// ============================================================
// Контакт: копирование почты, форма заявки.
// Если в config.js задан LEAD_API (Cloudflare Worker — см.
// worker/README.md), заявка улетает в Telegram автоматически.
// Иначе — текст для отправки вручную + mailto-фолбэк.
// ============================================================

import { CONTACTS, BRAND, LEAD_API } from '../config.js';
import { t, getLang } from '../data/i18n.js';

let toastTimer = 0;
export function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { /* noop */ }
    ta.remove();
    return ok;
  }
}

function buildLeadText(name, contact, task) {
  return (
    `${t('lead_head')} ${BRAND}\n` +
    `———————————\n` +
    `${t('lead_name')}: ${name}\n` +
    `${t('lead_contact')}: ${contact}\n` +
    `${t('lead_task')}: ${task}`
  );
}

export function initContact({ audio, goal } = {}) {
  // контакты из конфига
  const set = (id, attr, val) => {
    const el = document.getElementById(id);
    if (el) el[attr] = val;
  };
  set('tgLink', 'href', CONTACTS.telegramUrl);
  set('leadTg', 'href', CONTACTS.telegramUrl);
  set('menuTg', 'href', CONTACTS.telegramUrl);
  set('menuMail', 'href', `mailto:${CONTACTS.email}`);
  set('footEmail', 'textContent', CONTACTS.email);
  set('footTg', 'textContent', CONTACTS.telegramUser);
  set('copyEmail', 'textContent', CONTACTS.email);
  set('menuMail', 'textContent', CONTACTS.email);

  document.getElementById('copyEmail')?.addEventListener('click', async () => {
    const ok = await copyText(CONTACTS.email);
    toast(ok ? t('toast_copy_ok') : t('toast_copy_fail'));
  });

  const form = document.getElementById('leadForm');
  const result = document.getElementById('leadResult');
  const sent = document.getElementById('leadSent');
  const leadText = document.getElementById('leadText');
  const submitBtn = form?.querySelector('button[type=submit]');

  const showPanel = (which) => {
    if (!form) return;
    form.hidden = which !== 'form';
    if (result) result.hidden = which !== 'result';
    if (sent) sent.hidden = which !== 'sent';
  };

  const DRAFT_KEY = 'azoth_lead_draft';
  const nameInput = form?.querySelector('input[name=name]');
  const contactInput = form?.querySelector('input[name=contact]');
  const taskInput = form?.querySelector('textarea[name=task]');

  function saveDraft() {
    if (!form) return;
    try {
      const draft = {
        name: nameInput?.value || '',
        contact: contactInput?.value || '',
        task: taskInput?.value || '',
      };
      if (draft.name || draft.contact || draft.task) {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } else {
        sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch (_) { /* noop */ }
  }

  function loadDraft() {
    if (!form) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.name && nameInput && !nameInput.value) nameInput.value = draft.name;
        if (draft.contact && contactInput && !contactInput.value) contactInput.value = draft.contact;
        if (draft.task && taskInput && !taskInput.value) taskInput.value = draft.task;
      }
    } catch (_) { /* noop */ }
  }

  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) { /* noop */ }
  }

  form?.addEventListener('input', saveDraft);
  loadDraft();

  // интеллектуальная подсказка формата контакта при потере фокуса
  contactInput?.addEventListener('blur', () => {
    const val = contactInput.value.trim();
    if (!val) return;
    const isTg = /^@?[a-zA-Z0-9_]{4,}$/.test(val) || val.includes('t.me/');
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
    const digits = val.replace(/\D/g, '');
    const isPhone = digits.length >= 10 && digits.length <= 15;
    if (!isTg && !isEmail && !isPhone) {
      toast(t('toast_contact_hint'));
    }
  });

  document.getElementById('leadAgain')?.addEventListener('click', () => {
    showPanel('form');
    form?.reset();
    clearDraft();
    form?.querySelector('input[name=name]')?.focus();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const contact = (fd.get('contact') || '').toString().trim();
    const task = (fd.get('task') || '').toString().trim();
    const honeypot = (fd.get('company') || '').toString();
    if (!name || !contact || !task) return;

    // боты заполняют скрытое поле — делаем вид, что всё отправилось
    if (honeypot) {
      showPanel('sent');
      clearDraft();
      form.reset();
      return;
    }

    // 1) есть эндпоинт — отправляем на Cloudflare Worker
    if (LEAD_API) {
      const label = submitBtn?.querySelector('span') || submitBtn;
      const oldLabel = label.textContent;
      if (submitBtn) submitBtn.disabled = true;
      if (label) label.textContent = t('btn_sending');
      try {
        const res = await fetch(LEAD_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, contact, task, company: honeypot,
            meta: { lang: getLang(), page: location.hash || '#contact' },
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        showPanel('sent');
        toast(t('toast_sent'));
        goal?.('lead_sent');
        clearDraft();
        form.reset();
      } catch (err) {
        // не ушло — отдаём текст вручную
        if (leadText) leadText.value = buildLeadText(name, contact, task);
        setMailto();
        showPanel('result');
        toast(t('toast_sent_fail'));
        goal?.('lead_fail');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (label) label.textContent = oldLabel;
      }
      return;
    }

    // 2) без бэкенда — собираем текст для Telegram / почты
    if (leadText) leadText.value = buildLeadText(name, contact, task);
    setMailto();
    showPanel('result');
    toast(t('toast_built'));
    goal?.('lead_built');
    leadText?.focus();
    leadText?.select();
  });

  // mailto-фолбэк: письмо с готовым текстом заявки
  function setMailto() {
    const el = document.getElementById('leadMail');
    if (!el || !leadText) return;
    const subject = `${t('lead_subject')} — ${BRAND}`;
    el.href = `mailto:${CONTACTS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(leadText.value)}`;
  }

  document.getElementById('leadCopy')?.addEventListener('click', async () => {
    const ok = await copyText(leadText?.value || '');
    toast(ok ? t('toast_copied') : t('toast_copy_hint'));
  });
}
