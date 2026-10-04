// ============================================================
// AZOTH lead worker — приём заявок с сайта и пересылка в Telegram.
// Деплой: см. README.md рядом.
// ============================================================

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

// экранирование для parse_mode=HTML
const esc = (s) => s
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ ok: false, error: 'not configured' }, 500);
    }

    let data;
    try { data = await request.json(); } catch (e) { return json({ ok: false, error: 'json' }, 400); }

    const name = clean(data.name, 100);
    const contact = clean(data.contact, 200);
    const task = String(data.task ?? '').trim().slice(0, 3000);
    const meta = clean(data.meta, 300);

    if (!name || !contact || !task) return json({ ok: false, error: 'fields' }, 400);

    // honeypot: бот заполнил скрытое поле — делаем вид, что всё ушло
    if (clean(data.company, 50)) return json({ ok: true });

    const lines = [
      '<b>Заявка с сайта AZOTH</b>',
      '',
      `<b>Имя:</b> ${esc(name)}`,
      `<b>Контакт:</b> ${esc(contact)}`,
      `<b>Задача:</b> ${esc(task)}`,
    ];
    if (meta) lines.push('', `<i>${esc(meta)}</i>`);

    let res;
    try {
      res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: lines.join('\n'),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
    } catch (e) {
      return json({ ok: false, error: 'telegram unreachable' }, 502);
    }

    if (!res.ok) return json({ ok: false, error: 'telegram' }, 502);
    return json({ ok: true });
  },
};
