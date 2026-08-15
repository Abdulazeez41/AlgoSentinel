"use client";

import { motion } from "framer-motion";
import { endpoints } from "@/lib/config";
import { CopyButton } from "./ui/CopyButton";

const accentMap = {
  amber: { text: "text-amber", bar: "bg-amber" },
  accent: { text: "text-accent", bar: "bg-accent" },
  violet: { text: "text-violet", bar: "bg-violet" },
};

export function Endpoints() {
  return (
    <section id="endpoints" className="mx-auto max-w-5xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Three decisions, one safety layer
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Each check is independently priced and independently payable. Your
          agent can call one check or compose all three before acting.
        </p>
      </motion.div>
      <div className="flex flex-col gap-6">
        {endpoints.map((ep, i) => {
          const accent = accentMap[ep.accent];
          return (
            <motion.div
              key={ep.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass relative overflow-hidden p-8"
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${accent.bar}`} aria-hidden="true" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-ink">{ep.title}</h3>
                    <span className={`font-mono text-sm font-semibold ${accent.text}`}>{ep.price}</span>
                  </div>
                  <code className="font-mono text-sm text-muted">{ep.method} {ep.path}</code>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{ep.description}</p>
              <div className="glass-tight mt-6 flex items-center justify-between gap-4 border border-border bg-black/30 px-4 py-3">
                <code className="overflow-x-auto whitespace-nowrap font-mono text-xs text-ink/80 sm:text-sm">{ep.curl}</code>
                <CopyButton value={ep.curl} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
