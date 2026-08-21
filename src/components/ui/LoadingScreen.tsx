"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SignatureAnimation } from "@/components/ui/SignatureAnimation";

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  // MotionValue terikat langsung ke persentase loading
  const rawProgress = useMotionValue(0);
  
  // Garansi animasi tanda tangan 100% selesai tepat saat loading mendekati/mencapai 100%
  const signatureProgress = useTransform(rawProgress, [0, 0.95, 1], [0, 1, 1]);

  useEffect(() => {
    let isMounted = true;
    let minTimePassed = false;
    let threejsLoaded = false;
    let fallbackTimer: NodeJS.Timeout;

    import("framer-motion").then(({ animate }) => {
      if (!isMounted) return;
      
      // Animate progress up to 90% over 2.8 seconds
      const controls = animate(rawProgress, 0.9, {
        duration: 2.8,
        ease: [0.22, 1, 0.36, 1], // easeOutQuint
        onUpdate: (latest) => setProgress(Math.floor(latest * 100)),
        onComplete: () => {
          minTimePassed = true;
          checkCompletion();
        }
      });

      const finishAnimation = () => {
        controls.stop();
        animate(rawProgress, 1, {
          duration: 0.5,
          ease: "easeOut",
          onUpdate: (latest) => setProgress(Math.floor(latest * 100)),
          onComplete: () => {
            setTimeout(() => { if (isMounted) onComplete(); }, 700);
          }
        });
      };

      const checkCompletion = () => {
        if (minTimePassed && threejsLoaded) {
          finishAnimation();
          clearTimeout(fallbackTimer);
        }
      };

      // Import THREE to hook into its DefaultLoadingManager
      import("three").then((THREE) => {
        if (!isMounted) return;
        
        THREE.DefaultLoadingManager.onLoad = () => {
          threejsLoaded = true;
          checkCompletion();
        };

        // Fallback timer: force finish after 8 seconds in case no 3D models are loaded or network fails
        fallbackTimer = setTimeout(() => {
          threejsLoaded = true;
          checkCompletion();
        }, 8000);
      });
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [onComplete, rawProgress]);

  return (
    <AnimatePresence>
      <motion.div
        key="loading-screen"
        initial={{ opacity: 0.999 }}
        animate={{ opacity: 0.999 }}
        exit={{ opacity: 0, y: "-100%" }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] overflow-hidden select-none pointer-events-auto"
      >
        {/* GPU-Accelerated Background: Animasi tanda tangan sequential drawing dengan kejernihan visual yang tinggi */}
        <div 
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-45 sm:opacity-60 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-opacity duration-500"
          style={{ transform: "rotate(-12deg)", willChange: "transform" }}
        >
          <SignatureAnimation 
            progress={signatureProgress}
            className="w-[140vw] sm:w-[110vw] md:w-[75vw] lg:w-[55vw] h-auto max-w-none text-[var(--theme-primary)]" 
          />
        </div>

        {/* Center Stage: Bersih, tajam, profesional tanpa efek glow */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full max-w-md">
          
          {/* Logo SVG dengan animasi looping cepat (Murni Solid, 0% Glow/Blur) */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-8 flex items-center justify-center">
            <div
              className="w-full h-full relative overflow-hidden"
              style={{
                maskImage: "url('/Logo%20Prasetyo.svg')",
                WebkitMaskImage: "url('/Logo%20Prasetyo.svg')",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }}
            >
              {/* Dasar siluet logo solid yang elegan */}
              <div className="absolute inset-0 w-full h-full bg-[var(--foreground)] opacity-15" />

              {/* Sapuan tinta/garis cerah menyala melintasi logo (Tanpa Box-Shadow/Glow) */}
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{
                  background: "linear-gradient(105deg, var(--theme-primary) 0%, var(--theme-primary) 75%, var(--theme-light, #ffffff) 100%)",
                  willChange: "transform",
                }}
                initial={{ x: "-105%" }}
                animate={{ x: ["-105%", "0%", "0%", "105%"] }}
                transition={{
                  duration: 2.0,
                  times: [0, 0.45, 0.65, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.15,
                }}
              />
            </div>
          </div>

          {/* Typography & Progress Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex items-center justify-center gap-3 md:gap-4 font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.25em] uppercase text-[var(--foreground)]/80 px-4 py-2 rounded-full border border-[var(--foreground)]/15 bg-[var(--foreground)]/5 shadow-sm"
          >
            <span className="font-semibold text-[var(--foreground)] tracking-[0.18em]">Loading</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
            <span className="w-10 sm:w-12 text-right text-[var(--theme-primary)] font-bold font-syne tracking-wider">
              {progress}%
            </span>
          </motion.div>

          {/* Sleek Solid Progress Bar (GPU Optimized) */}
          <div className="w-48 sm:w-56 md:w-64 h-[2px] bg-[var(--foreground)]/15 rounded-full mt-4 overflow-hidden relative">
            {/* Teknik Optimasi 2: Menggunakan scaleX alih-alih mengubah width. 
                scaleX 100% dijalankan oleh GPU compositor tanpa memicu browser reflow/repaint, 
                menjadikan progress bar sangat mulus tanpa stutter. */}
            <motion.div 
              className="absolute inset-y-0 left-0 bg-[var(--theme-primary)] rounded-full origin-left"
              style={{ scaleX: rawProgress, width: "100%", willChange: "transform" }}
            />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
