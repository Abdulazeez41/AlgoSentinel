"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  hover = true,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
} & Omit<HTMLMotionProps<"div">, "children" | "className">) {
  return (
    <motion.div
      className={`glass p-8 ${className}`}
      whileHover={
        hover
          ? { scale: 1.015, backgroundColor: "rgba(255,255,255,0.09)" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
