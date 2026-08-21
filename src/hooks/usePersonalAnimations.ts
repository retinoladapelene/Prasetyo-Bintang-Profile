"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function usePersonalAnimations({
  mounted,
  trackRef,
  imageRef,
  bgRef,
  activeTheme,
}: {
  mounted: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLDivElement | null>;
  bgRef: React.RefObject<HTMLDivElement | null>;
  activeTheme: any;
}) {
  useLayoutEffect(() => {
    if (!mounted || !trackRef.current || !imageRef.current) return;

    let tickerCallback: ((time: number, deltaTime: number) => void) | null = null;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

      // Initialize signature transform state using pure pixel coordinates to prevent mixed unit interpolation bugs on mobile
      gsap.set("#signature-container", {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        xPercent: -50,
        yPercent: -50,
        rotation: -15,
        scale: 1,
        force3D: true,
      });

      // Initialize shadow layer static property to prevent CPU shadow rasterization during scrub
      gsap.set("#card-shadow-layer", {
        boxShadow: `0 30px 90px ${activeTheme.primary}4D`,
        opacity: 0,
        force3D: true,
      });

      // ── 2ND-ORDER KINEMATIC INERTIA ENGINE FOR HERO SECTION (Alche Studio Smoothness) ──
      // Why replace simple scrub? When scrolling fast, linear lerps cause harsh initial velocity spikes 
      // followed by sluggish trailing. By controlling physical momentum and capping maximum velocity, 
      // the zoom in/out transitions maintain a relaxed, fluid, and cinematic pace ("santai dan smooth") 
      // regardless of how fast the user flings the scroll wheel!
      let targetProgress = 0;
      let currentProgress = 0;
      let isWarmingUp = true;

      ScrollTrigger.create({
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
      });

      const tl = gsap.timeline({ paused: true });

      tickerCallback = (time: number, deltaTime: number) => {
        if (isWarmingUp) return;

        const dt = Math.min(deltaTime * 0.001, 0.1);

        // Frame-rate independent continuous exponential decay smoothing.
        // Eliminates artificial velocity caps (maxVel) and forced positional jumps (maxLag)
        // guaranteeing zero stutter ("patah-patah") and silky-smooth 60/120 FPS momentum!
        const smoothness = 12.0;
        currentProgress += (targetProgress - currentProgress) * (1 - Math.exp(-smoothness * dt));

        // Clamp cleanly to boundaries when practically arrived
        if (Math.abs(targetProgress - currentProgress) < 0.0001) {
          currentProgress = targetProgress;
        }

        if (currentProgress < 0) currentProgress = 0;
        else if (currentProgress > 1) currentProgress = 1;

        tl.progress(currentProgress);
      };

      if (tickerCallback) {
        gsap.ticker.add(tickerCallback);
      }

      // 0.0 to 0.35: Shrink down into card form gently
      tl.to(
        imageRef.current,
        {
          scale: 0.35,
          x: 0,
          y: 0,
          force3D: true,
          ease: "power1.out",
          duration: 0.35
        },
        0
      );

      // Animate shadow layer opacity cleanly on GPU compositor
      tl.to(
        "#card-shadow-layer",
        {
          opacity: 1,
          ease: "power1.out",
          duration: 0.35
        },
        0
      );

      // Text and color layer reveals (0.15 to 0.35)
      tl.to(
        "#reveal-name-back, #reveal-name-front",
        { opacity: 1, duration: 0.2, ease: "power2.out" },
        0.15
      );

      tl.to("#full-color-layer", { opacity: 1, duration: 0.2, ease: "power2.inOut" }, 0.15);

      // IMMEDIATELY hide heavy SVG filters and wireframe animations as soon as scroll starts 
      // (eliminating heavy GPU SVG filter recalculations during the scale transform for a buttery smooth 60fps zoom out)
      tl.to(["#mask-photo-layer", "#interactive-photo-filters", "#idle-wireframe-layer"], { autoAlpha: 0, duration: 0.01 }, 0.0);

      tl.to("#transition-text", { opacity: 1, y: -20, duration: 0.2, ease: "power2.out" }, 0.25);

      tl.to("#marquee-container", { opacity: 0.1, duration: 0.2, ease: "power2.inOut" }, 0.25);

      tl.to(["#side-label-left", "#side-label-right"], { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.25);

      // Fade out the PB logo as the signature takes its place
      tl.to("#pb-logo", { autoAlpha: 0, duration: 0.1 }, 0.3);

      // Signature transitions to top-left using ONLY GPU transforms (preserving exact desktop layout while fixing mobile target positioning)
      tl.to(
        "#signature-container",
        {
          x: isMobile ? 38 : 60,
          y: isMobile ? 36 : 55,
          xPercent: -50,
          yPercent: -50,
          scale: isMobile ? 0.13 : 0.08,
          rotation: 0,
          opacity: 1,
          force3D: true,
          ease: "power2.inOut",
          duration: 0.2
        },
        0.35
      );

      // [0.35 to 0.48]: Breathing room / pause where user peacefully enjoys the full card composition

      // At 0.45: Immediately discard the heavy 90px card drop shadow BEFORE scaling starts so GPU doesn't scale heavy blur
      tl.to(
        "#card-shadow-layer",
        { autoAlpha: 0, duration: 0.05, ease: "power1.out", force3D: true },
        0.45
      );

      // 0.50 to 0.78: GPU-accelerated zoom-in through the card
      tl.to(
        imageRef.current,
        { scale: 2.1, ease: "power1.inOut", duration: 0.28, force3D: true, rotationZ: 0.01 },
        0.50
      );

      // FADE OUT & PERFECTLY COUNTER-SCALE the internal elements so they stay stationary!
      // By fading the parent container directly, we bypass massive frame drops caused by fading multiple individual leaf elements.
      tl.to(
        ["#card-inner-contents", "#transition-text"],
        { scale: 0.476, autoAlpha: 0, transformOrigin: "center center", ease: "power1.inOut", duration: 0.28, force3D: true },
        0.50
      );

      // Ensure Hero sticky layer does not block mouse events or consume GPU compositing resources once zoomed past
      tl.to(
        "#sticky-transition",
        { pointerEvents: "none", autoAlpha: 0, duration: 0.03 },
        0.77
      );

      // Fade in the Profile 3D Tube background seamlessly as the zoom completes
      if (bgRef.current) {
        tl.to(
          bgRef.current,
          { opacity: 1, duration: 0.15, ease: "power2.inOut" },
          0.78
        );
      }

      // ── IMAGE DECODE + GPU UPLOAD WARMUP ─────────────────────────────────────────────────
      //
      // ROOT CAUSE (confirmed by file sizes):
      //   bw-professional-foto.png = 1.53 MB → decodes to ~15-20 MB raw RGBA pixels in VRAM
      //   helm visual mask reveal.svg = 1.1 MB → complex SVG needing rasterization
      //
      // Browsers decode image files LAZILY — only when the image is first needed for a GPU
      // draw call. Even though the image is downloaded & cached, the actual decode from
      // compressed PNG/SVG → raw pixel data → VRAM upload happens on the FIRST animation
      // frame that touches the element. This causes a multi-millisecond CPU stall (framedrop)
      // on ONLY the first scroll (second scroll is smooth because VRAM is already populated).
      //
      // THE FIX:
      // 1. Use HTMLImageElement.decode() — forces the browser to decompress & decode the image
      //    to RAM immediately (returns a Promise). This runs while loading screen is still up.
      // 2. After decode resolves, seek the GSAP timeline through the fade zone. This forces
      //    the browser to upload the now-decoded pixels to GPU VRAM. By the time the user
      //    scrolls, VRAM is fully populated → zero stall on first frame.
      // 3. Reset timeline to progress 0 so animation starts fresh for the user.

      const runWarmup = () => {
        // Step 2: Seek through the entire animation — forces VRAM upload + JIT compilation
        const passes = [0.10, 0.25, 0.35, 0.50, 0.52, 0.55, 0.50, 0.0];
        let i = 0;
        const step = () => {
          if (i < passes.length) {
            tl.progress(passes[i], true); // suppressEvents = true: update DOM silently
            i++;
            requestAnimationFrame(step);
          } else {
            // Reset to start — animation is now fully warm, user gets smooth first scroll
            tl.progress(0, true);
            currentProgress = targetProgress; // Catch up to where user actually is
            isWarmingUp = false;
          }
        };
        requestAnimationFrame(step);
      };

      // Step 1: Force decode of all hero images (runs while loading screen still covers page)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Collect ALL img elements inside the hero photo card
          const heroImages = Array.from(
            document.querySelectorAll<HTMLImageElement>(
              '#hero-photo-container img, #base-photo-layer img, #full-color-layer img, #mask-photo-layer img'
            )
          );

          if (heroImages.length === 0) {
            // No images found yet — run warmup directly
            runWarmup();
            return;
          }

          const decodePromises = heroImages.map(img => {
            // If image is already complete and has natural dimensions, decode() prepares it for GPU
            // If not yet loaded, we wait for the load event then decode
            if (img.complete && img.naturalWidth > 0) {
              return typeof img.decode === 'function'
                ? img.decode().catch(() => {}) // decode() prepares decoded pixels for GPU upload
                : Promise.resolve();
            }
            return new Promise<void>(resolve => {
              const onLoad = () => {
                if (typeof img.decode === 'function') {
                  img.decode().catch(() => {}).finally(resolve);
                } else {
                  resolve();
                }
              };
              img.addEventListener('load', onLoad, { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            });
          });

          // After ALL images are decoded to RAM → run GSAP seek to force VRAM upload
          Promise.all(decodePromises).then(() => {
            setTimeout(runWarmup, 50); // Small delay to let decode settle
          });
        });
      });
    }, trackRef);

    return () => {
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      ctx.revert();
    };
  }, [mounted, trackRef, imageRef, activeTheme]);
}
