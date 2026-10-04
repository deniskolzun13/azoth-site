// ============================================================
// Курсор: точка + кольцо, hover-состояния, магнитные кнопки,
// лёгкий параллакс заголовков. Только для точных указателей.
// ============================================================

export class Cursor {
  constructor({ reduced = false } = {}) {
    this.fine = window.matchMedia('(pointer: fine)').matches;
    this.reduced = reduced;
    if (!this.fine) return;

    this.dot = document.querySelector('.cursor-dot');
    this.ring = document.querySelector('.cursor-ring');
    this.label = document.querySelector('.cursor-label');

    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.dx = this.x; this.dy = this.y;
    this.rx = this.x; this.ry = this.y;
    this.shown = false;
    this.down = false;

    window.addEventListener('pointermove', (e) => {
      this.x = e.clientX; this.y = e.clientY;
      if (!this.shown) {
        this.shown = true;
        document.body.classList.add('has-cursor');
        this.dot.style.opacity = '1';
        this.ring.style.opacity = '1';
      }
    }, { passive: true });

    window.addEventListener('pointerdown', () => { this.down = true; });
    window.addEventListener('pointerup', () => { this.down = false; });
    document.addEventListener('mouseleave', () => {
      this.dot.style.opacity = '0';
      this.ring.style.opacity = '0';
      this.shown = false;
    });

    const SELECTOR = '[data-cursor], a, button, input, textarea, .work-card';
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest(SELECTOR);
      this.ring.classList.remove('is-link', 'is-view');
      if (!t) return;
      const kind = t.dataset.cursor === 'view' ? 'is-view' : 'is-link';
      this.ring.classList.add(kind);
      // своя подпись на кольце (например «КРУТИ» у 3D-объекта)
      if (this.label) this.label.textContent = t.dataset.cursorLabel || 'СМОТРЕТЬ';
    });

    if (!reduced) this._initMagnets();
  }

  // кнопки слегка тянутся к курсору
  _initMagnets() {
    this.magnets = Array.from(
      document.querySelectorAll('.btn, #burger, .hud-arrows button')
    ).map((el) => ({ el, tx: 0, ty: 0, x: 0, y: 0 }));

    for (const m of this.magnets) {
      m.el.addEventListener('pointermove', (e) => {
        const r = m.el.getBoundingClientRect();
        m.tx = Math.max(-14, Math.min(14, (e.clientX - r.left - r.width / 2) * 0.3));
        m.ty = Math.max(-10, Math.min(10, (e.clientY - r.top - r.height / 2) * 0.35));
      });
      m.el.addEventListener('pointerleave', () => { m.tx = 0; m.ty = 0; });
    }

    // заголовки с data-para плывут за мышью
    this.paras = Array.from(document.querySelectorAll('[data-para]')).map((el) => ({
      el,
      f: parseFloat(el.dataset.para) || 1,
    }));
  }

  tick(dt) {
    if (!this.fine || !this.shown) return;
    const kd = Math.min(1, dt * 26);
    const kr = Math.min(1, dt * 11);
    this.dx += (this.x - this.dx) * kd;
    this.dy += (this.y - this.dy) * kd;
    this.rx += (this.x - this.rx) * kr;
    this.ry += (this.y - this.ry) * kr;

    const s = this.down ? 0.82 : 1;
    this.dot.style.transform = `translate3d(${this.dx}px, ${this.dy}px, 0) translate(-50%,-50%)`;
    this.ring.style.transform = `translate3d(${this.rx}px, ${this.ry}px, 0) translate(-50%,-50%) scale(${s})`;

    if (this.magnets) {
      for (const m of this.magnets) {
        m.x += (m.tx - m.x) * kr;
        m.y += (m.ty - m.y) * kr;
        if (m.x || m.y || m.tx || m.ty) {
          m.el.style.transform = `translate(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px)`;
        }
      }
    }
    if (this.paras) {
      const px = (this.x / window.innerWidth) * 2 - 1;
      const py = (this.y / window.innerHeight) * 2 - 1;
      for (const p of this.paras) {
        p.el.style.transform =
          `translate3d(${(px * -10 * p.f).toFixed(2)}px, ${(py * -7 * p.f).toFixed(2)}px, 0)`;
      }
    }
  }
}
