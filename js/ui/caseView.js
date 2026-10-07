// ============================================================
// Кейс-вью: полноэкранный просмотр проекта вместо простой модалки.
// Галерея кадров (процедурные шоты) + лайтбокс, блоки «задача /
// решение / стек», похожие проекты, фокус-ловушка, возврат фокуса,
// интеграция с историей браузера (push/replace из main.js).
// Хэш кейса — слаг: #case-<id> (старые числовые #case-N тоже работают).
// ============================================================

import { gsap } from 'gsap';
import { PROJECTS } from '../data/projects.js';
import { t, getLang, onLang } from '../data/i18n.js';
import { toast } from './contact.js';

const MAX_SHOTS = 6;

export function initCaseView({ cards, audio, buzz, push, replace, onChange, goal } = {}) {
  const modal = document.getElementById('caseModal');
  if (!modal) return null;
  const panel = modal.querySelector('.case-panel');
  const caseShotImg = document.getElementById('caseShot');
  const demoBtn = document.getElementById('caseDemo');
  const caseItem = cards.ok
    ? cards.add(document.getElementById('caseCanvas'), { variant: 0, seed: 0, vp: [1024, 640] })
    : null;

  // ---------- лайтбокс: увеличенный кадр (скриншот или живой шейдер) ----------
  const lightbox = document.getElementById('caseLightbox');
  const lbCanvas = document.getElementById('lbCanvas');
  const lbShotImg = document.getElementById('lbShot');
  const lbCount = document.getElementById('lbCount');
  const zoomBtn = document.getElementById('caseZoom');
  const lbItem = cards.ok && lightbox
    ? cards.add(lbCanvas, { variant: 0, seed: 0, vp: [1024, 640], page: null })
    : null;
  let lbOpen = false;
  let lbReturnFocus = null;
  if (zoomBtn && !cards.ok) zoomBtn.hidden = true;

  function openLb() {
    if (!lightbox || lbOpen) return;
    const s = currentShot();
    const isImg = typeof s === 'string';
    if (isImg) {
      if (!lbShotImg) return;
      lbShotImg.src = s;
      lbShotImg.hidden = false;
      lbCanvas.hidden = true;
    } else {
      if (!lbItem) return;
      lbItem.variant = s.variant;
      lbItem.seed = s.seed;
      lbItem.visible = true;
      if (lbShotImg) lbShotImg.hidden = true;
      if (lbCanvas) lbCanvas.hidden = false;
    }
    lbOpen = true;
    lbReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    audio?.pop();
    requestAnimationFrame(() => document.getElementById('lbClose')?.focus());
  }
  function closeLb() {
    if (!lightbox || !lbOpen) return;
    lbOpen = false;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lbItem) lbItem.visible = false;
    if (lbReturnFocus && document.contains(lbReturnFocus)) lbReturnFocus.focus();
    lbReturnFocus = null;
  }
  function lbNav(dir) {
    setShot((shotIdx + dir + currentShots().length) % currentShots().length, false);
    audio?.blip(720, 0.06, 0.035);
  }

  lightbox?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(lightbox.querySelectorAll('button')).filter((el) => !el.hidden);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !lightbox.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lbCanvas || e.target === lbShotImg) closeLb();
  });
  document.getElementById('lbClose')?.addEventListener('click', closeLb);
  document.getElementById('lbPrev')?.addEventListener('click', () => lbNav(-1));
  document.getElementById('lbNext')?.addEventListener('click', () => lbNav(1));

  // свайп-навигация (тач-жесты на смартфонах/планшетах)
  function bindSwipe(element, onSwipeLeft, onSwipeRight) {
    if (!element) return;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    element.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = performance.now();
    }, { passive: true });
    element.addEventListener('touchend', (e) => {
      if (e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = performance.now() - startTime;
      if (dt < 600 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) onSwipeLeft();
        else onSwipeRight();
      }
    }, { passive: true });
  }

  bindSwipe(lightbox, () => { lbNav(1); buzz?.(8); }, () => { lbNav(-1); buzz?.(8); });
  const canvasWrap = modal.querySelector('.case-canvas-wrap');
  bindSwipe(canvasWrap, () => {
    const shots = currentShots();
    if (shots.length > 1) {
      setShot((shotIdx + 1) % shots.length);
      audio?.blip(720, 0.06, 0.035);
      buzz?.(8);
    }
  }, () => {
    const shots = currentShots();
    if (shots.length > 1) {
      setShot((shotIdx - 1 + shots.length) % shots.length);
      audio?.blip(720, 0.06, 0.035);
      buzz?.(8);
    }
  });

  // ---------- галерея: до шести статичных кадров-миниатюр ----------
  const thumbsWrap = document.getElementById('caseThumbs');
  const thumbItems = [];
  if (thumbsWrap) {
    for (let j = 0; j < MAX_SHOTS; j++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'case-thumb';
      b.dataset.cursor = 'link';
      b.setAttribute('aria-label', t('case_shot_aria', { n: j + 1 }));
      const cv = document.createElement('canvas');
      b.appendChild(cv);
      b.addEventListener('click', () => setShot(j));
      thumbsWrap.appendChild(b);
      const tItem = cards.ok
        ? cards.add(cv, { variant: 0, seed: j, vp: [512, 320], page: null })
        : null;
      thumbItems.push({ btn: b, canvas: cv, item: tItem });
    }
  }

  let isOpen = false;
  let current = 0;
  let shotIdx = 0;
  let lastFocus = null;

  const coverSeed = (i) => i * 1.7 + 0.3;

  const currentShots = () => {
    const p = PROJECTS[current];
    return p.shots || [{ variant: p.variant, seed: coverSeed(current) }];
  };
  const currentShot = () => {
    const shots = currentShots();
    return shots[Math.max(0, Math.min(shots.length - 1, shotIdx))];
  };

  function setShot(j, animate = true) {
    const shots = currentShots();
    shotIdx = Math.max(0, Math.min(shots.length - 1, j));
    const s = shots[shotIdx];
    const isImg = typeof s === 'string';
    // скриншот демо-сайта
    if (caseShotImg) {
      caseShotImg.hidden = !isImg;
      if (isImg) caseShotImg.src = s;
    }
    if (caseItem) {
      caseItem.visible = !isImg;
      if (!isImg) {
        caseItem.variant = s.variant;
        caseItem.seed = s.seed;
        if (animate) {
          caseItem.load = 0;
          gsap.to(caseItem, { load: 1, duration: 1.0, ease: 'power2.out', delay: 0.12 });
        } else {
          caseItem.load = 1;
        }
      }
    }
    if (lbOpen && isImg && lbShotImg) lbShotImg.src = s;
    if (lbItem && !isImg) {
      lbItem.variant = s.variant;
      lbItem.seed = s.seed;
    }
    if (lbCount) lbCount.textContent = `${shotIdx + 1} / ${shots.length}`;
    thumbItems.forEach((th, k) => th.btn.classList.toggle('on', k === shotIdx));
  }

  function renderThumbs() {
    const shots = currentShots();
    const isImgs = typeof shots[0] === 'string';
    thumbItems.forEach((th, j) => {
      const has = j < shots.length;
      th.btn.hidden = !has;
      let img = th.btn.querySelector('img');
      if (has && isImgs) {
        if (!img) {
          img = document.createElement('img');
          img.alt = '';
          img.loading = 'lazy';
          th.btn.appendChild(img);
        }
        img.src = shots[j];
        th.canvas.hidden = true;
      } else {
        if (img) img.remove();
        th.canvas.hidden = false;
        if (has && th.item) {
          th.item.variant = shots[j].variant;
          th.item.seed = shots[j].seed;
          cards.renderStatic(th.item);
        }
      }
    });
  }

  // похожие проекты: сначала та же категория, затем остальные по порядку
  function similarTo(i, lang) {
    const cur = PROJECTS[i];
    const others = PROJECTS.map((p, k) => ({ p, k })).filter(({ k }) => k !== i);
    const sameCat = others.filter(({ p }) => p.cat === cur.cat);
    return [...sameCat, ...others].slice(0, 2);
  }

  function fill(i) {
    const p = PROJECTS[i];
    const lang = getLang();
    document.getElementById('caseMeta').textContent =
      `${String(i + 1).padStart(2, '0')} · ${p.year} · ${t('case_tag')}`;
    document.getElementById('caseTitle').textContent = p.title;
    document.getElementById('caseDesc').textContent = p.desc[lang];
    document.getElementById('caseTags').innerHTML = p.tags[lang].map((x) => `<span>${x}</span>`).join('');
    document.getElementById('caseTask').textContent = p.task[lang];
    document.getElementById('caseSolution').textContent = p.solution[lang];
    document.getElementById('caseStack').innerHTML = p.stack[lang].map((x) => `<span>${x}</span>`).join('');
    document.getElementById('caseFacts').innerHTML = `
      <div><dt>${t('case_facts_role')}</dt><dd>${p.role[lang]}</dd></div>
      <div><dt>${t('case_facts_time')}</dt><dd>${p.duration[lang]}</dd></div>
      <div><dt>${t('case_facts_client')}</dt><dd>${p.client[lang]}</dd></div>`;
    document.getElementById('caseResults').innerHTML =
      p.results[lang].map((r) => `<li><b>→</b> ${r}</li>`).join('');
    document.getElementById('caseSimilarRow').innerHTML = similarTo(i, lang)
      .map(({ p: sp, k }) =>
        `<button type="button" class="case-sim" data-idx="${k}" data-cursor="link"
           aria-label="${t('case_sim_aria', { title: sp.title })}">
           <b>${sp.title}</b><span class="mono">${sp.catLabel[lang]} · ${sp.year}</span>
         </button>`)
      .join('');
    document.getElementById('caseCount').textContent =
      `${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`;
    // кнопка на живое демо + лупа (для скриншотов не нужен WebGL)
    if (demoBtn) {
      demoBtn.hidden = !p.demo;
      if (p.demo) {
        demoBtn.href = p.demo;
        demoBtn.textContent = t('case_demo');
      }
    }
    if (zoomBtn) {
      zoomBtn.hidden = typeof (p.shots && p.shots[0]) === 'string' ? false : !cards.ok;
    }
    modal.setAttribute('aria-label', t('card_aria', { title: p.title }));
  }

  document.getElementById('caseSimilarRow')?.addEventListener('click', (e) => {
    const b = e.target.closest('.case-sim');
    if (!b) return;
    open(Number(b.dataset.idx));
  });

  function open(i, { pushHash = true } = {}) {
    const p = PROJECTS[i];
    if (!p) return;

    // кейс уже открыт (←/→, Back/Forward, похожие) — просто переключаем содержимое
    if (isOpen) {
      current = i;
      fill(i);
      renderThumbs();
      setShot(0, true);
      if (pushHash) push?.(`case-${p.id}`);
      else replace?.(`case-${p.id}`);
      return;
    }

    isOpen = true;
    current = i;
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    fill(i);
    renderThumbs();
    setShot(0, false);

    if (cards.ok) cards.active = true;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    audio?.pop();
    buzz?.(10);
    goal?.('case_open');
    if (pushHash) push?.(`case-${p.id}`);
    else replace?.(`case-${p.id}`);

    // фокус внутрь диалога
    requestAnimationFrame(() => modal.querySelector('.case-close')?.focus());
  }

  function close({ pushHash = true } = {}) {
    if (!isOpen) return;
    closeLb();
    isOpen = false;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (caseItem) caseItem.visible = false;
    if (pushHash) push?.('');
    onChange?.();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }

  function nav(dir) {
    open((current + dir + PROJECTS.length) % PROJECTS.length);
    audio?.blip(720, 0.06, 0.035);
  }

  // фокус-ловушка: Tab не покидает диалог
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(
      panel.querySelectorAll('button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hidden && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.getElementById('casePrev')?.addEventListener('click', () => nav(-1));
  document.getElementById('caseNext')?.addEventListener('click', () => nav(1));
  zoomBtn?.addEventListener('click', openLb);

  // «ЗАКРЫТЬ» и клик по затемнённому фону
  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) close();
  });

  document.getElementById('caseShare')?.addEventListener('click', async () => {
    // красивый адрес SEO-страницы кейса (works/<slug>/), а не голый хэш
    const base = location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`;
    const url = `${location.origin}${base}works/${PROJECTS[current].id}/`;
    try {
      await navigator.clipboard.writeText(url);
      toast(t('toast_case_url'));
    } catch (e) {
      toast(url);
    }
    audio?.chirp();
    buzz?.(12);
  });

  onLang(() => {
    if (!isOpen) return;
    fill(current);
    renderThumbs();
  });

  return {
    open,
    close,
    nav,
    lbNav,
    closeLb,
    get isOpen() { return isOpen; },
    get current() { return current; },
    get lightboxOpen() { return lbOpen; },
  };
}
