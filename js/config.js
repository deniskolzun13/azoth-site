// ============================================================
// Конфигурация сайта. ВСЁ ПЕРСОНАЛЬНОЕ — ЗДЕСЬ.
// Замените BRAND и контакты на настоящие — и сайт ваш.
// ВНИМАНИЕ: <title>, meta description, og-теги и JSON-LD
// захардкожены ещё и в index.html — меняйте вместе с ними.
// ============================================================

export const BRAND = 'AZOTH';              // ← название-заглушка, поменяйте на своё
export const BRAND_DOMAIN = 'deniskolzun13.github.io';
export const SITE_URL = 'https://deniskolzun13.github.io/azoth-site'; // ← GitHub Pages; при покупке домена замените здесь и в index.html/robots.txt/sitemap.xml

export const CONTACTS = {
  telegramUser: '@azoth_dev',              // ← ник в Telegram
  telegramUrl: 'https://t.me/azoth_dev',   // ← ссылка на ваш Telegram
  email: 'hello@azoth.dev',                // ← ваша почта
};

// URL эндпоинта отправки заявок (Cloudflare Worker — см. worker/README.md).
// Пусто → форма работает по-старому: собирает текст для Telegram/копирования.
export const LEAD_API = '';                // ← например 'https://azoth-lead.<ваш-субдомен>.workers.dev'

// Яндекс.Метрика: впишите номер счётчика — скрипт и цели подключатся сами.
// Цели: case_open, calc_to_form, lead_built, lead_sent.
export const METRICA_ID = '';              // ← например '12345678'

// Плашка доступности на «Главной» и «Контакте».
// now: true — «СВОБОДЕН СЕЙЧАС»; false — показывать дату из from.
export const AVAILABILITY = {
  free: true,
  now: true,
  slots: 2,
  from: { ru: '20 октября', en: 'October 20' },
};

export const PAGES = [
  { id: 'home',    title: { ru: 'ГЛАВНАЯ',    en: 'HOME' } },
  { id: 'works',   title: { ru: 'РАБОТЫ',     en: 'WORKS' } },
  { id: 'about',   title: { ru: 'УСЛУГИ',     en: 'SERVICES' } },
  { id: 'calc',    title: { ru: 'КАЛЬКУЛЯТОР', en: 'CALCULATOR' } },
  { id: 'contact', title: { ru: 'КОНТАКТ',    en: 'CONTACT' } },
];

export const SERVICES = [
  { name: { ru: 'Лендинги',             en: 'Landing pages' },
    desc: { ru: 'Промо-страницы с сильной подачей: анимация, 3D, работа на конверсию.',
            en: 'Promo pages with a strong pitch: animation, 3D, built for conversion.' } },
  { name: { ru: 'Корпоративные сайты',  en: 'Corporate sites' },
    desc: { ru: 'Многостраничники с аккуратной структурой, CMS и быстрым поиском.',
            en: 'Multi-page sites with clean structure, CMS and fast search.' } },
  { name: { ru: 'Интернет-магазины',    en: 'Online stores' },
    desc: { ru: 'E-commerce, где витрина цепляет, а корзина не теряет покупателей.',
            en: 'E-commerce where the storefront hooks and the checkout never leaks.' } },
  { name: { ru: 'WebGL / 3D-эффекты',   en: 'WebGL / 3D effects' },
    desc: { ru: 'Шейдеры, частицы, интерактивные сцены — как на этом сайте.',
            en: 'Shaders, particles, interactive scenes — like on this site.' } },
  { name: { ru: 'Редизайн',             en: 'Redesign' },
    desc: { ru: 'Освежу проект без потери SEO, конверсий и старых клиентов.',
            en: 'A fresh look without losing SEO, conversions or old clients.' } },
];

export const MARQUEE = ['THREE.JS', 'GLSL', 'GSAP', 'WEBGL', '60 FPS', 'CREATIVE DEV', 'AWWWARDS STYLE', 'GSAP + LENIS'];
