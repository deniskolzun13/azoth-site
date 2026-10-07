// ============================================================
// Роутер SPA: полноэкранные страницы, шейдерный глитч-переход,
// колесо/стрелки/тач с накоплением на краю скролла, Lenis.
// ============================================================

import { gsap } from 'gsap';
import Lenis from 'lenis';
import { PAGES } from '../config.js';

const NAV_COOLDOWN = 950;   // мс между переходами
const EDGE_THRESHOLD = 170; // накопленный дельта-порог
const EDGE_RESET = 380;     // мс сброса накопления

export class Router {
  constructor({ gl, hud, isBlocked = () => false, reduced = false, onTransition = null } = {}) {
    this.gl = gl;
    this.hud = hud;
    this.isBlocked = isBlocked;
    this.reduced = reduced;
    this.onTransition = onTransition;

    this.pages = Array.from(document.querySelectorAll('.page'));
    this.current = -1;
    this.transitioning = false;
    this.lenis = null;
    this._acc = 0;
    this._accTimer = 0;
    this._lastNav = 0;

    this._bindWheel();
    this._bindKeys();
    this._bindTouch();
  }

  get scrollEl() {
    const p = this.pages[this.current];
    return p ? p.querySelector('.page-scroll') : null;
  }

  _atBottom() {
    const sc = this.scrollEl;
    if (!sc) return true;
    return sc.scrollTop >= sc.scrollHeight - sc.clientHeight - 3;
  }

  _atTop() {
    const sc = this.scrollEl;
    if (!sc) return true;
    return sc.scrollTop <= 3;
  }

  _edge(e) {
    const now = performance.now();
    if (this.transitioning || this.isBlocked() || now - this._lastNav < NAV_COOLDOWN) return;
    const d = e.deltaY;
    const canNext = this._atBottom();
    const canPrev = this._atTop();
    if ((d > 0 && canNext) || (d < 0 && canPrev)) {
      this._acc += d;
      clearTimeout(this._accTimer);
      this._accTimer = setTimeout(() => { this._acc = 0; }, EDGE_RESET);
    } else {
      this._acc = 0;
    }
    if (this._acc > EDGE_THRESHOLD) { this._acc = 0; this.nav(1); }
    else if (this._acc < -EDGE_THRESHOLD) { this._acc = 0; this.nav(-1); }
  }

  _bindWheel() {
    window.addEventListener('wheel', (e) => this._edge(e), { passive: true });
  }

  _bindTouch() {
    let lastY = null;
    let startY = null;
    let startX = null;
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { lastY = null; return; }
      lastY = e.touches[0].clientY;
      startY = lastY;
      startX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (lastY === null || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const d = lastY - y; // вверх = вперёд
      lastY = y;
      const now = performance.now();
      if (this.transitioning || this.isBlocked() || now - this._lastNav < NAV_COOLDOWN) return;

      // горизонтальный жест (свайпы в слайдерах/галерее) не переключает экраны
      if (startX !== null && Math.abs(x - startX) > Math.abs(y - startY) * 1.4) {
        this._acc = 0;
        return;
      }

      if ((d > 0 && this._atBottom()) || (d < 0 && this._atTop())) {
        this._acc += d * 1.2;
        clearTimeout(this._accTimer);
        this._accTimer = setTimeout(() => { this._acc = 0; }, EDGE_RESET);
      } else {
        this._acc = 0;
      }
      // повышенный порог для предотвращения случайного elastic bounce на смартфонах
      if (this._acc > 340) { this._acc = 0; this.nav(1); }
      else if (this._acc < -340) { this._acc = 0; this.nav(-1); }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      lastY = null;
      startY = null;
      startX = null;
    }, { passive: true });
  }

  _bindKeys() {
    window.addEventListener('keydown', (e) => {
      const t = e.target;
      // не перехватываем клавиши в полях формы
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      // пробел/enter на сфокусированной кнопке — её родное поведение
      const onCtl = t && t.closest && t.closest('button, a, [role="button"]');
      if (onCtl && (e.key === ' ' || e.key === 'Enter')) return;
      if (this.isBlocked()) return;
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault(); this.nav(1); break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault(); this.nav(-1); break;
        case '1': case '2': case '3': case '4': case '5':
          this.goTo(+e.key - 1); break;
        case 'Home':
          e.preventDefault(); this._scrollPage(0); break;
        case 'End':
          e.preventDefault(); this._scrollPage(1); break;
        default: break;
      }
    });
  }

  nav(dir) {
    this.goTo(this.current + dir);
  }

  goTo(i, { instant = false } = {}) {
    if (i === this.current || i < 0 || i >= this.pages.length) return;
    if (this.transitioning && !instant) return;

    if (instant || this.reduced || !this.gl?.ok) {
      this._activate(i);
      return;
    }

    this.transitioning = true;
    this._lastNav = performance.now();
    document.body.classList.add('is-transitioning');
    this.onTransition?.();

    const oldEl = this.pages[this.current];
    gsap.to(oldEl, { opacity: 0, duration: 0.22, ease: 'power1.in' });

    gsap.to(this.gl.u.uGlitch, {
      value: 1,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        this._activate(i);
        gsap.to(oldEl, { opacity: 1, duration: 0 });
        gsap.to(this.gl.u.uGlitch, {
          value: 0,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => {
            this.transitioning = false;
            document.body.classList.remove('is-transitioning');
          },
        });
      },
    });
  }

  _activate(i) {
    const prev = this.pages[this.current];
    if (prev) {
      prev.classList.remove('is-active');
      prev.style.opacity = '';
    }
    this.current = i;

    const el = this.pages[i];
    el.classList.add('is-active');

    // скролл в начало
    const sc = el.querySelector('.page-scroll');
    if (sc) sc.scrollTop = 0;

    // Lenis на активную страницу
    if (this.lenis) { this.lenis.destroy(); this.lenis = null; }
    if (!this.reduced && sc) {
      this.lenis = new Lenis({
        wrapper: sc,
        content: sc.firstElementChild,
        lerp: 0.09,
        smoothWheel: true,
      });
      this.lenis.on('scroll', (e) => {
        this.gl?.setFlow(Math.abs(e.velocity ?? 0) * 0.012);
      });
    }

    // скорость нативного скролла (тач / reduced) — тоже в «поток» фона
    this._attachFlow(sc);

    // WebGL-режим и защита текста
    this.gl?.setMode(i);
    this.gl?.setDim([0.25, 0.55, 0.5, 0.55, 0.35][i] ?? 0.4);

    // HUD / меню / заголовок (title ставится в main.js — там язык)
    this.hud?.update(i);
    document.body.dataset.page = PAGES[i].id;
  }

  // прокрутка активной страницы в начало (0) или конец (1)
  _scrollPage(edge) {
    const sc = this.scrollEl;
    if (!sc) return;
    const max = Math.max(0, sc.scrollHeight - sc.clientHeight);
    const y = edge ? max : 0;
    if (this.lenis) this.lenis.scrollTo(y, { duration: 1.2 });
    else sc.scrollTo({ top: y, behavior: 'smooth' });
  }

  raf(time) {
    this.lenis?.raf(time);
  }

  _attachFlow(sc) {
    if (this._flowEl) this._flowEl.removeEventListener('scroll', this._onNativeScroll);
    this._flowEl = sc;
    if (sc) sc.addEventListener('scroll', this._onNativeScroll, { passive: true });
  }

  _onNativeScroll = () => {
    const now = performance.now();
    const el = this._flowEl;
    if (!el) return;
    if (this._flowT && now > this._flowT) {
      const v = Math.abs(el.scrollTop - (this._flowLast ?? el.scrollTop)) / (now - this._flowT);
      this.gl?.setFlow(v * 0.35);
    }
    this._flowT = now;
    this._flowLast = el.scrollTop;
  };
}
