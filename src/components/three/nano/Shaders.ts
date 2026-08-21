export const NanoShaders = {
  // Dissolve effect injected via onBeforeCompile
  dissolve: {
    uniforms: `
      uniform float uDissolveProgress;
      uniform float uDissolveEdge;
      uniform vec3 uDissolveColor;
      uniform vec3 uDissolveCoreColor;
      uniform float uNoiseScale;
      uniform float uTime;
      
      uniform float uPortalY;
      uniform float uPortalActive;
      
      varying vec3 vWorldPosition;
    `,
    vertex: `
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    `,
    // Simplex 3D noise function (fast version)
    fragmentNoise: `
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      
      float snoise(vec3 v){ 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod(i, 289.0 ); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        float n_ = 1.0/7.0;
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.zzzz);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }
    `,
    fragment: `
      // If progress is effectively 1.0 (fully assembled), bypass dissolve completely so avatar is 100% solid!
      if (uDissolveProgress < 0.98) {
        // Map vertical position to a sweep progress with a slight diagonal armor wave.
        float diagonalWave = sin(vWorldPosition.x * 2.4 + vWorldPosition.z * 1.8 + uTime * 2.2) * 0.08;
        float yProgress = smoothstep(-5.2, 5.2, vWorldPosition.y + diagonalWave);
        
        // Combine broad sweep, fine turbulence, and panel-like bands.
        float noiseVal = clamp(snoise(vWorldPosition * uNoiseScale + vec3(0.0, uTime * 0.45, 0.0)), -1.0, 1.0);
        float microNoise = clamp(snoise(vWorldPosition * (uNoiseScale * 4.8) - vec3(uTime * 0.9)), -1.0, 1.0);
        float panelBand = smoothstep(0.78, 1.0, sin((vWorldPosition.y + vWorldPosition.x * 0.35) * 8.0 - uTime * 7.0) * 0.5 + 0.5);
        float dissolveMask = (yProgress * 0.62 + noiseVal * 0.28 + microNoise * 0.06 + panelBand * 0.04);
        
        // Map uDissolveProgress [-1.0, 1.0] to threshold [-2.0, 2.0]
        float threshold = mix(-2.0, 2.0, (uDissolveProgress + 1.0) / 2.0);
        
        if (dissolveMask > threshold) {
          discard; // Hasn't assembled yet
        }
        
        // Edge glow calculation
        float edgeDist = threshold - dissolveMask;
        float edgeWidth = uDissolveEdge;
        
        if (edgeDist < edgeWidth) {
          float edgeIntensity = 1.0 - (edgeDist / edgeWidth);
          edgeIntensity = pow(edgeIntensity, 2.0); // Sharpen
          float hotCore = pow(edgeIntensity, 5.0);
          float travelingBand = smoothstep(0.0, 0.7, edgeIntensity) * panelBand;
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 radialDir = normalize(vWorldPosition + vec3(0.001, 0.0, 0.001));
          float rim = pow(1.0 - abs(dot(radialDir, viewDir)), 2.5);
          
          // Add emission for the edge: dynamic technology glow with an adaptive core.
          vec3 glowCol = uDissolveColor * (edgeIntensity * 2.8 + rim * 0.6);
          glowCol += uDissolveCoreColor * (hotCore * 3.2 + travelingBand * 0.8);
          
          #ifdef USE_COLOR
            gl_FragColor.rgb += glowCol;
          #else
            gl_FragColor = vec4(gl_FragColor.rgb + glowCol, gl_FragColor.a);
          #endif
        }
      }

      // Portal clipping logic
      if (uPortalActive > 0.5) {
        if (vWorldPosition.y < uPortalY) {
          discard;
        }
        
        float distToPortal = vWorldPosition.y - uPortalY;
        if (distToPortal >= 0.0 && distToPortal < 0.15) {
          float burnIntensity = 1.0 - (distToPortal / 0.15);
          burnIntensity = pow(burnIntensity, 2.0);
          
          vec3 portalColor = vec3(1.0, 0.4, 0.0); // Orange fiery
          vec3 portalCore = vec3(1.0, 0.9, 0.5);  // Yellow/White core
          vec3 burnCol = mix(portalColor, portalCore, pow(burnIntensity, 3.0)) * burnIntensity * 3.0;
          
          #ifdef USE_COLOR
            gl_FragColor.rgb += burnCol;
          #else
            gl_FragColor = vec4(gl_FragColor.rgb + burnCol, gl_FragColor.a);
          #endif
        }
      }
    `
  },

  // Particle System Shader (Points)
  particle: {
    vertex: `
      uniform float uTime;
      uniform float uProgress; // 0: swirl, 1: locked to mesh
      uniform float uEnergy;
      uniform float uSizeMultiplier;
      
      attribute vec3 targetPosition;
      attribute vec3 swirlAxis;
      attribute float swirlSpeed;
      attribute float swirlRadius;
      attribute float phase;
      attribute float shardScale;
      attribute float orbitLayer;
      attribute float burst;
      
      varying float vProgress;
      varying float vSpark;
      varying float vPlateLock;
      
      // Helper for rotation
      mat3 rotationMatrix(vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;
          
          return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
      }
      
      void main() {
        float progress = clamp(uProgress, 0.0, 1.0);
        vProgress = progress;
        
        // Staggered lock gives the impression of many nano plates sealing at different times.
        float verticalStage = smoothstep(-3.2, 3.6, targetPosition.y);
        float individualDelay = orbitLayer * 0.16 + verticalStage * 0.22;
        float lock = smoothstep(individualDelay, 1.0, progress);
        float p = lock * lock * (3.0 - 2.0 * lock);
        vPlateLock = p;

        // Orbital staging: particles circle outside the body before snapping to the sampled surface.
        float angle = uTime * swirlSpeed + phase;
        vec3 bodyDir = normalize(targetPosition + vec3(0.001, 0.2, 0.001));
        vec3 tangent = normalize(cross(bodyDir, swirlAxis) + vec3(0.001, 0.0, 0.001));
        vec3 bitangent = normalize(cross(bodyDir, tangent));
        float radius = swirlRadius * mix(1.45, 0.34, p);
        float helix = sin(progress * 9.0 + phase + targetPosition.y * 2.1) * (1.0 - p);
        vec3 orbitalOffset = (tangent * cos(angle) + bitangent * sin(angle)) * radius;
        orbitalOffset.y += helix * 0.75;

        // Shell stage forms a slightly expanded ghost armor before the final lock.
        vec3 shellPos = targetPosition + bodyDir * mix(0.85 + orbitLayer * 0.9, 0.02, p);
        vec3 swirlPos = shellPos + orbitalOffset;

        // A short outward spark burst happens near the locking front.
        float front = smoothstep(0.0, 0.18, progress - individualDelay) * (1.0 - smoothstep(0.18, 0.42, progress - individualDelay));
        vec3 burstPos = targetPosition + bodyDir * (burst * 1.7 + 0.5) * front;
        
        vec3 finalPos = mix(swirlPos + burstPos, targetPosition, p);
        
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        vSpark = front + uEnergy * (1.0 - p) * 0.25;

        // Size attenuates by distance; unlocked nano shards are larger and brighter.
        float pointScale = mix(3.4, 1.05, p) * shardScale + front * 2.2;
        gl_PointSize = (12.0 / -mvPosition.z) * pointScale * uSizeMultiplier;
      }
    `,
    fragment: `
      uniform vec3 uColor;
      uniform vec3 uCoreColor;
      uniform vec3 uSparkColor;
      uniform float uOpacity;
      varying float vProgress;
      varying float vSpark;
      varying float vPlateLock;
      
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float radial = length(xy);
        float diamond = abs(xy.x) + abs(xy.y);
        float mask = min(smoothstep(0.5, 0.18, radial), smoothstep(0.56, 0.22, diamond));
        if (mask <= 0.01) discard;
        
        float core = pow(1.0 - radial * 2.0, 2.1);
        float rim = smoothstep(0.45, 0.18, abs(radial - 0.35));
        float intensity = max(core, rim * 0.7) * mask;
        
        vec3 color = mix(uColor, uSparkColor, clamp(vSpark, 0.0, 1.0));
        color = mix(color, uCoreColor, core * 0.45);
        color *= mix(1.55, 0.7, vPlateLock);
        
        // Fade out slightly when locked, leaving a crisp surface shimmer.
        float alpha = mix(intensity, intensity * 0.34, vProgress) * uOpacity;
        alpha += vSpark * mask * uOpacity * 0.35;
        
        gl_FragColor = vec4(color * intensity, alpha);
      }
    `
  }
};
