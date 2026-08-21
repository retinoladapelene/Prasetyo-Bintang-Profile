import * as THREE from "three";
import { NanoShaders } from "./Shaders";
import type { QualityProfile } from "./QualityManager";

export class NanoParticleSystem {
  public points: THREE.Points;
  public material: THREE.ShaderMaterial;

  constructor(targetPositions: Float32Array, quality: QualityProfile) {
    const geometry = new THREE.BufferGeometry();
    const count = targetPositions.length / 3;
    const sizeMultiplier = quality.tier === "low" ? 0.82 : quality.tier === "medium" ? 0.92 : 1.0;

    // We need attributes to control the swirl
    const swirlAxis = new Float32Array(count * 3);
    const swirlSpeed = new Float32Array(count);
    const swirlRadius = new Float32Array(count);
    const phase = new Float32Array(count);
    const shardScale = new Float32Array(count);
    const orbitLayer = new Float32Array(count);
    const burst = new Float32Array(count);

    const _v = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // Random axis for each particle's swirl
      _v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      swirlAxis[i * 3] = _v.x;
      swirlAxis[i * 3 + 1] = _v.y;
      swirlAxis[i * 3 + 2] = _v.z;

      // Random speed, radius, and staging values for layered armor assembly
      swirlSpeed[i] = (Math.random() * 3.5 + 1.8) * (Math.random() > 0.5 ? 1 : -1);
      swirlRadius[i] = Math.random() * 2.4 + 0.75;
      phase[i] = Math.random() * Math.PI * 2;
      shardScale[i] = Math.random() * 0.85 + 0.55;
      orbitLayer[i] = Math.random();
      burst[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(targetPositions, 3)); 
    geometry.setAttribute("targetPosition", new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute("swirlAxis", new THREE.BufferAttribute(swirlAxis, 3));
    geometry.setAttribute("swirlSpeed", new THREE.BufferAttribute(swirlSpeed, 1));
    geometry.setAttribute("swirlRadius", new THREE.BufferAttribute(swirlRadius, 1));
    geometry.setAttribute("phase", new THREE.BufferAttribute(phase, 1));
    geometry.setAttribute("shardScale", new THREE.BufferAttribute(shardScale, 1));
    geometry.setAttribute("orbitLayer", new THREE.BufferAttribute(orbitLayer, 1));
    geometry.setAttribute("burst", new THREE.BufferAttribute(burst, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: NanoShaders.particle.vertex,
      fragmentShader: NanoShaders.particle.fragment,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 }, // 0: swirl, 1: locked to target
        uColor: { value: new THREE.Color(0x00f3ff) }, // Cyan glow
        uCoreColor: { value: new THREE.Color(0xffffff) },
        uSparkColor: { value: new THREE.Color(0xffb02e) },
        uOpacity: { value: 0 },
        uEnergy: { value: 0 },
        uSizeMultiplier: { value: sizeMultiplier }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false; // Important: prevent popping during assembly
  }

  update(dt: number, progress: number) {
    this.material.uniforms.uTime.value += dt;
    this.material.uniforms.uProgress.value = progress;
    this.material.uniforms.uEnergy.value = Math.sin(Math.min(Math.max(progress, 0), 1) * Math.PI);
  }

  dispose() {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
