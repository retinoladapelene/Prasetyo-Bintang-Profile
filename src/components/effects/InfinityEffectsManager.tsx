"use client";

import { useEffect, useState } from "react";
import { useInfinityEffect, triggerInfinityEffect } from "@/hooks/useInfinityEffect";

export function InfinityEffectsManager() {
    const activeEffect = useInfinityEffect();
    const [snapCanvases, setSnapCanvases] = useState<HTMLCanvasElement[]>([]);
    const [snapRect, setSnapRect] = useState<DOMRect | null>(null);
    const [isSnapping, setIsSnapping] = useState(false);

    useEffect(() => {
        if (!activeEffect) return;

        const handleEffect = async () => {
            if (activeEffect === 'time') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => triggerInfinityEffect(null), 1000);
            } 
            else if (activeEffect === 'space') {
                const sections = document.querySelectorAll('section');
                if (sections.length > 0) {
                    // Blink effect
                    document.body.style.transition = 'filter 0.2s';
                    document.body.style.filter = 'brightness(2) sepia(1) hue-rotate(180deg)';
                    
                    setTimeout(() => {
                        const randomSection = sections[Math.floor(Math.random() * sections.length)];
                        randomSection.scrollIntoView({ behavior: 'instant' });
                        
                        setTimeout(() => {
                            document.body.style.filter = '';
                            setTimeout(() => {
                                document.body.style.transition = '';
                                triggerInfinityEffect(null);
                            }, 200);
                        }, 50);
                    }, 200);
                } else {
                    triggerInfinityEffect(null);
                }
            } 
            else if (activeEffect === 'power') {
                // Add screen shake class
                document.body.classList.add('power-shake');
                setTimeout(() => {
                    document.body.classList.remove('power-shake');
                    triggerInfinityEffect(null);
                }, 1500);
            } 
            else if (activeEffect === 'soul') {
                // Soul World Effect
                document.body.style.transition = 'filter 1.5s ease-in-out';
                document.body.style.filter = 'sepia(0.8) hue-rotate(-15deg) contrast(1.2) brightness(0.6)';
                setTimeout(() => {
                    document.body.style.filter = '';
                    setTimeout(() => {
                        document.body.style.transition = '';
                        triggerInfinityEffect(null);
                    }, 1500);
                }, 3000);
            } 
            else if (activeEffect === 'mind') {
                let ticking = false;
                const handleMouseMove = (e: MouseEvent) => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            const interactables = document.querySelectorAll('button, a, img, .glass-panel, h1, h2');
                            interactables.forEach((el) => {
                                const rect = el.getBoundingClientRect();
                                const cx = rect.left + rect.width / 2;
                                const cy = rect.top + rect.height / 2;
                                const dx = e.clientX - cx;
                                const dy = e.clientY - cy;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                
                                if (dist < 300) {
                                    const force = (300 - dist) / 300;
                                    const tx = (dx / dist) * force * 20;
                                    const ty = (dy / dist) * force * 20;
                                    (el as HTMLElement).style.transform = `translate(${tx}px, ${ty}px)`;
                                    (el as HTMLElement).style.transition = 'none';
                                } else {
                                    (el as HTMLElement).style.transform = '';
                                    (el as HTMLElement).style.transition = 'transform 0.5s ease';
                                }
                            });
                            ticking = false;
                        });
                        ticking = true;
                    }
                };

                window.addEventListener('mousemove', handleMouseMove);
                setTimeout(() => {
                    window.removeEventListener('mousemove', handleMouseMove);
                    const interactables = document.querySelectorAll('button, a, img, .glass-panel, h1, h2');
                    interactables.forEach((el) => {
                        (el as HTMLElement).style.transform = '';
                        (el as HTMLElement).style.transition = 'transform 0.5s ease';
                    });
                    triggerInfinityEffect(null);
                }, 5000); // 5 seconds of telekinesis
            } 
            else if (activeEffect === 'reality') {
                if (isSnapping) return;
                setIsSnapping(true);
                try {
                    const { toCanvas } = await import('html-to-image');
                    const targetElement = document.getElementById('main-content') || document.body;
                    
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    
                    setSnapRect({ top: 0, left: 0, width, height } as DOMRect);
                    
                    const canvas = await toCanvas(targetElement, { 
                        backgroundColor: 'transparent',
                        pixelRatio: 1, // Keep scale 1 for performance
                        width: width,
                        height: height,
                        canvasWidth: width,
                        canvasHeight: height,
                        style: {
                            transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
                            transformOrigin: 'top left'
                        },
                        filter: (node) => {
                            const element = node as Element;
                            if (element?.classList?.contains('no-snap')) return false;
                            return true;
                        }
                    });
                    
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (ctx) {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const LAYER_COUNT = 8; // Optimize layers for better performance
                        const layers = Array.from({ length: LAYER_COUNT }, () => {
                            const c = document.createElement('canvas');
                            c.width = canvas.width;
                            c.height = canvas.height;
                            return c;
                        });
                        const layerCtxs = layers.map(c => c.getContext('2d')!);
                        const layerImageDatas = layerCtxs.map(ctx => ctx.createImageData(canvas.width, canvas.height));
                        
                        // Pixel distribution with 2x2 blocks for performance
                        for (let x = 0; x < canvas.width; x += 2) {
                            for (let y = 0; y < canvas.height; y += 2) {
                                const index = (y * canvas.width + x) * 4;
                                if (imageData.data[index + 3] > 0) {
                                    const layerIndex = Math.floor(LAYER_COUNT * (Math.random() + 2 * x / canvas.width) / 3);
                                    const safeIndex = Math.max(0, Math.min(LAYER_COUNT - 1, layerIndex));
                                    
                                    for(let i=0; i<2; i++){
                                        for(let j=0; j<2; j++){
                                            if (x+i < canvas.width && y+j < canvas.height) {
                                                const idx = ((y+j) * canvas.width + (x+i)) * 4;
                                                layerImageDatas[safeIndex].data[idx] = imageData.data[idx];
                                                layerImageDatas[safeIndex].data[idx+1] = imageData.data[idx+1];
                                                layerImageDatas[safeIndex].data[idx+2] = imageData.data[idx+2];
                                                layerImageDatas[safeIndex].data[idx+3] = imageData.data[idx+3];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        layerCtxs.forEach((ctx, i) => ctx.putImageData(layerImageDatas[i], 0, 0));
                        setSnapCanvases(layers);
                        
                        // Hide real content safely
                        targetElement.style.opacity = '0';
                        targetElement.style.transition = 'opacity 0.5s';
                        
                        // Wait for snap out animation
                        setTimeout(() => {
                            // Reverse the animation (dust flies back together)
                            const canvasElements = document.querySelectorAll('.snap-canvas');
                            canvasElements.forEach(el => {
                                (el as HTMLElement).style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
                                el.classList.remove('snapping');
                            });
                            
                            // Wait for reverse animation to finish
                            setTimeout(() => {
                                // Restore real UI
                                targetElement.style.opacity = '1';
                                setSnapCanvases([]);
                                setSnapRect(null);
                                setIsSnapping(false);
                                triggerInfinityEffect(null);
                            }, 2500);
                        }, 3000);
                    }
                } catch (err) {
                    console.error('Reality stone effect failed:', err);
                    setIsSnapping(false);
                    triggerInfinityEffect(null);
                }
            }
        };

        handleEffect();
    }, [activeEffect]);

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes power-shake {
                    0% { transform: translate(2px, 2px) rotate(0deg); }
                    10% { transform: translate(-2px, -3px) rotate(-1deg); }
                    20% { transform: translate(-4px, 0px) rotate(1deg); }
                    30% { transform: translate(4px, 3px) rotate(0deg); }
                    40% { transform: translate(2px, -2px) rotate(1deg); }
                    50% { transform: translate(-2px, 3px) rotate(-1deg); }
                    60% { transform: translate(-4px, 2px) rotate(0deg); }
                    70% { transform: translate(4px, 2px) rotate(-1deg); }
                    80% { transform: translate(-2px, -2px) rotate(1deg); }
                    90% { transform: translate(2px, 3px) rotate(0deg); }
                    100% { transform: translate(2px, -3px) rotate(-1deg); }
                }
                .power-shake {
                    animation: power-shake 0.3s cubic-bezier(.36,.07,.19,.97) both infinite;
                    filter: saturate(1.8) hue-rotate(280deg);
                }
                .snap-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                    transition: transform 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 2.5s ease-out, filter 2.5s ease-out;
                }
                .snap-canvas.snapping {
                    opacity: 0;
                    filter: blur(2px);
                }
            `}} />

            {isSnapping && snapCanvases.length > 0 && snapRect && (
                <div className="fixed z-[9999] pointer-events-none no-snap" style={{
                    top: snapRect.top,
                    left: snapRect.left,
                    width: snapRect.width,
                    height: snapRect.height
                }}>
                    {snapCanvases.map((canvas, i) => {
                        const angle = (Math.random() - 0.5) * Math.PI;
                        const dist = 100 + Math.random() * 200;
                        const tx = Math.cos(angle) * dist + 150; // Drift right
                        const ty = Math.sin(angle) * dist - 100;  // Drift up
                        const rot = (Math.random() - 0.5) * 15;
                        
                        return (
                            <img 
                                key={i}
                                src={canvas.toDataURL()}
                                className="snap-canvas"
                                style={{
                                    transform: `translate(0px, 0px) rotate(0deg)`
                                }}
                                ref={(el) => {
                                    if (el) {
                                        // Trigger reflow for CSS transition
                                        void el.offsetWidth;
                                        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(1.05)`;
                                        el.classList.add('snapping');
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}
