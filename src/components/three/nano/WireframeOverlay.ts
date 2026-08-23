import * as THREE from "three";

export class WireframeOverlay {
  public group: THREE.Group;
  public material: THREE.LineBasicMaterial;
  private lineSegments: THREE.LineSegments[] = [];
  public customUniforms = {
    uDrawProgress: { value: 0.0 },
    uBaseOpacity: { value: 0.0 }
  };

  constructor(sourceGroup: THREE.Group | THREE.Object3D) {
    this.group = new THREE.Group(); 
    
    // Shared material for all edge geometries
    this.material = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 1, // Controlled by shader uBaseOpacity
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // High performance GPU clip-discard animation
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uDrawProgress = this.customUniforms.uDrawProgress;
      shader.uniforms.uBaseOpacity = this.customUniforms.uBaseOpacity;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>\n varying vec3 vWorldPosition;`
      ).replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>\n vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>\n uniform float uDrawProgress;\n uniform float uBaseOpacity;\n varying vec3 vWorldPosition;`
      ).replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        // Map progress to roughly the avatar's height range (adjust if needed)
        float yThreshold = mix(-5.5, 5.5, uDrawProgress);
        
        if (vWorldPosition.y > yThreshold) {
          discard;
        }
        
        // Add a bright glowing leading edge
        float distToEdge = yThreshold - vWorldPosition.y;
        float edgeGlow = 0.0;
        if (distToEdge < 0.4) {
          edgeGlow = pow(1.0 - (distToEdge / 0.4), 2.0) * 2.0;
        }
        
        gl_FragColor = vec4(gl_FragColor.rgb + (gl_FragColor.rgb * edgeGlow), gl_FragColor.a * uBaseOpacity);
        `
      );
    };

    sourceGroup.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        // Extract edges (angle threshold of 30 degrees usually gives a nice sci-fi look)
        const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, 30);
        const lines = new THREE.LineSegments(edgesGeo, this.material);
        
        // Add directly as a child of the mesh so it inherits ALL transforms
        mesh.add(lines);
        
        this.lineSegments.push(lines);
      }
    });
  }

  setOpacity(opacity: number) {
    this.customUniforms.uBaseOpacity.value = opacity;
  }
  
  setProgress(progress: number) {
    this.customUniforms.uDrawProgress.value = progress;
  }

  dispose() {
    this.lineSegments.forEach(lines => {
      if (lines.parent) lines.parent.remove(lines);
      lines.geometry.dispose();
    });
    this.material.dispose();
  }
}
