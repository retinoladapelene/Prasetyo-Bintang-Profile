import * as THREE from "three";

export // Helper to generate the exact same Environment Map used in GlassStarScene
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