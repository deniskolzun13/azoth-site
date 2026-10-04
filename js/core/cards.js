// ============================================================
// Процедурные обложки: один WebGL-рендерер на все карточки,
// каждый кадр копирует вьюпорт в 2D-канвас карточки.
// ============================================================

import * as THREE from 'three';
import { CARD_VERT, makeCardFrag, OBJ3D_VERT, OBJ3D_FRAG } from './shaders.js';

const RW = 1024, RH = 640;

export class Cards {
  constructor({ isMobile = false, reduced = false } = {}) {
    this.items = [];
    this.active = false;
    this.ok = true;
    this.time = 0;

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: false, alpha: false,
        preserveDrawingBuffer: true, powerPreference: 'low-power',
      });
    } catch (e) {
      this.ok = false;
      return;
    }
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(RW, RH, false);
    this.renderer.setClearColor(0x05010f, 1);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.uniforms = {
      uTime:    { value: 0 },
      uVariant: { value: 0 },
      uHover:   { value: 0 },
      uScroll:  { value: 0 },
      uSeed:    { value: 0 },
      uLoad:    { value: 1 },
      uMouse:   { value: new THREE.Vector2(0, 0) },
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: CARD_VERT,
      fragmentShader: makeCardFrag(isMobile || reduced ? 3 : 4),
      uniforms: this.uniforms,
    });
    this.material.extensions = { derivatives: true };

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    // ---------- интерактивный 3D-объект (страница «Услуги») ----------
    this.scene3d = new THREE.Scene();
    this.cam3d = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
    this.cam3d.position.z = 4.3;

    this.u3 = { uTime: { value: 0 }, uDrag: { value: 0 } };
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 4),
      new THREE.ShaderMaterial({
        vertexShader: OBJ3D_VERT,
        fragmentShader: OBJ3D_FRAG,
        uniforms: this.u3,
      })
    );
    this.mesh3d = core;
    core.frustumCulled = false;
    this.scene3d.add(core);

    this.wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.5, 1)),
      new THREE.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.28 })
    );
    this.wire.frustumCulled = false;
    this.scene3d.add(this.wire);

    this.rot = { x: 0.35, y: -0.5, vx: 0, vy: 0, dragging: false };
    this.page = null;
  }

  // canvas: <canvas> в DOM; opts: { variant, seed, vp:[w,h], kind:'flat'|'mesh', page }
  add(canvas, { variant = 0, seed = Math.random() * 10, vp = [800, 500], kind = 'flat', page = null } = {}) {
    const ctx = canvas.getContext('2d');
    const item = { canvas, ctx, variant, seed, vp, kind, page, hover: 0, hoverT: 0, load: 1, visible: false, mlx: 0, mly: 0, mx: 0, my: 0 };
    this.items.push(item);
    return item;
  }

  _syncSize(item) {
    const w = item.canvas.clientWidth || 300;
    const h = item.canvas.clientHeight || 190;
    if (item.canvas.width !== w || item.canvas.height !== h) {
      item.canvas.width = w;
      item.canvas.height = h;
    }
  }

  tick(dt, viewportH) {
    if (!this.ok || !this.active) return;
    this.time += dt;
    this.uniforms.uTime.value = this.time;

    for (const it of this.items) {
      if (!it.visible) continue;
      if (it.page && it.page !== this.page) continue;
      const r = it.canvas.getBoundingClientRect();
      if (r.bottom < -60 || r.top > viewportH + 60) continue;

      this._syncSize(it);

      const [vw, vh] = it.vp;
      // WebGL-вьюпорт растёт от низа буфера, drawImage читает сверху — держим регион вверху
      this.renderer.setViewport(0, RH - vh, vw, vh);

      if (it.kind === 'mesh') {
        this._tick3d(dt);
      } else {
        it.hover += (it.hoverT - it.hover) * Math.min(1, dt * 9);
        it.mlx += (it.mx - it.mlx) * Math.min(1, dt * 10);
        it.mly += (it.my - it.mly) * Math.min(1, dt * 10);
        this.uniforms.uMouse.value.set(it.mlx, it.mly);

        const center = r.top + r.height / 2 - viewportH / 2;
        const scrollN = Math.max(-1, Math.min(1, center / viewportH));

        this.uniforms.uVariant.value = it.variant;
        this.uniforms.uSeed.value = it.seed;
        this.uniforms.uHover.value = it.hover;
        this.uniforms.uScroll.value = scrollN;
        this.uniforms.uLoad.value = it.load;

        // 3D-tilt карточки за курсором
        if (it.coverEl) {
          if (it.hover > 0.02) {
            it.coverEl.style.transform =
              `perspective(1100px) rotateY(${(it.mlx * 2.8).toFixed(2)}deg) rotateX(${(-it.mly * 2.2).toFixed(2)}deg)`;
            it._tilted = true;
          } else if (it._tilted) {
            it.coverEl.style.transform = '';
            it._tilted = false;
          }
        }

        this.renderer.render(this.scene, this.camera);
      }

      it.ctx.drawImage(this.renderer.domElement, 0, 0, vw, vh, 0, 0, it.canvas.width, it.canvas.height);
    }
  }

  // одиночный статичный кадр (галерея кейс-вью) — рендер + копия в 2D-канвас
  renderStatic(item) {
    if (!this.ok || !item.ctx) return;
    this._syncSize(item);
    const [vw, vh] = item.vp;
    this.renderer.setViewport(0, RH - vh, vw, vh);
    this.uniforms.uVariant.value = item.variant;
    this.uniforms.uSeed.value = item.seed;
    this.uniforms.uHover.value = 0;
    this.uniforms.uScroll.value = 0;
    this.uniforms.uLoad.value = 1;
    if (this.uniforms.uTime.value < 1) this.uniforms.uTime.value = 1.5;
    this.renderer.render(this.scene, this.camera);
    item.ctx.drawImage(this.renderer.domElement, 0, 0, vw, vh, 0, 0, item.canvas.width, item.canvas.height);
  }

  _tick3d(dt) {
    const r = this.rot;
    if (!r.dragging) {
      r.vx *= 0.95;
      r.vy *= 0.95;
      r.y += dt * 0.3; // авто-вращение в покое
    }
    r.vy = Math.max(-0.09, Math.min(0.09, r.vy));
    r.vx = Math.max(-0.09, Math.min(0.09, r.vx));
    r.y += r.vy;
    r.x = Math.max(-1.5, Math.min(1.5, r.x + r.vx));

    this.mesh3d.rotation.set(r.x, r.y, 0);
    this.wire.rotation.set(-r.x * 0.45, -r.y * 0.6 + this.time * 0.05, 0);
    this.u3.uTime.value = this.time;
    this.u3.uDrag.value += ((r.dragging ? 1 : 0) - this.u3.uDrag.value) * Math.min(1, dt * 6);

    this.renderer.render(this.scene3d, this.cam3d);
  }
}
