import * as THREE from "three";

export class WireframeOverlay {
  public group: THREE.Group;
  public material: THREE.LineBasicMaterial;
  private lineSegments: THREE.LineSegments[] = [];

  constructor(sourceGroup: THREE.Group | THREE.Object3D) {
    this.group = new THREE.Group(); // Keep group for compatibility, though we attach to meshes directly
    
    // Shared material for all edge geometries
    this.material = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    sourceGroup.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        // Extract edges (angle threshold of 30 degrees usually gives a nice sci-fi look)
        const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, 30);
        const lines = new THREE.LineSegments(edgesGeo, this.material);
        
        // Add directly as a child of the mesh so it inherits ALL transforms
        // (including deeply nested bones, scales, and offsets)
        mesh.add(lines);
        
        this.lineSegments.push(lines);
      }
    });
  }

  setOpacity(opacity: number) {
    this.material.opacity = opacity;
  }

  dispose() {
    this.lineSegments.forEach(lines => {
      if (lines.parent) lines.parent.remove(lines);
      lines.geometry.dispose();
    });
    this.material.dispose();
  }
}
