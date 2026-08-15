"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — fail silently, the text is still selectable.
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.14)" }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="glass-tight flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink/85"
      aria-label="Copy command"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "copied" : "copy"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
        >
          {copied ? "Copied" : "Copy"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
