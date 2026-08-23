"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, Terminal, X, Database, BarChart, Code, Shield, Network, Zap, Eye, PenTool, Activity, Rocket } from "lucide-react";
import { CylinderGalleryScene, GALLERY_CONFIG, GALLERY_TRAVEL } from "@/components/three/CylinderGalleryScene";
import { ProjectBackground } from "@/components/ui/ProjectBackground";
import { TonyStarkHudProfile } from "@/components/sections/TonyStarkHudProfile";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";






export const FALLBACK_GALLERY_ITEMS = [
  {
    id: "01",
    title: "FunQuiz for Kids",
    year: "2024",
    type: "Mobile App Education",
    desc: "Aplikasi mobile edukasi interaktif untuk anak-anak, dikembangkan menggunakan Java & XML. Fokus pada UI/UX yang ramah anak dan gamifikasi.",
    image_url: "/images/projects/funquiz.png",
    images: ["/images/projects/funquiz.png"],
    wallVideo: "/videos/ironman.webm",
    tech: ["JAVA", "XML", "MOBILE UI"],
    demoLink: "https://appetize.io/app/android/com.example.funquiz?device=pixel7&osVersion=13.0&toolbar=true",
    sourceLink: "https://github.com/retinoladapelene/Quiz-App-for-Kids",
    apkLink: "https://drive.google.com/file/d/1n4Q9Hm6ps4dxuCq-1C3hM193Zoa2zHeT/view?usp=sharing"
  },
  {
    id: "02",
    title: "PB. ROXY System",
    year: "2025",
    type: "Database & Automation",
    desc: "Sistem automasi manajemen komunitas, pendataan pemain, dan leaderboard statistik. Dibangun dengan fokus pada integritas dan arsitektur data.",
    image_url: "/images/projects/spreadsheet banner.png",
    images: ["/images/projects/spreadsheet banner.png"],
    wallVideo: "/videos/captainamericavideo.webm",
    embedLink: "https://docs.google.com/spreadsheets/d/1E9u_aDynzL7g86Ie5uTk2NXhH89g27EfdWQtbxX257s/htmlembed?widget=true&headers=false",
    sheetLink: "https://docs.google.com/spreadsheets/d/1E9u_aDynzL7g86Ie5uTk2NXhH89g27EfdWQtbxX257s/edit?usp=sharing",
    tech: ["DATABASE", "AUTOMATION", "ANALYTICS"]
  },
  {
    id: "03",
    title: "Roxy Leaderboard Analytics",
    year: "2025",
    type: "Data Visualization",
    desc: "Dashboard visualisasi data interaktif untuk statistik pemain PB. ROXY menggunakan Google Looker Studio. Mampu menyajikan insight data secara real-time dari spreadsheet.",
    image_url: "/images/projects/banner project looker studio.png",
    images: [
      "/images/projects/banner project looker studio.png",
      "/looker-1.png",
      "/looker-2.png",
      "/looker-3.png",
      "/looker-4.png",
      "/looker-5.png"
    ],
    dashboardLink: "https://datastudio.google.com/u/0/reporting/93b6a493-e62e-47e9-8f43-5ee6caf4e1d0/page/BFlWF/view",
    wallVideo: "/videos/spiderman.webm",
    tech: ["LOOKER STUDIO", "DATA VISUALIZATION", "DASHBOARD"]
  },
  {
    id: "04",
    title: "Business Manager",
    year: "2026",
    type: "POS & Cashflow Engine",
    desc: "Sistem Point of Sales (POS) dan Cashflow Engine berbasis web SPA. Dilengkapi dengan fitur Jurnal Akuntansi, Inventaris, Buku Besar, dan Gamifikasi.",
    image_url: "/images/projects/banner project business manager.png",
    images: [
      "/images/projects/banner project business manager.png",
      "/Screenshot 2026-07-01 202135.png",
      "/Screenshot 2026-07-01 202141.png",
      "/Screenshot 2026-07-01 202148.png",
      "/Screenshot 2026-07-01 202204.png"
    ],
    demoLink: "https://businessmanagerbycuancapital.netlify.app/",
    tech: ["VITE", "VANILLA JS", "TAILWIND CSS", "INDEXEDDB"]
  }
];

export const HERO_PROCESS_ITEMS = [
  {
    id: "01",
    title: "PLAN",
    year: "Step 01",
    type: "Strategy & Requirements",
    desc: "Menentukan konsep, struktur, dan user flow sebelum eksekusi dimulai.",
    image_url: "/images/projects/funquiz.png",
    images: ["/images/projects/funquiz.png"],
    wallVideo: "/videos/doctorstrange.webm",
    tech: ["NOTION", "FIGJAM", "STRATEGY"],
    wallTitle: "DOCTOR STRANGE X NOTION",
    wallType: "See the possibilities.",
    wallDesc: "Doctor Strange melihat jutaan kemungkinan masa depan untuk menentukan satu jalur kemenangan mutlak.\n\nFase PLAN (Perencanaan) adalah 'Time Stone' saya. Menggunakan Notion dan FigJam, saya memetakan requirements, sitemap, dan user flow untuk memastikan arsitektur yang dibangun nantinya tidak salah arah.",
    wallTech: ["PLAN", "NOTION", "FIGJAM"],
    themeColor: "text-[#f59e0b]",
    themeBg: "bg-[#f59e0b]",
    themeBorder: "border-[#f59e0b]",
    themeShadow: "shadow-[#f59e0b]",
    icon: Eye,
    quote: {
      text: "See the possibilities before making a move.",
      highlights: ["possibilities", "move"]
    }
  },
  {
    id: "02",
    title: "DESIGN",
    year: "Step 02",
    type: "UI/UX & Prototyping",
    desc: "Memvisualisasikan ide menjadi desain antarmuka yang interaktif dan presisi.",
    image_url: "/images/projects/spreadsheet banner.png",
    images: ["/images/projects/spreadsheet banner.png"],
    wallVideo: "/videos/ironman.webm",
    tech: ["FIGMA", "DESIGN SYSTEM", "UI/UX"],
    wallTitle: "IRON MAN X FIGMA",
    wallType: "Build the blueprint.",
    wallDesc: "Tony Stark selalu memvisualisasikan cetak biru armornya sebelum merakit besi sungguhan.\n\nFigma adalah laboratorium hologram saya. Di sinilah wireframe berevolusi menjadi purwarupa (prototype) dan Design System yang solid, memastikan setiap piksel memiliki tujuan yang jelas.",
    wallTech: ["DESIGN", "FIGMA", "PROTOTYPE"],
    themeColor: "text-[#ef4444]",
    themeBg: "bg-[#ef4444]",
    themeBorder: "border-[#ef4444]",
    themeShadow: "shadow-[#ef4444]",
    icon: PenTool,
    quote: {
      text: "Vision without execution is hallucination.\nBuild the blueprint first.",
      highlights: ["Vision", "blueprint"]
    }
  },
  {
    id: "03",
    title: "BUILD",
    year: "Step 03",
    type: "Development & Logic",
    desc: "Menerjemahkan desain menjadi baris kode yang interaktif, fungsional, dan dinamis.",
    image_url: "/images/projects/banner project looker studio.png",
    images: ["/images/projects/banner project looker studio.png"],
    wallVideo: "/videos/spiderman.webm",
    tech: ["VS CODE", "GITHUB", "TYPESCRIPT"],
    wallTitle: "SPIDER-MAN X VS CODE",
    wallType: "Weave the web.",
    wallDesc: "Seperti Spider-Man yang merajut jaringnya dengan presisi matematis dan kelenturan tingkat tinggi.\n\nFase BUILD adalah tempat saya 'merajut' kode. Menggunakan VS Code dan ekosistem modern (Next.js/React/TypeScript), saya membangun arsitektur frontend yang sangat lincah, tangguh, dan responsif layaknya jaring laba-laba.",
    wallTech: ["BUILD", "VS CODE", "TYPESCRIPT"],
    themeColor: "text-[#3b82f6]",
    themeBg: "bg-[#3b82f6]",
    themeBorder: "border-[#3b82f6]",
    themeShadow: "shadow-[#3b82f6]",
    icon: Code,
    quote: {
      text: "With great logic comes great functionality.",
      highlights: ["logic", "functionality"]
    }
  },
  {
    id: "04",
    title: "TEST",
    year: "Step 04",
    type: "Debugging & QA",
    desc: "Menguji setiap sudut aplikasi untuk memastikan performa maksimal dan tanpa celah.",
    image_url: "/images/projects/banner project looker studio.png",
    images: ["/images/projects/banner project looker studio.png"],
    wallVideo: "/videos/hulk.webm",
    tech: ["DEVTOOLS", "LIGHTHOUSE", "VITEST"],
    wallTitle: "HULK X DEVTOOLS",
    wallType: "Smash the bugs.",
    wallDesc: "Hulk adalah simbol kekuatan absolut dan daya tahan yang tidak bisa dihancurkan.\n\nFase TEST adalah pengujian brutal. Menggunakan Chrome DevTools, saya melakukan stress-test, mencari bug, mengoptimalkan Lighthouse score, dan memastikan kode ini kokoh serta tidak akan 'hancur' di bawah beban berat.",
    wallTech: ["TEST", "DEBUG", "PERFORMANCE"],
    themeColor: "text-[#10b981]",
    themeBg: "bg-[#10b981]",
    themeBorder: "border-[#10b981]",
    themeShadow: "shadow-[#10b981]",
    icon: Activity,
    quote: {
      text: "Break it in development before the users do in production.",
      highlights: ["Break", "production"]
    }
  },
  {
    id: "05",
    title: "DEPLOY",
    year: "Step 05",
    type: "Production & Hosting",
    desc: "Meluncurkan aplikasi ke ranah publik dan memastikan keandalannya di production.",
    image_url: "/images/projects/funquiz.png",
    images: ["/images/projects/funquiz.png"],
    wallVideo: "/videos/captainamericavideo.webm",
    tech: ["VERCEL", "DOMAIN", "CI/CD"],
    wallTitle: "CAPTAIN AMERICA X VERCEL",
    wallType: "Ready for launch.",
    wallDesc: "Captain America melambangkan kesiapan misi, keandalan (reliability), dan eksekusi akhir.\n\nFase DEPLOY adalah garis akhir sekaligus awal baru. Melalui pipeline CI/CD di Vercel, kode yang telah teruji diterbangkan ke ranah publik (live production), berdiri kokoh sebagai produk akhir yang siap melayani pengguna.",
    wallTech: ["DEPLOY", "VERCEL", "DOMAIN"],
    themeColor: "text-[#0ea5e9]",
    themeBg: "bg-[#0ea5e9]",
    themeBorder: "border-[#0ea5e9]",
    themeShadow: "shadow-[#0ea5e9]",
    icon: Rocket,
    quote: {
      text: "Mission ready. The foundation is set,\nand the launch is inevitable.",
      highlights: ["Mission ready", "launch"]
    }
  }
];

export function ArchiveGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedEmbed, setSelectedEmbed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAvatarReady, setIsAvatarReady] = useState(false);
  const isMounted = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    });
  }, [mouseX, mouseY]);

  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const mouseTranslateX = useTransform(smoothMouseX, [-1, 1], [15, -15]);
  const mouseTranslateY = useTransform(smoothMouseY, [-1, 1], [15, -15]);
  const mouseRotateX = useTransform(smoothMouseY, [-1, 1], [4, -4]);
  const mouseRotateY = useTransform(smoothMouseX, [-1, 1], [-4, 4]);

  useEffect(() => {
    isMounted.current = true;
    setLoading(false);
    return () => {
      isMounted.current = false;
    };
  }, []);

  const galleryItems = items.length > 0 ? items : FALLBACK_GALLERY_ITEMS;

  // Scroll tracking for the 3D Carousel
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // OPTIMIZED: We re-introduced useSpring with ultra-fast responsiveness (mass: 0.1, stiffness: 800).
  // This absorbs the 1-frame native scroll jumps when swiping hard on trackpads/mobile,
  // preventing the 3D scene from "terlempar jauh", while not fighting the GSAP smoothing.
  const cinematicProgress = useSpring(scrollYProgress, {
    stiffness: 800,
    damping: 80,
    mass: 0.1,
    restDelta: 0.0001
  });
  const PADDING_START = 5;
  const PADDING_END = 4;
  const totalSteps = (galleryItems.length - 1) + PADDING_START + PADDING_END;

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Calculate exact center progress for each gallery panel
      const panelSnapPoints = Array.from(
        { length: galleryItems.length },
        (_, i) => (PADDING_START + i) / totalSteps
      );

      // Variables to track last snapped indices to clamp fast scrolling
      let lastCarouselIndex = 0;
      let lastWallIndex = 0;

      ScrollTrigger.create({
        id: "galleryTrigger",
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onEnter: () => {
          document.getElementById('signature-container')?.classList.add('liquid-glass');
        },
        onLeaveBack: () => {
          document.getElementById('signature-container')?.classList.remove('liquid-glass');
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [galleryItems.length, totalSteps]);

  // Active index is now derived directly by CylinderGalleryScene's velocity-clamped WebGL loop!
  // This ensures the bottom-left description text transitions smoothly in total harmony with the visual 3D panel rotation.

  // Map scroll progress to rotation. 4 items = total 270 degrees of rotation to go from index 0 to index 3.
  const anglePerItem = 360 / Math.max(galleryItems.length, 4); // assume min 4 slots for the cylinder
  const maxRotation = (galleryItems.length - 1) * anglePerItem;
  const rotateY = useTransform(cinematicProgress, [0, 1], [0, -maxRotation]);

  // Map scroll progress to background rotation (parallax effect, slower than main content)
  const bgRotateY = useTransform(cinematicProgress, [0, 1], [0, -maxRotation * 0.3]);

  // Map scroll progress to Y translation (Spiral effect)
  const yOffsetPerItem = 80; // 80px drop per item (staircase effect)
  const maxYTranslation = (galleryItems.length - 1) * yOffsetPerItem;
  const translateY = useTransform(cinematicProgress, [0, 1], [0, -maxYTranslation]);

  // Stage 2A: Background grid triggers early, then lingers after project UI and panels disappear.
  const backgroundOpacity = useTransform(cinematicProgress, [0.15, 0.18, 0.985, 0.998], [0, 1, 1, 1]);
  const backgroundVisibility = useTransform(cinematicProgress, (val) => (val < 0.14 ? "hidden" : "visible"));

  // Stage 2B: Project UI description text AND 3D Panels appear AFTER background monitors boot up! (0.35 to 0.40)
  // This ensures they are 100% visible at the first snap point (0.416).
  const panelsUiOpacity = useTransform(cinematicProgress, [0.35, 0.40, 0.70, 0.75], [0, 1, 1, 0]);
  const panelsUiVisibility = useTransform(cinematicProgress, (val) => (val < 0.34 || val >= 0.76 ? "hidden" : "visible"));
  const panelsUiTranslateY = useTransform(cinematicProgress, [0.35, 0.40, 0.70, 0.75], [25, 0, 0, -20]);

  // Stage 3: Keep the WebGL canvas alive.
  const sceneOpacity = useTransform(cinematicProgress, [0.985, 0.998], [1, 1]);
  const sceneVisibility = useTransform(cinematicProgress, (val) => ("visible"));

  // Stage 4: Wall Panels UI (Visible only during the final wall phase > 0.94 and < 0.975)
  // At > 0.975 the IMAX flat morph begins, so the UI should disappear
  const wallUiOpacity = useTransform(cinematicProgress, [0.92, 0.94, 0.970, 0.975], [0, 1, 1, 0]);
  const wallUiVisibility = useTransform(cinematicProgress, (val) => (val < 0.91 || val > 0.976 ? "hidden" : "visible"));
  const wallUiTranslateX = useTransform(cinematicProgress, [0.92, 0.94], [25, 0]);

  // HUD background ring opacity — visible during HUD phase only (fades out completely by 0.29)
  const hudRingOpacity = useTransform(cinematicProgress, [0.18, 0.21, 0.26, 0.29], [0, 1, 1, 0]);
  const hudRingVisibility = useTransform(cinematicProgress, (val) => (val < 0.16 || val > 0.295 ? "hidden" : "visible"));

  // Stage 5: Blackout transition to SlingRingPortal
  const blackoutOpacity = useTransform(cinematicProgress, [0.993, 1], [0, 1]);

  const [isHudRingActive, setIsHudRingActive] = useState(false);
  const [isWallPanel, setIsWallPanel] = useState(false);
  useMotionValueEvent(cinematicProgress, "change", (val) => {
    setIsHudRingActive(val >= 0.15 && val <= 0.30);
    setIsWallPanel(val >= 0.85);
  });

  const [clampedActiveIndex, setClampedActiveIndex] = useState(-1);
  const [clampedWallIndex, setClampedWallIndex] = useState(-1);
  const isSnappingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Perfect Snap & Discrete Scroll mechanism:
    // Limit jumping to 1 panel max per swipe and forcefully align the scrollbar to the EXACT perfect center.
    if (typeof window !== "undefined" && (window as any).lenis) {
      const lenis = (window as any).lenis;
      const st = ScrollTrigger.getById("galleryTrigger");
      
      const doSnap = (idx: number, isWall: boolean) => {
        if (!st || isSnappingRef.current) return;
        isSnappingRef.current = true;
        
        let targetScrollY = 0;
        
        if (!isWall) {
          const totalSteps = (galleryItems.length - 1) + PADDING_START + PADDING_END;
          const targetProgress = (PADDING_START + idx) / totalSteps;
          targetScrollY = st.start + (st.end - st.start) * targetProgress;
        } else {
          // Fase J-Curve Wall Panels (Background Melengkung)
          if (idx === -1) {
            // Snap back to the last Carousel item (keluar dari J-Curve Wall, kembali ke Carousel)
            const lastCarouselIdx = galleryItems.length - 1;
            const totalSteps = lastCarouselIdx + PADDING_START + PADDING_END;
            const targetProgress = (PADDING_START + lastCarouselIdx) / totalSteps;
            targetScrollY = st.start + (st.end - st.start) * targetProgress;
          } else if (idx >= HERO_PROCESS_ITEMS.length) {
            // Index 5 = IMAX Flat screen fully achieved
            // Snap ke 0.990 (tengah-tengah fase idle IMAX) agar layar IMAX bisa dinikmati lebih lama sebelum blackout
            targetScrollY = st.start + (st.end - st.start) * 0.990; 
          } else {
            const START_T = 1.40;
            const isMobile = window.innerWidth < 768;
            const T_LEFT = isMobile ? 0.56 : 0.37;
            const SPACING = 1.15;
            const TRAVEL = START_T - T_LEFT + 4 * SPACING;
            
            const wp = (idx * SPACING + START_T - T_LEFT) / TRAVEL;
            // Wall Phase sekarang dipadatkan dari 0.94 ke 0.975
            const smoothedScroll = 0.94 + wp * (0.975 - 0.94);
            targetScrollY = st.start + (st.end - st.start) * smoothedScroll;
          }
        }
        
        // Scroll ke panel terdekat
        // Gunakan force: true dan lock: true agar animasi tidak dibatalkan dan 
        // native scroll tidak melompat jauh (terlempar) saat user melakukan swipe keras.
        lenis.scrollTo(targetScrollY, { 
          duration: 0.8, 
          easing: (t: number) => 1 - Math.pow(1 - t, 4), // easeOutQuart
          force: true,
          lock: true,
          onComplete: () => {
            // Unlock snap only after fully settled
            setTimeout(() => {
              isSnappingRef.current = false;
            }, 50);
          }
        });

        // Safety unlock in case onComplete fails to fire (e.g., if already at target position)
        setTimeout(() => {
          isSnappingRef.current = false;
        }, 1300);
      };

      if (st) {
        if (!isWallPanel) {
          // Fase J-Curve Carousel (Panel Utama / Convex)
          const diff = activeIndex - clampedActiveIndex;
          
          if (diff !== 0 && !isSnappingRef.current) {
            // Update UI teks/deskripsi, tapi jangan biarkan melompat lebih dari 1 jika user swipe keras
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            const step = diff > 0 ? 1 : -1;
            setClampedActiveIndex(clampedActiveIndex + step); 
          }

          const handleScroll = (e: any) => {
            if (isSnappingRef.current || isWallPanel) return;
            
            const currentProgress = cinematicProgress.get();
            if (currentProgress < 0.35) return;

            // Discrete Scroll: 1 Scroll = 1 Panel
            // Ambang batas sangat rendah agar dikit aja langsung pindah
            if (Math.abs(e.velocity) > 0.05) {
              if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
              
              const step = e.velocity > 0 ? 1 : -1;
              const newIndex = clampedActiveIndex + step;
              const maxIndex = galleryItems.length - 1;
              const clampedNewIndex = Math.max(-1, Math.min(maxIndex, newIndex));
              
              if (clampedNewIndex !== clampedActiveIndex) {
                setClampedActiveIndex(clampedNewIndex);
                if (clampedNewIndex >= 0) {
                  doSnap(clampedNewIndex, false);
                }
              }
            } else {
              // Fallback snap if they scroll very slowly
              if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
              scrollTimeoutRef.current = setTimeout(() => {
                if (clampedActiveIndex >= 0) {
                  doSnap(clampedActiveIndex, false);
                }
              }, 200);
            }
          };
          
          lenis.on('scroll', handleScroll);
          
          return () => {
            lenis.off('scroll', handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          };
          
        } else {
          // Fase J-Curve Wall Panels (Background Melengkung)
          // Menghapus logika sinkronisasi 'diff' karena activeIndex hanya untuk Carousel, 
          // sehingga mencegah paksaan pindah ke Iron Man saat berada di Doctor Strange.

          const handleScroll = (e: any) => {
            if (isSnappingRef.current || !isWallPanel) return;
            
            // TANGKAP MOMENTUM AWAL: Jika user scroll dengan sengaja, langsung potong
            // momentumnya dan arahkan HANYA ke 1 panel berikutnya.
            // Ambang batas sangat rendah (0.05) agar scroll sedikit saja langsung pindah panel
            if (Math.abs(e.velocity) > 0.05) {
              if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
              
              const step = e.velocity > 0 ? 1 : -1;
              const newIndex = clampedWallIndex + step;
              const maxIndex = HERO_PROCESS_ITEMS.length;
              const clampedNewIndex = Math.max(-1, Math.min(maxIndex, newIndex));
              
              if (clampedNewIndex !== clampedWallIndex) {
                setClampedWallIndex(clampedNewIndex);
                // Selalu panggil doSnap, termasuk untuk -1 agar bisa snap kembali ke Carousel
                doSnap(clampedNewIndex, true);
              }
            } else {
              if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
              scrollTimeoutRef.current = setTimeout(() => {
                // Snap ke tengah panel saat ini jika user berhenti scroll di posisi nanggung
                if (clampedWallIndex >= -1) {
                  doSnap(clampedWallIndex, true);
                }
              }, 200);
            }
          };
          
          lenis.on('scroll', handleScroll);
          
          return () => {
            lenis.off('scroll', handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          };
        }
      }
    }
  }, [activeIndex, clampedActiveIndex, clampedWallIndex, isWallPanel, galleryItems.length]);

  const activeItem = isWallPanel 
    ? (HERO_PROCESS_ITEMS[clampedWallIndex] || HERO_PROCESS_ITEMS[0]) 
    : (galleryItems[clampedActiveIndex] || galleryItems[0]);

  return (
    <section id="gallery-section" className="dark relative bg-transparent z-10 w-full" onMouseMove={handleMouseMove}>
      <style>{`
        #signature-container {
          transition: color 0.8s ease-out, filter 0.8s ease-out, mix-blend-mode 0.8s ease-out;
        }
        #signature-container.liquid-glass {
          color: rgba(255, 255, 255, 0.85) !important;
          /* Performance optimized drop-shadow */
          filter: drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.7)) !important;
          mix-blend-mode: normal !important;
        }
      `}</style>
      <AnimatePresence>
        {selectedEmbed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[var(--background)] border border-[var(--foreground)]/20 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-[var(--foreground)]/10 bg-[var(--foreground)]/5">
                <div className="flex items-center gap-3 text-[var(--theme-primary)]">
                  <Database size={20} />
                  <span className="font-mono text-sm uppercase tracking-widest text-[var(--foreground)]/70">Secure Database Viewer</span>
                </div>
                <button
                  onClick={() => setSelectedEmbed(null)}
                  className="p-2 bg-[var(--foreground)]/10 hover:bg-[var(--theme-primary)] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 w-full bg-white relative">
                {/* Fallback loading indicator behind iframe */}
                <div className="absolute inset-0 flex items-center justify-center text-[var(--foreground)]/40 font-mono text-sm animate-pulse">
                  Connecting to database...
                </div>
                <iframe
                  src={selectedEmbed}
                  className="relative z-10 w-full h-full border-none"
                  title="Embedded Content"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Base Dark Layer removed to allow global background to show through */}

      {/* Tall Scroll Container - Force GPU to pre-allocate this massive block */}
      <div
        ref={containerRef}
        style={{
          // Diubah menjadi 150vh (sebelumnya 350vh) agar jarak native scroll jauh lebih masuk akal, mencegah rasa 'jauh sekali'
          height: `${(totalSteps + 4) * 150}vh` 
        }}
        className="relative w-full"
      >
        {/* Sticky viewport for 3D rendering - Force GPU composite layer */}
        <div
          id="gallery-sticky-viewport"
          className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
          style={{
            perspective: "1500px",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
            transform: "translateZ(0)"
          }}
        >
          {/* Three.js Glass Star is now embedded INSIDE CylinderGalleryScene */}

          {/* Foreground Parallax Wrapper for UI Elements (Staged after background TV boot-up) */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              opacity: panelsUiOpacity,
              visibility: panelsUiVisibility,
              y: panelsUiTranslateY,
              willChange: "transform, opacity"
            }}
          >
            {/* Header Title removed as requested by user */}

            <div className="hidden md:block absolute bottom-12 md:bottom-24 right-6 md:right-12 text-right mix-blend-difference">
              <p className="font-mono text-xs md:text-sm text-white/50 uppercase tracking-widest">
                Scroll to explore
              </p>
              <div className="w-16 h-[1px] bg-white/30 ml-auto mt-2" />
            </div>

            {/* Static UI for Active Project Description (Kiri Bawah - CAROUSEL PHASE) */}
            <div className="absolute bottom-6 left-4 right-4 md:bottom-16 md:left-12 md:right-auto pointer-events-auto flex flex-col items-start w-auto md:w-[500px] sm:max-w-sm scale-95 sm:scale-100 origin-bottom-left z-10 p-4 md:p-0 rounded-xl md:rounded-none bg-black/70 md:bg-transparent border border-white/10 md:border-none shadow-2xl md:shadow-none">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                  className="flex flex-col items-start w-full"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs md:text-sm font-bold text-[var(--theme-primary)] drop-shadow-md">
                      {activeItem.id}
                    </span>
                    <div className="h-[1px] w-8 bg-white/40 drop-shadow-md" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-sm bg-black/40 backdrop-blur-sm">
                      {activeItem.year}
                    </span>
                  </div>

                  <h3 className="font-syne text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 uppercase tracking-tight leading-none drop-shadow-xl shadow-black">
                    {activeItem.title}
                  </h3>

                  <p className="font-outfit text-[11px] sm:text-xs md:text-sm text-white/80 leading-relaxed mb-4 max-w-lg drop-shadow-lg shadow-black line-clamp-3 md:line-clamp-none">
                    {activeItem.desc}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap justify-start gap-1.5 md:gap-2 mb-4 md:mb-5">
                    {activeItem.tech?.map((tech: string, i: number) => (
                      <span key={i} className="font-mono text-[8px] sm:text-[9px] md:text-[10px] text-white/90 bg-white/20 md:bg-white/10 md:backdrop-blur-md px-1.5 md:px-2 py-0.5 md:py-1 uppercase tracking-widest rounded-sm border border-white/10 shadow-lg shadow-black/50">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-start gap-2 md:gap-3">
                    {activeItem.demoLink && (
                      <a
                        href={activeItem.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold bg-[var(--theme-primary)] text-white px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-wider hover:bg-[var(--theme-primary)]/80 transition-colors rounded-sm shadow-xl shadow-black/50"
                      >
                        Play Demo
                        <ArrowUpRight size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </a>
                    )}
                    {activeItem.sourceLink && (
                      <a
                        href={activeItem.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold bg-white/20 md:bg-white/10 md:backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-wider hover:bg-white/30 transition-colors rounded-sm shadow-xl shadow-black/50"
                      >
                        Source
                        <Terminal size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </a>
                    )}
                    {activeItem.apkLink && (
                      <a
                        href={activeItem.apkLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold bg-white/20 md:bg-white/10 md:backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-wider hover:bg-white/30 transition-colors rounded-sm shadow-xl shadow-black/50"
                      >
                        Download APK
                        <ArrowUpRight size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </a>
                    )}
                    {activeItem.embedLink && setSelectedEmbed && (
                      <button
                        onClick={() => setSelectedEmbed(activeItem.embedLink)}
                        className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold bg-[var(--theme-primary)] text-white px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-wider hover:bg-[var(--theme-primary)]/80 transition-colors rounded-sm shadow-xl shadow-black/50"
                      >
                        Database
                        <Database size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </button>
                    )}
                    {activeItem.sheetLink && (
                      <a
                        href={activeItem.sheetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold bg-white/20 md:bg-white/10 md:backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-wider hover:bg-white/30 transition-colors rounded-sm shadow-xl shadow-black/50"
                      >
                        Sheet
                        <ArrowUpRight size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </a>
                    )}
                    {activeItem.dashboardLink && (
                      <a
                        href={activeItem.dashboardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 md:gap-2 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold bg-[var(--theme-primary)] text-white px-3 py-1.5 md:px-4 md:py-2 uppercase tracking-wider hover:bg-[var(--theme-primary)]/80 transition-colors rounded-sm shadow-xl shadow-black/50"
                      >
                        Dashboard
                        <BarChart size={14} className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Foreground UI Elements for WALL PANEL PHASE (Staged after Avatar disappears) */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            style={{
              opacity: wallUiOpacity,
              visibility: wallUiVisibility,
              x: wallUiTranslateX,
              willChange: "transform, opacity"
            }}
          >
            {/* Static UI for Active Project Description (Kanan Tengah - WALL PHASE) */}
            <div className="absolute bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-6 md:left-auto right-6 md:right-12 lg:right-24 pointer-events-auto flex flex-col items-start md:items-end text-left md:text-right w-auto md:w-[600px] scale-90 md:scale-100 origin-bottom-left md:origin-right z-20">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                  className="flex flex-col items-start md:items-end"
                >
                  <div className="flex w-full justify-between items-start pl-0 md:pl-20">
                    {/* Main Content Area */}
                    <div className="flex flex-col items-start text-left flex-1 max-w-2xl">
                      
                      {/* Chapter Header */}
                      <div className={`hidden md:flex items-center gap-3 md:gap-4 ${activeItem.themeColor || 'text-white'} mb-3 md:mb-6`}>
                        <span className="font-mono text-sm tracking-widest uppercase font-bold">
                          CHAPTER {activeItem.id}
                        </span>
                        <div className={`h-[1px] w-12 md:w-32 bg-current opacity-50 relative`}>
                          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${activeItem.themeBg || 'bg-white'} ${activeItem.themeShadow ? 'shadow-[0_0_8px]' : ''} ${activeItem.themeShadow || ''}`} />
                        </div>
                      </div>

                      {/* Title Image/Text */}
                      {activeItem.wallTitle === "CAPTAIN AMERICA X NEXT.JS" ? (
                        <img 
                          src="/images/fonts/CAPTAINAMERICAFONT.png" 
                          alt="CAPTAIN AMERICA X NEXT.JS" 
                          className="h-8 md:h-12 lg:h-16 mb-2 md:mb-6 object-contain drop-shadow-2xl origin-left" 
                        />
                      ) : activeItem.wallTitle === "IRONMAN X VS CODE" ? (
                        <img 
                          src="/images/fonts/IRONMANFONT.png" 
                          alt="IRONMAN X VS CODE" 
                          className="h-8 md:h-12 lg:h-16 mb-2 md:mb-6 object-contain drop-shadow-2xl origin-left" 
                        />
                      ) : activeItem.wallTitle === "SPIDERMAN X TAILWIND CSS" ? (
                        <img 
                          src="/images/fonts/SPIDERMANFONT.png" 
                          alt="SPIDERMAN X TAILWIND CSS" 
                          className="h-8 md:h-12 lg:h-16 mb-2 md:mb-6 object-contain drop-shadow-2xl origin-left" 
                        />
                      ) : (
                        <h3 className="font-bold mb-2 md:mb-6 uppercase tracking-widest leading-none drop-shadow-2xl text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-syne text-white shadow-black">
                          {activeItem.wallTitle || activeItem.title}
                        </h3>
                      )}

                      {/* Subtitle */}
                      <div className={`flex items-center gap-2 md:gap-4 ${activeItem.themeColor || 'text-white'} mb-3 md:mb-8`}>
                        <div className="hidden md:block w-8 h-[1px] bg-current" />
                        <span className="font-mono tracking-[0.1em] md:tracking-[0.2em] uppercase text-[10px] md:text-sm font-bold">
                          {activeItem.wallType || activeItem.type}
                        </span>
                      </div>

                      {/* Description Block */}
                      <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-3 md:mb-6 items-start md:items-stretch">
                        {/* Hexagon Icon */}
                        <div className="hidden md:flex relative w-12 h-12 md:w-16 md:h-16 items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${activeItem.themeColor || 'text-white'} opacity-80`} fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" />
                          </svg>
                          {activeItem.icon ? (
                            <activeItem.icon size={24} className={`${activeItem.themeColor || 'text-white'}`} />
                          ) : (
                            <Code size={24} className={`${activeItem.themeColor || 'text-white'}`} />
                          )}
                        </div>
                        
                        {/* Vertical Line */}
                        <div className="hidden md:block w-[1px] bg-white/20 self-stretch" />
                        
                        {/* Text */}
                        <div className="text-[10px] sm:text-[11px] md:text-[13px] text-white/80 md:text-white/80 leading-relaxed whitespace-pre-wrap max-w-sm md:max-w-none drop-shadow-md">
                          {activeItem.wallDesc || activeItem.desc}
                        </div>
                      </div>

                      {/* Quote Block */}
                      {activeItem.quote && (
                        <div className="hidden md:flex gap-3 md:gap-4 mt-2">
                          <span className={`text-4xl md:text-5xl font-serif ${activeItem.themeColor || 'text-white'} opacity-30 leading-none mt-1`}>
                            "
                          </span>
                          <p className="text-[11px] md:text-xs text-white/70 mt-2 leading-relaxed max-w-md">
                            {activeItem.quote.text.split(new RegExp(`(${activeItem.quote.highlights.join('|')})`, 'gi')).map((part: string, i: number) => {
                              if (activeItem.quote.highlights.some((h: string) => h.toLowerCase() === part.toLowerCase())) {
                                return <span key={i} className={`${activeItem.themeColor || 'text-white'} font-bold`}>{part}</span>;
                              }
                              return part;
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pagination Side Bar */}
                    <div className="hidden md:flex flex-col items-center justify-between h-[250px] md:h-[300px] font-mono text-white/50 ml-6 md:ml-12 border-l border-white/10 pl-4 md:pl-6 py-2">
                      <span className="text-xs md:text-[10px] font-bold tracking-widest">01</span>
                      <div className="flex flex-col items-center gap-6 my-4 flex-1 justify-center">
                        {HERO_PROCESS_ITEMS.map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                              i === activeIndex 
                                ? `${activeItem.themeBg || 'bg-white'} ${activeItem.themeShadow ? 'shadow-[0_0_8px]' : ''} ${activeItem.themeShadow || ''} scale-150` 
                                : 'bg-white/20'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs md:text-[10px] font-bold tracking-widest">0{HERO_PROCESS_ITEMS.length}</span>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>


          {/* Background slices layer */}
          <motion.div
            className="absolute pointer-events-none flex items-center justify-center bg-[#0F0F0F]"
            style={{
              top: "-20%", bottom: "-20%", left: "-20%", right: "-20%",
              rotateX: mouseRotateX,
              rotateY: mouseRotateY,
              x: mouseTranslateX,
              y: mouseTranslateY,
              transformStyle: "preserve-3d",
              opacity: backgroundOpacity,
              visibility: backgroundVisibility
            }}
          >
            <ProjectBackground items={galleryItems} smoothProgress={cinematicProgress} totalSteps={totalSteps} paddingStart={PADDING_START} />
          </motion.div>

          {/* WebGL Cylinder Gallery replacing the old CSS 3D Slice method */}
          <motion.div className="absolute inset-0 pointer-events-none z-10" style={{ opacity: sceneOpacity, visibility: sceneVisibility }}>
            <CylinderGalleryScene
              items={galleryItems}
              wallItems={HERO_PROCESS_ITEMS}
              smoothProgress={cinematicProgress}
              onActiveIndexChange={setActiveIndex}
              onAvatarReady={setIsAvatarReady}
              className="w-full h-full"
            />
          </motion.div>

          {/* ── HUD CONCENTRIC RINGS BACKGROUND (behind 3D avatar, in front of background) ── */}
          {/* z-index 6 = behind Three.js canvas (z-index 10) but above background slices */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ opacity: hudRingOpacity, visibility: hudRingVisibility, zIndex: 6 }}
          >
            {isHudRingActive && (
              <svg
                viewBox="0 0 800 800"
                className="w-full h-full max-w-[900px] max-h-[900px]"
                style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer large slow-rotating ring */}
                <motion.g
                  style={{ transformOrigin: "400px 400px", willChange: "transform" }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="400" cy="400" r="370"
                    fill="none" stroke="var(--theme-primary)" strokeOpacity={0.25} strokeWidth="1.5"
                    strokeDasharray="18 10"
                  />
                </motion.g>

                {/* Middle dashed counter-rotating ring */}
                <motion.g
                  style={{ transformOrigin: "400px 400px", willChange: "transform" }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="400" cy="400" r="320"
                    fill="none" stroke="white" strokeOpacity={0.15} strokeWidth="2"
                    strokeDasharray="4 16"
                  />
                </motion.g>

                {/* Inner thick segmented ring */}
                <motion.g
                  style={{ transformOrigin: "400px 400px", willChange: "transform" }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="400" cy="400" r="280"
                    fill="none" stroke="var(--theme-primary)" strokeOpacity={0.4} strokeWidth="6"
                    strokeDasharray="80 40 20 40"
                  />
                </motion.g>

                {/* Inner thin marker ring - counter-rotate slowly */}
                <motion.g
                  style={{ transformOrigin: "400px 400px", willChange: "transform" }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="400" cy="400" r="260"
                    fill="none" stroke="white" strokeOpacity={0.2} strokeWidth="1"
                    strokeDasharray="2 8"
                  />
                </motion.g>

                {/* Inner fast tick ring */}
                <motion.g
                  style={{ transformOrigin: "400px 400px", willChange: "transform" }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <circle cx="400" cy="400" r="210"
                    fill="none" stroke="var(--theme-primary)" strokeOpacity={0.25} strokeWidth="1"
                    strokeDasharray="3 25"
                  />
                </motion.g>
                {/* Core target circle */}
                <circle cx="400" cy="400" r="160" fill="none" stroke="var(--foreground)" strokeOpacity={0.1} strokeWidth="1" />

                {/* Cardinal tick marks at 0°, 90°, 180°, 270° on the outer ring */}
                {[0, 90, 180, 270].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 400 + Math.cos(rad) * 350;
                  const y1 = 400 + Math.sin(rad) * 350;
                  const x2 = 400 + Math.cos(rad) * 370;
                  const y2 = 400 + Math.sin(rad) * 370;
                  return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--theme-primary)" strokeOpacity={0.7} strokeWidth="2" />;
                })}

                {/* Diagonal neutral ticks at 45° intervals */}
                {[45, 135, 225, 315].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 400 + Math.cos(rad) * 352;
                  const y1 = 400 + Math.sin(rad) * 352;
                  const x2 = 400 + Math.cos(rad) * 368;
                  const y2 = 400 + Math.sin(rad) * 368;
                  return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--foreground)" strokeOpacity={0.4} strokeWidth="1.5" />;
                })}

                {/* HUD corner bracket top-left */}
                <path d="M 245 245 L 245 275 L 275 245 Z" fill="none" stroke="var(--theme-primary)" strokeOpacity={0.5} strokeWidth="1.5" />
                {/* HUD corner bracket top-right */}
                <path d="M 555 245 L 555 275 L 525 245 Z" fill="none" stroke="var(--theme-primary)" strokeOpacity={0.5} strokeWidth="1.5" />
                {/* HUD corner bracket bottom-left */}
                <path d="M 245 555 L 245 525 L 275 555 Z" fill="none" stroke="var(--theme-primary)" strokeOpacity={0.5} strokeWidth="1.5" />
                {/* HUD corner bracket bottom-right */}
                <path d="M 555 555 L 555 525 L 525 555 Z" fill="none" stroke="var(--theme-primary)" strokeOpacity={0.5} strokeWidth="1.5" />
              </svg>
            )}
          </motion.div>

          {/* Tony Stark JARVIS HUD Profile Overlay - visible after Avatar appears and BEFORE project panels light up */}
          <TonyStarkHudProfile smoothProgress={cinematicProgress} isAvatarReady={isAvatarReady} />

          {/* Blackout overlay for seamless transition to SlingRingPortal */}
          <motion.div
            className="absolute inset-0 z-[100] bg-black pointer-events-none"
            style={{ opacity: blackoutOpacity, willChange: "opacity" }}
          />
        </div>
      </div>
    </section>
  );
}
