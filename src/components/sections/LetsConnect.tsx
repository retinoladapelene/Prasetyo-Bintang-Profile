import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowUpRight } from 'lucide-react';
import { ParallaxContent } from "@/components/ui/ParallaxContent";

export function LetsConnect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] flex items-center justify-center w-full bg-[var(--background)] z-10 overflow-hidden border-t border-[var(--foreground)]/10">
      
      {/* Dynamic Background Orbs & Web */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-red-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Spiderman Webs in background (Placed exactly according to their natural straight edges) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Bottom Left Edge */}
        <img src="/images/ui/spooky-halloween-party-background-spiderwebs-600nw-2363896235_no_bg.png" alt="Bottom Left Web" className="absolute bottom-0 left-0 w-[350px] md:w-[500px] h-auto opacity-100 dark:opacity-80 dark:invert" />
        
        {/* Top Right Edge */}
        <img src="/images/ui/jaring-spiderman-png-11_no_bg.png" alt="Top Right Web" className="absolute top-0 right-0 w-[350px] md:w-[500px] h-auto opacity-100 dark:opacity-80 dark:invert" />
      </div>

      <ParallaxContent offset={40} className="w-full px-6 py-20">
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
            
            {/* Left Column: Typography */}
            <div className="flex flex-col gap-6 relative z-20">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >

                <h2 className="relative font-syne text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                  <span className="text-[var(--foreground)]">Let's</span> <br />
                  <span className="relative inline-block">
                    {/* Base text gradient */}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-blue-600">
                      Connect.
                    </span>
                    {/* Web texture text masking (Visible in Light & Dark Mode) */}
                    <span 
                      className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen dark:invert opacity-80"
                      style={{
                        backgroundImage: `url('/images/ui/jaring-spiderman-png-11_no_bg.png')`,
                        backgroundSize: '250px',
                        backgroundPosition: 'top right',
                        backgroundRepeat: 'no-repeat',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent'
                      }}
                    >
                      Connect.
                    </span>
                  </span>
                </h2>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="font-outfit text-lg md:text-xl text-[var(--foreground)]/60 max-w-md mt-6 leading-relaxed"
              >
                Saya selalu terbuka untuk mendiskusikan proyek baru, ide kreatif, atau peluang karir. Mari bangun sesuatu yang luar biasa bersama.
              </motion.p>
            </div>

            {/* Right Column: Interactive Buttons */}
            <div className="flex flex-col gap-4 w-full max-w-md mx-auto lg:mx-0 lg:ml-auto relative z-20">
              
              {/* LinkedIn Button */}
              <motion.a
                href="https://www.linkedin.com/in/prasetyo-bintang-8659042b3"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredBtn('linkedin')}
                onMouseLeave={() => setHoveredBtn(null)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="group relative flex items-center justify-between p-6 md:p-8 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-3xl overflow-hidden hover:border-transparent transition-colors duration-500 shadow-xl"
              >
                {/* Hover Background Fill */}
                <motion.div 
                  className="absolute inset-0 bg-blue-600 origin-left overflow-hidden flex items-center justify-center"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredBtn === 'linkedin' ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src="/images/ui/OIP (1)_no_bg.png" alt="Web Button" className="absolute top-0 right-0 w-48 h-auto opacity-70 dark:opacity-100 dark:invert" />
                </motion.div>
                
                <div className="relative z-10 flex items-center gap-6">
                  <div className={`p-4 rounded-full border transition-colors duration-500 ${hoveredBtn === 'linkedin' ? 'border-white/30 bg-white/10' : 'border-[var(--foreground)]/10 bg-[var(--foreground)]/5'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-500 ${hoveredBtn === 'linkedin' ? 'text-white' : 'text-[var(--foreground)]'}`}>
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                  </div>
                  <span className={`font-syne text-2xl font-bold transition-colors duration-500 ${hoveredBtn === 'linkedin' ? 'text-white' : 'text-[var(--foreground)]'}`}>
                    LinkedIn
                  </span>
                </div>
                
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${hoveredBtn === 'linkedin' ? 'bg-white text-[#0A66C2] scale-110' : 'bg-[var(--foreground)]/10 text-[var(--foreground)] group-hover:scale-110'}`}>
                  <ArrowUpRight size={20} className={`transition-transform duration-500 ${hoveredBtn === 'linkedin' ? 'rotate-45' : ''}`} />
                </div>
              </motion.a>

              {/* CV Button */}
              <motion.a
                href="/CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredBtn('cv')}
                onMouseLeave={() => setHoveredBtn(null)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="group relative flex items-center justify-between p-6 md:p-8 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-3xl overflow-hidden hover:border-transparent transition-colors duration-500 shadow-xl"
              >
                {/* Hover Background Fill */}
                <motion.div 
                  className="absolute inset-0 bg-red-600 origin-left overflow-hidden flex items-center justify-center"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredBtn === 'cv' ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img src="/images/ui/OIP (1)_no_bg.png" alt="Web Button" className="absolute top-0 right-0 w-48 h-auto opacity-70 dark:opacity-100 dark:invert" />
                </motion.div>
                
                <div className="relative z-10 flex items-center gap-6">
                  <div className={`p-4 rounded-full border transition-colors duration-500 ${hoveredBtn === 'cv' ? 'border-white/30 bg-white/10' : 'border-[var(--foreground)]/10 bg-[var(--foreground)]/5'}`}>
                    <FileText size={24} className={`transition-colors duration-500 ${hoveredBtn === 'cv' ? 'text-white' : 'text-[var(--foreground)]'}`} />
                  </div>
                  <span className={`font-syne text-2xl font-bold transition-colors duration-500 ${hoveredBtn === 'cv' ? 'text-white' : 'text-[var(--foreground)]'}`}>
                    Download CV
                  </span>
                </div>
                
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${hoveredBtn === 'cv' ? 'bg-white text-red-600 scale-110' : 'bg-[var(--foreground)]/10 text-[var(--foreground)] group-hover:scale-110'}`}>
                  <ArrowUpRight size={20} className={`transition-transform duration-500 ${hoveredBtn === 'cv' ? 'rotate-45' : ''}`} />
                </div>
              </motion.a>
              
            </div>
          </div>
          
        </div>
      </ParallaxContent>
      
      {/* Massive Background Text - Hidden on mobile for cleaner look, huge on desktop */}
      <div className="hidden md:flex absolute -bottom-10 left-0 right-0 overflow-hidden pointer-events-none justify-center z-0">
        <div className="relative">
          {/* Base solid background text */}
          <h1 className="relative font-syne text-[22vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-[var(--foreground)] opacity-5">
            CONNECT
          </h1>
          {/* Web texture text masking (Visible in Light & Dark Mode) */}
          <h1 
            className="absolute inset-0 font-syne text-[22vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter opacity-10 dark:opacity-20 dark:invert mix-blend-multiply dark:mix-blend-screen"
            style={{
              backgroundImage: `url('/images/ui/spooky-halloween-party-background-spiderwebs-600nw-2363896235_no_bg.png')`,
              backgroundSize: '400px',
              backgroundPosition: 'top right',
              backgroundRepeat: 'no-repeat',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            CONNECT
          </h1>
        </div>
      </div>
    </section>
  );
}
