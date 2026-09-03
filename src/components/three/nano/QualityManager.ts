import * as THREE from "three";

export type QualityTier = "ultra" | "high" | "medium" | "low";

export interface QualityProfile {
  tier: QualityTier;
  particleCount: number;
  bloomEnabled: boolean;
  bloomStrength: number;
  msaa: boolean;
  dissolveOctaves: number;
}

const PROFILES: Record<QualityTier, QualityProfile> = {
  ultra: {
    tier: "ultra",
    particleCount: 8500,
    bloomEnabled: true,
    bloomStrength: 1.0,
    msaa: true,
    dissolveOctaves: 4,
  },
  high: {
    tier: "high",
    particleCount: 5200,
    bloomEnabled: true,
    bloomStrength: 0.8,
    msaa: true,
    dissolveOctaves: 3,
  },
  medium: {
    tier: "medium",
    particleCount: 3000,
    bloomEnabled: true,
    bloomStrength: 0.5,
    msaa: false,
    dissolveOctaves: 3,
  },
  low: {
    tier: "low",
    particleCount: 500,
    bloomEnabled: false,
    bloomStrength: 0,
    msaa: false,
    dissolveOctaves: 2,
  },
};

export function detectQuality(renderer: THREE.WebGLRenderer): QualityProfile {
  const dpr = window.devicePixelRatio || 1;
  const gl = renderer.getContext();
  let tier: QualityTier = "high";

  // GPU renderer string detection
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (debugInfo) {
    const gpu = gl
      .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      .toLowerCase();

    if (/rtx|radeon rx [67]|arc a[57]|geforce gtx 1[6-9]|gtx 20/i.test(gpu)) {
      tier = "ultra";
    } else if (/gtx|geforce|radeon|rx [45]/i.test(gpu)) {
      tier = "high";
    } else if (/intel|uhd|iris|hd graphics/i.test(gpu)) {
      tier = "medium";
    } else if (/adreno|mali|powervr|apple gpu|swiftshader/i.test(gpu)) {
      tier = dpr > 2 ? "medium" : "low";
    }
  }

  // Hardware constraints
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const cores = navigator.hardwareConcurrency || 4;
  if (maxTex <= 4096 || cores <= 2) {
    tier = "low";
  }

  // Mobile cap
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
    navigator.userAgent
  );
  if (isMobile) {
    tier = "low";
  }

  return PROFILES[tier];
}
