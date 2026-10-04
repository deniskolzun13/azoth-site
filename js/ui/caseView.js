// ============================================================
// Кейс-вью: полноэкранный просмотр проекта вместо простой модалки.
// Галерея кадров (процедурные шоты), фокус-ловушка, возврат фокуса,
// интеграция с историей браузера (push/replace из main.js).
// ============================================================

import { gsap } from 'gsap';
import { PROJECTS } from '../data/projects.js';
import { t, getLang, onLang } from '../data/i18n.js';
import { toast } from './contact.js';

export function initCaseView({ cards, audio, buzz, push, replace, onChange, goal } = {}) {
  const modal = document.getElementById('caseModal');
  if (!modal) return null;
  const panel = modal.querySelector('.case-panel');
  const caseItem = cards.ok
    ? cards.add(document.getElementById('caseCanvas'), { variant: 0, seed: 0, vp: [1024, 640] })
    : null;

  // галерея: три статичных кадра-миниатюры
  const thumbsWrap = document.getElementById('caseThumbs');
  const thumbItems = [];
  if (thumbsWrap) {
    for (let j = 0; j < 3; j++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'case-thumb';
      b.dataset.cursor = 'link';
      b.appendChild(document.createElement('canvas'));
      b.addEventListener('click', () => setShot(j));
      thumbsWrap.appendChild(b);
      const tItem = cards.ok
        ? cards.add(b.querySelector('canvas'), { variant: 0, seed: j, vp: [512, 320], page: null })
        : null;
      thumbItems.push({ btn: b, item: tItem });
    }
  }

  let isOpen = false;
  let current = 0;
  let shotIdx = 0;
  let lastFocus = null;

  const coverSeed = (i) => i * 1.7 + 0.3;

  function setShot(j, animate = true) {
    const p = PROJECTS[current];
    const shots = p.shots || [{ variant: p.variant, seed: coverSeed(current) }];
    shotIdx = Math.max(0, Math.min(shots.length - 1, j));
    const s = shots[shotIdx];
    if (caseItem) {
      caseItem.variant = s.variant;
      caseItem.seed = s.seed;
      caseItem.visible = true;
      if (animate) {
        caseItem.load = 0;
        gsap.to(caseItem, { load: 1, duration: 1.0, ease: 'power2.out', delay: 0.12 });
      } else {
        caseItem.load = 1;
      }
    }
    thumbItems.forEach((th, k) => th.btn.classList.toggle('on', k === shotIdx));
  }

  function renderThumbs() {
    const p = PROJECTS[current];
    const shots = p.shots || [{ variant: p.variant, seed: coverSeed(current) }];
    thumbItems.forEach((th, j) => {
      const has = j < shots.length;
      th.btn.hidden = !has;
      if (has && th.item) {
        th.item.variant = shots[j].variant;
        th.item.seed = shots[j].seed;
        cards.renderStatic(th.item);
      }
    });
  }

  function fill(i) {
    const p = PROJECTS[i];
    const lang = getLang();
    document.getElementById('caseMeta').textContent =
      `${String(i + 1).padStart(2, '0')} · ${p.year} · ${t('case_tag')}`;
    document.getElementById('caseTitle').textContent = p.title;
    document.getElementById('caseDesc').textContent = p.desc[lang];
    document.getElementById('caseTags').innerHTML = p.tags[lang].map((x) => `<span>${x}</span>`).join('');
    document.getElementById('caseResults').innerHTML =
      p.results[lang].map((r) => `<li><b>→</b> ${r}</li>`).join('');
    document.getElementById('caseCount').textContent =
      `${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`;
    modal.setAttribute('aria-label', t('card_aria', { title: p.title }));
  }

  function open(i, { pushHash = true } = {}) {
    const p = PROJECTS[i];
    if (!p) return;

    // кейс уже открыт (←/→, Back/Forward) — просто переключаем содержимое
    if (isOpen) {
      current = i;
      fill(i);
      renderThumbs();
      setShot(0, true);
      if (pushHash) push?.(`case-${i + 1}`);
      else replace?.(`case-${i + 1}`);
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
    if (pushHash) push?.(`case-${i + 1}`);
    else replace?.(`case-${i + 1}`);

    // фокус внутрь диалога
    requestAnimationFrame(() => modal.querySelector('.case-close')?.focus());
  }

  function close({ pushHash = true } = {}) {
    if (!isOpen) return;
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

  document.getElementById('caseShare')?.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}#case-${current + 1}`;
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
    get isOpen() { return isOpen; },
    get current() { return current; },
  };
}
