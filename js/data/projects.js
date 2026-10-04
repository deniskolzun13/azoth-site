// ============================================================
// ДАННЫЕ ПРОЕКТОВ — ЗАГЛУШКИ.
// variant — какая процедурная обложка рисуется (0..5).
// shots — кадры для галереи в кейс-вью (первый = обложка).
// Замените содержимое на реальные работы: та же структура.
// ============================================================

export const PROJECTS = [
  {
    id: 'neon-drift',
    title: 'NEON DRIFT',
    year: '2026',
    cat: 'landing',
    catLabel: { ru: 'ЛЕНДИНГ', en: 'LANDING' },
    variant: 0,
    tags: { ru: ['Лендинг', 'WebGL', 'GSAP'], en: ['Landing', 'WebGL', 'GSAP'] },
    desc: {
      ru: 'Промо-лендинг концепта электрокара: первый экран — 3D-сцена с неоновым треком, характеристики оживают при скролле.',
      en: 'Promo landing for an EV concept: the hero is a 3D neon-track scene, specs come alive on scroll.',
    },
    results: {
      ru: ['LCP — 1.2 C', 'КОНВЕРСИЯ В БРОНЬ +38%', 'AWWWARDS SOTD НОМИНАНТ'],
      en: ['LCP — 1.2 S', 'BOOKING CONVERSION +38%', 'AWWWARDS SOTD NOMINEE'],
    },
    shots: [
      { variant: 0, seed: 0.3 },
      { variant: 2, seed: 3.1 },
      { variant: 4, seed: 6.7 },
    ],
  },
  {
    id: 'glitch-market',
    title: 'ГЛИТЧ.МАРКЕТ',
    year: '2025',
    cat: 'shop',
    catLabel: { ru: 'МАГАЗИН', en: 'STORE' },
    variant: 1,
    tags: { ru: ['E-commerce', 'Three.js', 'UI'], en: ['E-commerce', 'Three.js', 'UI'] },
    desc: {
      ru: 'Магазин стритвир-бренда: глитч-эстетика, 3D-примерка кроссовок, корзина без перезагрузок.',
      en: 'Streetwear store: glitch aesthetics, 3D sneaker try-on, cart with zero page reloads.',
    },
    results: {
      ru: ['СРЕДНИЙ ЧЕК +24%', 'ВОЗВРАТЫ −11%', '60 FPS НА СРЕДНЕМ ТЕЛЕФОНЕ'],
      en: ['AVERAGE ORDER +24%', 'RETURNS −11%', '60 FPS ON A MID-RANGE PHONE'],
    },
    shots: [
      { variant: 1, seed: 2.0 },
      { variant: 5, seed: 4.4 },
      { variant: 3, seed: 8.2 },
    ],
  },
  {
    id: 'portal-9',
    title: 'ПОРТАЛ 9',
    year: '2025',
    cat: 'corp',
    catLabel: { ru: 'КОРП. САЙТ', en: 'CORP. SITE' },
    variant: 2,
    tags: { ru: ['Корп. сайт', 'WebGL', 'Дизайн-система'], en: ['Corp. site', 'WebGL', 'Design system'] },
    desc: {
      ru: 'Корпоративный сайт IT-холдинга: строгая сетка, «порталы» между разделами на шейдерных переходах, 40+ страниц.',
      en: 'Corporate site for an IT holding: strict grid, shader “portal” transitions between sections, 40+ pages.',
    },
    results: {
      ru: ['9 ЯЗЫКОВ', 'LCP — 1.4 C', 'ЗАЯВКИ С САЙТА +52%'],
      en: ['9 LANGUAGES', 'LCP — 1.4 S', 'SITE LEADS +52%'],
    },
    shots: [
      { variant: 2, seed: 3.7 },
      { variant: 0, seed: 5.2 },
      { variant: 1, seed: 9.9 },
    ],
  },
  {
    id: 'liquid-metal',
    title: 'ЖИДКИЙ МЕТАЛЛ',
    year: '2024',
    cat: 'promo',
    catLabel: { ru: 'ПРОМО', en: 'PROMO' },
    variant: 3,
    tags: { ru: ['Промо', 'Шейдеры', 'Моушн'], en: ['Promo', 'Shaders', 'Motion'] },
    desc: {
      ru: 'Сайт ювелирной лаборатории: металл плавится и перетекает между разделами, каждый кейс — отдельная шейдерная сцена.',
      en: 'Jewelry lab site: metal melts and flows between sections, every case is its own shader scene.',
    },
    results: {
      ru: ['CSSDA WOTD', 'ВРЕМЯ НА САЙТЕ 4:12', 'ПРЕССА: 14 ПУБЛИКАЦИЙ'],
      en: ['CSSDA WOTD', 'TIME ON SITE 4:12', 'PRESS: 14 FEATURES'],
    },
    shots: [
      { variant: 3, seed: 5.4 },
      { variant: 4, seed: 1.8 },
      { variant: 2, seed: 7.3 },
    ],
  },
  {
    id: 'signal',
    title: 'СИГНАЛ',
    year: '2024',
    cat: 'platform',
    catLabel: { ru: 'ПЛАТФОРМА', en: 'PLATFORM' },
    variant: 4,
    tags: { ru: ['Платформа', 'Редизайн', 'Аудио'], en: ['Platform', 'Redesign', 'Audio'] },
    desc: {
      ru: 'Редизайн платформы подкастов: волновая визуализация эпизодов, тёмная тема по умолчанию, плеер с горячими клавишами.',
      en: 'Podcast platform redesign: waveform visualization, dark theme by default, hotkey-driven player.',
    },
    results: {
      ru: ['СЕАНСЫ +71%', 'ОТТЕК НА 19%', 'ОЦЕНКА В СТОРЕ 4.8'],
      en: ['SESSIONS +71%', 'CHURN DOWN 19%', 'APP STORE RATING 4.8'],
    },
    shots: [
      { variant: 4, seed: 7.1 },
      { variant: 3, seed: 2.6 },
      { variant: 5, seed: 5.9 },
    ],
  },
  {
    id: 'core',
    title: 'ЯДРО',
    year: '2026',
    cat: 'science',
    catLabel: { ru: 'НАУКА', en: 'SCIENCE' },
    variant: 5,
    tags: { ru: ['Наука', 'WebGL', 'Данные'], en: ['Science', 'WebGL', 'Data'] },
    desc: {
      ru: 'Сайт исследовательской лаборатории: интерактивная 3D-модель реактора, живые графики данных, раздел публикаций.',
      en: 'Research lab site: interactive 3D reactor model, live data charts, publications section.',
    },
    results: {
      ru: ['3D-МОДЕЛЬ 120K ПОЛИГОНОВ', 'ГРАНТЫ: 5 НОВЫХ ЗАЯВОК', 'HOTJAR: 0 RAGE-CLICKS'],
      en: ['3D MODEL, 120K POLYGONS', 'GRANTS: 5 NEW APPLICATIONS', 'HOTJAR: 0 RAGE-CLICKS'],
    },
    shots: [
      { variant: 5, seed: 8.8 },
      { variant: 1, seed: 0.9 },
      { variant: 3, seed: 4.1 },
    ],
  },
];
