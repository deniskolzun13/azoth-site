// ============================================================
// Калькулятор стоимости: тип сайта + группы опций →
// анимированная сумма, диапазон, срок, перенос конфигурации
// в форму заявки на «Контакте».
// ============================================================

import { gsap } from 'gsap';
import { PAGES } from '../config.js';
import { CALC } from '../data/calculator.js';
import { t, getLang, onLang } from '../data/i18n.js';
import { toast } from './contact.js';

const fmt = (n) => Math.round(n).toLocaleString('ru-RU');

export function initCalculator({ router, audio, buzz, goal } = {}) {
  const typesEl = document.getElementById('calcTypes');
  const groupsEl = document.getElementById('calcGroups');
  const sumEl = document.getElementById('calcSum');
  const rangeEl = document.getElementById('calcRange');
  const daysEl = document.getElementById('calcDays');
  const inclEl = document.getElementById('calcIncludes');
  const toFormBtn = document.getElementById('calcToForm');
  if (!typesEl || !groupsEl) return null;

  // state.sel: single → id опции, multi → массив id
  const state = { type: CALC.types[0].id, sel: {} };
  let shown = 0;
  let tween = null;
  let lastPickedLabels = [];
  let lastTotal = 0;
  let lastDays = '';
  let lastSpeed = '';

  // значения по умолчанию
  CALC.groups.forEach((g) => {
    const def = g.options.find((o) => o.def) || (g.single ? g.options[0] : null);
    if (def) state.sel[g.id] = g.single ? def.id : [];
  });

  const typeById = () => CALC.types.find((x) => x.id === state.type);
  const visibleGroups = () => CALC.groups.filter((g) => !g.only || g.only.includes(state.type));
  const optionById = (gid, oid) => CALC.groups.find((g) => g.id === gid)?.options.find((o) => o.id === oid);

  function renderTypes() {
    typesEl.innerHTML = '';
    CALC.types.forEach((x) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'calc-type' + (x.id === state.type ? ' on' : '');
      b.dataset.cursor = 'link';
      b.dataset.t = x.id;
      b.setAttribute('aria-pressed', String(x.id === state.type));
      b.innerHTML =
        `<span class="calc-type-name">${x.label[getLang()]}</span>` +
        `<span class="mono">${t('calc_from', { p: fmt(x.price) })}</span>`;
      b.addEventListener('click', () => {
        if (state.type === x.id) return;
        state.type = x.id;
        audio?.blip(760, 0.06, 0.035);
        buzz?.(6);
        renderTypes();
        renderGroups();
        update(true);
        typesEl.querySelector(`[data-t="${x.id}"]`)?.focus({ preventScroll: true });
      });
      typesEl.appendChild(b);
    });
  }

  function renderGroups() {
    groupsEl.innerHTML = '';
    visibleGroups().forEach((g, gi) => {
      const multi = !g.single;
      const cur = state.sel[g.id];

      const wrap = document.createElement('div');
      wrap.className = 'calc-group';
      const head = document.createElement('p');
      head.className = 'mono calc-label';
      head.textContent = `${String(gi + 2).padStart(2, '0')} // ${g.label[getLang()]}${multi ? ` ${t('calc_multi')}` : ''}`;
      wrap.appendChild(head);

      const box = document.createElement('div');
      box.className = 'calc-chips';
      g.options.forEach((o) => {
        const on = multi ? (cur || []).includes(o.id) : cur === o.id;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'calc-chip mono' + (on ? ' on' : '');
        b.dataset.cursor = 'link';
        b.dataset.g = g.id;
        b.dataset.o = o.id;
        b.setAttribute('aria-pressed', String(on));
        const priceTxt = o.factor
          ? (o.factor > 1 ? `×${o.factor}` : '')
          : (o.price ? `+${fmt(o.price)}` : '');
        b.innerHTML = `${o.label[getLang()]}<i>${priceTxt}</i>`;
        b.addEventListener('click', () => {
          if (multi) {
            const arr = state.sel[g.id] || [];
            const idx = arr.indexOf(o.id);
            if (idx >= 0) arr.splice(idx, 1); else arr.push(o.id);
            state.sel[g.id] = arr;
            b.classList.toggle('on', arr.includes(o.id));
            b.setAttribute('aria-pressed', String(arr.includes(o.id)));
            audio?.blip(1050, 0.045, 0.026);
            update(true);
          } else {
            if (state.sel[g.id] === o.id) return;
            state.sel[g.id] = o.id;
            // перерисовать группу: подсветка уходит со старой опции
            renderGroups();
            audio?.blip(1050, 0.045, 0.026);
            update(true);
            groupsEl.querySelector(`[data-g="${g.id}"][data-o="${o.id}"]`)?.focus({ preventScroll: true });
          }
        });
        box.appendChild(b);
      });

      wrap.appendChild(box);
      groupsEl.appendChild(wrap);
    });
  }

  function update(animate) {
    const x = typeById();
    let sum = x.price;
    let dmin = x.days[0];
    let dmax = x.days[1];
    const pickedLabels = [];

    visibleGroups().forEach((g) => {
      if (g.id === 'speed') return; // срочность — модификатор цены, не «включение»
      const cur = state.sel[g.id];
      if (g.single) {
        const o = g.options.find((q) => q.id === cur);
        if (!o) return;
        sum += o.price || 0;
        dmin += o.days || 0;
        dmax += o.days || 0;
        if (!o.def) pickedLabels.push(o.label[getLang()]);
      } else {
        (cur || []).forEach((oid) => {
          const o = g.options.find((q) => q.id === oid);
          if (!o) return;
          sum += o.price || 0;
          dmin += o.days || 0;
          dmax += o.days || 0;
          pickedLabels.push(o.label[getLang()]);
        });
      }
    });

    // множитель цены от одиночных групп: редизайн ×0.85, срочность ×1.25–1.5
    let factor = 1;
    visibleGroups().forEach((g) => {
      if (!g.single || g.id === 'speed') return; // срочность учтена ниже
      const o = g.options.find((q) => q.id === state.sel[g.id]);
      if (o?.factor) factor *= o.factor;
    });
    const speedOpt = optionById('speed', state.sel.speed);
    const speedFactor = speedOpt?.factor || 1;
    const speedLabel = speedOpt && speedFactor > 1 ? speedOpt.label[getLang()] : '';
    factor *= speedFactor;

    const total = Math.round((sum * factor) / 1000) * 1000;
    const lo = Math.round((total * 0.9) / 1000) * 1000;
    const hi = Math.round((total * 1.15) / 1000) * 1000;
    const tf = speedOpt?.tf || 1; // срочность сжимает срок
    dmin = Math.max(1, Math.round(dmin * tf));
    dmax = Math.max(2, Math.round(dmax * tf));

    lastPickedLabels = pickedLabels;
    lastTotal = total;
    lastSpeed = speedLabel;
    lastDays = dmin === dmax
      ? `${dmin} ${t('calc_weeks')}`
      : `${dmin}–${dmax} ${t('calc_weeks')}`;
    rangeEl.textContent = t('calc_range', { a: fmt(lo), b: fmt(hi) });
    daysEl.textContent = t('calc_days', { d: lastDays });
    inclEl.innerHTML = pickedLabels.length
      ? pickedLabels.map((p) => `<li>${p}</li>`).join('')
      : `<li>${t('calc_base')}</li>`;

    const set = (v) => { sumEl.textContent = `${fmt(v)} ₽`; };
    if (tween) tween.kill();
    if (animate) {
      const obj = { v: shown };
      tween = gsap.to(obj, {
        v: total,
        duration: 0.7,
        ease: 'power2.out',
        onUpdate: () => { shown = obj.v; set(obj.v); },
      });
    } else {
      shown = total;
      set(total);
    }
  }

  // перенос конфигурации в форму на «Контакте»
  toFormBtn?.addEventListener('click', () => {
    const x = typeById();
    const contactIdx = Math.max(0, PAGES.findIndex((p) => p.id === 'contact'));
    const form = document.getElementById('leadForm');
    const result = document.getElementById('leadResult');
    const sent = document.getElementById('leadSent');
    const taskEl = form?.querySelector('textarea[name=task]');

    const text =
      `${t('brief_head')}\n` +
      `${t('brief_type')} ${x.label[getLang()]}\n` +
      `${t('brief_opts')} ${lastPickedLabels.length ? lastPickedLabels.join('; ') : t('calc_base')}\n` +
      `${t('brief_budget')} ${fmt(lastTotal)} ₽, ${t('brief_deadline')}${lastDays}${lastSpeed ? `, ${lastSpeed}` : ''}`;

    if (form && taskEl) {
      if (result && !result.hidden) { result.hidden = true; form.hidden = false; }
      if (sent) sent.hidden = true;
      taskEl.value = text;
    }
    router?.goTo(contactIdx);
    audio?.blip(1200, 0.08, 0.04);
    buzz?.(10);
    goal?.('calc_to_form');
    setTimeout(() => {
      toast(t('toast_calc'));
      form?.querySelector('input[name=name]')?.focus?.();
    }, 1100);
  });

  renderTypes();
  renderGroups();
  update(false);

  // перевод динамических частей + пересчёт
  onLang(() => {
    renderTypes();
    renderGroups();
    update(false);
  });

  // при заходе на страницу — сумма «отсчитывается» заново
  return {
    refresh: () => { shown = 0; update(true); },
  };
}
