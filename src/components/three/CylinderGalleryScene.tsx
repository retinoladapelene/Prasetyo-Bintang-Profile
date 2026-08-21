"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { MotionValue } from "framer-motion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NanoAssemblyController } from "./nano/NanoAssemblyController";
import { PortalTransitionController } from "./nano/PortalTransitionController";
import { PaletteTab } from "@/components/sections/ThemeElements";

// ============================================================================
// 🔧 KONFIGURASI PANEL (SILAKAN UBAH NILAI DI BAWAH INI SESUAI KEINGINAN)
// ============================================================================
export const GALLERY_CONFIG = {
  // 1. LEBAR PANEL (Default: 0.24)
  // Semakin BESAR nilainya, panel akan semakin PANJANG/LEBAR merentang ke kanan dan kiri.
  PANEL_WIDTH: 0.21,

  // 2. TINGGI PANEL (Default: 13.5)
  // Semakin BESAR nilainya, panel akan semakin TINGGI.
  PANEL_HEIGHT: 18.5,

  // 3. POSISI AKHIR PANEL (Default: 0.36)
  // Menentukan titik berhenti panel terakhir saat *scroll* maksimal.
  // Semakin KECIL nilainya (misal 0.20), panel akan bergeser semakin jauh ke KIRI.
  // Semakin BESAR nilainya (misal 0.50),  akan bergeser semakin ke KANAN (ke tengah).
  T_LEFT: 0.37,

  // 4. LENGKUNGAN SISI KIRI (BEND)
  // Menentukan di titik mana sisi kiri panel mulai membengkok ke belakang.
  // Posisi X membentang dari -0.5 (ujung kiri) sampai 0.5 (ujung kanan).
  // Semakin BESAR nilainya (misal 0.1), semakin banyak area panel yang ikut melengkung.
  LEFT_BEND_START: -0.1,

  // Seberapa dalam/kuat lengkungan sisi kiri ke arah belakang.
  // Semakin MINUS nilainya (misal -3.0), lengkungan ke dalam dinding semakin tajam/dalam.
  // Jika diatur ke 0.0, panel akan sepenuhnya lurus/mengikuti dinding alami tanpa bengkokan.
  LEFT_BEND_AMOUNT: 0.0,

  // 5. KOREKSI KEMIRINGAN (YAW / ROTATION)
  // Panel secara alami sangat miring ke kanan mengikuti dinding melengkung.
  // Gunakan nilai ini untuk MEMUTAR seluruh panel secara fisik (dalam derajat).
  // Semakin BESAR nilainya (misal 15.0 atau 30.0), sisi kanan panel akan berputar ke arah depan.
  // Jika diatur ke 0.0, panel tidak diputar (mengikuti kemiringan dinding secara pasif).
  YAW_CORRECTION: 5.0,

  // 5.5 KOREKSI KEMIRINGAN ATAS/BAWAH (PITCH / TILT)
  // Gunakan nilai ini untuk menundukkan atau menengadahkan panel (dalam derajat).
  // Semakin BESAR nilainya (misal 10.0), bagian atas panel akan condong ke depan (menunduk).
  // Semakin MINUS nilainya (misal -10.0), bagian atas panel akan condong ke belakang (menengadah).
  PITCH_CORRECTION: -0,

  // 6. SUDUT KEMIRINGAN DINDING (DEPTH ANGLE)
  // Menentukan seberapa jauh/curam dinding dan panel menjorok ke belakang layar.
  // Semakin BESAR nilainya (misal 50.0 atau 70.0), panel akan terlihat semakin miring/tiduran ke belakang.
  // Semakin KECIL nilainya (misal 20.0), panel akan terlihat lebih rata berhadapan dengan layar.
  WALL_DEPTH_SLOPE: 50.0,

  // KONSTANTA INTERNAL (JANGAN DIUBAH KECUALI PENGEMBANG)
  START_T: 1.40, // Posisi awal panel di luar layar (kanan)
  SPACING: 1.15, // Jarak antar panel
};

// Jarak tempuh otomatis dihitung agar panel mendarat pas di T_LEFT
export const GALLERY_TRAVEL = GALLERY_CONFIG.START_T - GALLERY_CONFIG.T_LEFT + 4 * GALLERY_CONFIG.SPACING;
// ============================================================================

// ============================================================================
// 🕷️ KONFIGURASI SPIDERMAN (SILAKAN UBAH NILAI DI BAWAH INI)
// ============================================================================
export const SPIDERMAN_CONFIG = {
  // 1. UKURAN / SKALA
  // Semakin BESAR nilainya, Spiderman akan semakin besar. (Default: 6.0)
  SCALE: 15.0,

  // 2. POSISI SAAT BERHENTI (TARGET Y)
  // Posisi vertikal tempat Spiderman berhenti setelah merayap naik. (Default: -1.0)
  // Semakin BESAR (mendekati 0 atau positif), posisinya semakin ke atas layar.
  TARGET_Y: 2.0,

  // 3. POSISI AWAL / SEMBUNYI (START Y)
  // Posisi vertikal tempat Spiderman mulai merayap naik. (Default: -20.0)
  START_Y: -20.0,

  // 4. POSISI HORIZONTAL & KEDALAMAN
  POS_X: 6.0,    // Kiri/Kanan (Positif = Kanan). Default: 6.0
  POS_Z: -15.0,  // Depan/Belakang dinding (Semakin minus = Semakin jauh). Default: -15.0

  // 5. ROTASI TUBUH SPIDERMAN (DALAM DERAJAT)
  // Putar tubuh Spiderman agar menempel/menghadap sesuai keinginan Anda.
  // Catatan: Jika ingin dia tegak normal, coba X: -90, Y: 180, Z: 0.
  ROT_X: -90,      // Menunduk / Menengadah (Default: 0 - perut nempel dinding)
  ROT_Y: 0,      // Menoleh Kiri / Kanan (Default: 0)
  ROT_Z: 153,    // Miring / Rolling (Default: 153 derajat, agar tubuhnya serong)
};
// ============================================================================

interface CylinderGallerySceneProps {
  items: Array<any>;
  wallItems?: Array<any>;
  smoothProgress: MotionValue<number>;
  cinematicProgress?: MotionValue<number>;
  className?: string;
  onActiveIndexChange?: (index: number) => void;
  onAvatarReady?: (isReady: boolean) => void;
  activeThemeId?: string;
  onThemeChange?: (id: string) => void;
}

// Helper to generate the exact same Environment Map used in GlassStarScene
const generateEnvironmentMap = (renderer: THREE.WebGLRenderer) => {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  const envGeo = new THREE.SphereGeometry(100, 64, 64);
  const envMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      colorTop: { value: new THREE.Color(0x0a0a1a) },
      colorMid: { value: new THREE.Color(0x151525) },
      colorBot: { value: new THREE.Color(0x050510) },
      colorAccentL: { value: new THREE.Color(0x0044ff) },
      colorAccentR: { value: new THREE.Color(0xff00ff) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorTop;
      uniform vec3 colorMid;
      uniform vec3 colorBot;
      uniform vec3 colorAccentL;
      uniform vec3 colorAccentR;
      varying vec3 vWorldPosition;
      void main() {
        vec3 dir = normalize(vWorldPosition);
        float y = dir.y * 0.5 + 0.5;
        vec3 col = mix(vec3(0.02, 0.02, 0.05), vec3(0.0), smoothstep(0.0, 1.0, y));
        float theta = atan(dir.z, dir.x);
        float phi = asin(dir.y);
        vec2 gridUv = vec2(theta * 10.0, phi * 10.0);
        vec2 grid = abs(fract(gridUv) - 0.5);
        float lines = smoothstep(0.45, 0.5, grid.x) + smoothstep(0.45, 0.5, grid.y);
        col += vec3(0.15) * clamp(lines, 0.0, 1.0);
        float neonCyan = pow(max(0.0, dot(dir, normalize(vec3(1.0, 0.5, 0.8)))), 24.0) * 3.0;
        float neonMagenta = pow(max(0.0, dot(dir, normalize(vec3(-1.0, 0.2, -0.5)))), 24.0) * 3.0;
        float sharpWhite = pow(max(0.0, dot(dir, normalize(vec3(0.0, 1.0, 0.2)))), 128.0) * 4.0;
        col += vec3(0.0, 0.8, 1.0) * neonCyan;     
        col += vec3(1.0, 0.0, 0.8) * neonMagenta;  
        col += vec3(1.0) * sharpWhite;             
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const envMesh = new THREE.Mesh(envGeo, envMat);
  envScene.add(envMesh);
  const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
  pmremGenerator.dispose();
  envGeo.dispose();
  envMat.dispose();
  return envMap;
};



export function CylinderGalleryScene({ items, wallItems, smoothProgress, cinematicProgress, className, onActiveIndexChange, onAvatarReady, activeThemeId, onThemeChange }: CylinderGallerySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    carouselGroup: null as THREE.Group | null,
    avatarModel: null as THREE.Object3D | null,
    drstrangeModel: null as THREE.Object3D | null,
    ironmanModel: null as THREE.Object3D | null,
    captainModel: null as THREE.Object3D | null,
    captainMixer: null as THREE.AnimationMixer | null,
    spidermanModel: null as THREE.Object3D | null,
    spidermanMixer: null as THREE.AnimationMixer | null,
    meshes: [] as { mesh: THREE.Mesh; targetOpacity: number; isLoaded: boolean; }[],
    animationId: 0,
    clock: new THREE.Timer(),
    scrollProgress: 0,
    scrollVelocity: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    isVisible: true,
    disposed: false,
    spidermanAction: null as THREE.AnimationAction | null,
    wasSpidermanActive: false,
    proxyMesh: null as THREE.Mesh | null,
    bubbleInstanced: null as THREE.InstancedMesh | null,
    bubbleData: null as any,
    bgGroup: null as THREE.Group | null,
    bgMeshes: [] as { mesh: THREE.Mesh; material: THREE.ShaderMaterial; index: number }[],
    wallPanels: [] as { mesh: THREE.Mesh; material: THREE.ShaderMaterial; opacity: number }[],
    hoverIntensity: 0,
    scannerMat: null as THREE.ShaderMaterial | null,
    pointer: new THREE.Vector2(),
    nanoController: null as NanoAssemblyController | null,
    portalController: null as PortalTransitionController | null,
    // Nano animation state
    nanoHasTriggered: false,       // true after first trigger animation completes
    nanoIsPlaying: false,          // true while one-shot anim is in flight
    wasInNanoZone: false,          // tracks edge: entered the nano scroll zone
    avatarPositionSnapped: false,  // true after first Y-position snap on model load
    onActiveIndexChange: undefined as ((index: number) => void) | undefined,
    lastReportedIndex: -1,
    onAvatarReady: undefined as ((isReady: boolean) => void) | undefined,
    isAvatarReady: false,
    startAnimation: null as (() => void) | null,
    isAnimating: true,
    videoElements: [] as HTMLVideoElement[],
    videoTextures: [] as THREE.VideoTexture[],
  });

  // Keep callback reference updated without triggering re-renders or scene recreations
  stateRef.current.onActiveIndexChange = onActiveIndexChange;
  stateRef.current.onAvatarReady = onAvatarReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const state = stateRef.current;
    state.disposed = false;
    const isMobile = window.innerWidth < 768;

    // 1. Setup Renderer (Transparent background)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // OPTIMASI: Matikan antialias sepenuhnya untuk model 3D berat
      powerPreference: "high-performance"
    });
    // OPTIMASI: Batasi pixel ratio ke 1 (native) di semua perangkat agar tidak over-render
    // Layar HP atau Mac resolusi tinggi (DPI 2-3) akan membuat GPU sangat tersiksa jika merender 3D dengan pixelRatio > 1.
    renderer.setPixelRatio(1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    state.renderer = renderer;

    // 2. Setup Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null;
    const envMap = generateEnvironmentMap(renderer);
    // Removed scene.environment = envMap; so it doesn't affect the project panels

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9); // Kembalikan POV kamera panel seperti semula

    // Add lighting to camera so HUD models get lit properly with their original colors
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Soft white light
    camera.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight.position.set(5, 5, 5);
    camera.add(dirLight);
    scene.add(camera); // Add camera to scene since it holds lights

    state.camera = camera;

    // PRE-COMPILE SEMUA SHADER SAAT LOADING SELESAI
    // Ini memastikan tidak ada stutter/framedrop saat user scroll ke bawah
    const originalOnLoad = THREE.DefaultLoadingManager.onLoad;
    THREE.DefaultLoadingManager.onLoad = () => {
      if (!state.disposed && state.renderer && state.scene && state.camera) {
        state.renderer.compile(state.scene, state.camera);
        state.renderer.render(state.scene, state.camera); // Force upload to GPU
      }
      if (originalOnLoad) originalOnLoad();
    };

    // 3. Load 3D Avatar (/axeyJuh8SVJiCIjdJsXO9_model.glb) in center of Gallery
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/axeyJuh8SVJiCIjdJsXO9_model.glb",
      (gltf) => {
        if (state.disposed) return;
        const loadedModel = gltf.scene;

        // Automatically normalize size and center
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Normalize scale so max dimension is approx 7.6 units on desktop, smaller on mobile!
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = isMobile ? 4.5 : 7.6; // Diperkecil untuk mobile
        const scaleFactor = maxDim > 0 ? targetSize / maxDim : (isMobile ? 2.0 : 3.5);
        loadedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Center the model at origin, positioned so the head/helmet sits right in the center of the viewport
        loadedModel.position.x = -center.x * scaleFactor;
        loadedModel.position.y = -center.y * scaleFactor;
        loadedModel.position.z = -center.z * scaleFactor;

        // OPTIMIZATION: Reduce texture anisotropy on mobile to save GPU memory and bandwidth
        const maxAnisotropy = isMobile ? 1 : renderer.capabilities.getMaxAnisotropy();
        const optimizeTexture = (tex: THREE.Texture | null) => {
          if (!tex) return;
          tex.anisotropy = maxAnisotropy;
          // Mipmaps are essential for performance when textures are minified (drawn smaller on mobile).
          // Disabling them (LinearFilter) causes severe GPU cache misses and massive lag.
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
        };

        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.renderOrder = 1; // Guarantee 3D Avatar renders BEFORE front gallery panels!

            // Ensure normals exist for lighting
            if (mesh.geometry && !mesh.geometry.attributes.normal) {
              mesh.geometry.computeVertexNormals();
            }

            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((m) => {
                if ("flatShading" in m) {
                  (m as THREE.MeshStandardMaterial).flatShading = false;
                }
                const mat = m as THREE.MeshStandardMaterial;

                optimizeTexture(mat.map);
                optimizeTexture(mat.normalMap);
                optimizeTexture(mat.emissiveMap);
                optimizeTexture(mat.roughnessMap);
                optimizeTexture(mat.metalnessMap);

                const nameLower = (mesh.name + " " + mat.name).toLowerCase();
                const isVisorOrGlass =
                  nameLower.includes("visor") ||
                  nameLower.includes("glass") ||
                  nameLower.includes("lens") ||
                  nameLower.includes("frame") ||
                  nameLower.includes("goggle") ||
                  nameLower.includes("rim");

                // High-end Cyberpunk Visor & Glass materials (obsidian mirror gloss + neon LED glow)
                if (isVisorOrGlass || (mat.color && mat.color.getHexString() === "000000")) {
                  mat.roughness = 0.12;
                  mat.metalness = 0.88;
                  mat.envMapIntensity = 3.2;
                } else {
                  mat.envMapIntensity = 1.8;
                  if (mat.roughness !== undefined && mat.roughness > 0.75) {
                    mat.roughness = 0.55;
                  }
                }

                if (mat.emissive && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)) {
                  mat.emissiveIntensity = 4.0;
                  mat.toneMapped = false;
                }

                mat.transparent = true;
                mat.opacity = 1; // Used to be 0, but NanoAssembly handles visibility via shader discard now
                mat.needsUpdate = true;
              });
            }
          }
        });

        const avatarGroup = new THREE.Group();
        avatarGroup.add(loadedModel);
        avatarGroup.position.y = 0; // Centered in viewport

        // --- RETINA SCANNER HUD ---
        const scannerGeo = new THREE.PlaneGeometry(1.4, 1.4);
        const scannerMat = new THREE.ShaderMaterial({
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,
          uniforms: {
            uTime: { value: 0 },
            uAlpha: { value: 0 }, // Controlled by scroll — 0 = hidden, 1 = fully visible
            uColor: { value: new THREE.Color("#22d3ee") }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform float uAlpha;
            uniform vec3 uColor;
            varying vec2 vUv;
            #define PI 3.14159265359

            void main() {
              vec2 uv = vUv * 2.0 - 1.0;
              float r = length(uv);
              
              // OPTIMIZATION: Discard pixels outside the radar bounds to save rendering time
              if (r > 1.0) discard;
              
              float a = atan(uv.y, uv.x);
              float alpha = 0.0;
              
              // 1. Thin outer guide ring with gaps
              float outerRing = smoothstep(0.88, 0.87, r) - smoothstep(0.86, 0.85, r);
              float gapMask = step(0.15, abs(mod(a + PI/4.0, PI/2.0) - PI/4.0));
              alpha += outerRing * gapMask * 0.5;
              
              // 2. Inward pointing triangles (reticles)
              vec2 absUv = abs(uv);
              float triX = step(0.78, absUv.x) * step(absUv.y, (absUv.x - 0.78) * 0.6) * step(absUv.x, 0.86);
              float triY = step(0.78, absUv.y) * step(absUv.x, (absUv.y - 0.78) * 0.6) * step(absUv.y, 0.86);
              alpha += max(triX, triY) * 1.0;
              
              // 3. Thick segmented blocks on the right
              float isRight = step(abs(a), PI/2.5);
              float thickRing = smoothstep(0.76, 0.75, r) - smoothstep(0.65, 0.64, r);
              float segments = step(0.15, fract(a * 10.0));
              alpha += isRight * thickRing * segments * 0.6;
              
              // 4. Thin continuous arc on the left
              float isLeft = step(PI/2.0 + 0.1, abs(a));
              float thinInner = smoothstep(0.76, 0.75, r) - smoothstep(0.74, 0.73, r);
              alpha += isLeft * thinInner * 0.6;
              
              // 5. Inner spinning dashed ring
              float spinA = a - uTime * 2.0;
              float innerRing = smoothstep(0.42, 0.41, r) - smoothstep(0.38, 0.37, r);
              float innerDashes = step(0.4, fract(spinA * 12.0));
              alpha += innerRing * innerDashes * 0.7;
              
              // 6. Radar sweep (trailing fade effect)
              float sweep = fract(-a / (2.0*PI) + uTime * 0.5);
              float scanAlpha = (1.0 - sweep * 4.0) * step(sweep, 0.25) * step(r, 0.86);
              alpha += scanAlpha * 0.4;
              
              // 7. Subtle background grid
              float grid = step(0.95, fract(uv.x * 20.0)) + step(0.95, fract(uv.y * 20.0));
              alpha += grid * 0.05 * step(r, 0.86);
              
              // Fade out extremely close to center to protect pupil visibility
              alpha *= smoothstep(0.15, 0.25, r);
              
              // Global HUD sync — controlled by scroll progress from outside
              alpha *= uAlpha;
              
              gl_FragColor = vec4(uColor, alpha);
            }
          `
        });
        const scannerMesh = new THREE.Mesh(scannerGeo, scannerMat);
        // Position it right in front of the avatar's eye level
        scannerMesh.position.set(1, 0, 3); // Adjust Y and Z based on model
        scannerMesh.renderOrder = 999;
        avatarGroup.add(scannerMesh);
        state.scannerMat = scannerMat;
        // --------------------------

        scene.add(avatarGroup);
        state.avatarModel = avatarGroup;
        state.avatarPositionSnapped = true;

        // Initialize Nano Tech Assembly Controller
        if (state.renderer) {
          state.nanoController = new NanoAssemblyController(avatarGroup, state.renderer);
          state.portalController = new PortalTransitionController(avatarGroup);
        }
      }
    );

    // 4. Cinematic Dark Room Lighting (Avatar lit mostly by the glowing background TV)
    const ambient = new THREE.AmbientLight("#223344", 0.6); // Sedikit diterangkan
    scene.add(ambient);

    // Cahaya dari depan dibuat terang agar avatar terlihat jelas
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.0);
    keyLight.position.set(4, 3, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#aaddff", 1.2);
    fillLight.position.set(-6, 0, 6);
    scene.add(fillLight);

    // Cahaya dari belakang (TV screen) sangat terang menyinari pinggiran avatar
    const rimLeft = new THREE.DirectionalLight("#ffffff", 4.5);
    rimLeft.position.set(-8, 2, -10);
    scene.add(rimLeft);

    const rimRight = new THREE.DirectionalLight("#aaddff", 4.5);
    rimRight.position.set(8, 2, -10);
    scene.add(rimRight);

    // 4. Create Carousel Group
    const carouselGroup = new THREE.Group();
    if (isMobile) {
      carouselGroup.scale.set(0.65, 0.65, 0.65); // Perkecil drastis untuk mobile
      carouselGroup.position.y = 1.5; // Naikkan sedikit agar seimbang posisinya
    }
    scene.add(carouselGroup);
    state.carouselGroup = carouselGroup;

    // 4.5 Create Background Group & Giant Cylinder
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);
    state.bgGroup = bgGroup;

    const bgGeometry = new THREE.CylinderGeometry(
      22, 22, 40, 128, 24, true,
      0, Math.PI * 2
    );

    const BackgroundShader = {
      uniforms: {
        uTexture: { value: null },
        uOpacity: { value: 0 },
        uShift: { value: 0 },
        uTime: { value: 0 },
        uPerspectiveMorph: { value: 0 },
        uFlatMorph: { value: 0 },
        uVideoTexture: { value: null },
        uVideoBlend: { value: 0 },
        uWallScroll: { value: 0 },
        uBlackout: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        uniform float uPerspectiveMorph;
        uniform float uFlatMorph;
        void main() {
          // Flip U coordinate so the texture reads correctly from the inside
          vUv = vec2(1.0 - uv.x, uv.y);

          vec3 p = position;

          // The final shape is a straight flat wall on the left, turning right at the end (True J-Curve).
          // Kalikan vUv.x dengan 2.0 agar dinding background membentang JAUH ke kanan menutupi layar sepenuhnya.
          float tc = vUv.x * 2.0; 
          
          // Extend extreme left edge along the SAME straight line!
          // When tc is near 0, we push it negative to stretch the wall further left linearly.
          float leftStretch = max(0.0, 0.4 - tc);
          float tc_mod = tc - leftStretch * 2.5;
          
          // Gunakan fungsi kuadratik (bend^2) agar transisinya C1-continuous (turunannya nol di 0.58)
          // Ini MENGHILANGKAN lipatan/crease yang terjadi saat transisi linear.
          float bend = max(0.0, tc_mod - 0.58);
          
          float wallX = -24.0 + tc_mod * 43.0 + bend * bend * 73.7;
          // Tinggikan dinding secara konstan, biarkan perspektif 3D kamera mengecilkan ukurannya secara alami (tapering)
          float wallY = (vUv.y - 0.5) * 70.0;
          vec3 wall = vec3(
            wallX,
            wallY,
            // Dorong dinding background lebih jauh ke belakang (-15.5) agar terlihat lebih jauh dari panel
            -15.5 - tc_mod * float(${GALLERY_CONFIG.WALL_DEPTH_SLOPE}) + bend * bend * 102.0
          );
          
          // Dinding melengkung seperti layar IMAX cinematic
          // Diperkecil agar muat di dalam layar kamera sehingga menciptakan efek black bar (letterbox).
          float dx = vUv.x - 0.5;
          float imaxCurve = dx * dx * 15.0; // Membuat ujung layar lebih mundur (cekung)
          
          vec3 flatWall = vec3(
            dx * 90.0,
            (vUv.y - 0.5) * 14.5, // Tinggi dinaikkan dari 11.5 ke 14.5 agar black bar lebih kecil
            -15.5 - imaxCurve
          );
          
          wall = mix(wall, flatWall, uFlatMorph);

          p = mix(p, wall, uPerspectiveMorph);
          
          vec4 worldPos = modelMatrix * vec4(p, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uOpacity;
        uniform float uShift;
        uniform float uTime;
        uniform float uPerspectiveMorph;
        uniform float uFlatMorph;
        uniform sampler2D uVideoTexture;
        uniform float uVideoBlend;
        uniform float uWallScroll;
        uniform float uBlackout;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float roundedBox(vec2 scaledUv, vec2 scale, float rCorner) {
          vec2 p = fract(scaledUv) - 0.5;
          // Aspek rasio silinder secara fisik kira-kira 138 x 40
          // Mengkonversi UV space ke physical space agar ketebalan garis dan sudut lengkung seragam di semua ukuran kotak
          vec2 physCellSize = vec2(138.0 / scale.x, 40.0 / scale.y);
          vec2 p_phys = p * physCellSize;
          
          float halfBorder = 0.045; // Ketebalan garis grid yang konstan di semua ukuran
          vec2 size_phys = (physCellSize * 0.5) - halfBorder - rCorner;
          
          vec2 q = abs(p_phys) - size_phys;
          float d = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - rCorner;
          
          float aa = 0.025; // Anti-aliasing konstan agar tidak ada garis yang blur/tebal sebelah
          return 1.0 - smoothstep(-aa, aa, d);
        }
        
        void main() {
          // Shift X for parallax
          vec2 uv = vUv;
          uv.x = fract(uv.x + uShift * 0.05);
          
          vec4 texColor = texture2D(uTexture, uv);
          
          // Contrast and Saturate (kalikan dengan alpha untuk menghindari nilai warna tak terduga dari area transparan)
          vec3 color = texColor.rgb * texColor.a;
          color = (color - 0.5) * 1.1 + 0.5;
          float luminance = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(luminance), color, 1.2);
          
          // Procedural Bento Mask Grid (Irregular squares & rectangles)
          // Radius kelengkungan sudut dalam unit fisik (seragam untuk semua kotak)
          float rCorner = 0.4; 
          
          vec2 scale0 = vec2(8.0, 4.0);
          vec2 uv0 = uv * scale0;
          vec2 g0 = floor(uv0);
          float box0 = roundedBox(uv0, scale0, rCorner);
          
          vec2 scale1 = vec2(16.0, 4.0);
          vec2 uv1 = uv * scale1;
          vec2 g1 = floor(uv1);
          float box1 = roundedBox(uv1, scale1, rCorner);
          
          vec2 scale2 = vec2(16.0, 8.0);
          vec2 uv2 = uv * scale2;
          vec2 g2 = floor(uv2);
          float box2 = roundedBox(uv2, scale2, rCorner);
          
          vec2 scale3 = vec2(32.0, 8.0);
          vec2 uv3 = uv * scale3;
          vec2 g3 = floor(uv3);
          float box3 = roundedBox(uv3, scale3, rCorner);
          
          vec2 scale4 = vec2(32.0, 16.0);
          vec2 uv4 = uv * scale4;
          vec2 g4 = floor(uv4);
          float box4 = roundedBox(uv4, scale4, rCorner);
          
          float h0 = hash(g0);
          float h1 = hash(g1);
          float h2 = hash(g2);
          float h3 = hash(g3);
          float h4 = hash(g4);
          
          float mask = 0.0;
          float cellHash = 0.0;
          
          if (h0 > 0.8) {
            mask = box0; cellHash = h0;
          } else if (h1 > 0.65) {
            mask = box1; cellHash = h1;
          } else if (h2 > 0.5) {
            mask = box2; cellHash = h2;
          } else if (h3 > 0.3) {
            mask = box3; cellHash = h3;
          } else {
            mask = box4; cellHash = h4;
          }
          
          // --- Surface Texture & Styling ---
          
          // 1. Buat keseluruhan gambar tekstur menjadi gelap (suasana ruangan gelap)
          vec3 darkBase = color * 0.15;
          
          // 2. Buat "secercah sinar" (glimmer of light) yang memancar dari tengah
          // Menggunakan posisi world X agar sinar diam di tengah layar saat background bergeser
          float distFromCenter = abs(vWorldPosition.x);
          
          float glowDist = length(vec2(distFromCenter * 0.08, (uv.y - 0.5) * 2.0));
          float centerGlow = smoothstep(1.5, 0.0, glowDist); // Memudar secara halus ke arah luar
          
          // Sinar mengambil warna asli dari gambar namun dibuat sangat terang (Glow)
          vec3 glowColor = texColor.rgb * centerGlow * 4.0;
          
          vec3 surfaceColor = darkBase + glowColor;
          
          // 3. Tambahkan efek kedipan (pulse) halus pada sel-sel bento grid
          float pulse = (sin(uTime * 1.5 + cellHash * 6.28) * 0.5 + 0.5) * 0.25;
          surfaceColor += (texColor.rgb * pulse * cellHash);
          
          // 4. Saat morphing menjadi dinding datar, pudarkan grid bento (mask menuju 1.0)
          float effectiveMask = mix(mask, 1.0, uPerspectiveMorph);
          
          // Vignette dihapus sepenuhnya sesuai permintaan pengguna
          vec3 finalColor = surfaceColor * effectiveMask;
          
          // Add fine white grid lines over the entire thing.
          float fineGridX = step(0.99, fract(uv.x * 64.0));
          float fineGridY = step(0.98, fract(uv.y * 32.0));
          float fineGrid = 0.0;

          // Final linger phase: shift from dense bento texture into a calmer perspective wall.
          float vanish = pow(uv.x, 1.45);
          
          // 1. Grid Uniform: Skala diubah ke 0.45 agar kotak grid lebih besar (jumlah kotak lebih sedikit)
          float wallPhaseX = vWorldPosition.x * 0.45 + uTime * 0.6;
          float wallPhaseY = vWorldPosition.y * 0.45;
          
          // Karena skala diperbesar (0.85 -> 0.45), batas dipertajam ke 0.992 agar garis tetap tipis dan halus
          float gridLineV = smoothstep(0.992, 1.0, cos(wallPhaseX * 6.28318));
          float gridLineH = smoothstep(0.992, 1.0, cos(wallPhaseY * 6.28318));
          
          // ── CIRCUIT GROWTH LOGIC (Option 2) ──
          float dist = abs(vWorldPosition.x);
          
          // uPerspectiveMorph memicu pertumbuhan grid (menyebar dari tengah ke luar)
          // uPerspectiveMorph bernilai 0 saat animasi awal (silinder), jadi grid akan HILANG sepenuhnya di awal.
          float growthEdge = uPerspectiveMorph * 120.0; 
          
          // Horizontal lines tumbuh menyebar (merambat ke kiri/kanan)
          float horizontalGrowth = 1.0 - smoothstep(growthEdge - 30.0, growthEdge, dist);
          
          // Vertical lines muncul bertahap setelah dilewati garis rambat
          float verticalGrowth = 1.0 - smoothstep(growthEdge - 5.0, growthEdge, dist);
          
          float circuitGridMask = max(gridLineV * verticalGrowth, gridLineH * horizontalGrowth);
          
          // Warna dasar grid (abu-abu dengan sedikit kebiruan tech/J.A.R.V.I.S)
          vec3 gridBaseColor = vec3(0.5, 0.7, 0.9);
          
          // Ujung garis horizontal yang menyala terang seperti listrik merambat
          float tipGlow = smoothstep(growthEdge - 25.0, growthEdge, dist) * horizontalGrowth * gridLineH;
          vec3 glowingTip = vec3(0.1, 0.8, 1.0) * tipGlow * 3.0;
          
          // Gabungkan warna grid
          vec3 perspectiveGrid = (gridBaseColor * circuitGridMask * 0.15) + glowingTip;
          
          // Pastikan grid HILANG (dikalikan 0) sebelum morphing dimulai.
          float gridFadeIn = smoothstep(0.01, 0.05, uPerspectiveMorph);
          // HILANGKAN grid secara halus saat background sudah sepenuhnya menjadi J-Curve (uPerspectiveMorph mendekati 1.0)
          float gridFadeOut = 1.0 - smoothstep(0.8, 1.0, uPerspectiveMorph);
          
          perspectiveGrid *= (gridFadeIn * gridFadeOut);
          // ──────────────────────────────────────
          // Aggressively fade out the static image (surfaceColor) during transition
          // so it doesn't linger as a ghost image.
          float imageFade = 1.0 - smoothstep(0.0, 0.4, uPerspectiveMorph);
          finalColor *= imageFade;

          // Offset uv.y diubah dari 0.09 menjadi 0.18 agar video bergeser turun ke bawah di dinding (bagian atas video terlihat)
          vec2 videoUv = vec2(fract(uv.x * 0.7 + 0.18), clamp(uv.y * 0.82 + 0.18, 0.0, 1.0));
          vec3 videoColor = texture2D(uVideoTexture, videoUv).rgb;
          float videoLum = dot(videoColor, vec3(0.299, 0.587, 0.114));
          videoColor = mix(vec3(videoLum), videoColor, 0.55) * 0.42;
          
          finalColor = mix(finalColor, videoColor, uVideoBlend);
          
          // Darken the surface image/video according to blackout, but DO NOT darken the grid!
          finalColor = mix(finalColor, vec3(0.0), uBlackout);
          
          // Add grid on top of the blackout so the 3D shape transformation is always visible
          finalColor += perspectiveGrid;
          
          // Output dengan brightness dan opacity tinggi. Alpha tidak bergantung pada texColor.a
          // agar dinding background tetap solid dan grid selalu terlihat.
          gl_FragColor = vec4(finalColor * 1.2, uOpacity * 0.85);
        }
      `
    };

    const textureLoader = new THREE.TextureLoader();
    const isVideoAsset = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

    const videoTextureCache: Record<string, THREE.VideoTexture> = {};

    const getSharedVideoTexture = (url: string) => {
      if (videoTextureCache[url]) {
        return videoTextureCache[url];
      }
      const video = document.createElement("video");
      video.src = url;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.crossOrigin = "anonymous";
      video.preload = "auto";

      // Mencegah browser (Chrome/Safari) mematikan atau melimit FPS video (throttling).
      // Video HARUS dimasukkan ke dalam DOM dan tidak boleh memiliki opacity 0 atau ukuran 1x1.
      // Kita letakkan video di pojok dengan z-index negatif agar tertutup oleh canvas.
      video.style.position = "fixed";
      video.style.top = "0px";
      video.style.left = "0px";
      video.style.width = "10px";
      video.style.height = "10px";
      video.style.opacity = "0.001"; // Hide without being culled by browser
      video.style.zIndex = "-9999";
      video.style.pointerEvents = "none";
      document.body.appendChild(video);

      state.videoElements.push(video);

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.userData = { videoElement: video, url: url };
      videoTexture.generateMipmaps = false;
      state.videoTextures.push(videoTexture);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.wrapS = THREE.RepeatWrapping;
      videoTexture.wrapT = THREE.ClampToEdgeWrapping;

      const p = video.play();
      if (p !== undefined) {
        (video as any)._playPromise = p;
        p.catch(() => {
          const playOnGesture = () => {
            const p2 = video.play();
            if (p2 !== undefined) {
              (video as any)._playPromise = p2;
              p2.finally(() => {
                window.removeEventListener("pointerdown", playOnGesture);
                window.removeEventListener("scroll", playOnGesture);
              });
            }
          };
          window.addEventListener("pointerdown", playOnGesture, { once: true });
          window.addEventListener("scroll", playOnGesture, { once: true, passive: true });
        });
      }

      videoTextureCache[url] = videoTexture;
      return videoTexture;
    };

    const ironmanTexture = getSharedVideoTexture("/videos/ironman.mp4");


    // Geometry for a curved panel.
    const radius = 5.2; // Larger radius for a smoother curve
    const height = 1.6; // Smaller height (was 2.2)
    const thetaLength = 0.52; // Smaller width (was 0.71)

    // Create a shared geometry for all panels
    const geometry = new THREE.CylinderGeometry(
      radius, radius, height, 32, 1, true,
      -thetaLength / 2, thetaLength // Centered on Z axis
    );

    // We do NOT flip the UVs anymore, as looking at the outside of a cylinder maps correctly in Three.js

    // Spacing between panels (adjusted for smaller panels)
    const anglePerItem = 0.75; // ~43 degrees spacing
    const verticalStagger = 0.28; // Reduced vertical drop

    items.forEach((item, index) => {
      const imageUrl = item.images?.[0] || item.image_url || item.img;

      // CLEAN OPTICAL CRYSTAL GLASS: Ultra-crisp acrylic surface with subtle optical edge refraction
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0, // Start invisible, fade in after texture loads
      });

      // Inject clean mouse parallax and precision optical refraction edge (bias pinggiran kaca)
      material.userData = { uMouse: { value: new THREE.Vector2(0, 0) } };

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uMouse = material.userData.uMouse;

        shader.fragmentShader = `
          uniform vec2 uMouse;
        ` + shader.fragmentShader;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
          #ifdef USE_MAP
            // Subtle 3D Inner Parallax (Texture Shift based on Mouse)
            vec2 zoomedUv = (vMapUv - 0.5) * 0.95 + 0.5;
            vec2 parallaxUv = zoomedUv - (uMouse * 0.02);
            
            // ── EXTREME PERIMETER OPTICAL REFRACTION (Pembiasan Kaca Nyata Tepat di Sisi Terluar) ──
            // Calculate distance from center to strictly target the actual outer rim (no overlapping inside UI text!)
            vec2 distToCenter = abs(vMapUv - 0.5) * 2.0;
            float maxDist = max(distToCenter.x, distToCenter.y);
            
            // Outer perimeter glass zone (extreme outer 3.5% boundary: 0.965 to 1.0)
            float rimZone = smoothstep(0.965, 1.0, maxDist);
            
            // Strong optical glass refraction ("bias prisma") pointing towards the outer edge
            vec2 refractDirection = normalize(vMapUv - 0.5);
            vec2 redUv   = parallaxUv - refractDirection * (rimZone * 0.016);
            vec2 greenUv = parallaxUv;
            vec2 blueUv  = parallaxUv + refractDirection * (rimZone * 0.016);
            
            vec4 sampledDiffuseColor = vec4(
              texture2D(map, redUv).r,
              texture2D(map, greenUv).g,
              texture2D(map, blueUv).b,
              texture2D(map, parallaxUv).a
            );
            
            #ifdef DECODE_VIDEO_TEXTURE
              sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
            #endif
            
            // Optical glass rim luster that intensifies outward all the way to the extreme physical edge!
            // Using pow() instead of sin() ensures the shine peaks AT the border (1.0), not inset halfway inside!
            float rimLuster = pow(rimZone, 1.8) * 0.12;
            sampledDiffuseColor.rgb += vec3(rimLuster);

            // Ultra-sharp cut bevel line right at the extreme outer 0.5% tip (0.995 to 1.0)
            float sharpBevelTip = smoothstep(0.995, 1.0, maxDist);
            sampledDiffuseColor.rgb *= (1.0 - sharpBevelTip * 0.22);
            
            diffuseColor *= sampledDiffuseColor;
          #endif
          `
        );
      };

      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false; // Hide WebGL panels since we are using HTML slanted panels now
      mesh.renderOrder = 20; // Guarantee project cards render AFTER the Avatar background to prevent Z-sorting bleed!

      const meshData = {
        mesh,
        targetOpacity: 0,
        isLoaded: false,
      };

      if (imageUrl && isVideoAsset(imageUrl)) {
        const videoTexture = getSharedVideoTexture(imageUrl);
        videoTexture.wrapT = THREE.RepeatWrapping;
        material.map = videoTexture;
        material.needsUpdate = true;
        meshData.isLoaded = true;
      } else if (imageUrl) {
        textureLoader.load(imageUrl, (texture) => {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.needsUpdate = true;
          meshData.isLoaded = true;
        });
      }

      // Rotate the mesh around the Y axis to place it in the circle
      // Positive angle means placing it to the RIGHT (+X)
      mesh.rotation.y = anglePerItem * index;

      // Slight vertical drop for each subsequent panel
      mesh.position.y = -index * verticalStagger;

      carouselGroup.add(mesh);
      state.meshes.push(meshData);
    });

    // ── Create Background Meshes ──
    const bgDataLength = Math.max(items.length, (wallItems || []).length);
    for (let index = 0; index < bgDataLength; index++) {
      const carouselItem = items[index] || items[items.length - 1]; // fallback image from items
      const wallItem = (wallItems && wallItems[index]) || items[index] || items[items.length - 1]; // wall video

      const bgMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(BackgroundShader.uniforms),
        vertexShader: BackgroundShader.vertexShader,
        fragmentShader: BackgroundShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
      });

      let bgVideoTex = ironmanTexture;
      if (wallItem.wallVideo) {
        bgVideoTex = getSharedVideoTexture(wallItem.wallVideo);
        bgVideoTex.wrapT = THREE.RepeatWrapping;
      }
      bgMaterial.uniforms.uVideoTexture.value = bgVideoTex;

      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
      bgMesh.renderOrder = 0; // Behind avatar and cards
      bgGroup.add(bgMesh);
      state.bgMeshes.push({ mesh: bgMesh, material: bgMaterial, index });

      const imageUrl = carouselItem.images?.[0] || carouselItem.image_url || carouselItem.img;
      if (imageUrl && isVideoAsset(imageUrl)) {
        const videoTexture = getSharedVideoTexture(imageUrl);
        videoTexture.wrapT = THREE.RepeatWrapping;
        bgMaterial.uniforms.uTexture.value = videoTexture;
        if (!wallItem.wallVideo) {
          bgMaterial.uniforms.uVideoTexture.value = videoTexture;
        }
      } else if (imageUrl) {
        textureLoader.load(imageUrl, (texture) => {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          bgMaterial.uniforms.uTexture.value = texture;
        });
      }
    }

    // ── Create Text Mesh for Cinematic Transition ──
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 4096;
    textCanvas.height = 2048;
    const textCtx = textCanvas.getContext('2d')!;
    if (textCtx) {
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      
      // Minimalist Professional Design
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      
      // Modern Letter Spacing (Support modern browsers)
      if ('letterSpacing' in textCtx) {
        (textCtx as any).letterSpacing = '60px';
      }
      
      // Main Title
      textCtx.font = '300 200px "Inter", "Outfit", sans-serif';
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Slightly transparent for elegance
      // Very subtle elegant glow
      textCtx.shadowColor = 'rgba(255, 255, 255, 0.2)';
      textCtx.shadowBlur = 15;
      textCtx.shadowOffsetX = 0;
      textCtx.shadowOffsetY = 0;
      
      textCtx.fillText('T H E   W O R K F L O W', 2048, 1024 - 60);

      // Reset shadow for subsequent elements
      textCtx.shadowBlur = 0;
      
      // Minimalist Separator Line
      textCtx.beginPath();
      textCtx.moveTo(2048 - 80, 1024 + 50);
      textCtx.lineTo(2048 + 80, 1024 + 50);
      textCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      textCtx.lineWidth = 2;
      textCtx.stroke();
      
      // Subtitle
      if ('letterSpacing' in textCtx) {
        (textCtx as any).letterSpacing = '30px';
      }
      textCtx.font = '400 45px "Inter", "Outfit", sans-serif';
      textCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      textCtx.fillText('C R E A T I V E   P R O C E S S', 2048, 1024 + 140);
    }
    
    const textTex = new THREE.CanvasTexture(textCanvas);
    textTex.minFilter = THREE.LinearMipmapLinearFilter;
    textTex.magFilter = THREE.LinearFilter;
    if (state.renderer) {
      textTex.anisotropy = state.renderer.capabilities.getMaxAnisotropy();
    }
    
    // Instead of a custom vertex shader that goes to a flat wall, 
    // we use the exact same morphing logic as the background (J-Curve).
    const textBgMat = new THREE.ShaderMaterial({
      uniforms: {
        uTextTex: { value: textTex },
        uPerspectiveMorph: { value: 0 },
        uOpacity: { value: 0 },
        uFlatMorph: { value: 0 } // Required by the reused BackgroundShader
      },
      vertexShader: BackgroundShader.vertexShader, // REUSE EXACT BACKGROUND MORPH (CONCAVE -> J-CURVE)
      fragmentShader: `
        uniform sampler2D uTextTex;
        uniform float uOpacity;
        uniform float uPerspectiveMorph;
        varying vec2 vUv;
        void main() {
          // Kompensasi pergeseran fisik J-Curve: 
          // Saat morphing, titik fisik x=0 bergeser dari vUv.x=0.5 menjadi vUv.x=0.279.
          // Kita geser UV center agar teks tetap diam di tengah layar dan tidak ikut terseret ke kanan!
          float centerX = 0.5 - (uPerspectiveMorph * 0.221);
          
          // Scale UV to make text smaller on screen, keeping high-res canvas rendering sharp
          // A scale factor of 5.0 ensures the wide text fits comfortably within the camera FOV
          vec2 textUv = vec2(vUv.x - centerX, vUv.y - 0.5) * 5.0 + 0.5;
          
          vec4 col = vec4(0.0);
          if (textUv.x >= 0.0 && textUv.x <= 1.0 && textUv.y >= 0.0 && textUv.y <= 1.0) {
            col = texture2D(uTextTex, textUv);
          }
          gl_FragColor = vec4(col.rgb, col.a * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false, // Let renderOrder handle overlap without Z-fighting
      side: THREE.BackSide,
    });
    
    const textBgMesh = new THREE.Mesh(bgGeometry, textBgMat);
    // Push slightly outward visually using scale just to be safe
    textBgMesh.scale.set(0.999, 0.999, 0.999); 
    textBgMesh.renderOrder = 2; // above background (0), below UI cards (20)
    bgGroup.add(textBgMesh);
    // Add to state
    (state as any).textBgMesh = textBgMesh;

    // ── 5.5: Wall Panels (Cara 2) — tangent-based orientation along J-curve ──
    // Each panel CENTER is placed on the J-curve wall at position uT.
    // The panel extends LEFT-RIGHT along the J-curve's TANGENT direction,
    // and UP-DOWN along world Y. This makes it stand upright like a painting on a curved wall,
    // leaning against the wall and facing toward the viewer.
    //
    // ┌─────────────────── J-curve (background wall) ─────────────────────────┐
    // │  Panel is mounted like a painting: center on wall, upright, tangent-aligned │
    // └───────────────────────────────────────────────────────────────────────┘
    //
    // 🔧 TUNING GUIDE:
    //   PANEL_W  — width of panel in WORLD UNITS. Bigger = wider panel.
    //   PANEL_H  — height of panel in WORLD UNITS. Bigger = taller panel.
    // 🔧 KONFIGURASI PANEL TELAH DIPINDAH KE ATAS FILE (GALLERY_CONFIG)
    // Silakan scroll ke baris paling atas untuk mengubah nilai-nilai ini!
    const PANEL_TW = GALLERY_CONFIG.PANEL_WIDTH;
    const PANEL_H = GALLERY_CONFIG.PANEL_HEIGHT;

    const wallPanelVert = `
      uniform float uT;        // panel center on J-curve [0..1]
      uniform float uPanelTW;  // panel half-width in J-curve t-space
      uniform float uPanelH;   // panel height in world units
      uniform float uMorph;
      varying vec2 vUv;

      vec3 jCurvePos(float t) {
        // Izinkan t merentang hingga 2.0 agar panel berikutnya bisa bersembunyi di luar layar kanan.
        float tc = clamp(t, 0.0, 2.0);
        // Transisi kuadratik untuk menghilangkan "lipatan/crease" di tc=0.58
        float bend = max(0.0, tc - 0.58);
        float wx = -24.0 + tc * 43.0 + bend * bend * 73.7;
        float wz = -5.5  - tc * float(${GALLERY_CONFIG.WALL_DEPTH_SLOPE}) + bend * bend * 102.0;
        return vec3(wx, 0.0, wz);
      }

      void main() {
        vUv = uv;

        // ── 1. Map this vertex's local X [-0.5..0.5] → t value along J-curve ──
        // Each vertical COLUMN of the panel is placed at a different t,
        // so the panel's left-right edges follow the J-curve curvature.
        float tVertex = uT + position.x * uPanelTW * 2.0;
        vec3 colPos = jCurvePos(tVertex);

        // ── 2. Gunakan tinggi fisik aslinya tanpa artificial tapering ──
        // Perspektif kamera 3D akan secara alami membuat panel yang jauh terlihat lebih pendek (tapering alami).
        float worldY = position.y * uPanelH;

        // ── 3. Exact per-vertex offset so panel perfectly hugs the curved wall ──
        float eps = 0.004;
        vec3 vertexTangent = normalize(jCurvePos(tVertex + eps) - jCurvePos(tVertex - eps));
        vec3 up = vec3(0.0, 1.0, 0.0);
        vec3 wallNormal = normalize(cross(up, vertexTangent));
        vec3 camDir = normalize(vec3(0.0, 0.0, 9.0) - colPos);
        if (dot(wallNormal, camDir) < 0.0) wallNormal = -wallNormal;

        // ── 4. Manual Bend untuk Melengkungkan Sisi Kiri ke Belakang ──
        // Variabel ini bisa Anda ubah di GALLERY_CONFIG di bagian atas file!
        float bendStart = float(${GALLERY_CONFIG.LEFT_BEND_START}); 
        
        // Menghitung intensitas lengkungan berdasarkan posisi X saat ini
        float bendAmount = clamp((bendStart - position.x) / 0.4, 0.0, 1.0);
        float leftBend = bendAmount * bendAmount; // Kuadrat (Parabola) agar transisinya mulus
        
        // Kekuatan bengkokan diambil dari konfigurasi
        float bendStrength = float(${GALLERY_CONFIG.LEFT_BEND_AMOUNT});
        vec3 manualBendOffset = wallNormal * (bendStrength * leftBend);
        
        // Gabungkan posisi dinding + offset standar + bengkokan manual
        vec3 worldPos = vec3(colPos.x, worldY, colPos.z) + wallNormal * 0.04 + manualBendOffset;

        // ── 5. Koreksi Kemiringan (Yaw & Pitch Rotation) ──
        // Kita memutar (rotasi) keseluruhan bentuk panel di sekitar sumbu tengahnya
        float yawAngle = radians(float(${GALLERY_CONFIG.YAW_CORRECTION})); 
        float cy = cos(yawAngle);
        float sy = sin(yawAngle);
        
        float pitchAngle = radians(float(${GALLERY_CONFIG.PITCH_CORRECTION}));
        float cp = cos(pitchAngle);
        float sp = sin(pitchAngle);
        
        vec3 panelCenter = jCurvePos(uT);
        vec3 localPos = worldPos - panelCenter;
        
        // Pitch Rotation (Sumbu X lokal)
        float py = localPos.y * cp - localPos.z * sp;
        float pz = localPos.y * sp + localPos.z * cp;
        localPos.y = py;
        localPos.z = pz;
        
        // Yaw Rotation (Sumbu Y lokal)
        float px = localPos.x * cy - localPos.z * sy;
        pz = localPos.x * sy + localPos.z * cy;
        localPos.x = px;
        localPos.z = pz;
        
        worldPos = localPos + panelCenter;

        gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
      }
    `;
    const wallPanelFrag = `
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uHasMap;
      varying vec2 vUv;
      void main() {
        if (uHasMap < 0.5) {
          // Jika gambar belum di-load, buat panel transparan sepenuhnya agar tidak menjadi kotak hitam
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        vec4 col = texture2D(uMap, vUv);
        
        // 1. Buat panel memancarkan cahaya agar menyatu dengan scene
        col.rgb *= 1.2;
        
        // 2. Transisi alpha halus di tepi panel (anti-aliasing kasar) agar tidak bergerigi
        vec2 bord = abs(vUv - 0.5) * 2.0;
        float rim = max(bord.x, bord.y);
        float alpha = smoothstep(1.0, 0.98, rim);
        
        gl_FragColor = vec4(col.rgb, col.a * uOpacity * alpha);
      }
    `;

    const wallData = wallItems || items;
    const wallPanelItems = wallData.slice(0, 5).map((item: any) => ({
      src: item.wallVideo || item.images?.[0] || item.image_url || item.img,
      isVideo: false
    }));
    // Ensure we have exactly 5 items
    const fallbacks = [
      '/images/projects/funquiz.png',
      '/images/projects/spreadsheet banner.png',
      '/images/projects/banner project looker studio.png',
      '/images/projects/banner project business manager.png',
      '/images/projects/funquiz.png'
    ];
    for (let i = wallPanelItems.length; i < 5; i++) {
      wallPanelItems.push({ src: fallbacks[i] || '/images/projects/funquiz.png', isVideo: false });
    }
    wallPanelItems.forEach((p: any) => {
      if (p.src && isVideoAsset(p.src)) p.isVideo = true;
    });



    const wallGroup = new THREE.Group();
    scene.add(wallGroup);

    wallPanelItems.forEach((panelData: any, idx: number) => {
      // High-subdivision plane so the vertex shader can bend it smoothly
      const planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 64, 16);
      const planeMat = new THREE.ShaderMaterial({
        vertexShader: wallPanelVert,
        fragmentShader: wallPanelFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uT: { value: 0.85 + idx * 0.35 }, // start off-screen right
          uPanelTW: { value: PANEL_TW },
          uPanelH: { value: PANEL_H },
          uMorph: { value: 0 },
          uFullScreenProgress: { value: 0 },
          uMap: { value: null },
          uOpacity: { value: 0 },
          uHasMap: { value: 0 },
        },
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.visible = false;
      planeMesh.renderOrder = 30;
      // Position at origin — vertex shader places vertices in world space
      planeMesh.position.set(0, 0, 0);
      planeMesh.rotation.set(0, 0, 0);
      planeMesh.scale.set(1, 1, 1);
      wallGroup.add(planeMesh);
      state.wallPanels.push({ mesh: planeMesh, material: planeMat, opacity: 0 });

      if (panelData.isVideo) {
        const vTex = getSharedVideoTexture(panelData.src || '');
        planeMat.uniforms.uMap.value = vTex;
        planeMat.uniforms.uHasMap.value = 1;
      } else if (panelData.src) {
        textureLoader.load(panelData.src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          planeMat.uniforms.uMap.value = tex;
          planeMat.uniforms.uHasMap.value = 1;
        });
      }
    });

    // 6. Intersection Observer for pausing render when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        state.isVisible = entry.isIntersecting;
        if (state.isVisible && !state.isAnimating && state.scrollProgress < 0.999) {
          state.isAnimating = true;
          state.clock.reset();
          if (state.startAnimation) state.startAnimation();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    // 7. Resize Handler
    const onResize = () => {
      if (!container || state.disposed) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // 7.5 Mouse interaction for Parallax and Raycaster
    const onMouseMove = (e: MouseEvent) => {
      if (!container || state.disposed || !state.isVisible) return;
      const rect = container.getBoundingClientRect();
      state.targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      state.targetMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onClick = () => {
      // Replay Spiderman animation if clicked while active
      if (state.wasSpidermanActive && state.spidermanAction) {
        state.spidermanAction.reset();
        state.spidermanAction.play();
      }
    };
    window.addEventListener('click', onClick);

    // 8. Animation Loop
    let smoothedScroll = 0;
    let initialized = false;
    let lastLightColorUpdate = 0;
    const raycaster = new THREE.Raycaster();
    const animate = () => {
      if (state.disposed) return;

      const now = state.clock.getElapsed();

      if (now - lastLightColorUpdate > 0.25) {
        lastLightColorUpdate = now;
        const computedPrimary = getComputedStyle(document.documentElement).getPropertyValue("--theme-primary").trim();
        if (computedPrimary) {
          try {
            rimLeft.color.set(computedPrimary);
            rimRight.color.set(computedPrimary);
            if (state.scannerMat) {
              state.scannerMat.uniforms.uColor.value.set(computedPrimary);
            }
          } catch (e) { }
        }
      }

      // CRITICAL GPU/CPU OPTIMIZATION: Once the lingering background is done, halt WebGL shader/draw calculations.
      // The avatar and project panels leave earlier; the background cylinder remains visible a little longer.
      if (!state.isVisible) {
        state.isAnimating = false;
        return; // BREAKS the requestAnimationFrame loop entirely!
      }

      state.isAnimating = true;
      state.animationId = requestAnimationFrame(animate);

      state.clock.update();
      const rawDt = state.clock.getDelta();
      // Clamp dt to max 33ms so tab-switches don't cause a giant lerp spike
      const dt = Math.min(rawDt, 0.033);
      const time = state.clock.getElapsed();

      // Export animate for external wake-ups
      state.startAnimation = animate;

      // Update Animation Mixers (OPTIMASI: Hanya diupdate jika model sedang dirender/visible!)
      // Ini menghemat CPU secara signifikan karena tidak mengkalkulasi tulang (bones) Spiderman & Captain saat tersembunyi
      if (state.captainMixer && state.captainModel?.visible) {
        state.captainMixer.update(dt);
      }
      if (state.spidermanMixer && state.spidermanModel?.visible) {
        state.spidermanMixer.update(dt);
      }
      // Smooth interpolation for mouse parallax and avatar look direction.
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.12;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.12;

      // Update 3D Avatar Rotation: follow cursor direction like a helmet/head turn.
      if (state.avatarModel) {
        const targetRotY = THREE.MathUtils.clamp(state.mouseX * 0.72, -0.72, 0.72);
        const targetRotX = THREE.MathUtils.clamp(-state.mouseY * 0.38, -0.38, 0.38); // Negate mouseY so avatar tilts UP when cursor is at the top
        const TARGET_POS_Y = 0;

        state.avatarModel.rotation.y += (targetRotY - state.avatarModel.rotation.y) * 0.14;
        state.avatarModel.rotation.x += (targetRotX - state.avatarModel.rotation.x) * 0.14;
        state.avatarModel.rotation.z += ((-state.mouseX * 0.08) - state.avatarModel.rotation.z) * 0.12;

        // ── BUG FIX: Only lerp Y if already snapped (avoids "rising" on load) ──
        if (state.avatarPositionSnapped) {
          // Allow very subtle correction only, no big lerp
          const curY = state.avatarModel.position.y;
          if (Math.abs(curY - TARGET_POS_Y) > 0.001) {
            state.avatarModel.position.y += (TARGET_POS_Y - curY) * 0.05;
          }
        } else {
          // First frame after load — snap immediately
          state.avatarModel.position.y = TARGET_POS_Y;
          state.avatarPositionSnapped = true;
        }
      }

      // ── DR STRANGE HOLOGRAM ANIMATION ──
      if (state.drstrangeModel) {
        // Only trigger the "rise up" animation if we are on the first slide (Doctor Strange)
        // and we have scrolled into the Wall Phase
        const isStrangeActive = state.lastReportedIndex === 0 && smoothedScroll >= 0.85;

        // Target Y: visible (-1.5) if active, hidden (-15.0) if not. Add subtle floating animation.
        const floatOffset = isStrangeActive ? Math.sin(time * 1.5) * 0.15 : 0;
        const targetY = isStrangeActive ? -1.5 : -15.0;

        // Smooth lerp from bottom to top
        state.drstrangeModel.position.y += ((targetY + floatOffset) - state.drstrangeModel.position.y) * 0.05;

        // Interactive Mouse Follow (Head turning / subtle rotation)
        if (isStrangeActive) {
          const targetRotY = state.mouseX * 0.4;
          const targetRotX = -state.mouseY * 0.2;
          state.drstrangeModel.rotation.y += (targetRotY - state.drstrangeModel.rotation.y) * 0.08;
          state.drstrangeModel.rotation.x += (targetRotX - state.drstrangeModel.rotation.x) * 0.08;
        }

        // Optimization: Disable rendering entirely when hidden below screen
        // Ini memastikan GPU benar-benar tidak merender model saat berada di luar layar
        if (state.drstrangeModel.position.y < -14.0) {
          state.drstrangeModel.visible = false;
        } else {
          state.drstrangeModel.visible = true;
        }
      }

      // ── IRONMAN HOLOGRAM ANIMATION ──
      if (state.ironmanModel) {
        // Only trigger the "rise up" animation if we are on the second slide (Ironman)
        // and we have scrolled into the Wall Phase
        const isIronmanActive = state.lastReportedIndex === 1 && smoothedScroll >= 0.85;

        // Target Y: visible (-3.5) if active, hidden (-15.0) if not. Add subtle floating animation.
        const floatOffset = isIronmanActive ? Math.sin(time * 1.5) * 0.15 : 0;
        const targetY = isIronmanActive ? -2 : -15.0;

        // Smooth lerp from bottom to top
        state.ironmanModel.position.y += ((targetY + floatOffset) - state.ironmanModel.position.y) * 0.05;

        // Interactive Mouse Follow (Head turning / subtle rotation)
        if (isIronmanActive) {
          const targetRotY = state.mouseX * 0.4;
          const targetRotX = -state.mouseY * 0.2;
          state.ironmanModel.rotation.y += (targetRotY - state.ironmanModel.rotation.y) * 0.08;
          state.ironmanModel.rotation.x += (targetRotX - state.ironmanModel.rotation.x) * 0.08;
        }

        // Optimization: Disable rendering entirely when hidden below screen
        if (state.ironmanModel.position.y < -14.0) {
          state.ironmanModel.visible = false;
        } else {
          state.ironmanModel.visible = true;
        }
      }

      if (state.captainModel) {
        // Only trigger the "rise up" animation if we are on the fifth slide (Captain America)
        // and we have scrolled into the Wall Phase
        const isCaptainActive = state.lastReportedIndex === 4 && smoothedScroll >= 0.85;

        // Hapus efek floating
        const targetY = isCaptainActive ? -3.5 : -10.0; // Adjust visible height

        // Smooth lerp from bottom to top (tanpa floatOffset)
        state.captainModel.position.y += (targetY - state.captainModel.position.y) * 0.05;

        // Interactive Mouse Follow (Head turning / subtle rotation)
        if (isCaptainActive) {
          const targetRotY = state.mouseX * 0.4;
          const targetRotX = -state.mouseY * 0.2;
          state.captainModel.rotation.y += (targetRotY - state.captainModel.rotation.y) * 0.08;
          state.captainModel.rotation.x += (targetRotX - state.captainModel.rotation.x) * 0.08;
        }

        // Optimization: Disable rendering entirely when hidden below screen
        if (state.captainModel.position.y < -14.0) {
          state.captainModel.visible = false;
        } else {
          state.captainModel.visible = true;
        }

        // Animasi Opacity
        const targetOpacity = isCaptainActive ? 0.9 : 0;
        state.captainModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
              mat.opacity = state.captainModel!.position.y > -5 ? 1 : 0;
            }
          }
        });
      }

      if (state.spidermanModel) {
        const isSpidermanActive = state.lastReportedIndex === 2 && smoothedScroll >= 0.85;

        // Auto-play when scrolled into view
        if (isSpidermanActive && !state.wasSpidermanActive) {
          if (state.spidermanAction) {
            state.spidermanAction.reset();
            state.spidermanAction.play();
          }
        }
        state.wasSpidermanActive = isSpidermanActive;

        const floatOffset = isSpidermanActive ? Math.sin(time * 2.0) * 0.15 : 0;
        // Spiderman merayap naik ke tengah dari bawah
        const targetY = isSpidermanActive ? SPIDERMAN_CONFIG.TARGET_Y : SPIDERMAN_CONFIG.START_Y;

        state.spidermanModel.position.y += ((targetY + floatOffset) - state.spidermanModel.position.y) * 0.05;

        if (isSpidermanActive) {
          // Efek parallax ringan saat merayap
          const targetRotY = state.mouseX * 0.2;
          const targetRotX = -state.mouseY * 0.2;
          state.spidermanModel.rotation.y += (targetRotY - state.spidermanModel.rotation.y) * 0.08;
          state.spidermanModel.rotation.x += (targetRotX - state.spidermanModel.rotation.x) * 0.08;
        }

        if (state.spidermanModel.position.y < (SPIDERMAN_CONFIG.START_Y + 1.0)) {
          state.spidermanModel.visible = false;
        } else {
          state.spidermanModel.visible = true;
        }

      }

      // ── HUD RETINA SCANNER ANIMATION ──(Disabled to remove 3D depth effect on background)
      camera.position.x = 0;
      camera.position.y = 0;
      camera.lookAt(0, 0, 0); // Keep looking at the center

      // ── DIRECT LERP SYNC WITH LENIS (STUTTER-FREE OPTIMIZATION) ──
      // Lenis + GSAP sudah memberikan easing scroll yang sangat halus (duration 0.8s di scrollTo).
      // Menggunakan pegas (spring) untuk mengejar nilai yang sudah di-easing akan menyebabkan bentrok
      // fisika (stuttering/patah-patah) karena spring tertinggal lalu ngebut.
      // Solusinya: Kita ikat (bind) rotasi 3D langsung ke scrollProgress dengan Lerp ringan.
      // Ini 100% mulus dan sangat ringan untuk CPU/GPU.
      const lerpFactor = 1.8; // Diturunkan ke 1.8 agar pergerakan panel sangat lambat, halus, dan gentle
      smoothedScroll = THREE.MathUtils.lerp(smoothedScroll, state.scrollProgress, dt * lerpFactor);

      // Export the smoothly clamped scroll progress back to React HTML UI
      if (cinematicProgress) {
        cinematicProgress.set(smoothedScroll);
      }

      // Optimization handled at top of animate loop

      // Padding to allow the 3D star to be alone at start and end
      const paddingStart = 5.0;
      const paddingEnd = 4.0;
      const totalRotationSteps = (items.length - 1) + paddingStart + paddingEnd;

      // Rotate the entire group based on smoothed scroll
      const totalRotation = totalRotationSteps * anglePerItem;
      carouselGroup.rotation.y = (paddingStart * anglePerItem) - (smoothedScroll * totalRotation);

      // Translate the group UP to counteract the vertical stagger of the active panel (+0.35 lift prevents colliding with text below)
      const totalTranslation = totalRotationSteps * verticalStagger;
      const floatOffset = Math.sin(time) * 0.05;
      carouselGroup.position.y = (smoothedScroll * totalTranslation) - (paddingStart * verticalStagger) + floatOffset + 0.35;

      // Calculate precise floating-point index of the active panel across both modes
      let rawIndex = 0;
      let targetIndex = 0;

      if (smoothedScroll >= 0.85) {
        if (smoothedScroll >= 0.94) {
          const WALL_START = 0.94;
          const WALL_END = 0.975;
          let wp = Math.max((smoothedScroll - WALL_START) / (WALL_END - WALL_START), 0);

          const START_T = GALLERY_CONFIG.START_T;
          const T_LEFT = GALLERY_CONFIG.T_LEFT;
          const SPACING = GALLERY_CONFIG.SPACING;
          const TRAVEL = GALLERY_TRAVEL;

          rawIndex = (wp * TRAVEL - (START_T - T_LEFT)) / SPACING;
          targetIndex = Math.round(rawIndex);
        } else {
          targetIndex = -1;
          rawIndex = -1;
        }
      } else {
        const currentStep = smoothedScroll * totalRotationSteps;
        rawIndex = currentStep - paddingStart;
        targetIndex = Math.round(rawIndex);
      }
      
      const maxIndex = (smoothedScroll >= 0.85 && wallItems) ? wallItems.length + 1 : items.length - 1;
      // Allow -1 for BOTH phases so the very first item can be magnetically snapped into
      const minIndex = -1;
      targetIndex = Math.max(minIndex, Math.min(maxIndex, targetIndex));

      // Synchronize active UI description text with the ACTUAL visual rotation of the panels!
      if (state.onActiveIndexChange) {
        if (state.lastReportedIndex !== targetIndex) {
          state.lastReportedIndex = targetIndex;
          state.onActiveIndexChange(targetIndex);
        }
      }

      // Raycaster Detection
      state.pointer.set(state.mouseX, state.mouseY);
      raycaster.setFromCamera(state.pointer, camera);

      // ── Stage 1: Nano Assembly & Dissolve Scrubbing (0.015 -> 0.18) ──────────────────
      // Scroll Down (0.015 -> 0.18): Avatar smoothly assembles from nano tech particles AFTER Hero card vanishes
      // Scroll Up   (0.18 -> 0.015): Avatar smoothly dissolves in reverse back into particles
      if (state.avatarModel && state.nanoController) {
        const NANO_START = 0.015; // Clean buffer zone after Hero section card finishes zooming out
        const NANO_END = 0.18; // Finishes at 0.18 BEFORE HUD Profile appears at 0.18!

        // PREVENT DOWNWARD SLIDING WHEN SCROLLING UP BACK INTO HERO SECTION:
        // When scrollProgress drops below NANO_START (reaching top sticky boundary),
        // immediately hide avatarModel and reset inertia so nothing remains visible while the container scrolls down!
        // When scroll drops below NANO_START, hide immediately
        if (smoothedScroll <= NANO_START) {
          state.avatarModel.visible = false;
          if (state.wasInNanoZone) {
            state.nanoController.setScrubProgress(0);
            state.nanoController.update(0);
            state.wasInNanoZone = false;
          }
        } else {
          // Derive nano progress directly from the globally damped cinematic scroll!
          const rawProgress = (smoothedScroll - NANO_START) / (NANO_END - NANO_START);
          const targetNanoProgress = Math.min(Math.max(rawProgress, 0), 1);

          const isReady = targetNanoProgress > 0.99;
          if (isReady !== state.isAvatarReady) {
            state.isAvatarReady = isReady;
            if (state.onAvatarReady) state.onAvatarReady(isReady);
          }

          state.avatarModel.visible = true;

          const isNanoActive = (smoothedScroll <= 0.19) || (Math.abs(targetNanoProgress - state.nanoController.scrubProgress) > 0.005);
          if (isNanoActive || state.wasInNanoZone) {
            state.nanoController.setScrubProgress(targetNanoProgress);
            state.nanoController.update(dt);
            state.wasInNanoZone = isNanoActive;
          }
        }
      }

      // Stage 1.5: Portal Transition (Avatar dissolves first)
      if (state.portalController && state.nanoController) {
        // smoothedScroll from 0.70 to 0.78
        let portalProgress = 0;
        if (smoothedScroll > 0.70 && smoothedScroll <= 0.78) {
          portalProgress = (smoothedScroll - 0.70) / 0.08;
        } else if (smoothedScroll > 0.78) {
          portalProgress = 1.0;
        }

        const portalY = state.portalController.update(portalProgress, dt);
        const isPortalActive = portalProgress > 0.0; // Keep active even at 1.0 so avatar stays hidden

        state.nanoController.setPortalState(isPortalActive, portalY);
      }

      // Stage 2: Carousel Panels
      const panelGlobalFade = Math.min(Math.max((state.scrollProgress - 0.35) / 0.05, 0), 1);
      const panelExitFade = 1 - Math.min(Math.max((smoothedScroll - 0.70) / 0.05, 0), 1);
      
      // Blackout transition (darkens background image, leaves grid visible)
      let blackout = 0;
      if (smoothedScroll > 0.75 && smoothedScroll <= 0.78) {
        blackout = (smoothedScroll - 0.75) / 0.03; // fade to black
      } else if (smoothedScroll > 0.78 && smoothedScroll <= 0.92) {
        blackout = 1.0; // hold black
      } else if (smoothedScroll > 0.92 && smoothedScroll <= 0.94) {
        blackout = 1.0 - (smoothedScroll - 0.92) / 0.02; // fade out
      } else if (smoothedScroll > 0.975) {
        blackout = Math.min(Math.max((smoothedScroll - 0.975) / 0.010, 0), 1); // fade to black for IMAX
      }

      // Text Overlay Opacity (Appears after blackout, before morph)
      let textOpacity = 0;
      if (smoothedScroll > 0.78 && smoothedScroll <= 0.81) {
        textOpacity = (smoothedScroll - 0.78) / 0.03;
      } else if (smoothedScroll > 0.81 && smoothedScroll <= 0.90) {
        textOpacity = 1.0;
      } else if (smoothedScroll > 0.90 && smoothedScroll <= 0.92) {
        textOpacity = 1.0 - (smoothedScroll - 0.90) / 0.02;
      }

      // Morph the background to J-curve (grid and text morph together)
      const perspectiveMorph = Math.min(Math.max((smoothedScroll - 0.81) / 0.08, 0), 1);

      // Video background is delayed until 0.94 (after blackout fades)
      const ironmanVideoBlend = Math.min(Math.max((smoothedScroll - 0.94) / 0.02, 0), 1);

      // ── Wall Panel update (Cara 2) ─────────────────────────────────────────
      // Panels begin sliding onto the J-curve wall at scroll 0.94 (after bg morph finishes)
      // Each panel's position on the J-curve is driven by a parameter `t` that goes from 1 (far right)
      // down to 0 (far left) as the scroll progresses. Panel 2 has a delayed tOffset.
      const WALL_START = 0.94;
      const WALL_END = 0.975;
      let wp = Math.max((smoothedScroll - WALL_START) / (WALL_END - WALL_START), 0);

      // ── STICKY SCROLL FIX ──
      // GSAP ScrollTrigger now actively snaps `smoothedScroll` to exactly 0.969 and 0.998.
      // We map these scroll values so Panel 0 is centered at wp = 0.50 and Panel 1 at wp = 1.00.

      // Flat Morph (IMAX Phase) - Starts after WALL_END
      const flatMorph = Math.min(Math.max((smoothedScroll - 0.975) / 0.010, 0), 1);

      // Sembunyikan HTML overlay interaktif karena Panel 5 tidak lagi menjadi fullscreen
      if (overlayRef.current) {
        overlayRef.current.style.opacity = '0';
        overlayRef.current.style.pointerEvents = 'none';
      }

      if (state.wallPanels.length > 0) {
        // Menggunakan konstanta dari konfigurasi di atas
        const START_T = GALLERY_CONFIG.START_T;
        const MIN_T = -3.50;    // Batas aman
        const TRAVEL = GALLERY_TRAVEL;
        const SPACING = GALLERY_CONFIG.SPACING;

        // Calculate raw position (unclamped)
        const rawBaseT = START_T - (wp * TRAVEL);

        const tValues = state.wallPanels.map((_, idx) => {
          return Math.max(MIN_T, Math.min(START_T, rawBaseT + idx * SPACING));
        });
        state.wallPanels.forEach((wpData, idx) => {
          wpData.material.uniforms.uT.value = tValues[idx];
          wpData.material.uniforms.uMorph.value = perspectiveMorph;

          // (Dihapus: uFullScreenProgress tidak lagi digunakan)

          // Fade in as the panel leaves START_T
          const currentT = tValues[idx];
          const entryFade = Math.min(Math.max((START_T - currentT) / 0.10, 0), 1);
          // For panel 0, ensure it fades in even before it starts moving (using wp)
          const panelEntryFade = idx === 0
            ? Math.max(entryFade, Math.min(wp / 0.12, 1))
            : entryFade;

          // Terapkan targetOpacity standar (tanpa efek bypass panel 5)
          let targetOpacity = panelEntryFade * perspectiveMorph;

          wpData.opacity += (targetOpacity - wpData.opacity) * Math.min(dt * 8, 1);
          wpData.material.uniforms.uOpacity.value = wpData.opacity;
          wpData.mesh.visible = (wpData.opacity > 0.005) && perspectiveMorph > 0.01;
        });
      }

      // Dynamic Opacity Fade & Scale Materialization for Panels
      state.meshes.forEach((meshData, index) => {
        const mesh = meshData.mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        // Fast path GPU culling: if global panel opacity is 0 (before 0.32), completely hide mesh and skip calculations!
        if (panelGlobalFade <= 0.001) {
          material.opacity = 0;
          mesh.visible = false;
          return;
        }

        // Calculate global Y rotation of this panel (between -PI and PI)
        let globalRot = mesh.rotation.y + carouselGroup.rotation.y;
        globalRot = globalRot % (Math.PI * 2);
        if (globalRot > Math.PI) globalRot -= Math.PI * 2;
        if (globalRot < -Math.PI) globalRot += Math.PI * 2;

        const absRot = Math.abs(globalRot);

        // Start fading out at ~45 degrees (0.8 rad), completely invisible by ~85 degrees (1.5 rad)
        const fadeStart = 0.8;
        const fadeEnd = 1.5;

        let targetOpacity = 1;
        if (absRot > fadeStart) {
          targetOpacity = 1 - ((absRot - fadeStart) / (fadeEnd - fadeStart));
          if (targetOpacity < 0) targetOpacity = 0;
        }

        if (meshData.isLoaded) {
          meshData.targetOpacity = targetOpacity * panelGlobalFade * panelExitFade;
        }

        // Apply opacity lerping cleanly with time-delta decay
        const currentOpacity = material.opacity || 0;
        const opacityDamping = 1 - Math.exp(-dt * 12);
        material.opacity = currentOpacity + (meshData.targetOpacity - currentOpacity) * opacityDamping;

        // Add subtle 3D materialization scale as panel global fade slides in from 0 to 1
        const entryScale = 0.8 + (panelGlobalFade * panelExitFade * 0.2);
        mesh.scale.set(entryScale, entryScale, entryScale);

        // CRITICAL GPU OPTIMIZATION: Disable draw calls and shader execution completely for hidden panels!
        mesh.visible = (material.opacity > 0.005);

        // Only update 3D inner parallax mouse uniform if the panel is visible
        if (mesh.visible && material.userData.uMouse) {
          material.userData.uMouse.value.set(state.mouseX, state.mouseY);
        }
      });

      // Background Mesh Fade & Parallax
      if (state.bgGroup) {
        state.bgGroup.scale.set(
          1,
          1,
          1
        );
        state.bgGroup.position.set(
          (perspectiveMorph * -0.85) * (1.0 - flatMorph),
          (perspectiveMorph * 0.25) * (1.0 - flatMorph),
          0
        );
        state.bgGroup.rotation.y = (perspectiveMorph * -0.08) * (1.0 - flatMorph);
        state.bgGroup.rotation.x = (perspectiveMorph * 0.025) * (1.0 - flatMorph);
      }

      state.bgMeshes.forEach((meshData) => {
        const material = meshData.material;

        if (panelGlobalFade <= 0.001) {
          material.uniforms.uOpacity.value = 0;
          meshData.mesh.visible = false;
          return;
        }

        // Use the global rawIndex (which accurately maps both Carousel and Wall phase positions)
        // to calculate the distance of this background mesh from the current view center.
        // Prevent the final background mesh from fading out when we scroll into the IMAX phase
        const clampedRawIndex = Math.min(rawIndex, state.bgMeshes.length - 1);
        const diff = clampedRawIndex - meshData.index;

        // We use panelGlobalFade so the background (grid and video) stays visible
        // until the end of the transition. The static image ghosting is handled in the shader.
        const bgOpacity = Math.max(0, 1 - Math.abs(diff)) * panelGlobalFade;

        material.uniforms.uOpacity.value = bgOpacity;
        // Background statis (tidak bergeser), murni animasi Fade-In sesuai permintaan
        material.uniforms.uShift.value = 0.0; 
        material.uniforms.uTime.value = time;
        material.uniforms.uPerspectiveMorph.value = perspectiveMorph;
        material.uniforms.uFlatMorph.value = flatMorph;
        material.uniforms.uVideoBlend.value = ironmanVideoBlend;
        material.uniforms.uBlackout.value = blackout;
        // Gunakan nilai positif agar perpindahan UV membuat grid tampak bergeser dari kanan ke kiri
        material.uniforms.uWallScroll.value = wp * 0.6;

        // GPU OPTIMIZATION: Hentikan render sepenuhnya saat opacity sangat rendah
        meshData.mesh.visible = (bgOpacity > 0.005);
      });

      if ((state as any).textBgMesh) {
        const textMesh = (state as any).textBgMesh as THREE.Mesh;
        const textMat = textMesh.material as THREE.ShaderMaterial;
        textMat.uniforms.uPerspectiveMorph.value = perspectiveMorph;
        textMat.uniforms.uOpacity.value = textOpacity;
        textMesh.visible = textOpacity > 0.005;
      }

      if (state.scannerMat) {
        state.scannerMat.uniforms.uTime.value = time;

        // Sync scanner visibility with HUD: fade in at 0.18→0.21, fade out at 0.26→0.29
        // Matches exactly when TonyStarkHudProfile enters and exits
        const HUD_FADE_IN_START = 0.18;
        const HUD_FADE_IN_END = 0.21;
        const HUD_FADE_OUT_START = 0.26;
        const HUD_FADE_OUT_END = 0.29;

        let scannerAlpha = 0;
        if (smoothedScroll >= HUD_FADE_IN_START && smoothedScroll <= HUD_FADE_OUT_END) {
          if (smoothedScroll < HUD_FADE_IN_END) {
            // Fading in
            scannerAlpha = (smoothedScroll - HUD_FADE_IN_START) / (HUD_FADE_IN_END - HUD_FADE_IN_START);
          } else if (smoothedScroll <= HUD_FADE_OUT_START) {
            // Fully visible
            scannerAlpha = 1.0;
          } else {
            // Fading out
            scannerAlpha = 1.0 - (smoothedScroll - HUD_FADE_OUT_START) / (HUD_FADE_OUT_END - HUD_FADE_OUT_START);
          }
        }

        state.scannerMat.uniforms.uAlpha.value = Math.max(0, Math.min(1, scannerAlpha));

        // GPU optimization: hide the mesh entirely when invisible
        const scannerMesh = state.avatarModel?.children.find(
          (c) => c instanceof THREE.Mesh && c.material === state.scannerMat
        );
        if (scannerMesh) scannerMesh.visible = scannerAlpha > 0.005;
      }

      // ── SMART VIDEO AUTO-PAUSE (GPU OPTIMIZATION) ──
      // Calculate which videos are currently visible on screen to save decoding CPU/GPU
      const videoVisibility = new Map<HTMLVideoElement, boolean>();
      state.videoElements.forEach(vid => videoVisibility.set(vid, false));

      const markVideoVisible = (texture: any) => {
        if (texture && texture.isVideoTexture && texture.userData && texture.userData.videoElement) {
          videoVisibility.set(texture.userData.videoElement, true);
        }
      };

      state.meshes.forEach(meshData => {
        if (meshData.mesh.visible) {
          markVideoVisible((meshData.mesh.material as any).map);
        }
      });

      state.bgMeshes.forEach(meshData => {
        if (meshData.mesh.visible) {
          const mat = meshData.material as any;
          markVideoVisible(mat.uniforms.uTexture?.value);
          if (mat.uniforms.uVideoBlend?.value > 0.005) {
            markVideoVisible(mat.uniforms.uVideoTexture?.value);
          }
        }
      });

      state.wallPanels.forEach(wpData => {
        if (wpData.mesh.visible) {
          markVideoVisible((wpData.material as any).uniforms.uMap?.value);
        }
      });

      videoVisibility.forEach((isVisible, video) => {
        if (isVisible) {
          if (video.paused) {
            const p = video.play();
            if (p !== undefined) {
              (video as any)._playPromise = p;
              p.catch(() => {});
            }
          }
        } else {
          if (!video.paused) {
            const p = (video as any)._playPromise;
            if (p !== undefined) {
              p.then(() => {
                video.pause();
              }).catch(() => {});
            } else {
              video.pause();
            }
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      state.disposed = true;
      cancelAnimationFrame(state.animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      observer.disconnect();

      geometry.dispose();
      bgGeometry.dispose();
      envMap.dispose();

      if (state.nanoController) {
        state.nanoController.dispose();
        state.nanoController = null;
      }
      if (state.portalController) {
        state.portalController.dispose();
        state.portalController = null;
      }
      state.videoElements.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      state.videoElements = [];
      state.videoTextures.forEach((texture) => texture.dispose());
      state.videoTextures = [];

      if (state.avatarModel) {
        state.avatarModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((m) => {
                if ((m as any).map) (m as any).map.dispose();
                if ((m as any).normalMap) (m as any).normalMap.dispose();
                m.dispose();
              });
            }
          }
        });
      }

      state.meshes.forEach(meshData => {
        if (meshData.mesh.material instanceof THREE.Material) meshData.mesh.material.dispose();
        if ((meshData.mesh.material as any).map) (meshData.mesh.material as any).map.dispose();
      });

      state.wallPanels.forEach(wp => {
        wp.mesh.geometry.dispose();
        if (wp.material.uniforms.uMap?.value) wp.material.uniforms.uMap.value.dispose();
        wp.material.dispose();
      });
      state.wallPanels = [];

      state.videoElements.forEach(vid => {
        vid.pause();
        vid.removeAttribute('src');
        vid.load();
        vid.remove();
      });
      state.videoElements = [];

      state.videoTextures.forEach(vTex => {
        vTex.dispose();
      });
      state.videoTextures = [];

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [items]);

  // Handle Framer Motion scroll progress
  useEffect(() => {
    const unsubscribeScroll = smoothProgress.on("change", (latest: number) => {
      stateRef.current.scrollProgress = latest;

      // Wake up the animation loop if we scroll back into view
      if (stateRef.current.scrollProgress < 0.999 && stateRef.current.isVisible && !stateRef.current.isAnimating) {
        stateRef.current.isAnimating = true;
        stateRef.current.clock.reset();
        if (stateRef.current.startAnimation) stateRef.current.startAnimation();
      }

      // Force play any suspended videos when the user scrolls is removed to prevent aggressive stuttering
    });
    return () => unsubscribeScroll();
  }, [smoothProgress]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className || ""}`}
      style={{ zIndex: 10 }}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none opacity-0 flex items-center justify-center p-4 md:p-12 transition-opacity duration-75"
        style={{ zIndex: 20 }}
      >
        <div className="w-full max-w-7xl mx-auto mt-20">
          <PaletteTab
            activeThemeId={activeThemeId || "tesseract"}
            onThemeChange={onThemeChange || (() => { })}
            isActive={true}
          />
        </div>
      </div>
    </div>
  );
}
