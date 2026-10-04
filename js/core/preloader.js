// ============================================================
// Прелоадер: процент → глитч-логотип → сборка частицами
// → проявление фона из шума → открытие Home.
// ============================================================

import { gsap } from 'gsap';
import { BRAND } from '../config.js';
import { t } from '../data/i18n.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function runPreloader({ gl, router, reduced = false, startIndex = 0, onReady = null }) {
  const el = document.getElementById('preloader');
  const bar = document.getElementById('preBar');
  const pct = document.getElementById('prePercent');
  const label = document.getElementById('preLabel');
  const logo = document.getElementById('preLogo');
  const dprEl = document.getElementById('preDpr');
  if (dprEl) dprEl.textContent = (window.devicePixelRatio || 1).toFixed(1);

  // реальные ресурсы
  const fontsP = Promise.race([document.fonts.ready, delay(2600)]);
  const winP = new Promise((res) => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res, { once: true });
  });
  const glP = delay(reduced ? 120 : 420);

  let done = 0;
  const parts = [fontsP, winP, glP];
  parts.forEach((p) => p.then(() => { done++; }).catch(() => { done++; }));

  await fontsP;
  gl?.buildTextTargets(BRAND);

  // прогресс
  const t0 = performance.now();
  const minDur = reduced ? 500 : 1650;
  let shown = 0;

  await new Promise((resolve) => {
    const step = () => {
      const timeP = Math.min(1, (performance.now() - t0) / minDur);
      const realP = 0.12 + 0.88 * (done / parts.length);
      const target = Math.min(timeP, realP);
      shown += (target - shown) * 0.12;
      const v = Math.round(shown * 100);
      // редкий глитч цифр
      if (!reduced && Math.random() < 0.05) {
        pct.textContent = `${String(Math.floor(Math.random() * 900) + 100)}%`;
      } else {
        pct.textContent = `${String(Math.min(v, 100)).padStart(3, '0')}%`;
      }
      bar.style.width = `${Math.min(shown, 1) * 100}%`;
      if (target >= 1 && shown > 0.985) return resolve();
      requestAnimationFrame(step);
    };
    step();
  });

  pct.textContent = '100%';
  bar.style.width = '100%';
  label.textContent = reduced ? t('pre_label_launch') : t('pre_label_particles');

  const finish = () => {
    if (gl?.ok) {
      gl.pu.uAssemble.value = 1;
      gl.pu.uRelease.value = 1;
      gl.pu.uAlpha.value = reduced ? 0.3 : 0.7;
      gl.u.uIntro.value = 1;
    }
    el.classList.add('done');
    router._activate(startIndex);
    document.body.classList.add('is-ready');
    onReady?.();
  };

  // скип по клику/клавише
  let tl = null;
  const skip = () => { if (tl) tl.progress(1); };
  window.addEventListener('pointerdown', skip, { once: true });
  window.addEventListener('keydown', skip, { once: true });

  if (!reduced && gl?.ok) {
    tl = gsap.timeline({ onComplete: () => { window.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip); } });
    tl.to(gl.pu.uAssemble, { value: 1, duration: 1.3, ease: 'expo.inOut' }, 0.05)
      .to(logo, { scale: 0.86, opacity: 0, filter: 'blur(12px)', duration: 0.55, ease: 'power2.in' }, 0.28)
      .add(() => { label.textContent = t('pre_label_scene'); }, 0.5)
      .to(gl.u.uIntro, { value: 1, duration: 1.35, ease: 'power2.inOut' }, 0.62)
      .to(gl.pu.uRelease, { value: 1, duration: 1.6, ease: 'power2.inOut' }, 0.9)
      .add(() => {
        el.classList.add('done');
        router._activate(startIndex);
        document.body.classList.add('is-ready');
        onReady?.();
      }, 0.85)
      .to(gl.pu.uAlpha, { value: 0.7, duration: 1.2 }, 1.4);
  } else {
    finish();
  }
}
