"use client";

import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Endpoints } from "@/components/Endpoints";
import { CodeTabs } from "@/components/CodeTabs";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-x-hidden"
    >
      <Hero />
      <HowItWorks />
      <Endpoints />
      <CodeTabs />
      <Footer />
    </motion.main>
  );
}
