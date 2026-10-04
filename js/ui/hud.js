// ============================================================
// HUD: часы, fps, индикатор страницы, стрелки для тача.
// ============================================================

import { PAGES } from '../config.js';
import { t, getLang, onLang } from '../data/i18n.js';

export class HUD {
  constructor(router) {
    this.router = router;
    this.elIndex = document.getElementById('hudIndex');
    this.elTitle = document.getElementById('hudTitle');
    this.elDashes = document.getElementById('hudDashes');
    this.elClock = document.getElementById('hudClock');
    this.elFps = document.getElementById('hudFps');
    this.elHint = document.getElementById('hudHint');
    this.navBtns = Array.from(document.querySelectorAll('.hud-nav button'));
    this.elArrIdx = document.getElementById('arrIdx');
    this.current = 0;

    document.getElementById('arrPrev')?.addEventListener('click', () => this.router?.nav(-1));
    document.getElementById('arrNext')?.addEventListener('click', () => this.router?.nav(1));

    this._clock();
    setInterval(() => this._clock(), 1000);

    this._frames = 0;
    this._fpsT = performance.now();

    onLang(() => {
      // кнопки навигации и меню переведёт applyStatic (data-i18n),
      // здесь обновляем динамическую подпись страницы
      if (this.current >= 0) this.update(this.current);
    });
  }

  _clock() {
    if (!this.elClock) return;
    this.elClock.textContent = new Date().toLocaleTimeString('ru-RU', { hour12: false });
  }

  // вызывается из общего rAF
  fps() {
    this._frames++;
    const now = performance.now();
    if (now - this._fpsT >= 600) {
      const fps = Math.round(this._frames * 1000 / (now - this._fpsT));
      this.elFps.textContent = `${Math.min(fps, 120)} FPS`;
      this._frames = 0;
      this._fpsT = now;
    }
  }

  update(i) {
    this.current = i;
    if (this.elIndex) this.elIndex.textContent = String(i + 1).padStart(2, '0');
    if (this.elTitle) this.elTitle.textContent = PAGES[i].title[getLang()];
    if (this.elArrIdx) this.elArrIdx.textContent = `${i + 1}/${PAGES.length}`;
    this.navBtns.forEach((b, idx) => b.classList.toggle('on', idx === i));
    document.querySelectorAll('.menu-nav button').forEach((b) => {
      b.classList.toggle('on', +b.dataset.go === i);
    });
    if (this.elDashes) {
      Array.from(this.elDashes.children).forEach((d, idx) => d.classList.toggle('on', idx === i));
    }
    if (this.elHint) {
      this.elHint.textContent = i === PAGES.length - 1 ? t('hint_final') : t('hint_scroll');
    }
  }
}
