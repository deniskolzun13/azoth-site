// ============================================================
// AZOTH — точка входа. Сборка всех систем.
// ============================================================

import { gsap } from 'gsap';
import { BRAND, SERVICES, MARQUEE, PAGES, METRICA_ID, AVAILABILITY } from './config.js';
import { PROJECTS } from './data/projects.js';
import { t, getLang, setLang, plural, applyStatic, onLang } from './data/i18n.js';
import { GL } from './core/gl.js';
import { Cards } from './core/cards.js';
import { Cursor } from './core/cursor.js';
import { Router } from './core/router.js';
import { runPreloader } from './core/preloader.js';
import { Menu } from './ui/menu.js';
import { initContact, toast } from './ui/contact.js';
import { AudioFX } from './ui/audio.js';
import { initCalculator } from './ui/calculator.js';
import { initWorks } from './ui/works.js';
import { initCaseView } from './ui/caseView.js';
import { HUD } from './ui/hud.js';

const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Яндекс.Метрика (только если задан METRICA_ID) ----------
window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
window.ym.l = 1 * new Date();
const goal = (name) => {
  try { if (METRICA_ID && window.ym) window.ym(Number(METRICA_ID), 'reachGoal', name); } catch (e) { /* noop */ }
};
if (METRICA_ID) {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(s);
  window.ym(Number(METRICA_ID), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
}

// ---------- WebGL ----------
const gl = new GL(document.getElementById('gl'), {
  isMobile,
  reduced,
  onContextLost: () => toast(t('toast_gl_lost')),
  onContextRestored: () => toast(t('toast_gl_back')),
});
const cards = new Cards({ isMobile, reduced });

// короткая вибрация на мобильных для тактильного отклика
const buzz = (ms = 8) => {
  if (isMobile && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* noop */ } }
};

// ---------- hash / история: Back и Forward работают ----------
const pageHashOf = (i) => {
  const id = PAGES[i]?.id;
  return !id || id === 'home' ? '' : id;
};
const cleanUrl = (h) => {
  const clean = location.pathname + location.search;
  return h ? `${clean}#${h}` : clean;
};
function push(h) {
  try { history.pushState({ azoth: 1 }, '', cleanUrl(h)); } catch (e) { /* noop */ }
}
function replace(h) {
  try { history.replaceState({ azoth: 1 }, '', cleanUrl(h)); } catch (e) { /* noop */ }
}

// ---------- 3D-объект на «Услугах» (drag-вращение с инерцией) ----------
const obj3dItem = cards.ok
  ? cards.add(document.getElementById('obj3dCanvas'), { kind: 'mesh', vp: [640, 640], page: 'about' })
  : null;
if (obj3dItem) obj3dItem.visible = true; // tick() рисует только visible-элементы; у карточек это делает IntersectionObserver, здесь ставим сразу
if (obj3dItem) {
  const wrap3d = document.querySelector('.obj3d-wrap');
  let px3 = 0, py3 = 0;
  wrap3d.addEventListener('pointerdown', (e) => {
    cards.rot.dragging = true;
    px3 = e.clientX; py3 = e.clientY;
    wrap3d.setPointerCapture?.(e.pointerId);
  });
  wrap3d.addEventListener('pointermove', (e) => {
    if (!cards.rot.dragging) return;
    cards.rot.vy += (e.clientX - px3) * 0.00045;
    cards.rot.vx += (e.clientY - py3) * 0.00045;
    px3 = e.clientX; py3 = e.clientY;
  });
  const end3 = () => { cards.rot.dragging = false; };
  wrap3d.addEventListener('pointerup', end3);
  wrap3d.addEventListener('pointercancel', end3);
}

// ---------- Контент из данных ----------
// услуги
const svc = document.getElementById('servicesList');
function renderServices() {
  svc.innerHTML = '';
  SERVICES.forEach((s, i) => {
    const li = document.createElement('li');
    li.setAttribute('data-reveal', '');
    li.style.setProperty('--i', String(i + 1));
    li.innerHTML = `
      <span class="svc-idx">0${i + 1}</span>
      <div><h3>${s.name[getLang()]}</h3><p>${s.desc[getLang()]}</p></div>`;
    svc.appendChild(li);
  });
}
renderServices();

// бегущая строка
const track = document.getElementById('marqueeTrack');
const half = MARQUEE.map((m) => `<span>${m} ·</span>`).join('');
track.innerHTML = half + half;

// ---------- HUD / меню / контакт / курсор / звук ----------
const hud = new HUD(null);
const menu = new Menu({ router: null });
const cursor = new Cursor({ reduced });
const audio = new AudioFX();
initContact({ audio, goal });

// тумблер звука в HUD
const sndBtn = document.getElementById('sndBtn');
const sndLabel = () => {
  sndBtn.textContent = audio.enabled ? t('sound_on') : t('sound_off');
  sndBtn.classList.toggle('on', audio.enabled);
};
sndLabel();
sndBtn.addEventListener('click', () => {
  audio.setEnabled(!audio.enabled);
  sndLabel();
});

// переключатель языка (HUD + меню)
const langBtns = Array.from(document.querySelectorAll('.lang-btn'));
const langLabel = () => langBtns.forEach((b) => { b.textContent = getLang() === 'ru' ? 'EN' : 'RU'; });
langLabel();
langBtns.forEach((b) => b.addEventListener('click', () => {
  setLang(getLang() === 'ru' ? 'en' : 'ru');
  audio.blip(1200, 0.05, 0.03);
}));
// подписи кнопок-переключателей живут вне data-i18n — обновляем вручную
onLang(() => { langLabel(); sndLabel(); });

// тихий тик при наведении на кликабельное
let lastHover = null;
document.addEventListener('pointerover', (e) => {
  if (!audio.enabled) return;
  const x = e.target.closest('[data-cursor], a, button, .work-card');
  if (x && x !== lastHover) {
    lastHover = x;
    audio.blip(1350 + Math.random() * 300, 0.04, 0.02);
  }
  if (!x) lastHover = null;
});

// ---------- Работы (сетка + фильтры) ----------
const works = initWorks({
  cards,
  audio,
  onOpenCase: (i) => caseView.open(i),
});

// ---------- Кейс-вью ----------
const caseView = initCaseView({
  cards,
  audio,
  buzz,
  push,
  replace,
  goal,
  onChange: () => syncCardsActive(),
});

// ---------- Роутер ----------
const router = new Router({
  gl,
  hud,
  reduced,
  isBlocked: () => menu.isOpen || caseView.isOpen,
  onTransition: () => { audio.whoosh(); buzz(10); },
});
hud.router = router;
menu.router = router;

// syncCardsActive вызывается и из caseView.onChange — объявлена до первого открытия
function syncCardsActive() {
  cards.page = PAGES[router.current]?.id;
  cards.active = caseView.isOpen || cards.page === 'works' || cards.page === 'about';
}

// навигация с записью в историю: пользовательский переход — push,
// переход из popstate — silent (replace)
const _goTo = router.goTo.bind(router);
let pendingPop = null;
router.goTo = (i, opts = {}) => {
  if (router.transitioning) {
    if (opts.silent) { pendingPop = i; return; }
    _goTo(i, opts);
    return;
  }
  const before = router.current;
  _goTo(i, opts);
  if (router.current !== before) {
    if (opts.silent) replace(pageHashOf(router.current));
    else push(pageHashOf(router.current));
  }
};

// Back/Forward браузера: кейс открывается/закрывается, страницы листаются
window.addEventListener('popstate', () => {
  const h = location.hash.slice(1);
  if (h.startsWith('case-')) {
    const n = parseInt(h.slice(5), 10);
    if (Number.isNaN(n)) return;
    if (router.current !== 1) router.goTo(1, { silent: true });
    caseView.open(Math.max(0, Math.min(PROJECTS.length - 1, n - 1)), { pushHash: false });
  } else {
    if (caseView.isOpen) caseView.close({ pushHash: false });
    const idx = PAGES.findIndex((p) => p.id === h);
    const target = idx >= 0 ? idx : 0;
    if (router.current !== target) router.goTo(target, { silent: true });
  }
});

// ---------- Калькулятор стоимости (нужен готовый router) ----------
const calcApi = initCalculator({ router, audio, buzz, goal });

// навигация по data-go (кнопки, меню, карточные CTA)
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (!go) return;
  e.preventDefault();
  menu.close();
  if (caseView.isOpen) caseView.close({ pushHash: false });
  router.goTo(+go.dataset.go);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') caseView.close();
  if (caseView.isOpen && !menu.isOpen) {
    if (e.key === 'ArrowRight') { e.preventDefault(); caseView.nav(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); caseView.nav(-1); }
  }
  // presentation mode: H прячет весь HUD-хром (без модификаторов — не трогаем Ctrl+H)
  if (e.code === 'KeyH' && !e.ctrlKey && !e.metaKey && !e.altKey
      && !(e.target.closest && e.target.closest('input, textarea'))) {
    document.body.classList.toggle('hud-hidden');
    const hidden = document.body.classList.contains('hud-hidden');
    toast(hidden ? t('toast_hud_off') : t('toast_hud_on'));
    buzz(8);
  }
});

// страницы переключились → карточки активны только на «Работах», счётчики на «Услугах»
function runCounters() {
  document.querySelectorAll('#page-about .num').forEach((el) => {
    const raw = el.dataset.num || '';
    const m = raw.match(/^(.*?)(\d+)(.*)$/);
    if (!m) { el.textContent = raw; return; }
    const [, pre, digits, suf] = m;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: +digits,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = pre + String(Math.round(obj.v)).padStart(digits.length, '0') + suf;
      },
    });
  });
}

const _activate = router._activate.bind(router);
router._activate = (i) => {
  _activate(i);
  syncCardsActive();
  if (PAGES[i]?.id === 'about') runCounters();
  if (PAGES[i]?.id === 'calc') calcApi?.refresh();
  document.title = `${BRAND}® — ${PAGES[i].title[getLang()]}`;
  document.body.dataset.page = PAGES[i].id;
};
onLang(() => {
  if (router.current >= 0) document.title = `${BRAND}® — ${PAGES[router.current].title[getLang()]}`;
});

// ---------- Цикл ----------
let last = performance.now();
let running = true;
const progressEl = document.getElementById('scrollProgress');
const progressBar = progressEl?.querySelector('i');
const topBtn = document.getElementById('topBtn');

topBtn?.addEventListener('click', () => {
  router._scrollPage(0);
  audio.blip(900, 0.06, 0.03);
  buzz(6);
});

function loop(now) {
  requestAnimationFrame(loop);
  if (!running) { last = now; return; }
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  // отложенный popstate-переход, если в момент Back шла анимация
  if (pendingPop != null && !router.transitioning) {
    const p = pendingPop;
    pendingPop = null;
    if (p !== router.current) router.goTo(p, { silent: true });
  }

  router.raf(now);
  gl.tick(dt);
  cards.tick(dt, window.innerHeight);
  cursor.tick(dt);
  hud.fps();

  // прогресс скролла активной страницы + кнопка «наверх»
  const sc = router.scrollEl;
  if (sc && progressBar) {
    const max = sc.scrollHeight - sc.clientHeight;
    const p = max > 4 ? sc.scrollTop / max : 0;
    progressBar.style.transform = `scaleY(${p.toFixed(4)})`;
    progressEl.classList.toggle('on', p > 0.003);
    topBtn?.classList.toggle('show', sc.scrollTop > window.innerHeight * 1.2);
  } else if (progressEl) {
    progressEl.classList.remove('on');
    topBtn?.classList.remove('show');
  }
}
requestAnimationFrame(loop);

document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (gl.ok) gl.visible = running;
});

// ---------- Resize ----------
let rto = 0;
window.addEventListener('resize', () => {
  clearTimeout(rto);
  rto = setTimeout(() => {
    gl.resize();
    router.lenis?.resize();
  }, 120);
});

// ---------- Плашка доступности ----------
function renderAvail() {
  document.querySelectorAll('[data-avail]').forEach((el) => {
    if (!AVAILABILITY.free) { el.hidden = true; return; }
    const n = AVAILABILITY.slots;
    const span = el.querySelector('span');
    if (span) {
      span.textContent =
        `${t('avail_from')} ${AVAILABILITY.from[getLang()]} · ${n} ${plural(n, 'avail_slot_1', 'avail_slot_2', 'avail_slot_5')}`;
    }
    el.hidden = false;
  });
}
renderAvail();
onLang(renderAvail);

// ---------- Старт: hash (#works, #about, #case-3) открывает нужный экран ----------
const startHash = location.hash.slice(1);
let startIndex = 0;
let startCase = null;
if (startHash.startsWith('case-')) {
  startIndex = 1;
  const n = parseInt(startHash.slice(5), 10);
  if (!Number.isNaN(n)) startCase = n - 1;
} else {
  const hi = PAGES.findIndex((p) => p.id === startHash);
  if (hi >= 0) startIndex = hi;
}

router._activate(0); // стартовое состояние за прелоадером (без анимаций CSS — класс уже стоит)
document.querySelector('#page-home')?.classList.remove('is-active');
runPreloader({
  gl,
  router,
  reduced,
  startIndex,
  onReady: () => {
    if (startCase != null) {
      caseView.open(Math.max(0, Math.min(PROJECTS.length - 1, startCase)), { pushHash: false });
    }
  },
});

// бренд в шапке — из конфига
document.getElementById('brandName').innerHTML = `${BRAND}<sup>®</sup>`;

// статичные подписи по словарю (после того как все элементы в DOM)
applyStatic();
