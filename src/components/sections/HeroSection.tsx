"use client";

import React, { useState, useEffect } from "react";
import { motion, useTransform, useMotionValue } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { InteractivePhoto } from "@/components/ui/InteractivePhoto";
import { SignatureAnimation } from "@/components/ui/SignatureAnimation";
export function HeroSection({ imageRef, currentTime, activeTheme, heroSettings, scrollYProgress, isLoaded = true }: { 
  imageRef: React.RefObject<HTMLDivElement | null>;
  currentTime: string;
  activeTheme: any;
  heroSettings: any;
  scrollYProgress?: any;
  isLoaded?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultProgress = useMotionValue(0);
  const signatureDrawProgress = useTransform(scrollYProgress || defaultProgress, [0, 0.35], [0, 1]);

  return (
    <>
      {/* Global Floating Signature Layer (z-[35]: Positioned behind Hero transition card z-40) */}
      <div id="signature-container" className="fixed top-0 left-0 text-[var(--theme-primary)] mix-blend-normal opacity-100 z-[35] pointer-events-none transition-colors duration-700" style={{ transform: "translate(calc(50vw - 50%), calc(50vh - 50%)) rotate(-15deg)", willChange: "transform" }}>
        <SignatureAnimation progress={signatureDrawProgress} className="w-[80vw] md:w-[45vw] h-auto max-w-none drop-shadow-[0_4px_35px_rgba(0,0,0,0.45)]" />
      </div>

      <div
        id="sticky-transition"
        className="sticky top-0 z-40 flex h-screen w-full items-center justify-center overflow-hidden pointer-events-auto"
      >
      {/* Background Marquee */}
      <div
        id="marquee-container"
        className="absolute inset-0 z-0 flex flex-col justify-center gap-0 select-none overflow-hidden pointer-events-none opacity-0"
        style={{ willChange: "opacity, transform", transform: "translateZ(0)" }}
      >
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[1, 2, 3, 4].map((i) => (
            <h2 key={`mq-1-${i}`} className="font-syne text-[10vw] font-black tracking-tighter px-8 leading-[0.8]" style={{ color: 'var(--theme-primary)' }}>
              WEB DEVELOPMENT • DATA ANALYSIS • UI/UX DESIGN • 
            </h2>
          ))}
        </motion.div>
        <motion.div
          animate={{ x: [-1000, 0] }}
          transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[1, 2, 3, 4].map((i) => (
            <h2 key={`mq-2-${i}`} className="font-syne text-[10vw] font-black tracking-tighter px-8 leading-[0.8]" style={{ color: 'var(--theme-primary)' }}>
              TRANSFORMING DATA INTO INSIGHTS • BUILDING SCALABLE APPS • 
            </h2>
          ))}
        </motion.div>
      </div>

      <div
        ref={imageRef}
        className="pointer-events-auto relative flex w-full items-end md:items-center justify-center will-change-transform h-full"
        style={{
          transform: 'translateZ(0)',
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-end h-full w-full pb-0">
          <div
            id="transition-text"
            className="w-full max-w-6xl opacity-0 relative mb-6 md:mb-8 flex flex-row justify-between items-end z-20 px-6 md:px-12"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform, opacity'
            }}
          >
            <div className="flex flex-col items-start text-left">
              <span className="font-outfit text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] opacity-80 mb-1" style={{ color: 'var(--theme-primary)' }}>
                ENGINEERING
              </span>
              <h3 className="font-syne text-xl md:text-4xl font-extrabold tracking-widest text-[var(--foreground)] uppercase">
                WEB <span className="font-light italic" style={{ color: 'var(--theme-primary)' }}>DEV</span>
              </h3>
            </div>
            
            <div className="hidden md:flex flex-col items-center pb-3 px-8 flex-grow">
              <div className="w-full h-[1px]" style={{ background: 'var(--theme-primary)', opacity: 0.3 }} />
            </div>
            
            <div className="flex flex-col items-end text-right">
              <span className="font-outfit text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] opacity-80 mb-1" style={{ color: 'var(--theme-primary)' }}>
                ANALYTICS
              </span>
              <h3 className="font-syne text-xl md:text-4xl font-extrabold tracking-widest text-[var(--foreground)] uppercase">
                DATA <span className="font-light italic" style={{ color: 'var(--theme-primary)' }}>ANALYST</span>
              </h3>
            </div>
          </div>

          <div className="relative group w-full flex justify-center">

            <div className="absolute -inset-8 pointer-events-none hidden md:block">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: 'var(--theme-light)' }} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: 'var(--theme-light)' }} />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: 'var(--theme-light)' }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: 'var(--theme-light)' }} />
            </div>

            {/* GPU-optimized card shadow layer */}
            <div
              id="card-shadow-layer"
              className="absolute inset-0 rounded-t-[32px] md:rounded-[32px] pointer-events-none opacity-0"
              style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            />

            <div className="relative overflow-hidden flex items-end justify-center rounded-t-[32px] md:rounded-[32px] bg-transparent h-[90vh] md:h-[98vh] self-end md:self-auto w-full" style={{ willChange: 'transform, border-radius', transform: 'translateZ(0)' }}>
              <div id="card-inner-contents" className="absolute inset-0 w-full h-full pointer-events-none" style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}>
                <div id="hero-photo-container" className="absolute inset-0 w-full h-full flex items-end justify-center pointer-events-auto">
                  <InteractivePhoto settings={heroSettings} />
                </div>

                <div
                  id="reveal-name-back"
                  className="absolute inset-0 -z-10 flex flex-col justify-end items-center opacity-0 pointer-events-none select-none pb-[7.5vw] md:pb-[10vw]"
                  style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
                >
                  <h2 className="font-outfit font-black text-[11vw] md:text-[14.5vw] leading-[0.7] text-[var(--foreground)] tracking-tighter uppercase scale-y-105 origin-bottom">
                    PRASETYO
                  </h2>
                </div>

                <div
                  id="reveal-name-front"
                  className="absolute inset-0 z-50 flex flex-col justify-end items-center opacity-0 pointer-events-none select-none pb-0"
                  style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
                >
                  <h2 className="font-outfit font-black text-[11vw] md:text-[14.5vw] leading-[0.7] text-[var(--foreground)] tracking-tighter uppercase scale-y-105 origin-bottom">
                    BINTANG
                  </h2>
                </div>
              </div>
            </div>

            {/* Side labels */}
            <div
              id="side-label-left"
              className="absolute -left-12 md:-left-20 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-6 pointer-events-none opacity-0"
            >
              <div className="h-16 w-[1px]" style={{ background: 'var(--theme-dot)' }} />
              <div className="font-outfit text-[11px] md:text-[13px] font-bold uppercase tracking-[0.6em]" style={{ color: 'var(--theme-primary)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                PROBLEM SOLVER
              </div>
              <div className="h-16 w-[1px]" style={{ background: 'var(--theme-dot)' }} />
            </div>

            <div
              id="side-label-right"
              className="absolute -right-12 md:-right-20 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-6 pointer-events-none opacity-0"
            >
              <div className="h-16 w-[1px]" style={{ background: 'var(--theme-dot)' }} />
              <div className="font-outfit text-[11px] md:text-[13px] font-bold uppercase tracking-[0.6em]" style={{ color: 'var(--theme-primary)', writingMode: 'vertical-rl' }}>
                DATA DRIVEN
              </div>
              <div className="h-16 w-[1px]" style={{ background: 'var(--theme-dot)' }} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export function EditorialIntro({ mounted, currentTime }: { mounted: boolean; currentTime: string }) {
  
  // Helper for generating staggered wave text
  const renderWaveText = (text: string, delayOffset: number, className: string, style: any = {}) => {
    return (
      <motion.div
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        className={`flex overflow-hidden ${className}`}
        style={style}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            custom={i + delayOffset}
            variants={{
              hidden: { opacity: 0, y: 150, rotate: 5 },
              visible: (custom) => ({
                opacity: 1,
                y: 0,
                rotate: 0,
                transition: { 
                  delay: custom * 0.08, // The "wave" stagger
                  duration: 1.2, 
                  ease: [0.2, 0.65, 0.3, 0.9] 
                }
              })
            }}
            className="inline-block"
            style={{ willChange: "transform, opacity" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-transparent">
      {mounted && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-purple-900/30 blur-[1px]"
              initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: Math.random() * 0.5 }}
              animate={{ y: ["-10%", "110%"], opacity: [0, 1, 0] }}
              transition={{ duration: 15 + Math.random() * 20, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            />
          ))}
        </div>
      )}

      <Link
        href="/"
        id="pb-logo"
        className="absolute left-4 top-4 sm:left-6 sm:top-6 z-50 flex items-center group cursor-pointer md:left-10 md:top-10 hover:scale-105 transition-transform"
      >
        <Image 
          src="/images/ui/Logo%20Prasetyo.svg" 
          alt="Logo Prasetyo" 
          width={48} 
          height={48} 
          className="w-10 h-10 md:w-12 md:h-12 object-contain transition-all duration-300 dark:invert drop-shadow-sm"
          priority
        />
      </Link>

      {/* Background Names (Solid - Behind Photo) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none hidden md:flex flex-col justify-center p-6 md:p-20">
        <div className="relative h-full flex flex-col justify-center">
          {renderWaveText("PRASETYO", 0, "font-outfit text-[18vw] md:text-[13vw] font-black leading-[0.8] tracking-tighter text-[var(--foreground)] absolute top-1/4 -left-4 md:static")}
          {renderWaveText("BINTANG", 4, "font-outfit text-[18vw] md:text-[13vw] font-black leading-[0.8] tracking-tighter text-[var(--foreground)] absolute bottom-1/4 -right-4 md:static md:ml-[10vw]")}
        </div>
      </div>

      {/* Foreground editorial layout (Includes Outline Names in front of Photo) */}
      <div className="absolute inset-0 z-[50] pointer-events-none select-none flex flex-col justify-between pt-12 p-6 md:pt-20 md:px-20 md:pb-6">
        {/* Outline Overlay for Sandwich Effect */}
        <div className="absolute inset-0 z-0 hidden md:flex flex-col justify-center p-20">
          <div className="relative h-full flex flex-col justify-center">
            {renderWaveText("PRASETYO", 0, "font-outfit text-[18vw] md:text-[13vw] font-black leading-[0.8] tracking-tighter text-transparent static", { WebkitTextStroke: '2px var(--foreground)', opacity: 0.7 })}
            {renderWaveText("BINTANG", 4, "font-outfit text-[18vw] md:text-[13vw] font-black leading-[0.8] tracking-tighter text-transparent static ml-[10vw]", { WebkitTextStroke: '2px var(--foreground)', opacity: 0.7 })}
          </div>
        </div>

        <div className="absolute bottom-24 left-6 right-6 flex flex-col items-start md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-col items-start gap-1"
          >
            <h1 className="font-outfit text-4xl font-black uppercase tracking-[0.15em] text-[var(--foreground)] leading-[1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Prasetyo<br />Bintang
            </h1>
            <div className="w-12 h-1 mt-2 bg-[var(--theme-primary)]" />
          </motion.div>
        </div>

        <div className="hidden md:flex justify-between items-start" />
        <div className="flex-1" />

        <div className="grid grid-cols-12 gap-4 items-end pb-4 md:pb-0">
          <div className="col-span-8 md:hidden hidden" />

          <div className="hidden md:flex col-span-12 justify-end items-end w-full">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-8 right-8 z-40 flex flex-col items-end gap-2 group"
            >
              <div className="flex items-center gap-4 mb-1">
                <span className="font-outfit text-[10px] font-black uppercase tracking-[0.5em] text-[var(--foreground)]/40">
                  Jakarta / GMT +7
                </span>
                <span className="font-outfit text-[9px] font-medium tracking-widest text-[var(--foreground)]/20">
                  Waktu Lokal: {currentTime}
                </span>
              </div>
              <div className="w-64 h-[1px] bg-[var(--foreground)]/10 origin-right transition-transform group-hover:scale-x-105" />
              <div className="flex items-center gap-2 pt-1">
                <span className="font-outfit text-[11px] font-black uppercase tracking-[0.6em] text-[var(--theme-primary)]/80">
                  Developer
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]/40" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
