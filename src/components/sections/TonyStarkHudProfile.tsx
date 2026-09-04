"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
  Brain,
  Code2,
  Cpu,
  Database,
  Folder,
  GraduationCap,
  Mail,
  MapPin,
  Mic,
  MicOff,
  ShieldCheck,
  User,
  Wrench,
  Zap,
  X,
  MessageSquare,
  Volume2,
  Send,
} from "lucide-react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

interface TonyStarkHudProfileProps {
  smoothProgress: MotionValue<number>;
  isAvatarReady?: boolean;
}

type ActiveCategory = "experience" | "skills" | "education" | "projects" | null;
type CategoryId = Exclude<ActiveCategory, null>;

const realExperience = [
  {
    company: "PT. Gamma Persada Solusindo",
    role: "Quality Control Engineer",
    period: "Agustus 2024 – Mei 2025",
    location: "Jakarta, Indonesia",
    type: "Daily Worker",
    points: [
      "Membantu teknisi IT dalam proses instalasi software pada perangkat klien",
      "Melakukan quality control terhadap hardware dan perangkat IT sebelum distribusi",
      "Mengerjakan instalasi hardware dan konfigurasi perangkat komputer",
      "Berkoordinasi dengan tim teknis untuk memastikan standar kualitas terpenuhi",
    ],
  },
  {
    company: "PB. ROXY (Komunitas Badminton)",
    role: "System Developer",
    period: "30 Juli 2025 – Sekarang",
    location: "Jakarta, Indonesia",
    type: "Pengalaman Organisasi",
    points: [
      "Merancang sistem manajemen berbasis Google Spreadsheet untuk data pemain, jadwal, dan keuangan",
      "Membangun fitur leaderboard dan statistik pemain untuk transparansi dan engagement anggota",
      "Mengembangkan otomasi formula tingkat lanjut untuk mempermudah pengelolaan data pengurus",
      "Melakukan pembaruan dan maintenance berkala terhadap sistem sesuai kebutuhan komunitas",
    ],
  },
];

const realEducation = {
  institution: "Universitas Bina Sarana Informatika",
  degree: "S1 Teknologi Informasi",
  period: "2023 – 2027",
  location: "Jakarta, Indonesia",
  focus: [
    "Programming & Data Analytics",
    "Web Development & SPA Architecture",
    "IT Support & Quality Control",
    "Database Management & SQL",
  ],
};

const realSkillsCategory = [
  {
    category: "Programming & Data",
    icon: Database,
    items: [
      "Python (Data Processing, Scripting)",
      "SQL (Query, Database Management)",
      "Looker Studio / Google Data Studio",
      "Microsoft Excel & Google Spreadsheet (Certified)",
    ],
  },
  {
    category: "Web Development",
    icon: Code2,
    items: [
      "HTML, CSS, JavaScript (Vanilla JS)",
      "Laravel, React, Vite, Tailwind CSS",
      "IndexedDB & Web SPA Architecture",
    ],
  },
  {
    category: "IT Support & QC",
    icon: Wrench,
    items: [
      "Instalasi & konfigurasi software & hardware",
      "Quality Control perangkat IT sebelum distribusi",
      "System Maintenance & Troubleshooting",
    ],
  },
];

const realProjects = [
  {
    id: "01",
    title: "Business Manager (POS & Cashflow)",
    year: "2026",
    type: "Web SPA & Cashflow Engine",
    desc: "Sistem Point of Sales & Cashflow dengan fitur Jurnal Akuntansi, Inventaris, Buku Besar, dan Gamifikasi.",
    image: "/images/projects/banner project business manager.png",
    tech: ["Vite", "Vanilla JS", "Tailwind CSS", "IndexedDB"],
  },
  {
    id: "02",
    title: "Roxy Leaderboard Analytics",
    year: "2025",
    type: "Data Visualization & Analytics",
    desc: "Dashboard visualisasi data real-time statistik pemain PB. ROXY berbasis Looker Studio.",
    image: "/images/projects/banner project looker studio.png",
    tech: ["Looker Studio", "Google Spreadsheet", "Analytics"],
  },
  {
    id: "03",
    title: "Sistem Manajemen PB. ROXY",
    year: "2025",
    type: "Community Management System",
    desc: "Sistem manajemen komunitas badminton: leaderboard, statistik pemain, match management, dan laporan keuangan.",
    image: "/images/projects/spreadsheet banner.png",
    tech: ["Google Spreadsheet", "Advanced Formulas", "Automation"],
  },
  {
    id: "04",
    title: "Quiz App for Kids — FunQuiz",
    year: "2024",
    type: "Android Education App",
    desc: "Aplikasi Android edukasi anak berbasis kuis interaktif dengan antarmuka yang ramah pengguna.",
    image: "/images/projects/funquiz.png",
    tech: ["Android Studio", "Java", "XML"],
  },
];

const certifications = [
  "PCAP: Programming Essentials in Python (Cisco - 2025)",
  "Uji Kompetensi Bidang Sistem Basis Data (G2 Academy - 2025)",
  "Pemrograman Statistika bagi Data Scientist (Skill Academy - 2025)",
  "Microsoft Excel Advanced & Intermediate (2024 - 2025)",
  "Microsoft Office untuk Pegawai Perkantoran (2025)",
  "Introduction to Cloud and AI Applications (2024)",
  "Digital Entrepreneurship Academy (2024)",
];

const coreStrengths = [
  { label: "DATA ANALYTICS & VISUALIZATION", percent: 95 },
  { label: "WEB DEVELOPMENT (LARAVEL/REACT/VITE)", percent: 92 },
  { label: "IT SUPPORT & QC ENGINEERING", percent: 90 },
  { label: "DATABASE MANAGEMENT & SQL", percent: 95 },
];

const hudCategories: Array<{
  id: CategoryId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}> = [
    {
      id: "experience",
      title: "EXPERIENCE",
      subtitle: "QC ENGINEER & SYSTEM DEV",
      icon: User,
    },
    {
      id: "skills",
      title: "SKILLS",
      subtitle: "PROGRAMMING, WEB & IT SUPPORT",
      icon: Code2,
    },
    {
      id: "education",
      title: "EDUCATION",
      subtitle: "S1 TEKNOLOGI INFORMASI (UBSI)",
      icon: GraduationCap,
    },
    {
      id: "projects",
      title: "PROJECTS",
      subtitle: "4 FEATURED PROJECTS",
      icon: Folder,
    },
  ];

// 3D Parallax Panel Wrapper (Independent dynamic depth per element)
interface Panel3DProps {
  mouseX: number;
  mouseY: number;
  depth?: number;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
function Panel3D({ mouseX, mouseY, depth = 0.5, className = "", children, style }: Panel3DProps) {
  const tiltX = mouseY * -10 * depth;
  const tiltY = mouseX * 10 * depth;
  const transZ = depth * 40;
  const tx = mouseX * -15 * depth;
  const ty = mouseY * -15 * depth;
  return (
    <div
      className={className}
      style={{
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${tx}px) translateY(${ty}px) translateZ(${transZ}px)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedHudElementProps {
  smoothProgress: MotionValue<number>;
  enterRange: [number, number];
  exitRange: [number, number];
  fromX?: number;
  fromY?: number;
  fromRotateY?: number;
  fromScale?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function AnimatedHudElement({
  smoothProgress,
  enterRange,
  exitRange,
  fromX = 0,
  fromY = 0,
  fromRotateY = 0,
  fromScale = 1,
  children,
  className = "",
  style = {},
}: AnimatedHudElementProps) {
  const opacity = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    [0, 1, 1, 0]
  );
  const x = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    [fromX, 0, 0, fromX]
  );
  const y = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    [fromY, 0, 0, fromY]
  );
  const rotateY = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    [fromRotateY, 0, 0, fromRotateY]
  );
  const scale = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    [fromScale, 1, 1, fromScale]
  );
  const visibility = useTransform(smoothProgress, (val) =>
    val < enterRange[0] - 0.005 || val > exitRange[1] + 0.005 ? "hidden" : "visible"
  );

  return (
    <motion.div
      className={className}
      style={{
        opacity,
        x,
        y,
        rotateY,
        scale,
        visibility,
        willChange: "transform, opacity",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedTypewriterLineProps {
  smoothProgress: MotionValue<number>;
  enterRange: [number, number];
  exitRange: [number, number];
  children: React.ReactNode;
  className?: string;
  showCursor?: boolean;
}

function AnimatedTypewriterLine({
  smoothProgress,
  enterRange,
  exitRange,
  children,
  className = "",
  showCursor = false,
}: AnimatedTypewriterLineProps) {
  const clipPath = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    [
      "inset(-20px 100% -20px -20px)",
      "inset(-20px 0% -20px -20px)",
      "inset(-20px 0% -20px -20px)",
      "inset(-20px 100% -20px -20px)",
    ]
  );
  const opacity = useTransform(
    smoothProgress,
    [
      enterRange[0],
      enterRange[0] + (enterRange[1] - enterRange[0]) * 0.1,
      exitRange[1] - (exitRange[1] - exitRange[0]) * 0.1,
      exitRange[1],
    ],
    [0, 1, 1, 0]
  );
  const cursorLeft = useTransform(
    smoothProgress,
    [enterRange[0], enterRange[1], exitRange[0], exitRange[1]],
    ["0%", "100%", "100%", "0%"]
  );
  const cursorOpacity = useTransform(
    smoothProgress,
    [
      enterRange[0],
      enterRange[0] + 0.002,
      enterRange[1] - 0.002,
      enterRange[1],
      exitRange[0],
      exitRange[0] + 0.002,
      exitRange[1] - 0.002,
      exitRange[1],
    ],
    [0, 1, 1, 0, 0, 1, 1, 0]
  );
  const visibility = useTransform(smoothProgress, (val) =>
    val < enterRange[0] - 0.005 || val > exitRange[1] + 0.005 ? "hidden" : "visible"
  );

  return (
    <div className={`relative inline-block w-full ${className}`}>
      <motion.div style={{ clipPath, opacity, visibility, willChange: "clip-path, opacity" }} className="w-full">
        {children}
      </motion.div>
      {showCursor && (
        <motion.span
          style={{ left: cursorLeft, opacity: cursorOpacity, visibility, willChange: "left, opacity" }}
          className="absolute top-0 bottom-0 w-[3px] bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-primary)] pointer-events-none"
        />
      )}
    </div>
  );
}

export function TonyStarkHudProfile({ smoothProgress, isAvatarReady = true }: TonyStarkHudProfileProps) {
  const readyProgress = useMotionValue(0);
  useEffect(() => {
    import("framer-motion").then(({ animate }) => {
      animate(readyProgress, isAvatarReady ? 1 : 0, { type: "spring", stiffness: 40, damping: 10 });
    });
  }, [isAvatarReady, readyProgress]);

  const combinedProgress = useTransform(
    [smoothProgress, readyProgress],
    ([scroll, ready]) => {
      const s = scroll as number;
      const r = ready as number;
      if (r === 1) return s;
      // Sweep from 0.16 (hidden state) up to current scroll position as ready goes 0 -> 1
      return 0.16 + (s - 0.16) * r;
    }
  );

  const opacity = useTransform(combinedProgress, [0.174, 0.178, 0.368, 0.373], [0, 1, 1, 0]);
  const scale = useTransform(combinedProgress, [0.174, 0.182, 0.364, 0.373], [0.98, 1, 1, 1.02]);
  const visibility = useTransform(combinedProgress, (val) => (val < 0.172 || val > 0.375 ? "hidden" : "visible"));

  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null);
  const [clockTime, setClockTime] = useState("23:46:21");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearActiveReset = useCallback(() => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  }, []);

  const handleNodeEnter = (cat: CategoryId) => {
    clearActiveReset();
    setActiveCategory(cat);
  };

  const handleNodesLeave = () => {
    clearActiveReset();
    resetTimer.current = setTimeout(() => {
      setActiveCategory(null);
    }, 450);
  };

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      const ms = Math.floor(d.getMilliseconds() / 100);
      setClockTime(`${h}:${m}:${s}.${ms}`);
    };
    const timer = setInterval(updateTime, 80);
    return () => clearInterval(timer);
  }, []);

  // Lock scrolling when assistant is active
  useEffect(() => {
    if (isAssistantActive) {
      document.body.style.overflow = 'hidden';
      if ((window as any).lenis) (window as any).lenis.stop();
    } else {
      document.body.style.overflow = '';
      if ((window as any).lenis) (window as any).lenis.start();
    }
    
    return () => {
      document.body.style.overflow = '';
      if ((window as any).lenis) (window as any).lenis.start();
    };
  }, [isAssistantActive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const { isListening, isSpeaking, isProcessing, transcript, error, startListening, sendTextMessage, chatHistory, userName, language, setLanguage } = useVoiceAssistant();

  const [textInput, setTextInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isProcessing, isSpeaking]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    sendTextMessage(textInput);
    setTextInput("");
  };

  const mx = mousePos.x;
  const my = mousePos.y;

  const hudOpacity = isAssistantActive ? 0 : 1;
  const hudPointerEvents = isAssistantActive ? "none" : "auto";

  const jarvisSpeech = useTransform(smoothProgress, (val): string => {
    if (activeCategory === "experience") return "MEMUAT ARSIP PENGALAMAN KERJA DAN KONTRIBUSI PROFESIONAL.";
    if (activeCategory === "skills") return "MENGANALISIS KEAHLIAN TEKNIS, ALAT BI, DAN FRAMEWORK PENGEMBANGAN.";
    if (activeCategory === "education") return "MENAMPILKAN LATAR BELAKANG PENDIDIKAN DAN PRESTASI AKADEMIK.";
    if (activeCategory === "projects") return "MEMERIKSA DATABASE PROYEK UNGGULAN DAN IMPLEMENTASI SISTEM.";
    if (val < 0.2) return "PROFIL MARK-VI ONLINE. MENGINISIALISASI SEMUA MODUL TELEMETRI SECARA BERTAHAP.";
    if (val < 0.25) return "SEMUA DATA KEAHLIAN DAN PROYEK SIAP DIANALISIS SECARA LIVE DI ATAS KURSOR.";
    return "MEMPERSIAPKAN TRANSISI KE RUANG ARSIP SECARA HALUS TANPA BENTURAN VISUAL.";
  });

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity,
        scale,
        visibility,
        pointerEvents: "auto",
        willChange: "transform, opacity",
      }}
      className="absolute inset-0 z-[60] overflow-hidden bg-transparent font-mono text-[var(--foreground)] select-none"
    >
      <motion.div className="absolute inset-0 mx-auto max-w-[1680px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.15)_60%,rgba(0,0,0,0.35)_100%)]" />

        <motion.div
          animate={{ opacity: hudOpacity }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ pointerEvents: hudPointerEvents as any }}
        >
          <AnimatedHudElement
            smoothProgress={combinedProgress}
            enterRange={[0.175, 0.190]}
            exitRange={[0.458, 0.472]}
            fromY={-35}
            className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6 lg:right-28 lg:top-8 pointer-events-none"
          >
            <Panel3D mouseX={mx} mouseY={my} depth={0.32} className="flex items-center gap-3">
              <div className="flex items-center gap-2 sm:gap-4 rounded-full border border-[var(--foreground)]/20 bg-[var(--background)]/95 md:bg-[var(--background)]/70 px-3 py-1 sm:px-4 sm:py-1.5 text-[8px] sm:text-[10px] uppercase tracking-[0.16em] text-[var(--foreground)] drop-shadow-[0_0_10px_rgb(var(--theme-primary-rgb)/0.4)] md:backdrop-blur-md">
                <span><b className="text-[var(--theme-primary)]">CLOCK</b> {clockTime}</span>
                <span><b className="text-[var(--theme-primary)]">NET</b> <span className="font-bold text-[var(--theme-primary)]">STABLE</span></span>
              </div>
              <div className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--theme-primary-rgb)/0.5)] shadow-[0_0_16px_rgb(var(--theme-primary-rgb)/0.4)] xl:flex">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-[rgb(var(--theme-primary-rgb)/0.6)]"
                />
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-primary)]" />
                <div className="absolute h-full w-px bg-[rgb(var(--theme-primary-rgb)/0.4)]" />
                <div className="absolute h-px w-full bg-[rgb(var(--theme-primary-rgb)/0.4)]" />
              </div>
            </Panel3D>
          </AnimatedHudElement>
        </motion.div>

        <motion.div
          className="absolute left-4 top-[80px] bottom-[100px] z-30 flex flex-col justify-between lg:bottom-auto lg:justify-start lg:gap-4 lg:left-8 xl:left-12 w-[240px] sm:w-[280px] lg:w-[310px] xl:w-[330px] pointer-events-none origin-top-left scale-[0.85] sm:scale-100"
          animate={{ opacity: hudOpacity }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ pointerEvents: isAssistantActive ? "none" : undefined }}
        >
          <Panel3D mouseX={mx} mouseY={my} depth={0.35}>
            <div className="space-y-0.5">
              <AnimatedTypewriterLine
                smoothProgress={combinedProgress}
                enterRange={[0.178, 0.190]}
                exitRange={[0.458, 0.470]}
                showCursor={true}
              >
                <h1 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)] drop-shadow-[0_0_14px_var(--foreground)] sm:text-base lg:text-lg xl:text-xl pointer-events-auto w-max">
                  PRASETYO BINTANG
                </h1>
              </AnimatedTypewriterLine>
              <AnimatedTypewriterLine
                smoothProgress={combinedProgress}
                enterRange={[0.183, 0.195]}
                exitRange={[0.453, 0.465]}
                showCursor={true}
              >
                <div className="text-xs font-extrabold uppercase tracking-[0.16em] sm:text-sm lg:text-base xl:text-lg pointer-events-auto w-max">
                  <span className="text-[var(--theme-primary)] drop-shadow-[0_0_12px_var(--theme-primary)]">SIDIQ </span>
                  <span className="text-[var(--theme-primary)] drop-shadow-[0_0_12px_var(--theme-primary)]">NAWAWI</span>
                </div>
              </AnimatedTypewriterLine>
              <AnimatedTypewriterLine
                smoothProgress={combinedProgress}
                enterRange={[0.188, 0.198]}
                exitRange={[0.448, 0.460]}
                showCursor={true}
              >
                <div className="pt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--foreground)]">
                  IT INTERN
                </div>
              </AnimatedTypewriterLine>
              <AnimatedTypewriterLine
                smoothProgress={combinedProgress}
                enterRange={[0.192, 0.201]}
                exitRange={[0.444, 0.456]}
                showCursor={false}
              >
                <div className="text-[9px] uppercase tracking-[0.18em] text-[var(--foreground)]/75">
                  DATA ANALYST • WEB DEVELOPER
                </div>
              </AnimatedTypewriterLine>
              <AnimatedHudElement
                smoothProgress={combinedProgress}
                enterRange={[0.195, 0.203]}
                exitRange={[0.442, 0.452]}
                fromScale={0}
              >
                <div className="mt-2.5 h-[2px] w-full bg-gradient-to-r from-[var(--theme-primary)] via-[rgb(var(--theme-primary-rgb)/0.5)] to-transparent shadow-[0_0_10px_var(--theme-primary)] origin-left" />
              </AnimatedHudElement>
            </div>
          </Panel3D>

          <div
            className="flex flex-col gap-2 pb-2 lg:overflow-visible lg:pb-0 pointer-events-auto"
            onMouseLeave={handleNodesLeave}
            onPointerLeave={handleNodesLeave}
          >
            {hudCategories.map((category, idx) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const nodeDepth = 0.45 + idx * 0.08;

              return (
                <AnimatedHudElement
                  key={category.id}
                  smoothProgress={combinedProgress}
                  enterRange={[0.186 + idx * 0.005, 0.198 + idx * 0.005]}
                  exitRange={[0.455 - idx * 0.005, 0.467 - idx * 0.005]}
                  fromX={-70}
                >
                  <Panel3D mouseX={mx} mouseY={my} depth={nodeDepth}>
                    <button
                      type="button"
                      onPointerEnter={() => handleNodeEnter(category.id)}
                      onMouseEnter={() => handleNodeEnter(category.id)}
                      onFocus={() => handleNodeEnter(category.id)}
                      onClick={() => activeCategory === category.id ? setActiveCategory(null) : handleNodeEnter(category.id)}
                      className={`group flex w-full flex-row items-center gap-2 lg:gap-3 rounded-lg lg:rounded-xl border px-2.5 py-2 lg:px-3.5 lg:py-2.5 text-left transition-all cursor-pointer md:backdrop-blur-md ${isActive
                        ? "border-[var(--theme-primary)] bg-[rgb(var(--theme-primary-rgb)/0.15)] shadow-[0_0_22px_rgb(var(--theme-primary-rgb)/0.5)] lg:scale-[1.02]"
                        : "border-[var(--foreground)]/20 bg-[var(--background)]/95 md:bg-[var(--background)]/70 hover:border-[var(--theme-primary)]/70 hover:bg-[var(--background)]/90 hover:shadow-[0_0_16px_rgb(var(--theme-primary-rgb)/0.35)]"
                        }`}
                    >
                      <div className={`flex h-7 w-7 lg:h-9 lg:w-9 shrink-0 items-center justify-center rounded-full border transition-all ${isActive
                        ? "border-[var(--theme-primary)] bg-[rgb(var(--theme-primary-rgb)/0.25)] shadow-[0_0_16px_rgb(var(--theme-primary-rgb)/0.7)] text-[var(--theme-primary)]"
                        : "border-[var(--foreground)]/25 bg-[var(--background)]/50 text-[var(--foreground)]/80 group-hover:border-[var(--theme-primary)] group-hover:text-[var(--theme-primary)]"
                        }`}>
                        <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.12em] lg:tracking-[0.16em] transition-colors leading-tight ${isActive ? "text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]" : "text-[var(--foreground)] group-hover:text-[var(--theme-primary)]"
                          }`}>
                          {category.title}
                        </div>
                        <div className="hidden lg:block truncate text-[8px] uppercase tracking-[0.12em] text-[var(--foreground)]/70 mt-0.5">
                          {category.subtitle}
                        </div>
                      </div>
                      <div className={`hidden lg:block h-2 w-2 rounded-full transition-all ${isActive ? "bg-[var(--theme-primary)] shadow-[0_0_12px_var(--theme-primary)] scale-125" : "bg-[var(--foreground)]/40 group-hover:bg-[var(--theme-primary)]/80"
                        }`} />
                    </button>
                  </Panel3D>
                </AnimatedHudElement>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className={`absolute left-4 right-4 bottom-[195px] top-auto z-40 lg:top-[75px] lg:bottom-auto lg:left-auto lg:right-8 xl:right-12 lg:w-[320px] xl:w-[350px] ${!activeCategory ? 'hidden lg:block' : 'block'} pointer-events-none`}
          onPointerEnter={clearActiveReset}
          onPointerLeave={handleNodesLeave}
          onMouseEnter={clearActiveReset}
          onMouseLeave={handleNodesLeave}
          animate={{ opacity: hudOpacity }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ pointerEvents: isAssistantActive ? "none" : undefined }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory ?? "default"}
              initial={{ opacity: 0, x: 20, rotateY: -12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, rotateY: 12, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
              className="relative flex flex-col gap-4 p-5 lg:p-0 rounded-2xl lg:rounded-none bg-[var(--background)]/85 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-[var(--foreground)]/10 lg:border-none shadow-2xl lg:shadow-none pointer-events-auto"
            >
              {/* Mobile Close Button */}
              {activeCategory && (
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="absolute top-4 right-4 lg:hidden p-1.5 rounded-full bg-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 transition-colors z-50"
                >
                  <X size={14} />
                </button>
              )}
              {activeCategory === "experience" && (
                <AnimatedHudElement
                  smoothProgress={combinedProgress}
                  enterRange={[0.188, 0.202]}
                  exitRange={[0.450, 0.464]}
                  fromX={80}
                  fromRotateY={-25}
                  fromScale={0.9}
                >
                  <Panel3D mouseX={mx} mouseY={my} depth={0.55}>
                    <div className="space-y-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">
                        {"// DETAIL PENGALAMAN & ORGANISASI"}
                      </div>
                      <div className="space-y-4 max-h-[42vh] lg:max-h-[calc(100vh-220px)] overflow-y-auto pr-1.5 scrollbar-thin pointer-events-auto">
                        {realExperience.map((exp, eIdx) => (
                          <div key={eIdx} className="border-l-2 border-[var(--theme-primary)] pl-3 space-y-1.5 py-0.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="text-[12px] font-black leading-tight text-[var(--foreground)]">{exp.company}</div>
                              <div className="text-[11px] font-bold text-[var(--theme-primary)]">{exp.role}</div>
                            </div>
                            <div className="inline-flex items-center gap-2 text-[9px] text-[var(--foreground)]/85 font-bold bg-[rgb(var(--theme-primary-rgb)/0.12)] px-2 py-0.5 rounded border border-[rgb(var(--theme-primary-rgb)/0.3)] shadow-[0_0_6px_rgb(var(--theme-primary-rgb)/0.15)]">
                              <span>{exp.period}</span>
                              <span className="text-[var(--theme-primary)]">•</span>
                              <span className="text-[var(--theme-primary)]">{exp.type}</span>
                            </div>
                            <div className="pt-0.5 space-y-1">
                              {exp.points.map((pt, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-[10px] leading-snug text-[var(--foreground)]/90">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-primary)] mt-1 shrink-0 shadow-[0_0_6px_var(--theme-primary)]" />
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Panel3D>
                </AnimatedHudElement>
              )}

              {activeCategory === "skills" && (
                <>
                  <AnimatedHudElement
                    smoothProgress={combinedProgress}
                    enterRange={[0.188, 0.200]}
                    exitRange={[0.455, 0.467]}
                    fromX={80}
                    fromRotateY={-25}
                  >
                    <Panel3D mouseX={mx} mouseY={my} depth={0.35}>
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">
                        {"// DETAIL KEAHLIAN TEKNIS"}
                      </div>
                    </Panel3D>
                  </AnimatedHudElement>
                  <div className="space-y-3">
                    {realSkillsCategory.map((cat, i) => (
                      <AnimatedHudElement
                        key={cat.category}
                        smoothProgress={combinedProgress}
                        enterRange={[0.192 + i * 0.005, 0.204 + i * 0.005]}
                        exitRange={[0.452 - i * 0.005, 0.464 - i * 0.005]}
                        fromX={80}
                        fromRotateY={-25}
                        fromScale={0.9}
                      >
                        <Panel3D mouseX={mx} mouseY={my} depth={0.45 + i * 0.1}>
                          <div className="space-y-1.5 border-l-2 border-[rgb(var(--theme-primary-rgb)/0.6)] pl-3 py-0.5 pointer-events-auto">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--theme-primary)] drop-shadow-[0_0_6px_rgb(var(--theme-primary-rgb)/0.5)]">
                              <cat.icon className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
                              <span>{cat.category}</span>
                            </div>
                            <ul className="space-y-1 pl-4 text-[11px] text-[var(--foreground)]">
                              {cat.items.map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                  <span className="h-1 w-1 rounded-full bg-[var(--theme-primary)] shadow-[0_0_6px_var(--theme-primary)]" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Panel3D>
                      </AnimatedHudElement>
                    ))}
                  </div>
                </>
              )}

              {activeCategory === "education" && (
                <AnimatedHudElement
                  smoothProgress={combinedProgress}
                  enterRange={[0.188, 0.202]}
                  exitRange={[0.450, 0.464]}
                  fromX={80}
                  fromRotateY={-25}
                  fromScale={0.9}
                >
                  <Panel3D mouseX={mx} mouseY={my} depth={0.55}>
                    <div className="space-y-2.5 pointer-events-auto">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">
                        {"// DETAIL PENDIDIKAN"}
                      </div>
                      <div className="border-l-2 border-[var(--theme-primary)] pl-3.5 space-y-2 py-0.5">
                        <div className="text-xs font-black text-[var(--foreground)]">{realEducation.institution}</div>
                        <div className="text-[11px] font-bold text-[var(--theme-primary)]">{realEducation.degree}</div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[var(--foreground)]/80 font-bold">{realEducation.period}</span>
                          <span className="text-[var(--foreground)]/60">{realEducation.location}</span>
                        </div>
                        <div className="mt-2 space-y-1.5 text-[11px] text-[var(--foreground)]/90">
                          {realEducation.focus.map((focus) => (
                            <div key={focus} className="flex items-center gap-2">
                              <span className="h-1 w-1 rounded-full bg-[var(--theme-primary)] shadow-[0_0_6px_var(--theme-primary)]" />
                              <span>{focus}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="h-1 w-1 rounded-full bg-[var(--theme-primary)] shadow-[0_0_6px_var(--theme-primary)]" />
                            <span className="font-bold text-[var(--theme-primary)]">7x Certified IT & Data Analyst</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Panel3D>
                </AnimatedHudElement>
              )}

              {activeCategory === "projects" && (
                <>
                  <AnimatedHudElement
                    smoothProgress={combinedProgress}
                    enterRange={[0.188, 0.200]}
                    exitRange={[0.455, 0.467]}
                    fromX={80}
                    fromRotateY={-25}
                  >
                    <Panel3D mouseX={mx} mouseY={my} depth={0.35}>
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">
                        {"// FEATURED PROJECTS"}
                      </div>
                    </Panel3D>
                  </AnimatedHudElement>
                  <div className="space-y-2.5">
                    {realProjects.map((p, i) => (
                      <AnimatedHudElement
                        key={p.id}
                        smoothProgress={combinedProgress}
                        enterRange={[0.192 + i * 0.005, 0.204 + i * 0.005]}
                        exitRange={[0.452 - i * 0.005, 0.464 - i * 0.005]}
                        fromX={80}
                        fromRotateY={-25}
                        fromScale={0.9}
                      >
                        <Panel3D mouseX={mx} mouseY={my} depth={0.44 + i * 0.08}>
                          <div className="flex items-start gap-2.5 py-1 transition-all hover:translate-x-1 pointer-events-auto">
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-[rgb(var(--theme-primary-rgb)/0.5)] bg-[rgb(var(--theme-primary-rgb)/0.1)] shadow-[0_0_8px_rgb(var(--theme-primary-rgb)/0.3)]">
                              <Image
                                src={p.image}
                                alt={`${p.title} preview`}
                                fill
                                sizes="64px"
                                className="object-cover opacity-90 saturate-[1.15]"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1">
                                <div className="truncate text-[11px] font-bold text-[var(--foreground)]">{p.title}</div>
                                <div className="shrink-0 text-[8px] font-bold text-[var(--theme-primary)]">{p.year}</div>
                              </div>
                              <div className="text-[8px] text-[var(--foreground)]/70">{p.type}</div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {p.tech.slice(0, 3).map((t) => (
                                  <span key={t} className="rounded border border-[var(--foreground)]/20 bg-[var(--foreground)]/5 px-1 py-0.5 text-[7px] text-[var(--foreground)]/85">{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Panel3D>
                      </AnimatedHudElement>
                    ))}
                  </div>
                </>
              )}

              {!activeCategory && (
                <div className="flex flex-col gap-4">
                  <AnimatedHudElement
                    smoothProgress={combinedProgress}
                    enterRange={[0.188, 0.200]}
                    exitRange={[0.455, 0.467]}
                    fromX={80}
                    fromRotateY={-25}
                    fromScale={0.9}
                  >
                    <Panel3D mouseX={mx} mouseY={my} depth={0.42}>
                      <div>
                        <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">
                          PERSONAL INFO
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center justify-between border-b border-[var(--foreground)]/15 py-0.5">
                            <span className="flex items-center gap-1.5 text-[var(--foreground)]/75"><User className="h-3.5 w-3.5 text-[var(--theme-primary)]" /> ID</span>
                            <span className="font-bold text-[var(--foreground)]">PB-2026</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-[var(--foreground)]/15 py-0.5">
                            <span className="flex items-center gap-1.5 text-[var(--foreground)]/75"><MapPin className="h-3.5 w-3.5 text-[var(--theme-primary)]" /> LOCATION</span>
                            <span className="font-bold text-[var(--foreground)]">Jakarta, Indonesia</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-[var(--foreground)]/15 py-0.5">
                            <span className="flex items-center gap-1.5 text-[var(--foreground)]/75"><Mail className="h-3.5 w-3.5 text-[var(--theme-primary)]" /> EMAIL</span>
                            <span className="font-bold text-[var(--theme-primary)]">pbsn290704@gmail.com</span>
                          </div>
                        </div>
                      </div>
                    </Panel3D>
                  </AnimatedHudElement>

                  <AnimatedHudElement
                    smoothProgress={combinedProgress}
                    enterRange={[0.193, 0.205]}
                    exitRange={[0.450, 0.462]}
                    fromX={80}
                    fromRotateY={-25}
                    fromScale={0.9}
                  >
                    <Panel3D mouseX={mx} mouseY={my} depth={0.54}>
                      <div>
                        <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">EDUCATION</div>
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--theme-primary-rgb)/0.6)] bg-[rgb(var(--theme-primary-rgb)/0.15)] text-[var(--theme-primary)] shadow-[0_0_10px_rgb(var(--theme-primary-rgb)/0.4)]">
                            <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-[var(--foreground)]">{realEducation.degree}</div>
                            <div className="text-[9px] text-[var(--foreground)]/75 truncate">{realEducation.institution}</div>
                            <div className="mt-0.5 flex items-center justify-between text-[9px]">
                              <span className="text-[var(--foreground)]/70">{realEducation.period}</span>
                              <span className="font-bold text-[var(--theme-primary)]">{realEducation.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Panel3D>
                  </AnimatedHudElement>

                  <AnimatedHudElement
                    smoothProgress={combinedProgress}
                    enterRange={[0.198, 0.210]}
                    exitRange={[0.445, 0.457]}
                    fromX={80}
                    fromRotateY={-25}
                    fromScale={0.9}
                  >
                    <Panel3D mouseX={mx} mouseY={my} depth={0.66}>
                      <div>
                        <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">CERTIFICATION</div>
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--theme-primary-rgb)/0.6)] bg-[rgb(var(--theme-primary-rgb)/0.15)] text-[var(--theme-primary)] shadow-[0_0_10px_rgb(var(--theme-primary-rgb)/0.4)]">
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-black uppercase tracking-wider text-[var(--theme-primary)] drop-shadow-[0_0_6px_rgb(var(--theme-primary-rgb)/0.6)]">7X CERTIFIED IT & DATA ANALYST</div>
                            <ul className="mt-1 space-y-0.5 text-[9px] text-[var(--foreground)]/90 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
                              {certifications.map((cert) => (
                                <li key={cert} className="flex items-center gap-1.5">
                                  <span className="h-1 w-1 rounded-full bg-[var(--theme-primary)] shadow-[0_0_4px_var(--theme-primary)]" />
                                  <span className="truncate">{cert}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Panel3D>
                  </AnimatedHudElement>

                  <AnimatedHudElement
                    smoothProgress={combinedProgress}
                    enterRange={[0.203, 0.215]}
                    exitRange={[0.440, 0.452]}
                    fromX={80}
                    fromRotateY={-25}
                    fromScale={0.9}
                  >
                    <Panel3D mouseX={mx} mouseY={my} depth={0.48}>
                      <div>
                        <div className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]">CORE STRENGTHS</div>
                        <div className="flex items-start gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--theme-primary-rgb)/0.6)] bg-[rgb(var(--theme-primary-rgb)/0.15)] text-[var(--theme-primary)] shadow-[0_0_10px_rgb(var(--theme-primary-rgb)/0.4)]">
                            <Brain className="h-3.5 w-3.5" strokeWidth={1.8} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1.5">
                            {coreStrengths.map((s) => (
                              <div key={s.label}>
                                <div className="mb-0.5 flex justify-between text-[8px] font-bold text-[var(--foreground)]/85">
                                  <span>{s.label}</span>
                                  <span className="text-[var(--theme-primary)]">{s.percent}%</span>
                                </div>
                                <div className="h-1 overflow-hidden rounded-full bg-[rgb(var(--theme-primary-rgb)/0.15)] border border-[var(--foreground)]/20">
                                  <div className="h-full rounded-full bg-[var(--theme-primary)] shadow-[0_0_6px_var(--theme-primary)]" style={{ width: `${s.percent}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Panel3D>
                  </AnimatedHudElement>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <AnimatedHudElement
          smoothProgress={combinedProgress}
          enterRange={[0.195, 0.210]}
          exitRange={[0.440, 0.455]}
          fromY={35}
          className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-8 sm:right-8 z-30 pointer-events-none"
        >
          <div className="relative pointer-events-none w-full h-full">
            <AnimatePresence mode="wait">
              {isAssistantActive ? (
                <motion.div
                  key="chat-dashboard"
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onWheel={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                  onTouchMove={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                  className={`absolute bottom-0 right-0 flex flex-col gap-4 text-[var(--foreground)] w-full max-w-[340px] px-5 py-4 rounded-2xl border bg-[var(--background)]/98 md:bg-[var(--background)]/85 md:backdrop-blur-xl pointer-events-auto shadow-2xl transition-all duration-300 ${isListening
                    ? 'border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse'
                    : isSpeaking
                      ? 'border-green-500/80 shadow-[0_0_40px_rgba(34,197,94,0.3)]'
                      : isProcessing
                        ? 'border-blue-500/80 shadow-[0_0_40px_rgba(59,130,246,0.3)]'
                        : 'border-[var(--theme-primary)]/50 shadow-[0_0_40px_rgb(var(--theme-primary-rgb)/0.3)]'
                    }`}
                >
                  {/* Chat History Section */}
                  <div
                    ref={chatScrollRef}
                    data-lenis-prevent="true"
                    className="flex-1 max-h-[300px] min-h-[150px] overflow-y-auto overscroll-contain pr-2 space-y-4 scrollbar-thin scrollbar-thumb-[var(--theme-primary)]/50 scrollbar-track-transparent"
                  >
                    {chatHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-[var(--foreground)]/50 italic text-xs">
                        Mulai percakapan dengan mengetik atau berbicara...
                      </div>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <span className={`text-[9px] uppercase font-bold tracking-wider mb-1 opacity-50 ${msg.role === 'user' ? 'mr-1' : 'ml-1 text-[var(--theme-primary)]'}`}>
                            {msg.role === 'user' ? 'Anda' : 'Bintang'}
                          </span>
                          <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-tr-sm' 
                            : 'bg-[var(--theme-primary)]/10 text-[var(--foreground)] border border-[var(--theme-primary)]/30 rounded-tl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Status Indicators (Listening/Processing/Speaking) */}
                    {(isListening || isProcessing || isSpeaking) && (
                      <div className="flex flex-col items-start mt-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ml-1 ${
                          isListening ? 'text-red-500' : isProcessing ? 'text-[var(--theme-primary)]' : 'text-green-500'
                        }`}>
                          {isListening ? 'Bintang sedang mendengarkan' : isProcessing ? 'Bintang sedang mengetik' : 'Bintang sedang berbicara'}
                        </span>
                        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--background)]/50 rounded-2xl border border-[var(--foreground)]/10 rounded-tl-sm">
                          {isListening ? (
                            <><MicOff size={16} className="text-red-500 animate-pulse" /><span className="text-sm italic text-red-500">Mendengarkan...</span></>
                          ) : isProcessing ? (
                            <div className="flex items-center gap-1.5 h-5 px-2">
                              <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
                              <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
                              <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
                            </div>
                          ) : isSpeaking ? (
                            <><Volume2 size={16} className="text-green-500 animate-pulse" /><span className="text-sm italic text-green-500">Menjawab...</span></>
                          ) : null}
                          
                          {/* Equalizer animation for speaking */}
                          {isSpeaking && (
                            <div className="flex items-center gap-1 ml-2 h-4">
                              {[8, 14, 7, 18, 11].map((h, i) => (
                                <motion.span
                                  key={i}
                                  animate={{ height: [h*0.3, h, h*0.3] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                  className="w-1 bg-green-500 rounded-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Section */}
                  <div className="flex items-center gap-3 pt-2 border-t border-[var(--foreground)]/10">
                    <form onSubmit={handleTextSubmit} className="flex-1 relative">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={isListening ? "Sedang merekam suara..." : isProcessing ? "Tunggu sebentar..." : "Ketik pesan Anda di sini..."}
                        disabled={isListening || isProcessing}
                        className="w-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/20 rounded-full py-3 px-5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:outline-none focus:border-[var(--theme-primary)]/50 focus:bg-[var(--foreground)]/10 transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!textInput.trim() || isProcessing || isListening}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-[var(--foreground)]/50 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 transition-colors disabled:opacity-30"
                      >
                        <Send size={18} />
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                      disabled={isProcessing || isListening}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--foreground)]/30 text-[var(--foreground)]/60 hover:bg-[var(--theme-primary)]/20 hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)]/50 transition-all text-xs font-bold disabled:opacity-50"
                      title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                    >
                      {language === 'id' ? 'ID' : 'EN'}
                    </button>

                    <div className="h-10 w-px bg-[var(--foreground)]/10 mx-1" />

                    <button
                      onClick={startListening}
                      disabled={isProcessing}
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 disabled:opacity-50 ${isListening
                        ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] bg-red-500/10'
                        : isSpeaking
                          ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] bg-green-500/10'
                          : 'border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 hover:scale-105'
                      }`}
                    >
                      {isListening ? <MicOff size={20} className="animate-pulse" /> : <Mic size={20} />}
                    </button>

                    <button
                      onClick={() => setIsAssistantActive(false)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--foreground)]/30 text-[var(--foreground)]/60 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50 transition-all ml-1"
                      title="Tutup AI Assistant"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ask-button"
                  initial={{ opacity: 0, y: 20, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 20, x: "-50%" }}
                  className="pointer-events-auto absolute left-1/2 bottom-0"
                >
                  <button
                    onClick={() => setIsAssistantActive(true)}
                    className="group flex items-center gap-3 rounded-full border border-[var(--theme-primary)]/50 bg-[var(--background)]/95 md:bg-[var(--background)]/60 md:backdrop-blur-md px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-[var(--theme-primary)] transition-all hover:bg-[var(--theme-primary)]/20 hover:scale-105 hover:shadow-[0_0_20px_rgb(var(--theme-primary-rgb)/0.4)]"
                  >
                    <MessageSquare size={16} className="animate-pulse" />
                    Ask me anything
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimatedHudElement>
      </motion.div>
    </motion.div>
  );
}
