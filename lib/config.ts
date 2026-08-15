// Single source of truth for every external link and product-facing message.
export const siteConfig = {
  name: "AlgoSentinel",
  tagline: "The safety decision layer for Algorand AI agents",
  apiBaseUrl: "https://api.blueprintstech.org",
  repoUrl: "https://github.com/your-org/algo-analytics",
  bazaarUrl: "https://facilitator.goplausible.xyz/dashboard",
  contactUrl: "https://x.com/your-handle",
};

export const endpoints = [
  {
    id: "agent-preflight",
    method: "POST",
    path: "/api/agent-preflight",
    price: "$0.003",
    accent: "amber" as const,
    title: "Agent Preflight Decision",
    description:
      "A deterministic ALLOW, REVIEW, or BLOCK decision before an autonomous agent transfers, swaps, or calls a paid service.",
    curl: `curl -X POST https://api.blueprintstech.org/api/agent-preflight -H "content-type: application/json" -d '{"action":"swap","counterparty":"ALGO_ADDRESS"}'`,
  },
  {
    id: "verify-counterparty",
    method: "POST",
    path: "/api/verify-counterparty",
    price: "$0.001",
    accent: "accent" as const,
    title: "Counterparty Verification",
    description:
      "A paid counterparty check that turns Algorand account activity into a machine-readable transfer decision.",
    curl: `curl -X POST https://api.blueprintstech.org/api/verify-counterparty -H "content-type: application/json" -d '{"address":"ALGO_ADDRESS"}'`,
  },
  {
    id: "verify-asset",
    method: "POST",
    path: "/api/verify-asset",
    price: "$0.001",
    accent: "violet" as const,
    title: "Asset Verification",
    description:
      "Supply, metadata, and clawback/freeze control checks for an ASA or NFT before an agent accepts or transfers it.",
    curl: `curl -X POST https://api.blueprintstech.org/api/verify-asset -H "content-type: application/json" -d '{"assetId":"10458941"}'`,
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Agent proposes an action",
    description:
      "The agent sends its intended action and the relevant Algorand addresses or assets to AlgoSentinel.",
  },
  {
    step: "02",
    title: "Server returns 402",
    description:
      "The endpoint responds with HTTP 402 Payment Required and the exact USDC payment details for the decision.",
  },
  {
    step: "03",
    title: "Agent pays in USDC",
    description:
      "The agent signs a small USDC payment on Algorand and the GoPlausible facilitator verifies and settles it on-chain.",
  },
  {
    step: "04",
    title: "Agent receives a verdict",
    description:
      "The paid response returns ALLOW, REVIEW, or BLOCK with machine-readable reasons before the agent acts.",
  },
];
