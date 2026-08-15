"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "./ui/CopyButton";

const jsExample = `import { wrapFetchWithPayment } from "@x402/fetch";
import { toClientAvmSigner } from "@x402/avm";

const signer = await toClientAvmSigner(process.env.AGENT_PRIVATE_KEY);
const pay = wrapFetchWithPayment(fetch, signer);

const res = await pay("https://api.blueprintstech.org/api/agent-preflight", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    action: "swap",
    counterparty: "ALGO_ADDRESS",
    assetId: "10458941",
  }),
});

const decision = await res.json();
console.log(decision.decision, decision.reasons);`;

const pythonExample = `from x402_avm import AvmSigner, wrap_requests_with_payment

signer = AvmSigner(mnemonic=os.environ["AGENT_MNEMONIC"])
session = wrap_requests_with_payment(requests.Session(), signer)

res = session.post(
    "https://api.blueprintstech.org/api/agent-preflight",
    json={"action": "swap", "counterparty": "ALGO_ADDRESS"},
)
decision = res.json()
print(decision["decision"], decision["reasons"])`;

const rawFlowExample = `# 1. Agent proposes an action
POST /api/agent-preflight
{ "action": "swap", "counterparty": "ALGO_ADDRESS" }

# 2. Server responds with HTTP 402 Payment Required
#    and exact Algorand USDC payment requirements

# 3. Agent signs the payment and retries the same request
POST /api/agent-preflight
X-PAYMENT: <signed payment payload>

# 4. Server verifies, settles, and returns a decision
HTTP/1.1 200 OK
{ "decision": "ALLOW", "riskScore": 18, "reasons": [] }`;

const tabs = [
  { id: "js", label: "JavaScript", code: jsExample },
  { id: "py", label: "Python", code: pythonExample },
  { id: "raw", label: "Raw flow", code: rawFlowExample },
];

export function CodeTabs() {
  const [active, setActive] = useState(tabs[0].id);
  const activeTab = tabs.find((t) => t.id === active)!;
  return (
    <section className="mx-auto max-w-4xl px-6 py-28">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Give your agent a safety gate</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">Wrap the HTTP client once. Payment and the safety decision happen inline.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="glass overflow-hidden p-2">
        <div className="flex flex-wrap gap-1 p-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)} className={`glass-tight relative px-4 py-2 text-sm font-medium transition-colors ${active === t.id ? "text-ink" : "text-muted hover:text-ink/80"}`}>
              {active === t.id && <motion.span layoutId="tab-highlight" className="absolute inset-0 -z-10 rounded-[18px] bg-surface-strong" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative border-t border-border p-6">
          <div className="absolute right-6 top-6 z-10"><CopyButton value={activeTab.code} /></div>
          <AnimatePresence mode="wait">
            <motion.pre key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="overflow-x-auto font-mono text-xs leading-relaxed text-ink/85 sm:text-sm"><code>{activeTab.code}</code></motion.pre>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
