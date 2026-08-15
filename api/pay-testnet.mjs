import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { toClientAvmSigner } from "@x402/avm";
import { ExactAvmScheme } from "@x402/avm/exact/client";

dotenv.config({ path: fileURLToPath(new URL("./client.env", import.meta.url)) });

const privateKey = process.env.AVM_PRIVATE_KEY;
const resourceUrl = process.env.RESOURCE_URL || "http://localhost:4025/api/wallet-risk/TV3772EIRZ5UTEMYG4NQJN7HKA5J3J6UKDC7RZKM2JI52E5KMYMAAFDKPU";
const resourceMethod = (process.env.RESOURCE_METHOD || "GET").toUpperCase();
const resourceBody = process.env.RESOURCE_BODY || "";

if (!privateKey) {
  throw new Error("AVM_PRIVATE_KEY is missing. Put the client wallet key in api/client.env.");
}

const signer = toClientAvmSigner(privateKey);
const client = new x402Client().register("algorand:*", new ExactAvmScheme(signer));
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

console.log(`Paying from client address: ${signer.address}`);
console.log(`Requesting: ${resourceMethod} ${resourceUrl}`);

const request = { method: resourceMethod };
if (resourceBody) {
  request.headers = { "content-type": "application/json" };
  request.body = resourceBody;
}
const response = await fetchWithPayment(resourceUrl, request);
const body = await response.text();
console.log(`HTTP ${response.status}`);
console.log(body);

const paymentResponse = response.headers.get("PAYMENT-RESPONSE") || response.headers.get("X-PAYMENT-RESPONSE");
if (paymentResponse) console.log(`Payment response: ${paymentResponse}`);

if (!response.ok) process.exitCode = 1;
