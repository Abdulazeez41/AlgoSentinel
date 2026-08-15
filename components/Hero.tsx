"use client";

import { motion } from "framer-motion";
import { StatusPill } from "@/components/ui/StatusPill";
import { NetworkSceneLoader } from "@/components/NetworkSceneLoader";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] w-full items-center justify-center overflow-hidden px-6">
      <NetworkSceneLoader />
      <motion.div
        className="glass mx-auto flex max-w-2xl flex-col items-center gap-6 px-10 py-14 text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatusPill label="Testnet prototype · Mainnet-ready architecture" />
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Safer agent actions, priced by the decision.
        </h1>
        <p className="max-w-md text-balance text-lg text-muted">
          AlgoSentinel gives Algorand AI agents a paid ALLOW, REVIEW, or BLOCK
          decision before they transfer, swap, or accept an asset.
        </p>
        <motion.a
          href="#endpoints"
          className="glass-tight mt-2 border border-accent/40 bg-accent-soft px-7 py-3 text-sm font-semibold tracking-wide text-ink"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(61,217,235,0.26)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          View the safety endpoints
        </motion.a>
      </motion.div>
    </section>
  );
}
