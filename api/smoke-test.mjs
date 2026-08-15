const baseUrl = process.env.API_URL || "http://localhost:4021";

const health = await fetch(`${baseUrl}/health`);
if (!health.ok) throw new Error(`Health check failed: ${health.status}`);
console.log("health:", await health.json());

const unpaid = await fetch(`${baseUrl}/api/wallet-risk/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`);
if (unpaid.status !== 402) {
  throw new Error(`Expected 402 from protected route, received ${unpaid.status}`);
}
console.log("protected route: 402 Payment Required");
