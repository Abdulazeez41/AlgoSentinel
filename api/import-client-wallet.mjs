import fs from "node:fs";
import algosdk from "algosdk";

const mnemonicPath = new URL("./client-mnemonic.txt", import.meta.url);
const envPath = new URL("./client.env", import.meta.url);
if (!fs.existsSync(mnemonicPath)) {
  throw new Error("Create api/client-mnemonic.txt with the disposable Testnet wallet's 25-word phrase first.");
}

const mnemonic = fs.readFileSync(mnemonicPath, "utf8").trim().replace(/\s+/g, " ");
const account = algosdk.mnemonicToSecretKey(mnemonic);
const privateKey = Buffer.from(account.sk).toString("base64");
const resourceUrl = process.env.RESOURCE_URL || "http://localhost:4025/api/wallet-risk/TV3772EIRZ5UTEMYG4NQJN7HKA5J3J6UKDC7RZKM2JI52E5KMYMAAFDKPU";

fs.writeFileSync(envPath, `AVM_PRIVATE_KEY=${privateKey}\nRESOURCE_URL=${resourceUrl}\n`, { mode: 0o600 });
console.log(`Created api/client.env for client address: ${account.addr}`);
console.log("Delete api/client-mnemonic.txt now. Never commit or share either file.");
