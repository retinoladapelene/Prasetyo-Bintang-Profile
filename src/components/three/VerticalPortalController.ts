import * as THREE from "three";

export class VerticalPortalController {
  public group: THREE.Group;
  
  private plasmaTorusMesh!: THREE.Mesh;
  private interiorMesh!: THREE.Mesh;
  private sparkMesh!: THREE.Points;
  private sparkMaterial!: THREE.ShaderMaterial;
  
  private isActive: boolean = false;
  private elapsedTime: number = 0;
  private activeRotation: number = 0;

  constructor(parentGroup?: THREE.Object3D) {
    this.group = new THREE.Group();
    this.group.visible = false;
    
    if (parentGroup) {
      parentGroup.add(this.group);
    }
    
    // ----------------------------------------------------
    // 1. Plasma Ring (TorusGeometry - Thin and fiery)
    // ----------------------------------------------------
    // Default torus is in XY plane, which is exactly what we want for vertical!
    const plasmaGeo = new THREE.TorusGeometry(3.0, 0.03, 32, 100);
    
    const plasmaShader = {
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uDrawProgress: { value: 0 }
      },
      vertexShader: `
        uniform float uTime; 
        varying vec2 vUv; 
        void main() {
          vUv = uv; 
          vec3 pos = position;
          float wobble = sin(pos.x * 10.0 + uTime * 5.0) * cos(pos.y * 10.0 + uTime * 4.0) * 0.02;
          pos += normal * wobble;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime; uniform float uOpacity; uniform float uDrawProgress;
        varying vec2 vUv; 
        
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
                     mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0; float a = 0.5;
          for(int i=0; i<4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
          return v;
        }
        
        void main() {
          if (vUv.x > uDrawProgress) {
            discard;
          }
          
          float n = fbm(vUv * vec2(40.0, 5.0) - vec2(uTime * 3.0, uTime * 5.0));
          
          float edgeFade = sin(vUv.y * 3.14159);
          edgeFade = pow(edgeFade, 2.0);
          
          vec3 color1 = vec3(1.0, 0.9, 0.5); // Core
          vec3 color2 = vec3(1.0, 0.4, 0.0); // Outer
          vec3 color = mix(color2, color1, n * edgeFade + 0.2);
          
          float alpha = n * uOpacity * edgeFade * 2.0;
          gl_FragColor = vec4(color * 1.5, min(alpha, 1.0));
        }
      `
    };
    this.plasmaTorusMesh = new THREE.Mesh(plasmaGeo, new THREE.ShaderMaterial({
      uniforms: plasmaShader.uniforms,
      vertexShader: plasmaShader.vertexShader,
      fragmentShader: plasmaShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    }));
    this.group.add(this.plasmaTorusMesh);
    
    // ----------------------------------------------------
    // 2. Interior Nebula Portal Space (No longer needed, we use CSS clip-path for interior)
    // ----------------------------------------------------
    // Wait, the user might want the nebula inside?
    // No, the sling ring is a transition. Inside the portal is the actual DOM element (LetsConnect).
    // The nebula in PortalTransitionController covered the interior. Since this is for a page transition, the interior should be totally transparent to show the HTML content behind it!
    
    // ----------------------------------------------------
    // 3. Spark Particles (Oriented in XY plane)
    // ----------------------------------------------------
    const particleCount = 8000; // Optimized count. Since they will be evenly distributed now, 8k is plenty and performant.
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVelocity = new Float32Array(particleCount * 3);
    const pPhase = new Float32Array(particleCount);
    const pSize = new Float32Array(particleCount);
    const pType = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
      // Distribute particles completely evenly around the circle
      pPhase[i] = Math.random(); 
      const angle = pPhase[i] * Math.PI * 2;
      
      const radialSpeed = 0.5 + Math.random() * 2.5;
      const tangentialSpeed = 4.0 + Math.random() * 8.0;
      const zSpread = (Math.random() - 0.5) * 2.0;
      
      const radX = Math.cos(angle);
      const radY = Math.sin(angle);
      const tanX = -Math.sin(angle);
      const tanY = Math.cos(angle);
      
      pVelocity[i*3] = radX * radialSpeed + tanX * tangentialSpeed;
      pVelocity[i*3+1] = radY * radialSpeed + tanY * tangentialSpeed; 
      pVelocity[i*3+2] = zSpread;
      
      pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
      
      pType[i] = Math.random() > 0.8 ? 1.0 : 0.0;
      const rand = Math.random();
      pSize[i] = rand < 0.7 ? 0.5 + Math.random() * 0.5 : (rand < 0.9 ? 1.5 + Math.random() * 1.0 : 3.0 + Math.random() * 2.0);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('velocity', new THREE.BufferAttribute(pVelocity, 3));
    pGeo.setAttribute('spawnPhase', new THREE.BufferAttribute(pPhase, 1));
    pGeo.setAttribute('pSize', new THREE.BufferAttribute(pSize, 1));
    pGeo.setAttribute('pType', new THREE.BufferAttribute(pType, 1));
    
    this.sparkMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uDrawProgress: { value: 0 } },
      vertexShader: `
        uniform float uTime; uniform float uDrawProgress;
        attribute vec3 velocity; attribute float spawnPhase; attribute float pSize; attribute float pType;
        varying float vAlpha; varying float vType; varying vec2 vVelocityDir;
        void main() {
          vType = pType;
          if (spawnPhase > uDrawProgress) { 
            vAlpha = 0.0; 
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0); 
            gl_PointSize = 0.0;
            return; 
          }
          float duration = pType < 0.5 ? 0.8 : 1.5; 
          if (spawnPhase > 0.99) duration = 1.0;
          float age = mod(uTime + spawnPhase * 123.456, duration);
          
          vAlpha = max(0.0, 1.0 - (age / duration));
          if (vAlpha <= 0.01) { 
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0); 
            gl_PointSize = 0.0;
            return; 
          }
          
          // Start circle in XY plane
          vec3 startPos = vec3(cos(spawnPhase * 6.28318) * 3.0, sin(spawnPhase * 6.28318) * 3.0, 0.0);
          vec3 pos = startPos + velocity * age;
          pos.y -= 1.0 * age * age; // gravity downwards
          
          vec3 currentVel = velocity - vec3(0.0, 2.0 * age, 0.0);
          vec4 mvVelocity = modelViewMatrix * vec4(currentVel, 0.0);
          vec4 pVel = projectionMatrix * mvVelocity;
          
          float velLen = length(pVel.xy);
          vVelocityDir = velLen > 0.0001 ? pVel.xy / velLen : vec2(1.0, 0.0);
          vVelocityDir.y = -vVelocityDir.y;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = ((pType < 0.5 ? 180.0 : 300.0) * pSize / max(0.001, -mvPosition.z));
        }
      `,
      fragmentShader: `
        uniform float uOpacity; varying float vAlpha; varying float vType; varying vec2 vVelocityDir;
        void main() {
          if (vAlpha <= 0.0) discard;
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          
          float c = vVelocityDir.x;
          float s = vVelocityDir.y;
          mat2 rot = mat2(c, -s, s, c);
          vec2 rotatedXY = rot * xy;
          
          float x = rotatedXY.x - 0.3; // Push center forward
          float y = rotatedXY.y * 15.0; // High multiplier makes it extremely THIN (like a line)
          x *= (x > 0.0) ? 5.0 : 0.15; // Sharp front (5.0), very long tail (0.15)
          
          float dist = length(vec2(x, y));
          if (dist > 0.5) discard;
          
          float core = pow(max(0.0, 1.0 - (dist * 2.0)), 2.0);
          float alpha = core * vAlpha * uOpacity;
          
          vec3 color = (vType < 0.5) ? mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.8), core) : vec3(1.0, 0.6, 0.1);
          if (vType >= 0.5) alpha *= 0.5;
          gl_FragColor = vec4(color * 1.5, alpha); 
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    
    this.sparkMesh = new THREE.Points(pGeo, this.sparkMaterial);
    this.sparkMesh.frustumCulled = false;
    this.group.add(this.sparkMesh);
  }
  
  public update(dt: number, normalizedProgress: number = 1.0) {
    this.elapsedTime += dt;
    this.isActive = true;
    this.group.visible = true;
    
    // Only rotate the portal if it has finished drawing (normalizedProgress >= 0.25).
    // This allows the drawing phase to remain perfectly stationary.
    if (normalizedProgress >= 0.25) {
      this.activeRotation += dt * 2.5; // Fast continuous swirling rotation
    }
    this.plasmaTorusMesh.rotation.z = -this.activeRotation;
    this.sparkMesh.rotation.z = -this.activeRotation;
    
    const plasmaMat = this.plasmaTorusMesh.material as THREE.ShaderMaterial;
    
    plasmaMat.uniforms.uTime.value = this.elapsedTime;
    this.sparkMaterial.uniforms.uTime.value = this.elapsedTime;
    
    const breath = 1.0 + Math.sin(this.elapsedTime * 2.0) * 0.15;
    
    plasmaMat.uniforms.uOpacity.value = 1.0 * breath;
    
    // Animate drawing based on scroll progress (0 to 0.25)
    const drawProgress = Math.min(normalizedProgress / 0.25, 1.0);
    plasmaMat.uniforms.uDrawProgress.value = drawProgress;
    this.sparkMaterial.uniforms.uDrawProgress.value = drawProgress;
    
    // Keep visible once drawn
    this.sparkMaterial.uniforms.uOpacity.value = 1.0;
  }
  
  public dispose() {
    this.plasmaTorusMesh.geometry.dispose();
    (this.plasmaTorusMesh.material as THREE.Material).dispose();
    this.sparkMesh.geometry.dispose();
    (this.sparkMesh.material as THREE.Material).dispose();
  }
}
