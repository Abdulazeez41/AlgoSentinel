# AlgoSentinel

AlgoSentinel is a pay-per-action safety decision layer for Algorand AI agents. Before an agent transfers assets, swaps tokens, accepts an ASA/NFT, or interacts with a counterparty, it can pay a small amount of USDC through x402 and receive an `ALLOW`, `REVIEW`, or `BLOCK` decision.

The project is designed as a Composite Entry for the Algorand Global x402 Challenge. Its three product-facing endpoints share one operating wallet while remaining independently callable and payable.

## Product flow

```text
Agent proposes an action
        ↓
Agent pays through x402
        ↓
AlgoSentinel checks Algorand wallet and asset signals
        ↓
ALLOW, REVIEW, or BLOCK
        ↓
Agent executes or requests human approval
```

x402 is part of the core flow. The agent needs no API key, account, subscription, or invoice: it makes an HTTP request, receives `402 Payment Required`, pays in USDC on Algorand, and retries with payment proof.

## Product endpoints

### Agent preflight

```text
POST /api/agent-preflight
```

The main endpoint. It combines counterparty and optional asset checks before an agent performs an action.

```json
{
  "action": "swap",
  "counterparty": "ALGORAND_ADDRESS",
  "assetId": "10458941"
}
```

Example response:

```json
{
  "decision": "REVIEW",
  "action": "swap",
  "riskScore": 35,
  "confidence": 0.78,
  "reasons": ["Asset requires review before an autonomous action"],
  "checks": {
    "counterparty": "PASS",
    "asset": "REVIEW",
    "pool": "SKIPPED"
  },
  "network": "Algorand Testnet"
}
```

### Counterparty verification

```text
POST /api/verify-counterparty
```

Checks an Algorand address using indexed account activity, transaction history, asset holdings, and created assets or applications.

```json
{ "address": "ALGORAND_ADDRESS" }
```

### Asset verification

```text
POST /api/verify-asset
```

Checks an ASA or NFT for on-chain existence, supply, decimals, metadata, and manager, freeze, and clawback controls.

```json
{ "assetId": "10458941" }
```

An asset with administrative controls may correctly receive `REVIEW`. That means an autonomous agent should apply additional policy before treating it as safe.

## Compatibility routes

The original analytics routes remain available during the product transition:

```text
GET /api/wallet-risk/:address
GET /api/pool-health/:assetA/:assetB
GET /api/nft-check/:assetId
```

## x402 payment flow

1. The client sends a normal HTTP request.
2. The API returns `402 Payment Required` with Algorand payment requirements.
3. The client signs a USDC payment.
4. The GoPlausible facilitator verifies and settles it.
5. The client retries the original request with payment proof.
6. AlgoSentinel returns the paid JSON response.

The server supports Algorand Testnet and Mainnet through `ALGORAND_NETWORK`.

## Technology

- Next.js 14 and React for the website
- Express for the resource server
- `@x402/core`, `@x402/avm`, `@x402/express`, and `@x402/extensions`
- AlgoNode Indexer for account and asset data
- Tinyman Analytics for pool data
- Render for API hosting
- Namecheap DNS for `api.blueprintstech.org`

## Repository structure

```text
app/                    Next.js website
components/             Website sections and UI
lib/config.ts           Product copy and endpoint metadata
public/                 Static icon and Open Graph assets
api/server.mjs          Express x402 resource server
api/pay-testnet.mjs     Programmatic x402 client
api/smoke-test.mjs      Health and unpaid-402 test
api/import-client-wallet.mjs
                        Temporary mnemonic conversion helper
api/.env.example        Resource-server configuration template
api/client.env.example  Payment-client configuration template
render.yaml             Render service configuration
```

## Requirements

- Node.js 20 or newer
- npm
- A separate merchant wallet and client wallet
- Testnet ALGO and USDC for testing
- A GitHub repository for deployment

Never use the merchant wallet as the client wallet. Never commit a mnemonic, private key, or `.env` file.

## Local Testnet setup

From Windows Command Prompt:

```cmd
cd C:\Users\LENOVO\Documents\GitHub\algo-analytics
copy api\.env.example api\.env
```

Set the merchant configuration in `api\.env`:

```text
ALGORAND_NETWORK=testnet
AVM_ADDRESS=YOUR_TESTNET_MERCHANT_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
INDEXER_URL=https://testnet-idx.algonode.cloud
TINYMAN_ANALYTICS_URL=https://testnet.analytics.tinyman.org/api/v1
```

Start the API and run the smoke test:

```cmd
set PORT=4025
npm.cmd run api:dev
```

In another terminal:

```cmd
curl -i http://localhost:4025/health
npm.cmd run api:smoke
```

## Paid Testnet request

Create a disposable Testnet client wallet. Put its temporary mnemonic in `api\client-mnemonic.txt`, then run:

```cmd
npm.cmd run api:import-client-wallet
del api\client-mnemonic.txt
```

Set a paid request:

```cmd
set RESOURCE_URL=http://localhost:4025/api/agent-preflight
set RESOURCE_METHOD=POST
set RESOURCE_BODY={"action":"transfer","counterparty":"YOUR_TESTNET_MERCHANT_ADDRESS"}
npm.cmd run api:pay-testnet
```

For the deployed Testnet API:

```cmd
set RESOURCE_URL=https://api.blueprintstech.org/api/agent-preflight
npm.cmd run api:pay-testnet
```

Success means `HTTP 200`, a JSON decision, and a `Payment response` header.

## Network configuration

| Setting | Testnet | Mainnet |
|---|---|---|
| `ALGORAND_NETWORK` | `testnet` | `mainnet` |
| x402 network | `algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=` | `algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=` |
| USDC ASA | `10458941` | `31566704` |
| Indexer | `https://testnet-idx.algonode.cloud` | `https://mainnet-idx.algonode.cloud` |
| Tinyman | `https://testnet.analytics.tinyman.org/api/v1` | `https://mainnet.analytics.tinyman.org/api/v1` |

## Mainnet launch checklist

1. Create a separate Mainnet merchant wallet.
2. Opt it into Mainnet USDC ASA `31566704`.
3. Fund it with a small amount of ALGO.
4. Configure Render:

```text
ALGORAND_NETWORK=mainnet
AVM_ADDRESS=YOUR_MAINNET_MERCHANT_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
INDEXER_URL=https://mainnet-idx.algonode.cloud
TINYMAN_ANALYTICS_URL=https://mainnet.analytics.tinyman.org/api/v1
```

5. Confirm `/health` reports Mainnet and asset `31566704`.
6. Make one small Mainnet payment from a separate client wallet.
7. Confirm the paid response and USDC receipt.
8. Confirm Bazaar discovery and the challenge tag.
9. Drive legitimate usage from agents, developers, wallets, trading tools, and Algorand applications.

## Render deployment

The included `render.yaml` describes the API web service.

```text
Service type: Web Service
Runtime: Node
Build command: npm install
Start command: npm run api:start
Health check path: /health
```

The server binds to `0.0.0.0` and uses Render's `PORT` variable. Render provides an `onrender.com` URL and supports custom domains with HTTPS.

## Security

These files must stay local and untracked:

```text
api/.env
api/client.env
api/client-mnemonic.txt
api/server.log
```

Before pushing:

```cmd
git status --short
```

If a mnemonic, private key, or `.env` file appears, stop and remove it from the staged changes.

## Git workflow

```bash
git add README.md api/.env.example api/README.md api/server.mjs render.yaml
git commit -m "Add configurable Algorand network deployment"
git push origin main
```

Render can automatically deploy new commits from the connected `main` branch.

## Current status

The public Testnet deployment has been validated with paid requests for counterparty verification, asset verification, and full agent preflight. The next milestone is a small Mainnet payment using separate Mainnet merchant and client wallets.

