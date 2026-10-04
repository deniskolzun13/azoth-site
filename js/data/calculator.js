// ============================================================
// ДАННЫЕ КАЛЬКУЛЯТОРА СТОИМОСТИ.
// Цены — заглушки-ориентиры; поправьте под свой прайс.
// price — ₽, days — добавка к сроку в неделях, factor — множитель.
// label — {ru, en}; id — стабильный ключ (не переводится).
// ============================================================

export const CALC = {
  types: [
    { id: 'landing',  label: { ru: 'ЛЕНДИНГ',          en: 'LANDING PAGE' }, price: 90000,  days: [2, 3] },
    { id: 'corp',     label: { ru: 'КОРП. САЙТ',       en: 'CORP. SITE' },    price: 180000, days: [4, 6] },
    { id: 'shop',     label: { ru: 'ИНТЕРНЕТ-МАГАЗИН', en: 'ONLINE STORE' },  price: 260000, days: [6, 8] },
    { id: 'webgl',    label: { ru: 'WEBGL / 3D-ПРОМО', en: 'WEBGL / 3D PROMO' }, price: 320000, days: [5, 7] },
    { id: 'redesign', label: { ru: 'РЕДИЗАЙН',         en: 'REDESIGN' },      price: 120000, days: [3, 4] },
  ],

  groups: [
    {
      id: 'pages', label: { ru: 'ОБЪЁМ', en: 'SCOPE' }, single: true,
      options: [
        { id: 'p1',   label: { ru: '1–5 СТРАНИЦ', en: '1–5 PAGES' }, price: 0, days: 0, def: true },
        { id: 'p2',   label: { ru: '6–15 СТРАНИЦ', en: '6–15 PAGES' }, price: 30000, days: 1 },
        { id: 'p3',   label: { ru: '16–40 СТРАНИЦ', en: '16–40 PAGES' }, price: 70000, days: 2 },
        { id: 'p4',   label: { ru: '40+ / КАТАЛОГ / ПОРТАЛ', en: '40+ / CATALOG / PORTAL' }, price: 120000, days: 3 },
      ],
    },
    {
      id: 'design', label: { ru: 'ДИЗАЙН', en: 'DESIGN' }, single: true,
      options: [
        { id: 'std',    label: { ru: 'ЧИСТЫЙ СТАНДАРТ', en: 'CLEAN STANDARD' }, price: 0, def: true },
        { id: 'prem',   label: { ru: 'ПРЕМИУМ-ДИЗАЙН', en: 'PREMIUM DESIGN' }, price: 45000 },
        { id: 'premm',  label: { ru: 'ПРЕМИУМ + МОУШН-ДИЗАЙН', en: 'PREMIUM + MOTION DESIGN' }, price: 95000, days: 1 },
      ],
    },
    {
      id: 'motion', label: { ru: 'АНИМАЦИИ И 3D', en: 'ANIMATION & 3D' }, single: true,
      options: [
        { id: 'base',  label: { ru: 'БАЗОВЫЕ (HOVER, ПЕРЕХОДЫ)', en: 'BASIC (HOVER, TRANSITIONS)' }, price: 0, def: true },
        { id: 'gsap',  label: { ru: 'GSAP-СЦЕНЫ И ПАРАЛЛАКС', en: 'GSAP SCENES & PARALLAX' }, price: 50000, days: 1 },
        { id: 'webgl', label: { ru: 'WEBGL / 3D-СЦЕНА', en: 'WEBGL / 3D SCENE' }, price: 120000, days: 2 },
      ],
    },
    {
      id: 'cms', label: { ru: 'АДМИНКА / CMS', en: 'ADMIN / CMS' }, single: true,
      options: [
        { id: 'none',  label: { ru: 'БЕЗ CMS (СТАТИКА)', en: 'NO CMS (STATIC)' }, price: 0, def: true },
        { id: 'light', label: { ru: 'ПРОСТАЯ АДМИНКА', en: 'LIGHT ADMIN' }, price: 40000, days: 1 },
        { id: 'full',  label: { ru: 'ПОЛНОЦЕННАЯ CMS', en: 'FULL CMS' }, price: 70000, days: 1 },
      ],
    },
    {
      id: 'content', label: { ru: 'КОНТЕНТ И ЯЗЫКИ', en: 'CONTENT & LANGUAGES' }, single: true,
      options: [
        { id: 'own',  label: { ru: 'ТЕКСТЫ И ФОТО МОИ', en: 'MY TEXTS AND PHOTOS' }, price: 0, def: true },
        { id: 'copy', label: { ru: 'КОПИРАЙТИНГ', en: 'COPYWRITING' }, price: 25000, days: 1 },
        { id: 'i18n', label: { ru: 'КОПИРАЙТИНГ + 2–3 ЯЗЫКА', en: 'COPYWRITING + 2–3 LANGUAGES' }, price: 60000, days: 1 },
      ],
    },
    {
      id: 'integrations', label: { ru: 'ИНТЕГРАЦИИ', en: 'INTEGRATIONS' }, single: false,
      options: [
        { id: 'crm',    label: { ru: 'CRM (AMOCRM / БИТРИКС24)', en: 'CRM (AMOCRM / BITRIX24)' }, price: 30000, days: 0 },
        { id: 'pay',    label: { ru: 'ОНЛАЙН-ОПЛАТА', en: 'ONLINE PAYMENTS' }, price: 35000, days: 0 },
        { id: 'ship',   label: { ru: 'ДОСТАВКА (СДЭК И ДР.)', en: 'SHIPPING (CDEK ETC.)' }, price: 25000, days: 0 },
        { id: '1c',     label: { ru: '1С / СКЛАД', en: 'ERP / WAREHOUSE' }, price: 45000, days: 1 },
        { id: 'metric', label: { ru: 'МЕТРИКА + ЦЕЛИ', en: 'ANALYTICS + GOALS' }, price: 15000, days: 0 },
      ],
    },
    {
      id: 'shopextra', label: { ru: 'ДЛЯ МАГАЗИНА', en: 'STORE EXTRAS' }, only: ['shop'], single: false,
      options: [
        { id: 'filter', label: { ru: 'ФИЛЬТРЫ И ПОИСК', en: 'FILTERS & SEARCH' }, price: 40000, days: 0 },
        { id: 'account',label: { ru: 'ЛИЧНЫЙ КАБИНЕТ', en: 'CUSTOMER ACCOUNTS' }, price: 40000, days: 1 },
        { id: 'review', label: { ru: 'ОТЗЫВЫ И РЕЙТИНГИ', en: 'REVIEWS & RATINGS' }, price: 20000, days: 0 },
        { id: 'promo',  label: { ru: 'ПРОМОКОДЫ И СКИДКИ', en: 'PROMO CODES & DISCOUNTS' }, price: 25000, days: 0 },
      ],
    },
    {
      id: 'support', label: { ru: 'ПОДДЕРЖКА ПОСЛЕ ЗАПУСКА', en: 'POST-LAUNCH SUPPORT' }, single: true,
      options: [
        { id: 's2w', label: { ru: '2 НЕДЕЛИ (ВКЛЮЧЕНО)', en: '2 WEEKS (INCLUDED)' }, price: 0, def: true },
        { id: 's1m', label: { ru: '1 МЕСЯЦ', en: '1 MONTH' }, price: 20000 },
        { id: 's3m', label: { ru: '3 МЕСЯЦА', en: '3 MONTHS' }, price: 45000 },
      ],
    },
    {
      id: 'speed', label: { ru: 'СРОКИ', en: 'TIMELINE' }, single: true,
      options: [
        { id: 'normal', label: { ru: 'ОБЫЧНЫЕ', en: 'REGULAR' }, factor: 1, def: true },
        { id: 'fast',   label: { ru: 'СРОЧНО',   en: 'EXPEDITED' }, factor: 1.25 },
        { id: 'rush',   label: { ru: 'ГОРИТ',     en: 'ON FIRE' }, factor: 1.5 },
      ],
    },
  ],
};
