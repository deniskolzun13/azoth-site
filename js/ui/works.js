// ============================================================
// Страница «Работы»: сетка карточек, фильтры по категориям,
// сортировка по году, режимы сетка/список (в списке — живое
// WebGL-превью у курсора), клавиатурный доступ, видимость для
// WebGL-рендерера.
// ============================================================

import { gsap } from 'gsap';
import { PROJECTS } from '../data/projects.js';
import { t, plural, getLang, onLang } from '../data/i18n.js';

const VIEW_KEY = 'azoth-works-view';
const YEARS = PROJECTS.map((p) => Number(p.year));
const YEAR_MIN = Math.min(...YEARS);
const YEAR_MAX = Math.max(...YEARS);

// статичная 2D-заглушка обложки на случай отказа WebGL
const FALLBACK_COLORS = [
  ['#0a0a0a', '#333333'], ['#0c0c0c', '#292929'], ['#080808', '#383838'],
  ['#0e0e0e', '#595959'], ['#070707', '#616161'], ['#0a0a0a', '#383838'],
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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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
  const toolsEl = document.getElementById('worksTools');
  const noteEl = document.getElementById('worksNote');
  if (!grid || !filtersEl) return null;

  const cardItems = [];

  function cardMarkup(i) {
    const p = PROJECTS[i];
    const lang = getLang();
    return `
      <div class="work-cover">
        ${p.cover ? `<img class="work-cover-img" src="${p.cover}" alt="" loading="lazy">` : '<canvas aria-hidden="true"></canvas>'}
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
    // обложки-картинки (демо-сайты) живут без WebGL- item; canvas — фолбэк/шейдер
    let item = null;
    if (canvas) {
      item = cards.add(canvas, { variant: p.variant || 0, seed: i * 1.7 + 0.3, page: 'works' });
      item.coverEl = art.querySelector('.work-cover');
      if (!cards.ok) drawFallbackCover(item, i);
    }
    cardItems.push({ item, el: art, p });
  });

  // ---------- сортировка и вид ----------
  let sortDir = 'desc'; // год: новые сверху
  let viewMode = 'grid';
  try {
    if (localStorage.getItem(VIEW_KEY) === 'list') viewMode = 'list';
  } catch (e) { /* noop */ }

  const sortBtn = document.createElement('button');
  sortBtn.className = 'works-filter mono';
  sortBtn.dataset.cursor = 'link';
  sortBtn.type = 'button';
  toolsEl?.appendChild(sortBtn);

  const listBtn = document.createElement('button');
  listBtn.className = 'works-filter mono';
  listBtn.dataset.cursor = 'link';
  listBtn.type = 'button';
  toolsEl?.appendChild(listBtn);

  const gridBtn = document.createElement('button');
  gridBtn.className = 'works-filter mono';
  gridBtn.dataset.cursor = 'link';
  gridBtn.type = 'button';
  toolsEl?.appendChild(gridBtn);

  function refreshTools() {
    sortBtn.textContent = `${t('works_sort_year')} ${sortDir === 'desc' ? '↓' : '↑'}`;
    sortBtn.title = t('works_sort_aria');
    sortBtn.setAttribute('aria-label', t('works_sort_aria'));
    listBtn.textContent = t('works_view_list');
    gridBtn.textContent = t('works_view_grid');
    listBtn.classList.toggle('on', viewMode === 'list');
    gridBtn.classList.toggle('on', viewMode === 'grid');
    listBtn.setAttribute('aria-pressed', String(viewMode === 'list'));
    gridBtn.setAttribute('aria-pressed', String(viewMode === 'grid'));
  }

  // ---------- живое превью у курсора (режим списка) ----------
  const previewWrap = document.createElement('div');
  previewWrap.className = 'works-preview';
  previewWrap.setAttribute('aria-hidden', 'true');
  const previewCanvas = document.createElement('canvas');
  const previewImg = document.createElement('img');
  previewImg.className = 'works-preview-img';
  previewImg.alt = '';
  previewImg.hidden = true;
  previewWrap.appendChild(previewCanvas);
  previewWrap.appendChild(previewImg);
  document.body.appendChild(previewWrap);
  const previewItem = cards.ok
    ? cards.add(previewCanvas, { variant: 0, seed: 0, vp: [640, 400], page: 'works' })
    : null;

  function hidePreview() {
    previewWrap.classList.remove('show');
    previewImg.hidden = true;
    if (previewItem) previewItem.visible = false;
  }
  function showPreview(p, seed) {
    if (viewMode !== 'list') return;
    if (p.cover) {
      previewImg.src = p.cover;
      previewImg.hidden = false;
      previewWrap.classList.add('show');
      return;
    }
    if (!previewItem) return;
    previewItem.variant = p.variant || 0;
    previewItem.seed = seed;
    previewItem.visible = true;
    previewWrap.classList.add('show');
  }
  function movePreview(e) {
    if (viewMode !== 'list') return;
    const w = 300, h = 188;
    let x = e.clientX + 26;
    if (x + w + 10 > window.innerWidth) x = e.clientX - w - 26;
    let y = Math.min(Math.max(10, e.clientY - h / 2), window.innerHeight - h - 10);
    previewWrap.style.left = `${x}px`;
    previewWrap.style.top = `${y}px`;
  }
  grid.addEventListener('pointermove', movePreview);
  grid.addEventListener('pointerleave', hidePreview);

  // ---------- фильтры: стабильный cat + подпись по языку ----------
  const catIds = [...new Set(PROJECTS.map((p) => p.cat))];
  const catBtns = new Map();
  catIds.forEach((cat) => {
    const b = document.createElement('button');
    b.className = 'works-filter mono';
    b.dataset.cat = cat;
    b.dataset.cursor = 'link';
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    filtersEl.appendChild(b);
    catBtns.set(cat, b);
  });
  const allBtn = document.createElement('button');
  allBtn.className = 'works-filter mono on';
  allBtn.dataset.cat = 'ALL';
  allBtn.dataset.cursor = 'link';
  allBtn.type = 'button';
  allBtn.setAttribute('aria-pressed', 'true');
  filtersEl.prepend(allBtn);

  function refreshFilterLabels() {
    allBtn.textContent = t('filter_all');
    for (const [cat, b] of catBtns) {
      b.textContent = PROJECTS.find((p) => p.cat === cat).catLabel[getLang()];
    }
  }

  let currentCat = 'ALL';

  // порядок отображения: текущая сортировка по году
  function displayOrder() {
    const arr = [...cardItems];
    arr.sort((a, b) =>
      sortDir === 'desc' ? Number(b.p.year) - Number(a.p.year) : Number(a.p.year) - Number(b.p.year)
    );
    return arr;
  }

  // видимость по фильтру + ритм широких карточек + перенумерация
  function applyVisibility(animate) {
    let di = 0;
    let pos = 0;
    displayOrder().forEach(({ el, p }) => {
      const show = currentCat === 'ALL' || p.cat === currentCat;
      el.classList.toggle('is-hidden', !show);
      el.classList.toggle('wide', show && viewMode === 'grid' && pos % 3 === 0);
      if (show) {
        el.querySelector('.work-idx').textContent = String(pos + 1).padStart(2, '0');
        if (animate) {
          gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, delay: di++ * 0.05, ease: 'power3.out' });
        }
        pos++;
      }
    });
    updateNote();
  }

  function applyOrder(animate = false) {
    displayOrder().forEach(({ el }) => grid.appendChild(el));
    applyVisibility(animate);
  }

  function updateNote() {
    if (!noteEl) return;
    const n = cardItems.filter(({ p }) => currentCat === 'ALL' || p.cat === currentCat).length;
    noteEl.innerHTML =
      `<span class="acc">${n} ${plural(n, 'works_count_1', 'works_count_2', 'works_count_5')}</span>` +
      ` · ${YEAR_MIN}—${YEAR_MAX} · <span class="works-concept">${t('works_concept')}</span>`;
  }

  filtersEl.addEventListener('click', (e) => {
    const b = e.target.closest('.works-filter');
    if (!b || b.classList.contains('on')) return;
    filtersEl.querySelectorAll('.works-filter').forEach((x) => {
      x.classList.toggle('on', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    currentCat = b.dataset.cat;
    hidePreview();
    applyVisibility(true);
    audio?.blip(980, 0.05, 0.03);
  });

  sortBtn.addEventListener('click', () => {
    sortDir = sortDir === 'desc' ? 'asc' : 'desc';
    hidePreview();
    applyOrder(false);
    refreshTools();
    audio?.blip(860, 0.05, 0.03);
  });

  function setView(mode) {
    if (viewMode === mode) return;
    viewMode = mode;
    grid.classList.toggle('is-list', mode === 'list');
    hidePreview();
    applyVisibility(false);
    refreshTools();
    try { localStorage.setItem(VIEW_KEY, mode); } catch (e) { /* noop */ }
    audio?.blip(1080, 0.05, 0.03);
  }
  listBtn.addEventListener('click', () => setView('list'));
  gridBtn.addEventListener('click', () => setView('grid'));

  // hover / tilt-вход / клик / клавиатура
  cardItems.forEach(({ item, el, p }, i) => {
    el.addEventListener('pointerenter', () => {
      if (item) item.hoverT = 1;
      showPreview(p, i * 1.7 + 0.3);
    });
    el.addEventListener('pointerleave', () => {
      if (item) { item.hoverT = 0; item.mx = 0; item.my = 0; }
      hidePreview();
    });
    el.addEventListener('pointermove', (e) => {
      if (!item) return;
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
        if (found && found.item) found.item.visible = en.isIntersecting;
      });
    }, { root: null, rootMargin: '10% 0px' });
    cardItems.forEach(({ el }) => io.observe(el));
  } else {
    cardItems.forEach(({ item }) => { if (item) item.visible = true; });
  }

  // перевод динамических частей
  onLang(() => {
    cardItems.forEach(({ el, p }, i) => {
      el.querySelector('.work-tags').innerHTML = p.tags[getLang()].map((x) => `<span>${x}</span>`).join('');
      el.setAttribute('aria-label', t('card_aria', { title: p.title }));
      el.querySelector('.work-view').textContent = t('card_view');
      if (!cards.ok && cardItems[i].item) drawFallbackCover(cardItems[i].item, i);
    });
    refreshFilterLabels();
    refreshTools();
    updateNote();
  });

  refreshFilterLabels();
  refreshTools();
  grid.classList.toggle('is-list', viewMode === 'list');
  applyOrder(false);

  return { cardItems };
}
