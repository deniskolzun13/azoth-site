// ============================================================
// Страница «Работы»: сетка карточек, фильтры по категориям,
// счётчик, клавиатурный доступ, видимость для WebGL-рендерера.
// ============================================================

import { gsap } from 'gsap';
import { PROJECTS } from '../data/projects.js';
import { t, plural, getLang, onLang } from '../data/i18n.js';

// статичная 2D-заглушка обложки на случай отказа WebGL
const FALLBACK_COLORS = [
  ['#0a0618', '#3a2496'], ['#0c0416', '#5c1f4e'], ['#080618', '#2c3ba8'],
  ['#0e0718', '#6a4ac8'], ['#070414', '#1f6f9e'], ['#0a0518', '#44309c'],
];
function drawFallbackCover(item, i) {
  const c = item.canvas;
  const ctx = item.ctx;
  const w = c.width = c.clientWidth || 300;
  const h = c.height = c.clientHeight || 190;
  const [c0, c1] = FALLBACK_COLORS[i % FALLBACK_COLORS.length];
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
  ctx.lineWidth = 1;
  for (let y = (i % 3) * 12 + 8; y < h; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y - 10 - (i % 4) * 4);
    ctx.stroke();
  }
}

export function initWorks({ cards, audio, onOpenCase } = {}) {
  const grid = document.getElementById('worksGrid');
  const filtersEl = document.getElementById('worksFilters');
  const noteEl = document.getElementById('worksNote');
  if (!grid || !filtersEl) return null;

  const cardItems = [];

  function cardMarkup(i) {
    const p = PROJECTS[i];
    const lang = getLang();
    return `
      <div class="work-cover">
        <canvas aria-hidden="true"></canvas>
        <span class="work-view mono">${t('card_view')}</span>
      </div>
      <div class="work-meta">
        <span class="work-idx">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="work-name">${p.title}</h3>
        <span class="work-year">${p.year}</span>
      </div>
      <div class="work-tags">${p.tags[lang].map((x) => `<span>${x}</span>`).join('')}</div>`;
  }

  PROJECTS.forEach((p, i) => {
    const art = document.createElement('article');
    art.className = 'work-card';
    // клавиатурный доступ: карточка = кнопка
    art.tabIndex = 0;
    art.setAttribute('role', 'button');
    art.dataset.cursor = 'view';
    art.dataset.index = String(i);
    art.setAttribute('aria-label', t('card_aria', { title: p.title }));
    art.innerHTML = cardMarkup(i);
    grid.appendChild(art);

    const canvas = art.querySelector('canvas');
    const item = cards.add(canvas, { variant: p.variant, seed: i * 1.7 + 0.3, page: 'works' });
    item.coverEl = art.querySelector('.work-cover');
    if (!cards.ok) drawFallbackCover(item, i);
    cardItems.push({ item, el: art, p });
  });

  // фильтры: стабильный cat + подпись по языку
  const catIds = [...new Set(PROJECTS.map((p) => p.cat))];
  const catBtns = new Map();
  catIds.forEach((cat) => {
    const b = document.createElement('button');
    b.className = 'works-filter mono';
    b.dataset.cat = cat;
    b.dataset.cursor = 'link';
    b.setAttribute('aria-pressed', 'false');
    filtersEl.appendChild(b);
    catBtns.set(cat, b);
  });
  const allBtn = document.createElement('button');
  allBtn.className = 'works-filter mono on';
  allBtn.dataset.cat = 'ALL';
  allBtn.dataset.cursor = 'link';
  allBtn.setAttribute('aria-pressed', 'true');
  filtersEl.prepend(allBtn);

  function refreshFilterLabels() {
    allBtn.textContent = t('filter_all');
    for (const [cat, b] of catBtns) {
      b.textContent = PROJECTS.find((p) => p.cat === cat).catLabel[getLang()];
    }
  }

  let currentCat = 'ALL';
  function updateNote() {
    if (!noteEl) return;
    const n = cardItems.filter(({ el }) => !el.classList.contains('is-hidden')).length;
    noteEl.innerHTML =
      `<span class="acc">${n} ${plural(n, 'works_count_1', 'works_count_2', 'works_count_5')}</span>` +
      ` · 2024—2026 · <span class="works-hover">${t('works_hover')}</span>`;
  }

  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('.works-filter');
    if (!b || b.classList.contains('on')) return;
    filtersEl.querySelectorAll('.works-filter').forEach((x) => {
      x.classList.toggle('on', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    currentCat = b.dataset.cat;
    let di = 0;
    cardItems.forEach(({ el }, i) => {
      const show = currentCat === 'ALL' || PROJECTS[i].cat === currentCat;
      el.classList.toggle('is-hidden', !show);
      if (show) {
        gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, delay: di++ * 0.05, ease: 'power3.out' });
      }
    });
    updateNote();
    audio?.blip(980, 0.05, 0.03);
  });

  // hover / tilt-вход / клик / клавиатура
  cardItems.forEach(({ item, el }, i) => {
    el.addEventListener('pointerenter', () => { item.hoverT = 1; });
    el.addEventListener('pointerleave', () => { item.hoverT = 0; item.mx = 0; item.my = 0; });
    el.addEventListener('pointermove', (e) => {
      const r = el.querySelector('.work-cover').getBoundingClientRect();
      item.mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      item.my = -(((e.clientY - r.top) / r.height) * 2 - 1);
    });
    el.addEventListener('click', () => {
      audio?.blip(640, 0.08, 0.04);
      onOpenCase?.(i);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audio?.blip(640, 0.08, 0.04);
        onOpenCase?.(i);
      }
    });
  });

  // видимость карточек для рендерера
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const found = cardItems.find((c) => c.el === en.target);
        if (found) found.item.visible = en.isIntersecting;
      });
    }, { root: null, rootMargin: '10% 0px' });
    cardItems.forEach(({ el }) => io.observe(el));
  } else {
    cardItems.forEach(({ item }) => { item.visible = true; });
  }

  // перевод динамических частей
  onLang(() => {
    cardItems.forEach(({ el, p }, i) => {
      el.querySelector('.work-tags').innerHTML = p.tags[getLang()].map((x) => `<span>${x}</span>`).join('');
      el.setAttribute('aria-label', t('card_aria', { title: p.title }));
      el.querySelector('.work-view').textContent = t('card_view');
      if (!cards.ok) drawFallbackCover(cardItems[i].item, i);
    });
    refreshFilterLabels();
    updateNote();
  });

  refreshFilterLabels();
  updateNote();

  return { cardItems };
}
