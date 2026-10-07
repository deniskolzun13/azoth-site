// ============================================================
// WebGL-ядро: фон-«комната», частицы, управление DPR/паузой.
// ============================================================

import * as THREE from 'three';
import { BG_VERT, makeBgFrag, PARTICLE_VERT, PARTICLE_FRAG } from './shaders.js';

export class GL {
  constructor(container, { isMobile = false, reduced = false, onContextLost = null, onContextRestored = null } = {}) {
    this.isMobile = isMobile;
    this.reduced = reduced;
    this.ok = true;
    this.visible = true;
    this.mode = 0;
    this.modeTarget = 0;
    this.dim = 0;
    this.dimTarget = 0;
    this.vel = 0;
    this.time = 0;
    this.fpsLowCount = 0;
    this.fpsDownscaled = false;

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch (e) {
      this.ok = false;
      document.body.classList.add('no-gl');
      return;
    }

    this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // потеря контекста: three сам переинициализируется после restore,
    // нам достаточно приостановить цикл и показать тост
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.visible = false;
      onContextLost?.();
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.visible = true;
      onContextRestored?.();
    });

    const oct = reduced ? 3 : (isMobile ? 3 : 5);

    this.u = {
      uTime:     { value: 0 },
      uAspect:   { value: window.innerWidth / window.innerHeight },
      uMouse:    { value: new THREE.Vector2(0, 0) },
      uMouseVel: { value: 0 },
      uMode:     { value: 0 },
      uGlitch:   { value: 0 },
      uDim:      { value: 0 },
      uIntro:    { value: 0 },
      uFlow:     { value: 0 },
    };

    this.bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: makeBgFrag(oct),
      uniforms: this.u,
    });
    this.bgMat.extensions = { derivatives: true };

    this.bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bgMat);
    this.bg.frustumCulled = false;

    this.scene = new THREE.Scene();
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene.add(this.bg);

    this._initParticles(oct);
  }

  _initParticles(oct) {
    const N = this.reduced ? 500 : (this.isMobile ? 1500 : 3400);
    const scatter = new Float32Array(N * 3);
    const target = new Float32Array(N * 3);
    const rand = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      scatter[i * 3 + 0] = (Math.random() * 2 - 1) * 1.15;
      scatter[i * 3 + 1] = (Math.random() * 2 - 1) * 1.15;
      scatter[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      target[i * 3 + 0] = (Math.random() * 2 - 1) * 0.5;
      target[i * 3 + 1] = (Math.random() * 2 - 1) * 0.3;
      target[i * 3 + 2] = 0;
      rand[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

    this.pu = {
      uTime:      { value: 0 },
      uAspect:    this.u.uAspect,
      uTextScale: { value: this.isMobile ? 1.6 : 1.42 },
      uAssemble:  { value: 0 },
      uRelease:   { value: 0 },
      uSize:      { value: 6 },
      uAlpha:     { value: 0.9 },
      uMouseVel:  this.u.uMouseVel,
      uMouse:     this.u.uMouse,
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      uniforms: this.pu,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 1;
    this.scene.add(this.points);

    this._updatePointSize();
  }

  // Точки-цели из растра текста логотипа (вызвать после fonts.ready)
  buildTextTargets(text) {
    if (!this.ok) return;
    const cw = 360, ch = 120;
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 82px "Unbounded", sans-serif';
    ctx.fillText(text, cw / 2, ch / 2 + 4);

    const m = ctx.measureText(text);
    const tw = Math.max(m.width, 40);
    const img = ctx.getImageData(0, 0, cw, ch).data;

    const pts = [];
    const step = this.isMobile ? 2 : 2;
    for (let y = 0; y < ch; y += step) {
      for (let x = 0; x < cw; x += step) {
        if (img[(y * cw + x) * 4 + 3] > 110) {
          pts.push([
            (x - (cw - tw) / 2) / tw - 0.5,
            -(y / ch - 0.5) * (ch / tw),
          ]);
        }
      }
    }

    const attr = this.points.geometry.getAttribute('aTarget');
    const n = attr.count;
    for (let i = 0; i < n; i++) {
      const p = pts.length ? pts[Math.floor(Math.random() * pts.length)] : [0, 0];
      attr.setXYZ(i, p[0], p[1], 0);
    }
    attr.needsUpdate = true;
  }

  setMouse(nx, ny, dist) {
    if (!this.ok) return;
    this.u.uMouse.value.set(nx * this.u.uAspect.value, ny);
    if (dist) this.vel = Math.min(1, this.vel + dist * 0.02);
  }

  setMode(m) { this.modeTarget = m; }
  setDim(d) { this.dimTarget = d; }

  // импульс «скорости скролла» — сетка разгоняется и светится сильнее
  setFlow(v) { this.flow = Math.min(1, (this.flow || 0) + v); }

  _updatePointSize() {
    const h = this.renderer.domElement.height; // device px
    this.pu.uSize.value = Math.max(4, h * 0.0042);
  }

  resize() {
    if (!this.ok) return;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.u.uAspect.value = window.innerWidth / window.innerHeight;
    this._updatePointSize();
  }

  tick(dt) {
    if (!this.ok || !this.visible) return;

    // FPS Guard: адаптивное понижение разрешения при просадке кадров на слабых устройствах
    if (!this.fpsDownscaled && this.dpr > 1) {
      if (dt > 0.033) {
        this.fpsLowCount++;
        if (this.fpsLowCount > 60) {
          this.fpsDownscaled = true;
          this.dpr = Math.max(1, this.dpr * 0.75);
          this.renderer.setPixelRatio(this.dpr);
          this.resize();
        }
      } else if (this.fpsLowCount > 0) {
        this.fpsLowCount--;
      }
    }

    const k = this.reduced ? 0.25 : 1;
    this.time += dt * k;
    this.u.uTime.value = this.time;

    const f = Math.min(1, dt * 3.5);
    this.mode += (this.modeTarget - this.mode) * f;
    this.u.uMode.value = this.mode;
    this.dim += (this.dimTarget - this.dim) * f;
    this.u.uDim.value = this.dim;

    this.vel *= Math.exp(-dt * 2.6);
    this.u.uMouseVel.value = this.vel;
    this.flow = (this.flow || 0) * Math.exp(-dt * 2.2);
    this.u.uFlow.value += (this.flow - this.u.uFlow.value) * Math.min(1, dt * 5);
    this.pu.uTime.value = this.time;

    this.renderer.render(this.scene, this.cam);
  }
}
