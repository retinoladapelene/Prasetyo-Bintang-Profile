"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxContent({ children, className = "", offset = 100 }: { children: React.ReactNode, className?: string, offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={`relative w-full h-full ${className}`}>
      <motion.div style={{ y }} className="relative w-full h-full">
        {children}
      </motion.div>
    </div>
  );
}
