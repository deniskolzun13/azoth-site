// ============================================================
// i18n: словарь RU/EN + применение к статичной разметке.
// Статика: data-i18n (текст), data-i18n-html (innerHTML),
// data-i18n-ph (placeholder), data-i18n-aria (aria-label),
// data-i18n-title (title), data-i18n-dt (textContent + data-text).
// Динамические модули подписываются через onLang и перерисовываются.
// ============================================================

const STORAGE_KEY = 'azoth-lang';

export const DICT = {
  // ---------- навигация / HUD ----------
  nav_home:      { ru: 'ГЛАВНАЯ',   en: 'HOME' },
  nav_works:     { ru: 'РАБОТЫ',    en: 'WORKS' },
  nav_about:     { ru: 'УСЛУГИ',    en: 'SERVICES' },
  nav_calc:      { ru: 'КАЛЬКУЛЯТОР', en: 'CALCULATOR' },
  nav_contact:   { ru: 'КОНТАКТ',   en: 'CONTACT' },
  menu_btn:      { ru: 'МЕНЮ',      en: 'MENU' },
  sound_on:      { ru: 'ЗВУК ВКЛ',  en: 'SOUND ON' },
  sound_off:     { ru: 'ЗВУК ВЫКЛ', en: 'SOUND OFF' },
  hint_scroll:   { ru: 'SCROLL / ↓', en: 'SCROLL / ↓' },
  hint_final:    { ru: 'ФИНАЛ · ↑',  en: 'FINAL · ↑' },
  top_btn:       { ru: '↑ НАВЕРХ',   en: '↑ TOP' },
  hud_side:      { ru: 'CREATIVE DEVELOPER — WEBGL — 2026', en: 'CREATIVE DEVELOPER — WEBGL — 2026' },
  arr_prev:      { ru: 'Назад',   en: 'Previous' },
  arr_next:      { ru: 'Вперёд',  en: 'Next' },

  // ---------- прелоадер ----------
  pre_sub:            { ru: '// СОБИРАЮ СЦЕНУ ИЗ ШУМА',            en: '// ASSEMBLING THE SCENE FROM NOISE' },
  pre_label_init:     { ru: 'ИНИЦИАЛИЗАЦИЯ',                        en: 'INITIALIZING' },
  pre_label_particles:{ ru: '// СОБИРАЮ ЗНАК ИЗ ЧАСТИЦ',            en: '// ASSEMBLING THE MARK FROM PARTICLES' },
  pre_label_scene:    { ru: '// ПРОЯВЛЯЮ СЦЕНУ',                    en: '// REVEALING THE SCENE' },
  pre_label_launch:   { ru: 'ЗАПУСК',                               en: 'LAUNCH' },

  // ---------- главная ----------
  home_overline: { ru: '// CREATIVE-РАЗРАБОТКА · WEBGL · ФРИЛАНС', en: '// CREATIVE DEVELOPMENT · WEBGL · FREELANCE' },
  hero_l1:       { ru: 'ДЕЛАЮ САЙТЫ,',   en: 'I BUILD WEBSITES' },
  hero_l2:       { ru: 'КОТОРЫЕ',        en: 'PEOPLE' },
  hero_l3:       { ru: 'ЗАПОМИНАЮТСЯ',   en: 'REMEMBER' },
  home_sub:      { ru: 'Лендинги, магазины и корпоративные сайты с 3D-эффектами уровня Awwwards. От идеи до запуска — один разработчик, полный контроль качества.',
                   en: 'Landing pages, online stores and corporate sites with Awwwards-grade 3D. From idea to launch — one developer, full quality control.' },
  cta_discuss:   { ru: 'ОБСУДИТЬ ПРОЕКТ', en: 'DISCUSS A PROJECT' },
  cta_calc:      { ru: 'ПОСЧИТАТЬ ЦЕНУ',  en: 'ESTIMATE THE COST' },
  home_stat1:    { ru: '07 ЛЕТ В РАЗРАБОТКЕ', en: '07 YEARS IN DEV' },
  home_stat2:    { ru: '40+ ПРОЕКТОВ',        en: '40+ PROJECTS' },
  avail_now:     { ru: 'СВОБОДЕН СЕЙЧАС', en: 'AVAILABLE NOW' },
  avail_from:    { ru: 'СВОБОДЕН С',   en: 'OPEN FROM' },
  avail_slot_1:  { ru: 'СЛОТ В МЕСЯЦ', en: 'SLOT A MONTH' },
  avail_slot_2:  { ru: 'СЛОТА В МЕСЯЦ', en: 'SLOTS A MONTH' },
  avail_slot_5:  { ru: 'СЛОТОВ В МЕСЯЦ', en: 'SLOTS A MONTH' },

  // ---------- работы ----------
  works_overline:  { ru: '02 // ИЗБРАННЫЕ ПРОЕКТЫ', en: '02 // SELECTED PROJECTS' },
  works_title_html:{ ru: 'РА<span class="outline">БО</span>ТЫ', en: 'W<span class="outline">O</span>RKS' },
  works_concept:   { ru: 'РАБОЧИЕ ДЕМО', en: 'LIVE DEMOS' },
  works_count_1:   { ru: 'ПРОЕКТ',  en: 'PROJECT' },
  works_count_2:   { ru: 'ПРОЕКТА', en: 'PROJECTS' },
  works_count_5:   { ru: 'ПРОЕКТОВ', en: 'PROJECTS' },
  filter_all:      { ru: 'ВСЕ', en: 'ALL' },
  works_view_grid: { ru: 'СЕТКА', en: 'GRID' },
  works_view_list: { ru: 'СПИСОК', en: 'LIST' },
  works_sort_year: { ru: 'ГОД', en: 'YEAR' },
  works_sort_aria: { ru: 'Сортировать по году', en: 'Sort by year' },
  works_foot_note: { ru: 'КАЖДЫЙ ПРОЕКТ — ЖИВОЙ ДЕМО-САЙТ: ОТКРЫВАЙ И ЛИСТАЙ', en: 'EVERY PROJECT IS A LIVE DEMO SITE — OPEN AND EXPLORE' },
  works_foot_cta:  { ru: 'ХОЧУ ТАК ЖЕ →', en: 'I WANT THE SAME →' },
  card_view:       { ru: 'СМОТРЕТЬ КЕЙС +', en: 'VIEW CASE +' },
  card_aria:       { ru: 'Открыть кейс: {title}', en: 'Open case: {title}' },

  // ---------- кейс-вью ----------
  case_tag:        { ru: 'РАБОЧЕЕ ДЕМО', en: 'LIVE DEMO' },
  case_demo:       { ru: '↗ ОТКРЫТЬ САЙТ', en: '↗ OPEN SITE' },
  case_demo_title: { ru: 'Открыть демо-сайт проекта в новой вкладке', en: 'Open the project demo site in a new tab' },
  case_close:      { ru: 'ЗАКРЫТЬ ✕', en: 'CLOSE ✕' },
  case_prev:       { ru: '← ПРЕД', en: '← PREV' },
  case_next:       { ru: 'СЛЕД →', en: 'NEXT →' },
  case_share:      { ru: '⧉ ССЫЛКА', en: '⧉ LINK' },
  case_share_title:{ ru: 'Скопировать ссылку на этот кейс', en: 'Copy a link to this case' },
  case_cta:        { ru: 'ХОЧУ ТАК ЖЕ', en: 'I WANT THE SAME' },
  case_shot_aria:  { ru: 'Кадр {n}', en: 'Frame {n}' },
  case_task:       { ru: 'ЗАДАЧА', en: 'THE TASK' },
  case_solution:   { ru: 'РЕШЕНИЕ', en: 'THE SOLUTION' },
  case_stack:      { ru: 'СТЕК', en: 'STACK' },
  case_facts_role: { ru: 'РОЛЬ', en: 'ROLE' },
  case_facts_time: { ru: 'СРОК', en: 'TIMELINE' },
  case_facts_client:{ ru: 'КЛИЕНТ', en: 'CLIENT' },
  case_similar:    { ru: 'ПОХОЖИЕ ПРОЕКТЫ', en: 'RELATED PROJECTS' },
  case_zoom:       { ru: '⤢ НА ВЕСЬ ЭКРАН', en: '⤢ FULLSCREEN' },
  case_zoom_title: { ru: 'Открыть кадр на весь экран', en: 'Open the frame fullscreen' },
  case_sim_aria:   { ru: 'Открыть кейс: {title}', en: 'Open case: {title}' },
  toast_case_url:  { ru: 'ССЫЛКА НА КЕЙС СКОПИРОВАНА', en: 'CASE LINK COPIED' },

  // ---------- услуги ----------
  about_overline:   { ru: '03 // УСЛУГИ И ПОДХОД', en: '03 // SERVICES & APPROACH' },
  about_title_html: { ru: 'ЧТО Я <span class="accent">ДЕЛАЮ</span>', en: 'WHAT I <span class="accent">DO</span>' },
  obj3d_hint:       { ru: '// 3D В БРАУЗЕРЕ — ТЯНИ, ЧТОБЫ ВРАЩАТЬ', en: '// 3D IN THE BROWSER — DRAG TO SPIN' },
  obj3d_aria:       { ru: 'Интерактивная 3D-сцена — потяните, чтобы вращать', en: 'Interactive 3D scene — drag to spin' },
  obj3d_cursor:     { ru: 'КРУТИ', en: 'SPIN' },
  approach_title:   { ru: '// ПОДХОД', en: '// APPROACH' },
  approach_body:    { ru: 'Сначала смысл, потом эффекты. Каждый экран работает на доверие: быстрая загрузка, читаемый текст, честные сроки. Разработка — от двух недель, этапы прозрачные, правки — без сюрпризов.',
                      en: 'Meaning first, effects second. Every screen is built for trust: fast load, readable text, honest deadlines. Two weeks minimum, transparent stages, no surprise reworks.' },
  stat1_label:      { ru: 'ЛЕТ В РАЗРАБОТКЕ', en: 'YEARS IN DEV' },
  stat2_label:      { ru: 'ПРОЕКТОВ ЗАПУЩЕНО', en: 'PROJECTS SHIPPED' },
  stat3_label:      { ru: 'КЛИЕНТОВ ВОЗВРАЩАЮТСЯ', en: 'CLIENTS COME BACK' },
  q1_body: { ru: '«Сделал за три недели то, что предыдущий подрядчик не мог собрать год. Эффекты — как у студий с прайсом х10.»',
             en: '‘Shipped in three weeks what the previous contractor could not put together for a year. Effects on par with studios charging 10x.’' },
  q1_who:  { ru: '— МАРАТ, РЕСТОРАН «СОЛЬ»', en: '— MARAT, SALT RESTAURANT' },
  q2_body: { ru: '«Впервые магазин не тормозит на айфоне. Конверсия выросла с первого месяца.»',
             en: '‘First store that does not lag on an iPhone. Conversion grew from the very first month.’' },
  q2_who:  { ru: '— КАТЯ, МАСТЕРСКАЯ «ФОРМА»', en: '— KATE, FORMA WORKSHOP' },
  q3_body: { ru: '«Просто скинул ТЗ и забыл. Сроки, правки, запуск — всё как обещал.»',
             en: '‘I just sent the brief and forgot about it. Deadlines, edits, launch — everything as promised.’' },
  q3_who:  { ru: '— АРТЁМ, СЕТЬ «ПУЛЬС»', en: '— ARTEM, PULSE GYMS' },

  // ---------- калькулятор ----------
  calc_overline:  { ru: '04 // КАЛЬКУЛЯТОР СТОИМОСТИ', en: '04 // COST CALCULATOR' },
  calc_t1:        { ru: 'ПОСЧИТАЙ',  en: 'ESTIMATE' },
  calc_t2:        { ru: 'СВОЙ САЙТ', en: 'YOUR SITE' },
  calc_note:      { ru: 'ВЫБЕРИ СФЕРУ БИЗНЕСА — И ПОРЯДОК ЦЕН НА ЭКРАНЕ · ТОЧНАЯ СМЕТА ПОСЛЕ БРИФА',
                    en: 'PICK YOUR BUSINESS FIELD — AND A PRICE RANGE ON SCREEN · EXACT QUOTE AFTER THE BRIEF' },
  calc_label_type:{ ru: '01 // СФЕРА БИЗНЕСА', en: '01 // YOUR BUSINESS' },
  calc_from:      { ru: 'ОТ {p} ₽', en: 'FROM {p} ₽' },
  calc_multi:     { ru: '· МОЖНО НЕСКОЛЬКО', en: '· PICK ANY' },
  calc_total_head:{ ru: '// ПРИМЕРНАЯ СТОИМОСТЬ', en: '// ESTIMATED COST' },
  calc_range:     { ru: 'ДИАПАЗОН: {a} – {b} ₽', en: 'RANGE: {a} – {b} ₽' },
  calc_days:      { ru: 'СРОК: ~{d}', en: 'TIMELINE: ~{d}' },
  calc_weeks:     { ru: 'НЕД.', en: 'WKS' },
  calc_base:      { ru: 'БАЗОВАЯ КОМПЛЕКТАЦИЯ', en: 'BASE PACKAGE' },
  calc_to_form:   { ru: 'ПЕРЕНОС В ЗАЯВКУ', en: 'MOVE TO THE FORM' },
  calc_note2:     { ru: 'ОЦЕНКА ±15% · ФИНАЛЬНАЯ ЦЕНА ФИКСИРУЕТСЯ В ДОГОВОРЕ', en: 'ESTIMATE ±15% · FINAL PRICE IS FIXED IN THE CONTRACT' },

  // ---------- контакт ----------
  contact_overline: { ru: '05 // КОНТАКТ', en: '05 // CONTACT' },
  contact_t1:       { ru: 'ОБСУДИМ',  en: 'GOT A' },
  contact_t2:       { ru: 'ПРОЕКТ?',  en: 'PROJECT?' },
  contact_sub:      { ru: 'Опишите задачу — вернусь с планом и оценкой в течение дня. Средний отклик — два часа.',
                      en: 'Describe the task — I will come back with a plan and an estimate within a day. Average response time — two hours.' },
  step1: { ru: 'БРИФ',      en: 'BRIEF' },
  step2: { ru: 'ПРОТОТИП',  en: 'PROTOTYPE' },
  step3: { ru: 'РАЗРАБОТКА', en: 'BUILD' },
  step4: { ru: 'ЗАПУСК',    en: 'LAUNCH' },
  foot_reply: { ru: 'ОТВЕЧАЮ 10:00—22:00 МСК', en: 'I REPLY 10:00—22:00 MSK' },
  f_name:     { ru: 'ИМЯ',     en: 'NAME' },
  f_contact:  { ru: 'КОНТАКТ', en: 'CONTACT' },
  f_task:     { ru: 'ЗАДАЧА',  en: 'THE TASK' },
  ph_name:    { ru: 'Как к вам обращаться', en: 'What should I call you' },
  ph_contact: { ru: '@telegram или e-mail', en: '@telegram or e-mail' },
  ph_task:    { ru: 'Например: нужен лендинг для запуска продукта, с 3D-сценой на первом экране',
                en: 'For example: a landing page for a product launch, with a 3D scene above the fold' },
  btn_submit: { ru: 'СОБРАТЬ ЗАЯВКУ', en: 'BUILD THE REQUEST' },
  btn_sending:{ ru: 'ОТПРАВЛЯЮ…',     en: 'SENDING…' },
  form_note:  { ru: 'БЕЗ БЭКЕНДА: ЗАЯВКА СОБЕРЁТСЯ В ТЕКСТ — ОТПРАВЬТЕ В TELEGRAM ИЛИ СКОПИРУЙТЕ',
                en: 'NO BACKEND: THE REQUEST BECOMES TEXT — SEND IT VIA TELEGRAM OR COPY IT' },
  lead_ready: { ru: '// ЗАЯВКА ГОТОВА — ОТПРАВЬТЕ ЕЁ МНЕ', en: '// REQUEST READY — SEND IT TO ME' },
  btn_copy:   { ru: 'СКОПИРОВАТЬ', en: 'COPY' },
  btn_open_tg:{ ru: 'ОТКРЫТЬ TELEGRAM', en: 'OPEN TELEGRAM' },
  btn_mail:   { ru: 'ОТПРАВИТЬ НА ПОЧТУ', en: 'SEND BY EMAIL' },
  lead_sent:  { ru: '// ЗАЯВКА ОТПРАВЛЕНА — ОТВЕЧУ В ТЕЧЕНИЕ ДНЯ', en: '// REQUEST SENT — I WILL REPLY WITHIN A DAY' },
  btn_again:  { ru: 'НОВАЯ ЗАЯВКА', en: 'NEW REQUEST' },

  // ---------- тосты ----------
  toast_copy_ok:   { ru: 'ПОЧТА СКОПИРОВАНА', en: 'EMAIL COPIED' },
  toast_copy_fail: { ru: 'НЕ УДАЛОСЬ СКОПИРОВАТЬ', en: 'COPY FAILED' },
  toast_built:     { ru: 'ЗАЯВКА СОБРАНА — ОСТАЛОСЬ ОТПРАВИТЬ', en: 'REQUEST BUILT — SEND IT OVER' },
  toast_sent:      { ru: 'ЗАЯВКА ОТПРАВЛЕНА', en: 'REQUEST SENT' },
  toast_sent_fail: { ru: 'НЕ ОТПРАВИЛОСЬ — СКОПИРУЙТЕ ТЕКСТ', en: 'COULD NOT SEND — COPY THE TEXT' },
  toast_copied:    { ru: 'СКОПИРОВАНО', en: 'COPIED' },
  toast_copy_hint: { ru: 'СКОПИРУЙТЕ ВРУЧНУЮ ИЗ ПОЛЯ', en: 'COPY IT MANUALLY FROM THE FIELD' },
  toast_calc:      { ru: 'КОНФИГУРАЦИЯ В ЗАЯВКЕ — ОСТАЛОСЬ КОНТАКТЫ', en: 'CONFIG IS IN THE REQUEST — JUST ADD CONTACTS' },
  toast_hud_off:   { ru: 'HUD СКРЫТ — H ВЕРНЁТ ИНТЕРФЕЙС', en: 'HUD HIDDEN — H BRINGS IT BACK' },
  toast_hud_on:    { ru: 'ИНТЕРФЕЙС НА МЕСТЕ', en: 'INTERFACE IS BACK' },
  toast_gl_lost:   { ru: 'ГРАФИКА ПЕРЕЗАПУСКАЕТСЯ…', en: 'GRAPHICS RESTARTING…' },
  toast_gl_back:   { ru: 'ГРАФИКА СНОВА В СТРОЮ', en: 'GRAPHICS BACK ONLINE' },

  // ---------- письмо-заявка ----------
  lead_head:    { ru: 'Заявка с сайта', en: 'Request from the site' },
  lead_name:    { ru: 'Имя',     en: 'Name' },
  lead_contact: { ru: 'Контакт', en: 'Contact' },
  lead_task:    { ru: 'Задача',  en: 'Task' },
  lead_subject: { ru: 'Заявка с сайта', en: 'Request from the site' },

  // ---------- перенос из калькулятора ----------
  brief_head:   { ru: 'Прикидка с калькулятора:', en: 'Calculator estimate:' },
  brief_type:   { ru: '— Сфера:',      en: '— Business:' },
  brief_opts:   { ru: '— Опции:',    en: '— Options:' },
  brief_budget: { ru: '— Ориентир:', en: '— Estimate:' },
  brief_deadline:{ ru: 'срок ~',     en: 'timeline ~' },

  // ---------- меню ----------
  menu_note: { ru: '© 2026 — СДЕЛАНО НА WEBGL', en: '© 2026 — MADE WITH WEBGL' },
  nojs:      { ru: 'Включите JavaScript — сайт построен на WebGL.', en: 'Enable JavaScript — this site is built on WebGL.' },
};

let lang = 'ru';
try { lang = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ru'; } catch (e) { /* noop */ }

const listeners = new Set();

export function getLang() { return lang; }

export function setLang(next) {
  if (next !== 'ru' && next !== 'en') return;
  if (next === lang) return;
  lang = next;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* noop */ }
  document.documentElement.lang = lang;
  applyStatic();
  listeners.forEach((fn) => { try { fn(lang); } catch (e) { /* noop */ } });
}

export function toggleLang() { setLang(lang === 'ru' ? 'en' : 'ru'); }

export function onLang(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// t('key') или t('key', { n: 3, title: 'X' })
export function t(key, params = null) {
  const entry = DICT[key];
  let s = entry ? entry[lang] : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

// множественное число для счётчиков (ru: 1/2-4/5+, en: 1/other)
export function plural(n, k1, k2, k5) {
  if (lang === 'en') return t(n === 1 ? k1 : k5 || k2);
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return t(k1);
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return t(k2);
  return t(k5 || k2);
}

// применить словарь к статичной разметке
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-cursor]').forEach((el) => { el.dataset.cursorLabel = t(el.dataset.i18nCursor); });
  root.querySelectorAll('[data-i18n-dt]').forEach((el) => {
    el.textContent = t(el.dataset.i18nDt);
    el.dataset.text = t(el.dataset.i18nDt);
  });
}
