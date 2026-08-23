import * as THREE from "three";
import gsap from "gsap";
import { NanoShaders } from "./Shaders";
import { detectQuality, QualityProfile } from "./QualityManager";
import { SurfaceSampler } from "./SurfaceSampler";
import { NanoParticleSystem } from "./NanoParticleSystem";
import { WireframeOverlay } from "./WireframeOverlay";

export type AssemblyState = "IDLE" | "ASSEMBLING" | "FINISHED";

export class NanoAssemblyController {
  public group: THREE.Group;
  private quality: QualityProfile;
  private particles: NanoParticleSystem | null = null;
  private wireframe: WireframeOverlay | null = null;
  private energyHalo: THREE.Group | null = null;
  private energyHaloMaterials: THREE.MeshBasicMaterial[] = [];
  private energyHaloGeometries: THREE.BufferGeometry[] = [];
  public scrubProgress = 0;
  private elapsedTime = 0;
  
  private lastColorUpdate = 0;
  private currentThemePrimary = "";
  private currentForeground = "";
  
  private dissolveUniforms = {
    uDissolveProgress: { value: -1.0 }, // Start hidden — -1.0 maps to threshold far below all dissolveMask values
    uDissolveEdge: { value: 0.12 },
    uDissolveColor: { value: new THREE.Color(0x0F52BA) },
    uDissolveCoreColor: { value: new THREE.Color(0xffffff) },
    uNoiseScale: { value: 2.4 },
    uTime: { value: 0 },
    uPortalY: { value: -10.0 },
    uPortalActive: { value: 0.0 }
  };

  public state: AssemblyState = "IDLE";
  private originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

  constructor(group: THREE.Group, renderer: THREE.WebGLRenderer) {
    this.group = group;
    this.quality = detectQuality(renderer);

    this.init();
  }

  private init() {
    // Ensure all matrices are up to date before sampling surface points
    this.group.updateMatrixWorld(true);

    // 1. Sample points for particles in the local space of this.group
    const positions = SurfaceSampler.sample(this.group, this.quality.particleCount, this.group.matrixWorld);

    // 2. Initialize Particles
    if (positions.length > 0) {
      this.particles = new NanoParticleSystem(positions, this.quality);
      this.group.add(this.particles.points);
    }

    // 3. Initialize Wireframe (it attaches directly to meshes)
    this.wireframe = new WireframeOverlay(this.group);
    this.createEnergyHalo();

    // 4. Inject Dissolve Shader into all Avatar Meshes
    this.group.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        this.originalMaterials.set(mesh, mesh.material);
        
        // Ensure materials are transparent so discard works properly with depth sorting
        // if they weren't already.
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        
        materials.forEach(mat => {
          mat.depthWrite = true; // Still write depth to avoid weird sorting issues if mostly opaque

          mat.onBeforeCompile = (shader) => {
            // Bind uniforms
            shader.uniforms.uDissolveProgress = this.dissolveUniforms.uDissolveProgress;
            shader.uniforms.uDissolveEdge = this.dissolveUniforms.uDissolveEdge;
            shader.uniforms.uDissolveColor = this.dissolveUniforms.uDissolveColor;
            shader.uniforms.uDissolveCoreColor = this.dissolveUniforms.uDissolveCoreColor;
            shader.uniforms.uNoiseScale = this.dissolveUniforms.uNoiseScale;
            shader.uniforms.uTime = this.dissolveUniforms.uTime;
            shader.uniforms.uPortalY = this.dissolveUniforms.uPortalY;
            shader.uniforms.uPortalActive = this.dissolveUniforms.uPortalActive;

            // Inject Uniforms & Varying
            shader.vertexShader = shader.vertexShader.replace(
              '#include <common>',
              `#include <common>\n${NanoShaders.dissolve.uniforms}`
            );

            // Inject Vertex world position calculation
            shader.vertexShader = shader.vertexShader.replace(
              '#include <worldpos_vertex>',
              `#include <worldpos_vertex>\n${NanoShaders.dissolve.vertex}`
            );

            // Fragment Uniforms & Noise function
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <common>',
              `#include <common>\n${NanoShaders.dissolve.uniforms}\n${NanoShaders.dissolve.fragmentNoise}`
            );

            // Inject discard and glow
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <dithering_fragment>',
              `#include <dithering_fragment>\n${NanoShaders.dissolve.fragment}`
            );
          };
          
          mat.needsUpdate = true;
        });
      }
    });

    // Make particles & wireframe initially invisible
    if (this.particles) {
      this.particles.material.uniforms.uOpacity.value = 0;
      this.particles.points.visible = false;
    }
    if (this.wireframe) this.wireframe.setOpacity(0);
    this.setEnergyHaloIntensity(0);
    this.updateThemeColors(true);
  }

  private updateThemeColors(force = false) {
    if (typeof window === "undefined" || !document?.documentElement) return;
    const now = Date.now();
    if (!force && now - this.lastColorUpdate < 150) return;
    this.lastColorUpdate = now;

    const computedStyle = getComputedStyle(document.documentElement);
    const themePrimary = computedStyle.getPropertyValue("--theme-primary").trim() || "#0F52BA";
    const foreground = computedStyle.getPropertyValue("--foreground").trim() || "#ffffff";

    if (themePrimary !== this.currentThemePrimary || foreground !== this.currentForeground) {
      this.currentThemePrimary = themePrimary;
      this.currentForeground = foreground;

      try {
        if (themePrimary) {
          this.dissolveUniforms.uDissolveColor.value.set(themePrimary);
          if (this.wireframe) {
            this.wireframe.material.color.set(themePrimary);
          }
          if (this.particles) {
            this.particles.material.uniforms.uColor.value.set(themePrimary);
            this.particles.material.uniforms.uSparkColor.value.set(themePrimary);
          }
        }
        if (foreground) {
          this.dissolveUniforms.uDissolveCoreColor.value.set(foreground);
          if (this.particles) {
            this.particles.material.uniforms.uCoreColor.value.set(foreground);
          }
        }
      } catch (e) {
        // Ignore invalid color strings
      }
    }
  }

  private createEnergyHalo() {
    // Disabled as requested by user to remove orbit ring lines around the 3D avatar during nano tech assembly
    this.energyHalo = null;
  }

  private setEnergyHaloIntensity(intensity: number) {
    if (!this.energyHalo) return;

    const clamped = Math.min(Math.max(intensity, 0), 1);
    this.energyHalo.visible = clamped > 0.01;
    this.energyHalo.scale.setScalar(0.92 + clamped * 0.2 + Math.sin(this.elapsedTime * 5.5) * 0.012 * clamped);

    this.energyHalo.children.forEach((child, index) => {
      const ring = child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
      const baseOpacity = typeof ring.userData.baseOpacity === "number" ? ring.userData.baseOpacity : 0.4;
      ring.material.opacity = baseOpacity * clamped;
      ring.rotation.z += (0.012 + index * 0.005) * (ring.userData.spin || 1);
      ring.rotation.y = Math.sin(this.elapsedTime * 1.8 + index) * 0.08 * clamped;
    });
  }

  update(dt: number) {
    this.updateThemeColors();
    if (this.state === "FINISHED" && !this.isScrubbing) return;

    this.elapsedTime += dt;
    this.dissolveUniforms.uTime.value = this.elapsedTime;
    
    if (this.particles) {
      this.particles.update(dt, this.scrubProgress);
    }

    const haloIntensity = Math.sin(this.scrubProgress * Math.PI) * 0.95;
    this.setEnergyHaloIntensity(haloIntensity);
  }

  public isScrubbing = false;

  setScrubProgress(progress: number) {
    this.updateThemeColors();
    this.isScrubbing = true;
    if (this.state === "IDLE") {
      this.state = "ASSEMBLING";
    }

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    this.scrubProgress = clampedProgress;

    // Map progress [0, 1] to [-1.0, 1.0]
    this.dissolveUniforms.uDissolveProgress.value = -1.0 + (clampedProgress * 2.0);

    if (this.particles) {
      // Particles fade in at 0, peak at 0.5, fade out at 1.0
      const pOpacity = clampedProgress < 0.08 
        ? clampedProgress * 12.5 
        : clampedProgress > 0.9 
          ? (1.0 - clampedProgress) * 10 
          : 1.0;
      this.particles.material.uniforms.uOpacity.value = pOpacity;
      this.particles.material.uniforms.uProgress.value = clampedProgress;
      this.particles.points.visible = (pOpacity > 0.001);
    }

    if (this.wireframe) {
      // Wireframe peaks in the middle
      const wOpacity = clampedProgress < 0.12 || clampedProgress > 0.92 
        ? 0 
        : Math.sin((clampedProgress - 0.12) / 0.8 * Math.PI) * 0.78;
      this.wireframe.setOpacity(wOpacity);
    }

    if (clampedProgress >= 0.99) {
      this.state = "FINISHED";
    }
  }

  private timeline: gsap.core.Timeline | null = null;

  reset() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.state = "IDLE";
    this.isScrubbing = false;
    this.scrubProgress = 0;
    this.dissolveUniforms.uDissolveProgress.value = -1.0;
    if (this.particles) {
      this.particles.material.uniforms.uOpacity.value = 0;
      this.particles.points.visible = false;
    }
    if (this.wireframe) this.wireframe.setOpacity(0);
    this.setEnergyHaloIntensity(0);
  }

  trigger(onComplete?: () => void) {
    if (this.state !== "IDLE") return;
    this.state = "ASSEMBLING";
    if (this.particles) this.particles.points.visible = true;

    if (this.timeline) {
      this.timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.dissolveUniforms.uDissolveProgress.value = 1.0;
        if (this.particles) this.particles.points.visible = false;
        this.state = "FINISHED";
        this.timeline = null;
        if (onComplete) onComplete();
      }
    });
    this.timeline = tl;

    // 1. Swirl Phase (0 - 0.5s)
    if (this.particles) {
      tl.to(this.particles.material.uniforms.uOpacity, {
        value: 1,
        duration: 0.5,
        ease: "power2.out"
      }, 0);
    }

    // 2. Assembly Phase (0.5s - 1.8s) — animate from -1.0 to 1.0
    tl.to(this.dissolveUniforms.uDissolveProgress, {
      value: 1.0,
      duration: 1.5,
      ease: "power2.inOut"
    }, 0.3);

    // Wireframe fades in and out to highlight assembly
    if (this.wireframe) {
      tl.to(this.wireframe.material, {
        opacity: 0.6,
        duration: 0.5,
        ease: "power2.in"
      }, 0.8);
      tl.to(this.wireframe.material, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
      }, 1.3);
    }

    // Particles fade out as mesh solidifies
    if (this.particles) {
      tl.to(this.particles.material.uniforms.uOpacity, {
        value: 0,
        duration: 0.5,
        ease: "power2.out"
      }, 1.5);
    }
  }

  private disposeTempResources() {
    if (this.particles) {
      this.group.remove(this.particles.points);
      this.particles.dispose();
      this.particles = null;
    }
    
    if (this.wireframe) {
      this.wireframe.dispose();
      this.wireframe = null;
    }

    if (this.energyHalo) {
      this.group.remove(this.energyHalo);
      this.energyHalo = null;
    }

    this.energyHaloGeometries.forEach((geometry) => geometry.dispose());
    this.energyHaloGeometries = [];
    this.energyHaloMaterials.forEach((material) => material.dispose());
    this.energyHaloMaterials = [];
  }

  dispose() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.disposeTempResources();
  }

  public setPortalState(active: boolean, y: number) {
    this.dissolveUniforms.uPortalActive.value = active ? 1.0 : 0.0;
    this.dissolveUniforms.uPortalY.value = y;
  }
}
