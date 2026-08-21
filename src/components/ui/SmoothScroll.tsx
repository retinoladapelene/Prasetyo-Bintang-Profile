"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      duration: isTouchDevice ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: isTouchDevice, // Hanya ambil alih touch jika di touch device (atau emulasinya)
      wheelMultiplier: 1,
      touchMultiplier: 1, // Turunkan dari 2 ke 1 agar tidak terlalu agresif
    });

    (window as any).lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // Synchronize Lenis raf with GSAP ticker for ultra-smooth rendering
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);

    // Optimize lag smoothing: allow GSAP to skip frame interpolation during CPU/GPU heavy spikes (like fast scrolling) to prevent stutter (patah-patah)
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
