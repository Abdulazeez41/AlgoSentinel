"use client";

import { motion } from "framer-motion";

export function StatusPill({ label }: { label: string }) {
  return (
    <div className="glass-tight glass inline-flex items-center gap-2.5 px-4 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-accent"
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
      <span className="text-sm font-medium tracking-wide text-ink/90">
        {label}
      </span>
    </div>
  );
}
