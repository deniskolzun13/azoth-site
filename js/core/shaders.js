// ============================================================
// Все GLSL в одном месте.
// Пишем в GLSL1-стиле — three.js сам поднимет до GLSL3 на WebGL2.
// ============================================================

const SHARED = /* glsl */`
  float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash21(vec2 p){
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < OCT; i++){
      v += a * vnoise(p);
      p = r * p * 2.03;
      a *= 0.55;
    }
    return v;
  }
  mat2 rot2(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
  float gridLines(vec2 p, float th){
    vec2 w = fwidth(p) + 1e-5;
    vec2 g = abs(fract(p - 0.5) - 0.5) / w;
    return 1.0 - min(min(g.x, g.y) / th, 1.0);
  }
`;

/* ---------------- ФОН: туманность + сетка-комната ---------------- */

export const BG_VERT = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function makeBgFrag(oct) {
  return /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2  uMouse;
  uniform float uMouseVel;
  uniform float uMode;
  uniform float uGlitch;
  uniform float uDim;
  uniform float uIntro;
  uniform float uFlow;
  #define OCT ${oct}
  ${SHARED}

  float crossMark(vec2 p){
    vec2 cell = floor(p);
    if (hash21(cell) < 0.90) return 0.0;
    vec2 f = fract(p) - 0.5;
    vec2 w = fwidth(p) * 1.5 + 1e-5;
    float seg = 0.15;
    float cx = (1.0 - min(abs(f.y) / w.y, 1.0)) * step(abs(f.x), seg);
    float cy = (1.0 - min(abs(f.x) / w.x, 1.0)) * step(abs(f.y), seg);
    return max(cx, cy);
  }

  vec3 scene(vec2 uv){
    // туманность с доменным варпингом
    vec2 np = uv * 0.85 + uMouse * 0.16;
    vec2 warp = vec2(fbm(np * 1.5 + uTime * 0.045), fbm(np * 1.5 - uTime * 0.04 + 5.2));
    float n = fbm(np * 1.7 + 1.6 * warp);
    float nebAmp = 1.0 - 0.14 * uMode;
    vec3 col = mix(vec3(0.014, 0.004, 0.052), vec3(0.085, 0.045, 0.27), smoothstep(0.30, 0.92, n) * nebAmp);
    col += vec3(0.30, 0.20, 0.78) * pow(smoothstep(0.55, 1.05, n), 2.4) * (0.42 + 0.35 * uMouseVel) * nebAmp;
    col += vec3(0.10, 0.06, 0.30) * pow(max(0.0, 1.0 - abs(uv.y) * 0.85), 3.0) * 0.32;

    // пульс ядра на «Контакте»
    float pulse = smoothstep(2.5, 3.0, uMode);
    col += vec3(0.49, 0.36, 1.0) * pulse * 0.18 * (0.5 + 0.5 * sin(uTime * 1.4)) * exp(-dot(uv, uv) * 2.2);

    // сетка-комната: пол, потолок, задняя стена (разгоняется при скролле)
    vec3 ro = vec3(0.0, 0.0, mod(uTime * (0.5 + uFlow * 1.8), 6.0) - 3.0);
    vec3 rd = normalize(vec3(uv, -1.25));
    rd.xz = rot2(uMouse.x * 0.09) * rd.xz;
    rd.yz = rot2(-0.12 - uMouse.y * 0.06) * rd.yz;

    float gridB = (1.0 - 0.10 * uMode) * (1.0 + 0.30 * uFlow);
    vec3 gc = vec3(0.42, 0.30, 0.95);

    if (rd.y < -0.015) {
      float tf = -1.15 / rd.y;
      vec3 hit = ro + rd * tf;
      float fog = exp(-tf * 0.11) * smoothstep(-0.015, -0.12, rd.y);
      float g1 = gridLines(hit.xz, 1.15);
      float g2 = gridLines(hit.xz / 6.0, 1.7) * 0.5;
      col += gc * (g1 * 0.85 + g2 * 0.52) * fog * gridB;
      col += vec3(0.66, 0.56, 1.0) * crossMark(hit.xz) * fog * gridB * 1.5;
    }
    if (rd.y > 0.015) {
      float tc = 1.55 / rd.y;
      vec3 hit = ro + rd * tc;
      float fog = exp(-tc * 0.11) * smoothstep(0.015, 0.12, rd.y);
      float g1 = gridLines(hit.xz, 1.15);
      float g2 = gridLines(hit.xz / 6.0, 1.7) * 0.4;
      col += vec3(0.30, 0.20, 0.75) * (g1 * 0.5 + g2 * 0.36) * fog * gridB;
    }
    if (rd.z < -0.01) {
      float tw = (-12.0 - ro.z) / rd.z;
      vec3 hit = ro + rd * tw;
      float fog = exp(-tw * 0.065) * 0.9;
      float g1 = gridLines(hit.xy, 1.15);
      float g2 = gridLines(hit.xy / 6.0, 1.7) * 0.5;
      col += vec3(0.36, 0.25, 0.85) * (g1 * 0.55 + g2 * 0.42) * fog * gridB;
      col += vec3(0.55, 0.45, 1.0) * crossMark(hit.xy) * fog * gridB * 1.1;
    }
    return col;
  }

  void main(){
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uAspect;

    // глитч: блочный сдвиг строк
    vec2 guv = uv;
    if (uGlitch > 0.004) {
      float ft = floor(uTime * 24.0);
      float row = floor((uv.y * 0.5 + 0.5) * 24.0);
      float r1 = hash21(vec2(row, ft));
      float r2 = hash21(vec2(row * 1.91, ft + 11.0));
      guv.x += step(0.76, r1) * (r1 - 0.5) * 0.55 * uGlitch;
      guv.y += step(0.85, r2) * (r2 - 0.5) * 0.06 * uGlitch;
    }

    vec3 col = scene(guv);
    if (uGlitch > 0.004) {
      float ca = 0.016 * uGlitch;
      col.r = scene(guv + vec2(ca, 0.0)).r;
      col.b = scene(guv - vec2(ca, 0.0)).b;
      col += vec3(0.05, 0.02, 0.11) * uGlitch;
    }

    // проявление из шума (прелоадер)
    if (uIntro < 0.999) {
      float nz = fbm(uv * 2.6 + uTime * 0.5);
      float th = mix(1.25, -0.15, uIntro);
      float m = smoothstep(th - 0.18, th + 0.18, nz);
      col *= mix(0.05, 1.0, m);
      col += vec3(0.45, 0.33, 1.0) * (1.0 - uIntro) * 0.55 * m * (1.0 - m);
    }

    // защита центра под текст
    float dc = length(uv * vec2(0.60, 0.72));
    col *= 1.0 - uDim * (1.0 - smoothstep(0.15, 1.05, dc));

    // виньетка, сканлайны, зерно
    col *= clamp(1.0 - 0.42 * dot(uv * vec2(0.55, 0.7), uv * vec2(0.55, 0.7)), 0.0, 1.0);
    col *= 1.0 - 0.05 * sin(gl_FragCoord.y * 3.14159);
    col += (hash21(gl_FragCoord.xy + fract(uTime * 0.7) * 43.7) - 0.5) * 0.055;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }`;
}

/* ---------------- ЧАСТИЦЫ: сборка логотипа → пыль ---------------- */

export const PARTICLE_VERT = /* glsl */`
  attribute vec3 aTarget;
  attribute float aRand;
  varying float vRand;
  varying float vGlow;
  uniform float uTime;
  uniform float uAspect;
  uniform float uTextScale;
  uniform float uAssemble;
  uniform float uRelease;
  uniform float uSize;
  uniform float uMouseVel;
  uniform vec2  uMouse;

  void main(){
    vRand = aRand;
    vec3 sc = vec3(position.x * uAspect, position.y, position.z);

    float aT = clamp((uAssemble - aRand * 0.38) / 0.62, 0.0, 1.0);
    aT = aT * aT * (3.0 - 2.0 * aT);

    vec3 tg = vec3(aTarget.x * uTextScale, aTarget.y * uTextScale, 0.0);
    vec3 pos = mix(sc, tg, aT);

    // дрожание собранного знака
    pos.xy += (1.0 - uRelease) * 0.007 * vec2(sin(uTime * 2.2 + aRand * 71.0), cos(uTime * 1.9 + aRand * 53.0)) * aT;

    // рассеянная пыль
    vec3 amb = vec3(sc.x * 1.12, sc.y * 1.12, sc.z * 0.5);
    amb.xy += 0.05 * vec2(sin(uTime * 0.22 + aRand * 43.0), cos(uTime * 0.17 + aRand * 31.0));
    amb.y += 0.04 * sin(uTime * 0.35 + aRand * 11.0);
    pos = mix(pos, amb, uRelease);

    // мышь расталкивает
    vec2 dm = pos.xy - uMouse;
    float md = max(length(dm), 0.0001);
    pos.xy += (dm / md) * exp(-md * 3.5) * 0.09 * (0.25 + uMouseVel);

    gl_Position = vec4(pos.xy, 0.0, 1.0);
    gl_PointSize = uSize * mix(0.75, 1.4, aT) * (0.5 + aRand);
    vGlow = aT;
  }
`;

export const PARTICLE_FRAG = /* glsl */`
  precision highp float;
  varying float vRand;
  varying float vGlow;
  uniform float uAlpha;
  uniform float uRelease;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, d);
    vec3 col = mix(vec3(0.88, 0.82, 1.0), vec3(0.49, 0.36, 1.0), step(0.62, vRand));
    col += vec3(0.20, 0.14, 0.40) * vGlow;
    float alpha = a * uAlpha * mix(0.35, 0.95, vGlow) * (1.0 - uRelease * 0.55);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ---------------- 3D-ОБЪЕКТ (икосаэдр с фреснелем) ---------------- */

export const OBJ3D_VERT = /* glsl */`
  varying vec3 vNv;
  varying vec3 vP;
  uniform float uTime;
  uniform float uDrag;

  float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p){
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h3(i);
    float b = h3(i + vec3(1.0, 0.0, 0.0));
    float c = h3(i + vec3(0.0, 1.0, 0.0));
    float d = h3(i + vec3(1.0, 1.0, 0.0));
    float e = h3(i + vec3(0.0, 0.0, 1.0));
    float g = h3(i + vec3(1.0, 0.0, 1.0));
    float m = h3(i + vec3(0.0, 1.0, 1.0));
    float k = h3(i + vec3(1.0, 1.0, 1.0));
    return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(m, k, f.x), f.y), f.z);
  }
  float fbm3(vec3 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++){ v += a * n3(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main(){
    vNv = normalize(normalMatrix * normal);
    float d = fbm3(normal * 2.2 + uTime * 0.3) - 0.5;
    vec3 p = position + normal * d * (0.24 + uDrag * 0.22);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vP = p;
    gl_Position = projectionMatrix * mv;
  }
`;

export const OBJ3D_FRAG = /* glsl */`
  varying vec3 vNv;
  varying vec3 vP;
  uniform float uTime;
  uniform float uDrag;

  void main(){
    vec3 n = normalize(vNv);
    float fres = pow(1.0 - abs(dot(n, vec3(0.0, 0.0, 1.0))), 2.0);
    vec3 base = vec3(0.045, 0.02, 0.13);
    vec3 rim = mix(vec3(0.49, 0.36, 1.0), vec3(0.31, 0.94, 1.0), fres);
    vec3 col = base + rim * fres * (0.95 + 0.7 * uDrag);
    // бегущие сканлайн-полосы по сфере
    col += vec3(0.49, 0.36, 1.0) * 0.16 * smoothstep(0.42, 0.5, abs(fract(vP.y * 3.5 + uTime * 0.4) - 0.5));
    // мягкий свет сверху-справа
    col += vec3(0.40, 0.30, 0.90) * 0.22 * max(dot(n, normalize(vec3(0.4, 0.8, 0.5))), 0.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ---------------- ОБЛОЖКИ ПРОЕКТОВ (процедурные) ---------------- */

export const CARD_VERT = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function makeCardFrag(oct) {
  return /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uVariant;
  uniform float uHover;
  uniform float uScroll;
  uniform float uSeed;
  uniform float uLoad;
  uniform vec2  uMouse;
  #define OCT ${oct}
  ${SHARED}

  vec3 pattern(vec2 p){
    if (uVariant < 0.5) {
      // 0 — топографические линии
      vec2 q = p * 1.5 + vec2(0.0, uTime * 0.05) + uSeed;
      float w = fbm(q * 1.4 + 1.2 * vec2(fbm(q + uTime * 0.03), fbm(q - 7.7)));
      float bands = abs(fract(w * 6.0 - uTime * 0.1) - 0.5);
      float line = smoothstep(0.12, 0.0, bands);
      vec3 col = mix(vec3(0.020, 0.008, 0.060), vec3(0.100, 0.055, 0.300), w);
      col += vec3(0.49, 0.36, 1.0) * line * 0.85;
      col += vec3(0.31, 0.94, 1.0) * pow(smoothstep(0.72, 1.0, w), 2.0) * 0.5;
      return col;
    } else if (uVariant < 1.5) {
      // 1 — глитч-мозаика
      float ft = floor(uTime * 7.0);
      vec2 cell = floor(p * 7.0 + ft * 0.13) + uSeed;
      float h = hash21(cell);
      vec2 off = vec2(hash21(cell + 13.1), hash21(cell + 7.7)) - 0.5;
      float hot = step(0.78, h);
      vec2 q = p + off * 0.30 * hot;
      float g = gridLines(q * 7.0, 1.2);
      vec3 col = vec3(0.028, 0.012, 0.080);
      col += vec3(0.49, 0.36, 1.0) * g * (0.22 + 0.78 * hot);
      col += vec3(0.98, 0.24, 0.51) * step(0.94, hash21(cell + 3.3)) * 0.7;
      col += vec3(0.31, 0.94, 1.0) * step(0.965, hash21(cell + 9.9)) * 0.6;
      return col;
    } else if (uVariant < 2.5) {
      // 2 — воронка-портал
      float r = length(p);
      float a = atan(p.y, p.x);
      float swirl = a + r * 4.5 - uTime * 0.4 + uSeed;
      float n = fbm(vec2(swirl * 1.3, r * 3.2 - uTime * 0.22));
      vec3 col = mix(vec3(0.018, 0.006, 0.070), vec3(0.140, 0.070, 0.420), n);
      col += vec3(0.55, 0.40, 1.0) * exp(-r * 3.4) * (0.65 + 0.35 * sin(uTime * 2.0));
      col += vec3(0.31, 0.94, 1.0) * exp(-abs(r - 0.62) * 15.0) * 0.5 * smoothstep(0.3, 0.65, fbm(p * 4.0 + uTime * 0.1));
      return col;
    } else if (uVariant < 3.5) {
      // 3 — жидкий металл
      vec2 q = p * 1.25 + uSeed;
      float w1 = fbm(q * 2.0 + vec2(uTime * 0.09, -uTime * 0.05));
      float w2 = fbm(q * 2.0 + w1 * 2.4 + vec2(-uTime * 0.06, uTime * 0.07));
      float spec = pow(abs(sin(w2 * 9.0 + uTime * 0.3)), 6.0);
      vec3 col = mix(vec3(0.030, 0.020, 0.090), vec3(0.160, 0.100, 0.450), w2);
      col += vec3(0.75, 0.62, 1.0) * spec * 0.85;
      col += vec3(0.31, 0.94, 1.0) * pow(w2, 5.0) * 0.35;
      return col;
    } else if (uVariant < 4.5) {
      // 4 — сигнал: волны
      vec3 col = vec3(0.024, 0.010, 0.070);
      float drops = 0.0;
      for (int i = 0; i < 3; i++){
        float fi = float(i);
        float yc = (fi - 1.0) * 0.40;
        float wv = 0.10 * sin(p.x * 7.0 + uTime * 0.9 + fi * 1.9 + uSeed)
                 + 0.05 * sin(p.x * 15.0 - uTime * 1.3 + fi * 0.7)
                 + 0.06 * (fbm(vec2(p.x * 3.0 + fi * 9.0, uTime * 0.2)) - 0.5);
        float d = abs(p.y - yc - wv);
        col += mix(vec3(0.49, 0.36, 1.0), vec3(0.31, 0.94, 1.0), fi * 0.5) * exp(-d * 34.0) * 0.9;
        drops += step(0.93, hash21(vec2(floor((p.x + 2.0) * 22.0), fi + floor(uTime * 0.6)))) * exp(-d * 60.0) * 0.35;
      }
      col += vec3(0.49, 0.36, 1.0) * drops;
      return col;
    }
    // 5 — вороной-ядро
    vec2 gp = p * 4.2 + uSeed;
    vec2 gcell = floor(gp), gf = fract(gp);
    float md = 8.0, md2 = 8.0;
    for (int yy = -1; yy <= 1; yy++){
      for (int xx = -1; xx <= 1; xx++){
        vec2 o = vec2(float(xx), float(yy));
        vec2 rp = vec2(hash21(gcell + o), hash21(gcell + o + 31.7));
        rp = 0.5 + 0.42 * sin(uTime * 0.55 + 6.2831 * rp);
        float d = length(o + rp - gf);
        if (d < md) { md2 = md; md = d; } else if (d < md2) { md2 = d; }
      }
    }
    float edge = md2 - md;
    vec3 col = mix(vec3(0.018, 0.008, 0.065), vec3(0.100, 0.050, 0.320), 1.0 - md);
    col += vec3(0.55, 0.42, 1.0) * smoothstep(0.13, 0.0, edge) * 1.15;
    col += vec3(0.31, 0.94, 1.0) * smoothstep(0.035, 0.0, edge) * 0.7;
    return col;
  }

  void main(){
    vec2 p = vUv * 2.0 - 1.0;

    // параллакс + лёгкая деформация при скролле
    p.y += uScroll * 0.30;
    p.x += sin(p.y * 2.4 + uTime * 0.5 + uSeed) * 0.05 * uScroll;

    // локальный варп под курсором
    vec2 dm = p - uMouse;
    float infl = exp(-dot(dm, dm) * 7.0) * uHover;
    p -= normalize(dm + 1e-4) * infl * 0.10;

    // появление из шума
    float rv = smoothstep(0.0, 1.0, clamp(uLoad * 1.9 - fbm(p * 2.0 + uSeed) * 0.9, 0.0, 1.0));

    vec2 hp = p;
    if (uHover > 0.004) {
      hp += (vec2(fbm(p * 3.0 + uTime * 0.6), fbm(p * 3.0 - uTime * 0.5 + 4.2)) - 0.5) * 0.16 * uHover;
    }

    vec3 col = pattern(hp);

    if (uHover > 0.004) {
      float ca = 0.013 * uHover;
      col.r = pattern(hp + vec2(ca, 0.0)).r;
      col.b = pattern(hp - vec2(ca, 0.0)).b;
      col *= 1.0 + 0.28 * uHover;
    }

    col *= mix(0.04, 1.0, rv);
    col *= clamp(1.0 - 0.5 * dot(p * 0.60, p * 0.60), 0.0, 1.0);
    col *= 1.0 - 0.045 * sin(gl_FragCoord.y * 3.14159);
    col += (hash21(vUv * vec2(541.0, 733.0) + fract(uTime * 0.7) * 91.0) - 0.5) * 0.06;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }`;
}
