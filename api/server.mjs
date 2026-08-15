import dotenv from "dotenv";
import { setDefaultResultOrder } from "node:dns";
import { fileURLToPath } from "node:url";
import express from "express";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { USDC_MAINNET_ASA_ID, USDC_TESTNET_ASA_ID } from "@x402/avm";
import { ExactAvmScheme } from "@x402/avm/exact/server";
import { paymentMiddleware } from "@x402/express";
import { declareDiscoveryExtension } from "@x402/extensions";

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });
// Some Windows networks can reach the facilitator with curl but fail Node's
// first IPv6 connection attempt. Prefer IPv4 for the resource-server process.
setDefaultResultOrder("ipv4first");

const app = express();
// Render/Cloudflare terminate TLS before forwarding to Express. Trust the
// first proxy so x402 resource metadata keeps the public HTTPS URL.
app.set("trust proxy", 1);
const port = Number(process.env.PORT || 4021);
const payTo = process.env.AVM_ADDRESS || "";
const facilitatorUrl = process.env.FACILITATOR_URL || "https://facilitator.goplausible.xyz";
const algorandNetwork = (process.env.ALGORAND_NETWORK || "testnet").toLowerCase();
if (!["testnet", "mainnet"].includes(algorandNetwork)) {
  throw new Error("ALGORAND_NETWORK must be either testnet or mainnet.");
}
const isMainnet = algorandNetwork === "mainnet";
const networkName = isMainnet ? "Algorand Mainnet" : "Algorand Testnet";
const avmNetwork = isMainnet
  ? "algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8="
  : "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
const usdcAssetId = isMainnet ? USDC_MAINNET_ASA_ID : USDC_TESTNET_ASA_ID;
const indexerUrl = (process.env.INDEXER_URL || (isMainnet ? "https://mainnet-idx.algonode.cloud" : "https://testnet-idx.algonode.cloud")).replace(/\/$/, "");
const tinymanUrl = (process.env.TINYMAN_ANALYTICS_URL || (isMainnet ? "https://mainnet.analytics.tinyman.org/api/v1" : "https://testnet.analytics.tinyman.org/api/v1")).replace(/\/$/, "");

if (!/^[A-Z2-7]{58}$/.test(payTo)) {
  throw new Error(`AVM_ADDRESS must be a valid 58-character Algorand ${isMainnet ? "Mainnet" : "Testnet"} address.`);
}

app.use(express.json({ limit: "32kb" }));

const json = (value) => ({ contentType: "application/json", body: value });

const walletRiskDiscovery = declareDiscoveryExtension({
  method: "GET",
  input: { address: "ADDRESS" },
  inputSchema: {
    properties: { address: { type: "string", description: "Algorand address to score" } },
    required: ["address"],
  },
  output: { example: { riskScore: 18, verdict: "low", reasons: [] } },
});

const preflightDiscovery = declareDiscoveryExtension({
  method: "POST",
  bodyType: "json",
  input: {
    action: "swap",
    counterparty: "ADDRESS",
    assetId: "10458941",
    assetA: "10458941",
    assetB: "0",
  },
  inputSchema: {
    properties: {
      action: { type: "string", description: "Action the agent is about to perform" },
      counterparty: { type: "string", description: "Wallet receiving or initiating the action" },
      assetId: { type: "string", description: "ASA being transferred or purchased" },
      assetA: { type: "string", description: "First pool asset ID, or 0 for ALGO" },
      assetB: { type: "string", description: "Second pool asset ID, or 0 for ALGO" },
    },
    required: ["action", "counterparty"],
  },
  output: { example: { decision: "ALLOW", riskScore: 18, reasons: [] } },
});

const counterpartyDiscovery = declareDiscoveryExtension({
  method: "POST",
  bodyType: "json",
  input: { address: "ADDRESS" },
  inputSchema: {
    properties: { address: { type: "string", description: "Counterparty address to verify" } },
    required: ["address"],
  },
  output: { example: { decision: "ALLOW", riskScore: 18, reasons: [] } },
});

const assetDiscovery = declareDiscoveryExtension({
  method: "POST",
  bodyType: "json",
  input: { assetId: "12345678" },
  inputSchema: {
    properties: { assetId: { type: "string", description: "Algorand ASA ID to verify" } },
    required: ["assetId"],
  },
  output: { example: { decision: "ALLOW", authentic: true, confidence: "high" } },
});

const poolHealthDiscovery = declareDiscoveryExtension({
  method: "GET",
  input: { assetA: "10458941", assetB: "0" },
  inputSchema: {
    properties: {
      assetA: { type: "string", description: "First ASA ID, or 0 for ALGO" },
      assetB: { type: "string", description: "Second ASA ID, or 0 for ALGO" },
    },
    required: ["assetA", "assetB"],
  },
  output: { example: { found: true, tvlUsd: 1000, priceImpactBps: 42 } },
});

const nftDiscovery = declareDiscoveryExtension({
  method: "GET",
  input: { assetId: "12345678" },
  inputSchema: {
    properties: { assetId: { type: "string", description: "Algorand ASA ID" } },
    required: ["assetId"],
  },
  output: { example: { authentic: true, reasons: ["Asset exists on-chain"] } },
});

const routes = {
  "POST /api/agent-preflight": {
    accepts: {
      scheme: "exact",
      network: avmNetwork,
      payTo,
      price: process.env.PREFLIGHT_PRICE || "$0.003",
      extra: { asset: usdcAssetId, decimals: 6, tag: "x402-global-challenge" },
    },
    description: "Algorand agent safety preflight returning an ALLOW, REVIEW, or BLOCK decision before a paid action.",
    mimeType: "application/json",
    extensions: preflightDiscovery,
  },
  "POST /api/verify-counterparty": {
    accepts: {
      scheme: "exact",
      network: avmNetwork,
      payTo,
      price: process.env.COUNTERPARTY_PRICE || "$0.001",
      extra: { asset: usdcAssetId, decimals: 6, tag: "x402-global-challenge" },
    },
    description: "Deterministic Algorand counterparty check for agents before they transfer assets or call a service.",
    mimeType: "application/json",
    extensions: counterpartyDiscovery,
  },
  "POST /api/verify-asset": {
    accepts: {
      scheme: "exact",
      network: avmNetwork,
      payTo,
      price: process.env.ASSET_PRICE || "$0.001",
      extra: { asset: usdcAssetId, decimals: 6, tag: "x402-global-challenge" },
    },
    description: "Algorand ASA and NFT verification with supply, control-address, and metadata checks.",
    mimeType: "application/json",
    extensions: assetDiscovery,
  },
  "GET /api/wallet-risk/:address": {
    accepts: {
      scheme: "exact",
      network: avmNetwork,
      payTo,
      price: process.env.WALLET_RISK_PRICE || "$0.002",
      extra: { asset: usdcAssetId, decimals: 6, tag: "x402-global-challenge" },
    },
    description: "Algorand wallet and counterparty risk score based on account age, activity, assets, and recent transactions.",
    mimeType: "application/json",
    extensions: walletRiskDiscovery,
  },
  "GET /api/pool-health/:assetA/:assetB": {
    accepts: {
      scheme: "exact",
      network: avmNetwork,
      payTo,
      price: process.env.POOL_HEALTH_PRICE || "$0.005",
      extra: { asset: usdcAssetId, decimals: 6, tag: "x402-global-challenge" },
    },
    description: "Algorand DEX pool health including reserves, liquidity, price, and estimated execution risk when available.",
    mimeType: "application/json",
    extensions: poolHealthDiscovery,
  },
  "GET /api/nft-check/:assetId": {
    accepts: {
      scheme: "exact",
      network: avmNetwork,
      payTo,
      price: process.env.NFT_CHECK_PRICE || "$0.003",
      extra: { asset: usdcAssetId, decimals: 6, tag: "x402-global-challenge" },
    },
    description: "Algorand NFT authenticity check covering ASA existence, supply, manager controls, creator history, and metadata signals.",
    mimeType: "application/json",
    extensions: nftDiscovery,
  },
};

const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitator);
resourceServer.register("algorand:*", new ExactAvmScheme());
app.use(paymentMiddleware(routes, resourceServer));

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`Upstream returned non-JSON (${response.status})`);
  }
  if (!response.ok) throw new Error(data.message || `Upstream returned ${response.status}`);
  return data;
}

async function getWalletRisk(address) {
  assertAddress(address);
  const [accountResponse, transactionsResponse] = await Promise.all([
    fetchJson(`${indexerUrl}/v2/accounts/${address}`),
    fetchJson(`${indexerUrl}/v2/accounts/${address}/transactions?limit=100`),
  ]);
  const account = accountResponse.account;
  const transactions = transactionsResponse.transactions || [];
  const assets = account.assets || [];
  const createdAssets = account["created-assets"] || [];
  const createdApps = account["created-apps"] || [];
  const reasons = [];
  let score = 10;
  if (transactions.length === 0) {
    score += 25;
    reasons.push("No indexed transaction history");
  } else if (transactions.length < 5) {
    score += 10;
    reasons.push("Limited indexed transaction history");
  }
  if (assets.length > 50) {
    score += 10;
    reasons.push("Large number of opted-in assets");
  }
  if (createdAssets.length > 0 || createdApps.length > 0) score = Math.max(0, score - 5);
  const riskScore = Math.min(100, score);
  return {
    address,
    riskScore,
    verdict: classifyRisk(riskScore),
    reasons,
    account: {
      algoBalance: account.amount,
      optedInAssetCount: assets.length,
      createdAssetCount: createdAssets.length,
      createdAppCount: createdApps.length,
      status: account.status,
    },
    observedTransactionCount: transactions.length,
    indexedAt: new Date().toISOString(),
    network: networkName,
  };
}

async function getAssetCheck(assetId) {
  if (!Number.isSafeInteger(assetId) || assetId < 1) {
    const error = new Error("assetId must be a positive integer");
    error.status = 400;
    throw error;
  }
  const assetResponse = await fetchJson(`${indexerUrl}/v2/assets/${assetId}`);
  const asset = assetResponse.asset;
  const params = asset.params || {};
  const reasons = [`Asset exists on ${networkName}`];
  if (params.total === 1 && params.decimals === 0) reasons.push("Supply and decimals are consistent with a single-edition NFT");
  if (params.freeze || params.clawback) reasons.push("Asset retains freeze or clawback control");
  if (params.manager) reasons.push("Asset manager is still configured");
  const controlWarnings = [params.freeze, params.clawback, params.manager].filter(Boolean).length;
  return {
    assetId,
    authentic: true,
    confidence: controlWarnings === 0 ? "high" : "review",
    reasons,
    asset: {
      creator: params.creator,
      total: params.total,
      decimals: params.decimals,
      name: params.name,
      unitName: params["unit-name"],
      url: params.url,
      metadataHash: params["metadata-hash"],
      manager: params.manager || null,
      freeze: params.freeze || null,
      clawback: params.clawback || null,
    },
    network: networkName,
  };
}

function assertAddress(address) {
  if (!/^[A-Z2-7]{58}$/.test(address)) {
    const error = new Error("Invalid Algorand address");
    error.status = 400;
    throw error;
  }
}

function classifyRisk(score) {
  if (score >= 70) return "high";
  if (score >= 35) return "review";
  return "low";
}

app.get("/health", (_req, res) => {
  res.json({ service: "algosentinel-api", status: "ok", network: algorandNetwork, asset: usdcAssetId });
});

app.get("/", (_req, res) => {
  res.json({ service: "AlgoSentinel", network: networkName, routes: Object.keys(routes) });
});

app.post("/api/verify-counterparty", async (req, res, next) => {
  try {
    const address = req.body?.address;
    const wallet = await getWalletRisk(address);
    const decision = wallet.riskScore >= 70 ? "BLOCK" : wallet.riskScore >= 35 ? "REVIEW" : "ALLOW";
    res.json({ decision, riskScore: wallet.riskScore, reasons: wallet.reasons, counterparty: wallet.address, network: wallet.network });
  } catch (error) {
    next(error);
  }
});

app.post("/api/verify-asset", async (req, res, next) => {
  try {
    const asset = await getAssetCheck(Number(req.body?.assetId));
    const decision = asset.confidence === "high" ? "ALLOW" : "REVIEW";
    res.json({ decision, ...asset });
  } catch (error) {
    next(error);
  }
});

app.post("/api/agent-preflight", async (req, res, next) => {
  try {
    const { action = "unspecified", counterparty, assetId, assetA, assetB, maxRiskScore = 34 } = req.body || {};
    if (!counterparty) {
      const error = new Error("counterparty is required");
      error.status = 400;
      throw error;
    }
    const walletPromise = getWalletRisk(counterparty);
    const assetPromise = assetId ? getAssetCheck(Number(assetId)) : Promise.resolve(null);
    const [wallet, asset] = await Promise.all([walletPromise, assetPromise]);
    const reasons = [...wallet.reasons];
    if (asset && asset.confidence !== "high") reasons.push("Asset requires review before an autonomous action");
    const riskScore = Math.max(wallet.riskScore, asset && asset.confidence !== "high" ? 35 : 0);
    const decision = riskScore > 69 ? "BLOCK" : riskScore > Number(maxRiskScore) ? "REVIEW" : "ALLOW";
    res.json({
      decision,
      action,
      riskScore,
      confidence: decision === "ALLOW" ? 0.94 : decision === "REVIEW" ? 0.78 : 0.99,
      reasons,
      checks: {
        counterparty: wallet.verdict === "high" ? "FAIL" : wallet.verdict === "review" ? "REVIEW" : "PASS",
        asset: asset ? (asset.confidence === "high" ? "PASS" : "REVIEW") : "SKIPPED",
        pool: assetA && assetB ? "AVAILABLE_ON_REQUEST" : "SKIPPED",
      },
      counterparty: wallet.address,
      asset: asset ? { assetId: asset.assetId, authentic: asset.authentic, confidence: asset.confidence } : null,
      network: networkName,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/wallet-risk/:address", async (req, res, next) => {
  try {
    res.json(await getWalletRisk(req.params.address));
  } catch (error) {
    next(error);
  }
});

app.get("/api/nft-check/:assetId", async (req, res, next) => {
  try {
    res.json(await getAssetCheck(Number(req.params.assetId)));
  } catch (error) {
    next(error);
  }
});

app.get("/api/pool-health/:assetA/:assetB", async (req, res, next) => {
  try {
    const assetA = Number(req.params.assetA);
    const assetB = Number(req.params.assetB);
    if (![assetA, assetB].every((value) => Number.isSafeInteger(value) && value >= 0) || assetA === assetB) {
      const error = new Error("assetA and assetB must be different non-negative asset IDs");
      error.status = 400;
      throw error;
    }
    const query = `pools/?asset_1__id=${assetA}&asset_2__id=${assetB}&limit=10&offset=0`;
    let poolResponse;
    try {
      poolResponse = await fetchJson(`${tinymanUrl}/${query}`);
    } catch {
      poolResponse = await fetchJson(`${tinymanUrl}/pools/?asset_1__id=${assetB}&asset_2__id=${assetA}&limit=10&offset=0`);
    }
    const pool = poolResponse.results?.[0] || poolResponse.pools?.[0];
    if (!pool) {
      return res.status(404).json({ assetA, assetB, found: false, reason: "No indexed Tinyman pool found for this pair", network: networkName });
    }
    res.json({
      assetA,
      assetB,
      found: true,
      provider: "Tinyman Analytics",
      pool,
      network: networkName,
      indexedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = Number(error.status) || 502;
  res.status(status).json({ error: error.message || "Upstream data provider failed" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`AlgoSentinel API listening on http://localhost:${port}`);
  console.log(`Network: ${networkName} | Facilitator: ${facilitatorUrl}`);
});
