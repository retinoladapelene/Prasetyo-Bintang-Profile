"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import * as THREE from "three";
import { VerticalPortalController } from "@/components/three/VerticalPortalController";

// Shared state to communicate scroll progress to the canvas
export const portalState = { progress: 0.0 };

const PortalCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    const w = 800;
    const h = 800;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 24; // Pulled back further to give more room for sparks to travel
    
    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    mountRef.current.appendChild(renderer.domElement);
    
    const controller = new VerticalPortalController(scene);
    
    const clock = new THREE.Timer();
    let rid = 0;
    const animate = () => {
      rid = requestAnimationFrame(animate);
      clock.update();
      controller.update(clock.getDelta(), portalState.progress);
      renderer.render(scene, camera);
    };
    animate();
    
    return () => {
      cancelAnimationFrame(rid);
      controller.dispose();
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full pointer-events-none flex items-center justify-center" />;
};

export function SlingRingPortal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=250%", // 2.5x screen height for the portal animation duration
          scrub: 1, // Smooth scrub
          pin: true,
          anticipatePin: 1,
          onEnter: () => gsap.set(bgRef.current, { opacity: 1 }),
          onLeaveBack: () => gsap.set(bgRef.current, { opacity: 0 }),
          onUpdate: (self) => {
            portalState.progress = self.progress;
          }
        }
      });

      // Initial state (hole is closed)
      gsap.set(portalRef.current, { clipPath: "circle(0px at 50vw 50vh)" });
      gsap.set(ringRef.current, { scale: 1, opacity: 1 });

      // At exactly 25% (when drawing is complete), pop open the hole to match the inside of the ring.
      // The 3D torus has a radius of 3.0 units in a 19.88 unit high viewport on an 800px canvas = ~121px radius.
      tl.set(portalRef.current, { clipPath: "circle(121px at 50vw 50vh)" }, 0.25);

      // We don't rotate the frame anymore, the 3D particles have their own rotation logic
      // Phase 1 & 2: We just wait for the circle to draw itself (0% to 25% of scroll)
      // GSAP doesn't need to tween the ringRef here, as the drawing is handled by the 3D shader based on portalState.progress

      // Phase 3: Ring expands immensely and mask opens (25% - 95%)
      tl.to(portalRef.current, { 
        clipPath: "circle(3025px at 50vw 50vh)", // 121px * 25 = 3025px
        duration: 0.7, 
        ease: "power2.inOut" 
      }, 0.25)
      .to(ringRef.current, { 
        scale: 25, // Match the clipPath scaling (25x)
        opacity: 0, // Fades out as it goes past screen
        duration: 0.7, 
        ease: "power2.inOut" 
      }, 0.25);

      // Final rest (95% - 100%) to ensure smooth unpin
      tl.to(portalRef.current, { clipPath: "circle(3025px at 50vw 50vh)", duration: 0.05 });
        
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={bgRef} className="relative w-full bg-[#000000] z-50 opacity-0">
      <div ref={containerRef} className="relative w-full min-h-screen">
        
        {/* The Sling Ring Magical Sparks */}
        {/* Placed fixed in the center of the viewport during the pin by using a wrapper */}
        <div className="absolute top-0 left-0 w-full h-[100vh] pointer-events-none z-20 overflow-hidden">
          <div 
            ref={ringRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
            style={{ willChange: "transform, opacity" }}
          >
            <PortalCanvas />
          </div>
        </div>

        {/* The Masked Content */}
        {/* We use clipPath on this wrapper. Note that clip-path coordinates like 50% 50% are relative to this wrapper.
            If this wrapper is taller than 100vh, 50% is not the center of the screen. 
            To fix this, we clip a fixed viewport-sized overlay? No, we can animate the clip-path's Y position to be at the top.
            Wait, if container is pinned at top:0, the viewport is at the top of this container.
            So the center of the viewport is at 50vw and 50vh.
            We can set clipPath to circle(0% at 50vw 50vh).
        */}
        <div 
          ref={portalRef}
          className="relative w-full h-full z-10"
          style={{ willChange: "clip-path", clipPath: "circle(0px at 50vw 50vh)" }}
        >
          {children}
        </div>
        
      </div>
    </div>
  );
}
