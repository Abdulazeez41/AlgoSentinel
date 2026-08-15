"use client";

import { motion } from "framer-motion";
import { howItWorks } from "@/lib/config";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Four steps, one HTTP round trip. Nothing to configure ahead of time.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {howItWorks.map((s, i) => (
          <motion.div key={s.step} variants={item} className="relative">
            <div className="glass glass-tight flex h-full flex-col gap-3 p-6">
              <span className="font-mono text-sm text-accent">{s.step}</span>
              <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted">
                {s.description}
              </p>
            </div>
            {i < howItWorks.length - 1 && (
              <div
                className="pointer-events-none absolute right-[-14px] top-1/2 hidden h-px w-7 -translate-y-1/2 bg-gradient-to-r from-border to-transparent lg:block"
                aria-hidden="true"
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
