"use client";

import React from "react";
import { MotionValue } from "framer-motion";

export function ProjectBackground({ 
  smoothProgress,
}: { 
  items: any[], 
  smoothProgress: MotionValue<number>,
  totalSteps: number,
  paddingStart: number
}) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-transparent flex items-center justify-center">
      {/* Soft Vignette to darken edges for cinematic focus on the 3D cylinder */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.92) 100%)',
        }}
      />
    </div>
  );
}
