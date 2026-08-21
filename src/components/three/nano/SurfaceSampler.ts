import * as THREE from "three";

export class SurfaceSampler {
  /**
   * Samples random points on the surface of the meshes within a group.
   * Uses vertex sampling with slight noise for speed and good enough distribution.
   * 
   * @param group The root group containing meshes to sample.
   * @param count The number of points to sample.
   * @param rootMatrix Inverse of the root world matrix, to keep points local to the group.
   * @returns Float32Array of [x, y, z] coordinates.
   */
  static sample(group: THREE.Group | THREE.Object3D, count: number, rootMatrix?: THREE.Matrix4): Float32Array {
    const meshes: THREE.Mesh[] = [];
    let totalVertices = 0;

    group.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry && mesh.geometry.getAttribute("position")) {
        meshes.push(mesh);
        totalVertices += mesh.geometry.getAttribute("position").count;
      }
    });

    const positions = new Float32Array(count * 3);

    if (meshes.length === 0 || totalVertices === 0) {
      return positions; // Return zeroed array if no geometry found
    }

    const _v = new THREE.Vector3();
    const inverseRoot = rootMatrix ? rootMatrix.clone().invert() : new THREE.Matrix4();

    for (let i = 0; i < count; i++) {
      // Pick a random mesh, weighted loosely by vertex count (simplified to random for performance)
      const mesh = meshes[Math.floor(Math.random() * meshes.length)];
      const positionAttr = mesh.geometry.getAttribute("position");
      
      // Pick a random vertex
      const vertexIdx = Math.floor(Math.random() * positionAttr.count);
      _v.fromBufferAttribute(positionAttr, vertexIdx);

      // Add slight jitter so particles aren't exactly on vertices (better coverage)
      _v.x += (Math.random() - 0.5) * 0.02;
      _v.y += (Math.random() - 0.5) * 0.02;
      _v.z += (Math.random() - 0.5) * 0.02;

      // Transform to world space, then to local space of the root (if provided)
      mesh.updateMatrixWorld(true);
      _v.applyMatrix4(mesh.matrixWorld);
      
      if (rootMatrix) {
        _v.applyMatrix4(inverseRoot);
      }

      positions[i * 3] = _v.x;
      positions[i * 3 + 1] = _v.y;
      positions[i * 3 + 2] = _v.z;
    }

    return positions;
  }
}
