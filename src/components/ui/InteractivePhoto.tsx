"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export function InteractivePhoto({ settings }: { settings: any }) {
  const [isMobile, setIsMobile] = useState(false);

  const rawMaskPhoto = settings?.hero_mask_photo_url;
  const maskPhoto = (!rawMaskPhoto || rawMaskPhoto === "/images/ui/professional-foto.png" || rawMaskPhoto === "/professional-foto.png")
    ? "/images/ui/helm visual mask reveal.svg"
    : rawMaskPhoto;
  const basePhoto = (maskPhoto === "/images/ui/helm visual mask reveal.svg" || maskPhoto === "/helm visual mask reveal.svg" || maskPhoto === "/images/ui/professional-foto.png" || maskPhoto === "/professional-foto.png")
    ? "/images/ui/bw-professional-foto.png"
    : (settings?.hero_photo_url || "/images/ui/bw-professional-foto.png");

  const isSvgHelmet = maskPhoto === "/images/ui/helm visual mask reveal.svg" || maskPhoto === "/helm visual mask reveal.svg";
  const basePhotoStyle: React.CSSProperties = isSvgHelmet ? {
    objectFit: 'contain',
    objectPosition: 'bottom',
    transform: 'scale(1.25) translateY(10%)',
    transformOrigin: 'bottom center',
  } : {
    objectFit: 'contain',
    objectPosition: 'bottom',
  };

  // Opsi B (Fixed Aspect-Ratio Wrapper): Di mobile, kita atur wadah penampung dengan rasio pasti 1:1.38
  // sehingga jarak antara center & bottom tidak pernah melar sejauh apapun tinggi HP pengguna.
  // DESKTOP DIJAMIN 100% UTUH DAN TETAP SAMA SEDIKITPUN TIDAK DISENTUH!
  const maskImageStyle: React.CSSProperties = isSvgHelmet ? (
    isMobile ? {
      objectFit: 'contain',
      objectPosition: 'center',
      transform: 'translateX(0.5%) translateY(-18.3%) scale(0.65)',
      transformOrigin: 'center center',
    } : {
      objectFit: 'contain',
      objectPosition: 'center',
      transform: 'translateX(0.5%) translateY(-18.3%) scale(0.65)',
      transformOrigin: 'center center',
    }
  ) : {
    objectFit: 'contain',
    objectPosition: 'bottom',
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 800 });
  const maskX = useMotionValue(0);
  const maskY = useMotionValue(0);
  const springX = useSpring(maskX, { stiffness: 600, damping: 40 });
  const springY = useSpring(maskY, { stiffness: 600, damping: 40 });

  // 3D Depth & Parallax Tilt Transforms (100% GPU-accelerated, zero React re-renders)
  const tiltX = useTransform(springY, [0, dimensions.height || 800], [5, -5]);
  const tiltY = useTransform(springX, [0, dimensions.width || 500], [-5, 5]);

  const [trail, setTrail] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const trailCounter = useRef(0);
  const lastSpawnTime = useRef(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

  const [activeSplatters, setActiveSplatters] = useState<any[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      const w = containerRef.current?.offsetWidth || 500;
      const h = containerRef.current?.offsetHeight || 800;
      setDimensions({ width: w, height: h });
      maskX.set(w / 2);
      maskY.set(h / 2);
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (isInteracting) {
      setActiveSplatters([]);
      return;
    }

    let isMounted = true;

    const triggerSplatter = () => {
      if (!isMounted) return;
      const num = Math.floor(Math.random() * 2) + 1; // 1 to 2 organic ink splatters
      const splatters = Array.from({ length: num }).map((_, i) => ({
        id: Date.now() + i,
        x: 25 + Math.random() * 50,
        y: 15 + Math.random() * 45,
        scale: Math.random() * 0.4 + 0.65,
        rotation: Math.random() * 360,
        delay: i * 0.25
      }));
      setActiveSplatters(splatters);
    };

    const interval = setInterval(triggerSplatter, 5000);
    triggerSplatter();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isInteracting]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    maskX.set(x);
    maskY.set(y);
    setIsInteracting(true);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => {
      setIsInteracting(false);
      maskX.set(dimensions.width / 2);
      maskY.set(dimensions.height / 2);
    }, 1500);
  };

  useAnimationFrame((time) => {
    if (!isInteracting) return;
    if (time - lastSpawnTime.current > 65) {
      lastSpawnTime.current = time;
      const currentX = maskX.get();
      const currentY = maskY.get();

      // Main fluid body trailing dot (smaller, precise brush)
      const newDots: { id: number; x: number; y: number; size: number }[] = [
        { id: trailCounter.current++, x: currentX, y: currentY, size: 28 }
      ];

      // Organic side splatter droplet (low frequency for smooth 60 FPS)
      if (Math.random() > 0.65) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 12 + Math.random() * 20;
        newDots.push({
          id: trailCounter.current++,
          x: currentX + Math.cos(angle) * dist,
          y: currentY + Math.sin(angle) * dist,
          size: 7 + Math.random() * 9,
        });
      }

      setTrail((prev) => [
        ...prev.slice(-6), // Cap at 6 items for maximum GPU fluidity
        ...newDots
      ]);
    }
  });

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setIsInteracting(false);
        maskX.set(dimensions.width / 2);
        maskY.set(dimensions.height / 2);
      }}
      className="relative mx-auto h-full w-full select-none overflow-hidden touch-none pointer-events-auto group"
    >
      <svg id="interactive-photo-filters" style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }}>
        <defs>
          <filter id="brush-blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          {/* GPU-Optimized Metaball Cyber Ink Filter */}
          <filter id="cyber-ink-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
              result="goo"
            />
            <feGaussianBlur in="goo" stdDeviation="1" />
          </filter>

          <mask id="ink-mask-personal-v3" maskUnits="userSpaceOnUse">
            {isInteracting ? (
              <g filter="url(#cyber-ink-goo)">
                <motion.circle cx={springX} cy={springY} r="38" fill="white" />
                <AnimatePresence>
                  {trail.map((t) => (
                    <motion.circle
                      key={t.id}
                      initial={{ cx: t.x, cy: t.y, r: t.size, opacity: 1 }}
                      animate={{
                        cx: t.x + (Math.random() - 0.5) * 15,
                        cy: t.y + 10,
                        r: t.size * 0.2,
                        opacity: 0
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.85, ease: "easeOut" }}
                      fill="white"
                    />
                  ))}
                </AnimatePresence>
              </g>
            ) : (
              <g filter="url(#cyber-ink-goo)" transform={`scale(${dimensions.width / 100}, ${dimensions.height / 100})`}>
                <AnimatePresence>
                  {activeSplatters.map((splat) => (
                    <motion.g
                      key={splat.id}
                      transform={`translate(${splat.x}, ${splat.y}) rotate(${splat.rotation || 0})`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, splat.scale || 0.8, (splat.scale || 0.8) * 1.15, 0],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 3.8,
                        times: [0, 0.18, 0.78, 1], // Spreads like wet ink, lingers, then evaporates
                        ease: "easeInOut",
                        delay: splat.delay
                      }}
                    >
                      {/* Organic Ink Brush Splatter Core */}
                      <path
                        d="M 0 -18 C 10 -22, 22 -10, 20 4 C 18 16, 8 22, -2 20 C -14 22, -22 10, -18 -4 C -16 -14, -8 -20, 0 -18 Z"
                        fill="white"
                      />
                      {/* Organic satellite ink droplets */}
                      <circle cx="14" cy="-16" r="4.5" fill="white" />
                      <circle cx="-16" cy="12" r="3.5" fill="white" />
                      <circle cx="18" cy="14" r="5" fill="white" />
                      <circle cx="-12" cy="-18" r="3" fill="white" />
                      <circle cx="0" cy="22" r="4" fill="white" />
                    </motion.g>
                  ))}
                </AnimatePresence>
              </g>
            )}
          </mask>
        </defs>
      </svg>

      {/* 3D Parallax Tilt & Depth Container (Opsi B: Fixed Aspect Ratio khusus Mobile) */}
      <motion.div
        className={`pointer-events-none select-none overflow-hidden ${isMobile
          ? "absolute bottom-0 inset-x-0 w-full aspect-[1/1.38]"
          : "absolute inset-0 w-full h-full"
          }`}
        style={{
          rotateX: isInteracting ? tiltX : 0,
          rotateY: isInteracting ? tiltY : 0,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div id="base-photo-layer" className="absolute inset-0 z-10 select-none overflow-hidden" style={{ transform: "translateZ(0px)", willChange: "transform, opacity" }}>
          <Image
            src={basePhoto}
            alt="Personal Photo"
            fill
            priority
            unoptimized
            className="origin-bottom"
            style={basePhotoStyle}
          />
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        </div>

        {/* 100% GPU-Accelerated Top-to-Bottom Wireframe Scanner with Dynamic Schema Color */}
        {isSvgHelmet && (
          <div
            id="idle-wireframe-layer"
            className="absolute inset-0 z-[15] pointer-events-none select-none overflow-hidden"
            style={{ transform: "translateZ(25px)" }}
          >
            <div
              className="w-full h-full relative overflow-hidden"
              style={{
                ...maskImageStyle,
                maskImage: "url('/images/ui/helm-wireframe.svg')",
                WebkitMaskImage: "url('/images/ui/helm-wireframe.svg')",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskPosition: (maskImageStyle.objectPosition as string) || "center",
                WebkitMaskPosition: (maskImageStyle.objectPosition as string) || "center",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }}
            >
              {/* GPU TranslateY layer: glides inside cached wireframe texture smoothly without any CPU load! */}
              <motion.div
                className="w-full h-full absolute inset-0 bg-gradient-to-b from-transparent via-[var(--theme-primary)] via-[var(--theme-primary)] to-transparent opacity-100 transition-colors duration-500"
                style={{ willChange: "transform" }}
                initial={{ y: "-100%" }}
                animate={{ y: ["-100%", "100%"] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.3,
                }}
              />
            </div>
          </div>
        )}

        <div
          id="mask-photo-layer"
          className="absolute inset-0 z-20 select-none overflow-hidden"
          style={{
            maskImage: "url(#ink-mask-personal-v3)",
            WebkitMaskImage: "url(#ink-mask-personal-v3)",
            transform: "translateZ(12px)",
            willChange: "transform, opacity",
            filter: isSvgHelmet ? undefined : "brightness(1.1) contrast(1.25) saturate(1.2)",
          }}
        >
          <Image
            src={maskPhoto}
            alt="Personal Photo Masked"
            fill
            priority
            unoptimized
            className={isSvgHelmet ? "" : "origin-bottom"}
            style={maskImageStyle}
          />
        </div>

        <div id="full-color-layer" className="absolute inset-0 z-25 opacity-0 select-none overflow-hidden pointer-events-none" style={{ transform: "translateZ(5px)", willChange: "transform, opacity" }}>
          <Image
            src={maskPhoto}
            alt="Personal Photo Full Color"
            fill
            priority
            unoptimized
            className={isSvgHelmet ? "" : "origin-bottom"}
            style={maskImageStyle}
          />
        </div>
      </motion.div>
    </div>
  );
}

