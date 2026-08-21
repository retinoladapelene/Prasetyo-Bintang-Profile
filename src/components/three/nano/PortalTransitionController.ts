import * as THREE from "three";

export class PortalTransitionController {
  public group: THREE.Group;
  
  private plasmaTorusMesh!: THREE.Mesh;
  private interiorMesh!: THREE.Mesh;
  private sparkMesh!: THREE.Points;
  private sparkMaterial!: THREE.ShaderMaterial;
  
  private isActive: boolean = false;
  private elapsedTime: number = 0;

  constructor(parentGroup?: THREE.Group) {
    this.group = new THREE.Group();
    this.group.visible = false;
    
    if (parentGroup) {
      parentGroup.add(this.group);
    }
    
    // ----------------------------------------------------
    // 1. Plasma Ring (TorusGeometry - Thin and fiery)
    // ----------------------------------------------------
    const plasmaGeo = new THREE.TorusGeometry(3.0, 0.08, 32, 100);
    plasmaGeo.rotateX(Math.PI / 2);
    
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
          float wobble = sin(pos.x * 10.0 + uTime * 5.0) * cos(pos.z * 10.0 + uTime * 4.0) * 0.02;
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
          
          // Make the edges of the tube fade out so it looks like energy, not a solid donut
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
    // 2. Interior Nebula Portal Space
    // ----------------------------------------------------
    const interiorGeo = new THREE.PlaneGeometry(5.8, 5.8, 32, 32);
    interiorGeo.rotateX(-Math.PI / 2);
    
    const interiorShader = {
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 }
      },
      vertexShader: `
        uniform float uTime; varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.y += sin(pos.x * 2.0 + uTime) * cos(pos.z * 2.0 + uTime) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime; uniform float uOpacity;
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
          vec2 uv = vUv * 2.0 - 1.0;
          float radius = length(uv);
          if (radius > 1.0) discard;
          
          vec2 flow = vec2(fbm(uv * 2.0 + uTime * 0.1), fbm(uv * 2.0 - uTime * 0.1));
          vec2 distortedUv = uv + (flow - 0.5) * 0.2;
          float n = fbm(distortedUv * 3.0 + vec2(uTime * 0.2, uTime * 0.3));
          float n2 = fbm(distortedUv * 5.0 - vec2(uTime * 0.1, uTime * 0.4));
          vec3 col1 = vec3(0.02, 0.0, 0.15); vec3 col2 = vec3(0.1, 0.4, 0.9); vec3 col3 = vec3(1.0, 0.5, 0.1);
          vec3 color = mix(col1, col2, n);
          color = mix(color, col3, n2 * 0.6);
          float edgeAlpha = smoothstep(1.0, 0.7, radius + (flow.x * 0.1));
          float alpha = edgeAlpha * uOpacity * (n * 0.6 + 0.4);
          gl_FragColor = vec4(color, alpha);
        }
      `
    };
    this.interiorMesh = new THREE.Mesh(interiorGeo, new THREE.ShaderMaterial({
      uniforms: interiorShader.uniforms,
      vertexShader: interiorShader.vertexShader,
      fragmentShader: interiorShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    this.interiorMesh.position.y = -0.02;
    this.group.add(this.interiorMesh);
    
    // ----------------------------------------------------
    // 3. Spark Particles (70/20/10 Split & Radial Burst + SWIRL)
    // ----------------------------------------------------
    const particleCount = 4000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVelocity = new Float32Array(particleCount * 3);
    const pPhase = new Float32Array(particleCount);
    const pSize = new Float32Array(particleCount);
    const pType = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
      const isBurst = i >= 3000;
      
      pPhase[i] = isBurst ? (0.99 + Math.random() * 0.01) : Math.random(); 
      const angle = pPhase[i] * Math.PI * 2;
      
      // Kecepatan partikel melempar keluar dan berputar tangensial
      const radialSpeed = isBurst ? (2.0 + Math.random() * 4.0) : (0.5 + Math.random() * 1.5);
      const tangentialSpeed = isBurst ? (3.0 + Math.random() * 6.0) : (4.0 + Math.random() * 6.0);
      const ySpread = isBurst ? (Math.random() - 0.5) * 3.0 : (Math.random() * 2.0 + 0.5);
      
      const radX = Math.cos(angle);
      const radZ = Math.sin(angle);
      const tanX = -Math.sin(angle);
      const tanZ = Math.cos(angle);
      
      pVelocity[i*3] = radX * radialSpeed + tanX * tangentialSpeed;
      pVelocity[i*3+1] = ySpread; 
      pVelocity[i*3+2] = radZ * radialSpeed + tanZ * tangentialSpeed;
      
      // Dummy position at center so Three.js doesn't complain about missing position attribute
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
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // Aman dari divisi w=0
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
          
          vec3 startPos = vec3(cos(spawnPhase * 6.28318) * 3.0, 0.0, sin(spawnPhase * 6.28318) * 3.0);
          vec3 pos = startPos + velocity * age;
          pos.y -= 1.0 * age * age; // gravity
          
          vec3 currentVel = velocity - vec3(0.0, 2.0 * age, 0.0);
          vec4 mvVelocity = modelViewMatrix * vec4(currentVel, 0.0);
          vec4 pVel = projectionMatrix * mvVelocity;
          
          float velLen = length(pVel.xy);
          vVelocityDir = velLen > 0.0001 ? pVel.xy / velLen : vec2(1.0, 0.0);
          vVelocityDir.y = -vVelocityDir.y; // Invert y for gl_PointCoord
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Make particles big so we can draw long tails inside them
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
          
          float x = rotatedXY.x - 0.2;
          float y = rotatedXY.y * 6.0;
          x *= (x > 0.0) ? 3.0 : 0.7;
          
          float dist = length(vec2(x, y));
          if (dist > 0.5) discard;
          
          float core = pow(max(0.0, 1.0 - (dist * 2.0)), 2.0);
          float alpha = core * vAlpha * uOpacity;
          
          vec3 color = (vType < 0.5) ? mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.8), core) : vec3(1.0, 0.6, 0.1);
          if (vType >= 0.5) alpha *= 0.5;
          gl_FragColor = vec4(color * 1.5, alpha); // Boost HDR brightness
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    
    this.sparkMesh = new THREE.Points(pGeo, this.sparkMaterial);
    this.sparkMesh.frustumCulled = false; // Prevent culling issues since positions are calculated in shader
    
    // PARTIKEL DISEMBUNYIKAN KARENA MENGGANGGU VISUAL
    this.sparkMesh.visible = false; 

    this.group.add(this.sparkMesh);
  }
  
  public update(normalizedProgress: number, dt: number) {
    this.elapsedTime += dt;
    if (normalizedProgress <= 0.0) {
      if (this.isActive) { this.isActive = false; this.group.visible = false; }
      return -10.0;
    }
    if (normalizedProgress >= 1.0) {
      if (this.isActive) { this.isActive = false; this.group.visible = false; }
      return 10.0;
    }
    if (!this.isActive) { this.isActive = true; this.group.visible = true; }
    
    // Rotate the ring and sparks so it continuously swirls
    this.plasmaTorusMesh.rotation.y = -this.elapsedTime * 2.5;
    this.sparkMesh.rotation.y = -this.elapsedTime * 2.5;
    
    const plasmaMat = this.plasmaTorusMesh.material as THREE.ShaderMaterial;
    const intMat = this.interiorMesh.material as THREE.ShaderMaterial;
    
    plasmaMat.uniforms.uTime.value = this.elapsedTime;
    intMat.uniforms.uTime.value = this.elapsedTime;
    this.sparkMaterial.uniforms.uTime.value = this.elapsedTime;
    
    const breath = 1.0 + Math.sin(this.elapsedTime * 2.0) * 0.15;
    
    let yPos = -5.0;
    let drawProgress = 0.0;
    
    if (normalizedProgress < 0.5) {
      const formProgress = normalizedProgress / 0.5;
      drawProgress = Math.min(formProgress / 0.6, 1.0);
      plasmaMat.uniforms.uOpacity.value = 1.0 * breath;
      plasmaMat.uniforms.uDrawProgress.value = drawProgress;
      intMat.uniforms.uOpacity.value = Math.max(0, Math.min((formProgress - 0.8) / 0.2, 1.0));
      this.sparkMaterial.uniforms.uDrawProgress.value = drawProgress;
      this.sparkMaterial.uniforms.uOpacity.value = 1.0;
    } else if (normalizedProgress < 0.85) {
      const sweepP = (normalizedProgress - 0.5) / 0.35;
      yPos = -5.0 + (sweepP * 11.0);
      plasmaMat.uniforms.uDrawProgress.value = 1.0;
      plasmaMat.uniforms.uOpacity.value = 1.0 * breath;
      intMat.uniforms.uOpacity.value = 1.0;
      this.sparkMaterial.uniforms.uDrawProgress.value = 1.0;
      this.sparkMaterial.uniforms.uOpacity.value = 1.0;
    } else {
      const fadeP = (normalizedProgress - 0.85) / 0.15;
      yPos = 6.0;
      const globalOpacity = 1.0 - fadeP;
      plasmaMat.uniforms.uDrawProgress.value = 1.0;
      plasmaMat.uniforms.uOpacity.value = globalOpacity;
      intMat.uniforms.uOpacity.value = globalOpacity;
      this.sparkMaterial.uniforms.uOpacity.value = globalOpacity;
    }
    
    if (normalizedProgress < 0.5) {
      this.group.scale.setScalar(Math.max(Math.min((normalizedProgress / 0.5) / 0.1, 1.0), 0.01));
    } else if (normalizedProgress >= 0.85) {
      this.group.scale.setScalar(Math.max(1.0 - ((normalizedProgress - 0.85) / 0.15), 0.01));
    } else {
      this.group.scale.setScalar(1.0);
    }
    
    this.group.position.y = yPos;
    return yPos;
  }
  
  public dispose() {
    this.plasmaTorusMesh.geometry.dispose();
    (this.plasmaTorusMesh.material as THREE.Material).dispose();
    this.interiorMesh.geometry.dispose();
    (this.interiorMesh.material as THREE.Material).dispose();
    this.sparkMesh.geometry.dispose();
    this.sparkMaterial.dispose();
  }
}
