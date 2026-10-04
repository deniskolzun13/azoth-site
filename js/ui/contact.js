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

  document.getElementById('leadAgain')?.addEventListener('click', () => {
    showPanel('form');
    form?.reset();
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
