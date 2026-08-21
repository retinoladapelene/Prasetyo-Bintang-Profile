"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, AnimatePresence, motion } from "framer-motion";
import { themeColors, ThemeStyleInjector } from "@/components/sections/ThemeElements";
import { ArchiveGallery } from "@/components/sections/ArchiveGallery";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LetsConnect } from "@/components/sections/LetsConnect";
import { HeroSection, EditorialIntro } from "@/components/sections/HeroSection";
import { usePersonalAnimations } from "@/hooks/usePersonalAnimations";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { triggerInfinityEffect, StoneEffect } from "@/hooks/useInfinityEffect";
import { SlingRingPortal } from "@/components/ui/SlingRingPortal";


export default function PersonalPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [activeThemeId, setActiveThemeId] = useState("gold");
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [heroSettings, setHeroSettings] = useState<any>(null);

  const { scrollYProgress: rawScrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"]
  });
  const scrollYProgress = useSpring(rawScrollYProgress, { stiffness: 90, damping: 20, restDelta: 0.001 });

  const activeTheme = themeColors.find(t => t.id === activeThemeId) || themeColors[0];

  const handleThemeChange = (newThemeId: string) => {
    setActiveThemeId(newThemeId);
    
    const themeToEffect: Record<string, StoneEffect> = {
      'gold': 'mind',
      'amethyst': 'power',
      'alexandrite': 'soul',
      'sapphire': 'space',
      'emerald': 'time',
      'ruby': 'reality'
    };
    
    // triggerInfinityEffect(themeToEffect[newThemeId] || null);
  };

  usePersonalAnimations({
    mounted: mounted,
    trackRef,
    imageRef,
    bgRef,
    activeTheme,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Jakarta",
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
    setHeroSettings(null);
  }, []);

  // Prevent scrolling while loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <div className="relative min-h-screen transition-colors duration-700"
      style={{
        "--theme-primary": activeTheme.primary,
        "--theme-light": activeTheme.light,
        "--theme-dot": activeTheme.dot,
      } as React.CSSProperties}
    >
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div id="profile-3d-bg" ref={bgRef} className="hidden" />

      <ThemeStyleInjector activeThemeId={activeThemeId} />
      <ThemeToggle />
      
      <div ref={trackRef} className="relative w-full z-30">
        <HeroSection 
          imageRef={imageRef} 
          currentTime={currentTime} 
          activeTheme={activeTheme} 
          heroSettings={heroSettings}
          scrollYProgress={scrollYProgress}
          isLoaded={!isLoading}
        />

        <div className="relative -mt-[100vh]">
          <EditorialIntro mounted={mounted && !isLoading} currentTime={currentTime} />
          <section className="relative h-[1400vh] w-full overflow-hidden bg-transparent" />
        </div>
      </div>

      <div ref={galleryRef} className="relative z-20 w-full -mt-[320vh]">
        <ArchiveGallery />
      </div>

      <div className="relative z-40 bg-transparent -mt-[100vh]">
        <SlingRingPortal>
          <LetsConnect />
        </SlingRingPortal>
      </div>
    </div>
  );
}
