// ============================================================
// ДАННЫЕ КАЛЬКУЛЯТОРА СТОИМОСТИ.
// 01 — сфера бизнеса (20 категорий): у каждой своя базовая
// цена/срок и свой блок допов (группы only: [id]).
// Остальные группы универсальные; «ЗАДАЧА» даёт скидку
// редизайна (factor ×0.85), «СРОКИ» — наценку (×1.25–1.5)
// и сжатие срока (tf).
// Цены — заглушки-ориентиры; поправьте под свой прайс.
// price — ₽, days — добавка к сроку в неделях, tf — множитель
// срока. label — {ru, en}; id — стабильный ключ (не переводится).
// ============================================================

export const CALC = {
  // 01 // СФЕРА БИЗНЕСА
  types: [
    { id: 'resto',  label: { ru: 'РЕСТОРАН / КАФЕ',        en: 'RESTAURANT / CAFE' },   price: 5000,  days: [2, 3] },
    { id: 'med',    label: { ru: 'МЕДИЦИНА / КЛИНИКА',     en: 'MEDICAL / CLINIC' },    price: 6500, days: [3, 4] },
    { id: 'beauty', label: { ru: 'КРАСОТА / САЛОН',        en: 'BEAUTY / SALON' },      price: 5000,  days: [2, 3] },
    { id: 'realty', label: { ru: 'НЕДВИЖИМОСТЬ',           en: 'REAL ESTATE' },         price: 8500, days: [3, 5] },
    { id: 'fit',    label: { ru: 'ФИТНЕС / СПОРТ',         en: 'FITNESS / SPORT' },     price: 6000, days: [2, 4] },
    { id: 'edu',    label: { ru: 'ОБРАЗОВАНИЕ / КУРСЫ',    en: 'EDUCATION / COURSES' }, price: 7500, days: [3, 5] },
    { id: 'law',    label: { ru: 'ЮРИСТЫ / КОНСАЛТИНГ',    en: 'LEGAL / CONSULTING' },  price: 5500, days: [2, 3] },
    { id: 'build',  label: { ru: 'СТРОИТЕЛЬСТВО / РЕМОНТ', en: 'CONSTRUCTION / RENO' }, price: 7000, days: [3, 4] },
    { id: 'shop',   label: { ru: 'МАГАЗИН / E-COMMERCE',   en: 'STORE / E-COMMERCE' },  price: 14000, days: [6, 8] },
    { id: 'hotel',  label: { ru: 'ОТЕЛИ / ТУРИЗМ',         en: 'HOTELS / TRAVEL' },     price: 8000, days: [3, 5] },
    { id: 'auto',   label: { ru: 'АВТОСЕРВИС / ДЕТЕЙЛИНГ', en: 'AUTO SERVICE / DETAILING' }, price: 6000, days: [2, 3] },
    { id: 'logi',   label: { ru: 'ЛОГИСТИКА / ПЕРЕЕЗДЫ',   en: 'LOGISTICS / MOVERS' },  price: 7000, days: [3, 4] },
    { id: 'furn',   label: { ru: 'МЕБЕЛЬ НА ЗАКАЗ',        en: 'CUSTOM FURNITURE' },    price: 8000, days: [3, 5] },
    { id: 'event',  label: { ru: 'EVENT / ФОТОГРАФЫ',      en: 'EVENTS / PHOTOGRAPHERS' }, price: 6000, days: [2, 3] },
    { id: 'clean',  label: { ru: 'КЛИНИНГ',                en: 'CLEANING' },            price: 5000, days: [2, 3] },
    { id: 'fix',    label: { ru: 'РЕМОНТ ТЕХНИКИ',         en: 'DEVICE REPAIR' },       price: 6000, days: [2, 3] },
    { id: 'fin',    label: { ru: 'БУХГАЛТЕРИЯ / СТРАХОВАНИЕ', en: 'ACCOUNTING / INSURANCE' }, price: 6500, days: [2, 4] },
    { id: 'kids',   label: { ru: 'ДЕТЦЕНТРЫ / АВТОШКОЛЫ',  en: 'KIDS CENTERS / DRIVING SCHOOL' }, price: 6500, days: [3, 4] },
    { id: 'rent',   label: { ru: 'ПРОКАТ / АРЕНДА',        en: 'RENTALS' },             price: 8000, days: [3, 5] },
    { id: 'spa',    label: { ru: 'СПА / БАНИ / БАНКЕТЫ',   en: 'SPA / SAUNA / BANQUETS' }, price: 7000, days: [3, 4] },
  ],

  groups: [
    {
      id: 'task', label: { ru: 'ЗАДАЧА', en: 'TASK' }, single: true,
      options: [
        { id: 'new', label: { ru: 'НОВЫЙ САЙТ', en: 'NEW SITE' }, price: 0, def: true },
        { id: 're',  label: { ru: 'РЕДИЗАЙН (−15%)', en: 'REDESIGN (−15%)' }, factor: 0.85 },
      ],
    },
    {
      id: 'pages', label: { ru: 'ОБЪЁМ', en: 'SCOPE' }, single: true,
      options: [
        { id: 'p1',   label: { ru: '1–5 СТРАНИЦ', en: '1–5 PAGES' }, price: 0, days: 0, def: true },
        { id: 'p2',   label: { ru: '6–15 СТРАНИЦ', en: '6–15 PAGES' }, price: 1500, days: 1 },
        { id: 'p3',   label: { ru: '16–40 СТРАНИЦ', en: '16–40 PAGES' }, price: 4000, days: 2 },
        { id: 'p4',   label: { ru: '40+ / КАТАЛОГ / ПОРТАЛ', en: '40+ / CATALOG / PORTAL' }, price: 6500, days: 3 },
      ],
    },
    {
      id: 'design', label: { ru: 'ДИЗАЙН', en: 'DESIGN' }, single: true,
      options: [
        { id: 'std',    label: { ru: 'ЧИСТЫЙ СТАНДАРТ', en: 'CLEAN STANDARD' }, price: 0, def: true },
        { id: 'prem',   label: { ru: 'ПРЕМИУМ-ДИЗАЙН', en: 'PREMIUM DESIGN' }, price: 2500 },
        { id: 'premm',  label: { ru: 'ПРЕМИУМ + МОУШН-ДИЗАЙН', en: 'PREMIUM + MOTION DESIGN' }, price: 5000, days: 1 },
      ],
    },
    {
      id: 'motion', label: { ru: 'АНИМАЦИИ И 3D', en: 'ANIMATION & 3D' }, single: true,
      options: [
        { id: 'base',  label: { ru: 'БАЗОВЫЕ (HOVER, ПЕРЕХОДЫ)', en: 'BASIC (HOVER, TRANSITIONS)' }, price: 0, def: true },
        { id: 'gsap',  label: { ru: 'GSAP-СЦЕНЫ И ПАРАЛЛАКС', en: 'GSAP SCENES & PARALLAX' }, price: 2500, days: 1 },
        { id: 'webgl', label: { ru: 'WEBGL / 3D-СЦЕНА', en: 'WEBGL / 3D SCENE' }, price: 6500, days: 2 },
      ],
    },
    {
      id: 'cms', label: { ru: 'АДМИНКА / CMS', en: 'ADMIN / CMS' }, single: true,
      options: [
        { id: 'none',  label: { ru: 'БЕЗ CMS (СТАТИКА)', en: 'NO CMS (STATIC)' }, price: 0, def: true },
        { id: 'light', label: { ru: 'ПРОСТАЯ АДМИНКА', en: 'LIGHT ADMIN' }, price: 2000, days: 1 },
        { id: 'full',  label: { ru: 'ПОЛНОЦЕННАЯ CMS', en: 'FULL CMS' }, price: 4000, days: 1 },
      ],
    },
    {
      id: 'content', label: { ru: 'КОНТЕНТ И ЯЗЫКИ', en: 'CONTENT & LANGUAGES' }, single: true,
      options: [
        { id: 'own',  label: { ru: 'ТЕКСТЫ И ФОТО МОИ', en: 'MY TEXTS AND PHOTOS' }, price: 0, def: true },
        { id: 'copy', label: { ru: 'КОПИРАЙТИНГ', en: 'COPYWRITING' }, price: 1500, days: 1 },
        { id: 'i18n', label: { ru: 'КОПИРАЙТИНГ + 2–3 ЯЗЫКА', en: 'COPYWRITING + 2–3 LANGUAGES' }, price: 3000, days: 1 },
      ],
    },
    {
      id: 'integrations', label: { ru: 'ИНТЕГРАЦИИ', en: 'INTEGRATIONS' }, single: false,
      options: [
        { id: 'crm',    label: { ru: 'CRM (AMOCRM / БИТРИКС24)', en: 'CRM (AMOCRM / BITRIX24)' }, price: 1500, days: 0 },
        { id: 'pay',    label: { ru: 'ОНЛАЙН-ОПЛАТА', en: 'ONLINE PAYMENTS' }, price: 2000, days: 0 },
        { id: 'ship',   label: { ru: 'ДОСТАВКА (СДЭК И ДР.)', en: 'SHIPPING (CDEK ETC.)' }, price: 1500, days: 0 },
        { id: '1c',     label: { ru: '1С / СКЛАД', en: 'ERP / WAREHOUSE' }, price: 2500, days: 1 },
        { id: 'metric', label: { ru: 'МЕТРИКА + ЦЕЛИ', en: 'ANALYTICS + GOALS' }, price: 1000, days: 0 },
      ],
    },

    // ——— допы сфер: показываются только у своей категории ———
    {
      id: 'restoextra', label: { ru: 'ДЛЯ РЕСТОРАНА', en: 'RESTAURANT EXTRAS' }, only: ['resto'], single: false,
      options: [
        { id: 'menu',  label: { ru: 'ОНЛАЙН-МЕНЮ + QR', en: 'ONLINE MENU + QR' }, price: 1000, days: 0 },
        { id: 'book',  label: { ru: 'БРОНИРОВАНИЕ СТОЛИКОВ', en: 'TABLE RESERVATIONS' }, price: 2000, days: 1 },
        { id: 'deliver', label: { ru: 'ДОСТАВКА / САМОВЫВОЗ', en: 'DELIVERY / PICKUP' }, price: 1500, days: 0 },
      ],
    },
    {
      id: 'medextra', label: { ru: 'ДЛЯ КЛИНИКИ', en: 'CLINIC EXTRAS' }, only: ['med'], single: false,
      options: [
        { id: 'appt',  label: { ru: 'ОНЛАЙН-ЗАПИСЬ К ВРАЧУ', en: 'ONLINE APPOINTMENTS' }, price: 2500, days: 1 },
        { id: 'docs',  label: { ru: 'ВРАЧИ И ПРЕЙСКУРАНТ', en: 'DOCTORS & PRICE LIST' }, price: 1000, days: 0 },
        { id: 'lic',   label: { ru: 'ЛИЦЕНЗИИ И ДОКУМЕНТЫ', en: 'LICENSES & DOCUMENTS' }, price: 500, days: 0 },
      ],
    },
    {
      id: 'beautyextra', label: { ru: 'ДЛЯ САЛОНА', en: 'SALON EXTRAS' }, only: ['beauty'], single: false,
      options: [
        { id: 'appt',  label: { ru: 'ОНЛАЙН-ЗАПИСЬ', en: 'ONLINE BOOKING' }, price: 2000, days: 1 },
        { id: 'staff', label: { ru: 'МАСТЕРА И ПОРТФОЛИО', en: 'STYLISTS & PORTFOLIO' }, price: 1000, days: 0 },
        { id: 'cert',  label: { ru: 'ПОДАРОЧНЫЕ СЕРТИФИКАТЫ', en: 'GIFT CERTIFICATES' }, price: 1500, days: 0 },
      ],
    },
    {
      id: 'realtyextra', label: { ru: 'ДЛЯ НЕДВИЖИМОСТИ', en: 'REALTY EXTRAS' }, only: ['realty'], single: false,
      options: [
        { id: 'list',   label: { ru: 'КАТАЛОГ ОБЪЕКТОВ + ФИЛЬТРЫ', en: 'LISTINGS + FILTERS' }, price: 2500, days: 1 },
        { id: 'map',    label: { ru: 'КАРТА ОБЪЕКТОВ', en: 'OBJECTS MAP' }, price: 2000, days: 1 },
        { id: 'mortage',label: { ru: 'ИПОТЕЧНЫЙ КАЛЬКУЛЯТОР', en: 'MORTGAGE CALCULATOR' }, price: 1500, days: 0 },
      ],
    },
    {
      id: 'fitextra', label: { ru: 'ДЛЯ ФИТНЕСА', en: 'FITNESS EXTRAS' }, only: ['fit'], single: false,
      options: [
        { id: 'sched',  label: { ru: 'РАСПИСАНИЕ ЗАНЯТИЙ', en: 'CLASS SCHEDULE' }, price: 1000, days: 0 },
        { id: 'pass',   label: { ru: 'АБОНЕМЕНТЫ ОНЛАЙН', en: 'MEMBERSHIPS ONLINE' }, price: 2000, days: 1 },
        { id: 'coaches',label: { ru: 'ТРЕНЕРЫ И ЗАЛЫ', en: 'COACHES & VENUES' }, price: 1000, days: 0 },
      ],
    },
    {
      id: 'eduextra', label: { ru: 'ДЛЯ ОБУЧЕНИЯ', en: 'EDU EXTRAS' }, only: ['edu'], single: false,
      options: [
        { id: 'courses',label: { ru: 'КАТАЛОГ КУРСОВ', en: 'COURSE CATALOG' }, price: 1500, days: 0 },
        { id: 'account',label: { ru: 'ЛИЧНЫЙ КАБИНЕТ УЧЕНИКА', en: 'STUDENT ACCOUNT' }, price: 2500, days: 1 },
        { id: 'webinar',label: { ru: 'ВЕБИНАРЫ / ВИДЕО', en: 'WEBINARS / VIDEO' }, price: 1500, days: 1 },
      ],
    },
    {
      id: 'lawextra', label: { ru: 'ДЛЯ ЮРИСТОВ', en: 'LEGAL EXTRAS' }, only: ['law'], single: false,
      options: [
        { id: 'price',  label: { ru: 'ПРАЙС ПО УСЛУГАМ', en: 'SERVICES PRICE LIST' }, price: 1000, days: 0 },
        { id: 'cases',  label: { ru: 'КЕЙСЫ И ПРАКТИКА', en: 'CASES & PRACTICE' }, price: 1000, days: 0 },
        { id: 'consult',label: { ru: 'ЗАПИСЬ НА КОНСУЛЬТАЦИЮ', en: 'CONSULTATION BOOKING' }, price: 1500, days: 1 },
      ],
    },
    {
      id: 'buildextra', label: { ru: 'ДЛЯ СТРОЙКИ', en: 'BUILDING EXTRAS' }, only: ['build'], single: false,
      options: [
        { id: 'folio',  label: { ru: 'ПОРТФОЛИО ОБЪЕКТОВ', en: 'PROJECT PORTFOLIO' }, price: 1000, days: 0 },
        { id: 'estim',  label: { ru: 'КАЛЬКУЛЯТОР СМЕТЫ', en: 'QUOTE CALCULATOR' }, price: 2000, days: 1 },
        { id: 'reviews',label: { ru: 'ОТЗЫВЫ КЛИЕНТОВ', en: 'CLIENT REVIEWS' }, price: 1000, days: 0 },
      ],
    },
    {
      id: 'shopextra', label: { ru: 'ДЛЯ МАГАЗИНА', en: 'STORE EXTRAS' }, only: ['shop'], single: false,
      options: [
        { id: 'filter', label: { ru: 'ФИЛЬТРЫ И ПОИСК', en: 'FILTERS & SEARCH' }, price: 2000, days: 0 },
        { id: 'account',label: { ru: 'ЛИЧНЫЙ КАБИНЕТ', en: 'CUSTOMER ACCOUNTS' }, price: 2000, days: 1 },
        { id: 'review', label: { ru: 'ОТЗЫВЫ И РЕЙТИНГИ', en: 'REVIEWS & RATINGS' }, price: 1000, days: 0 },
        { id: 'promo',  label: { ru: 'ПРОМОКОДЫ И СКИДКИ', en: 'PROMO CODES & DISCOUNTS' }, price: 1500, days: 0 },
      ],
    },
    {
      id: 'hotelextra', label: { ru: 'ДЛЯ ОТЕЛЯ', en: 'HOTEL EXTRAS' }, only: ['hotel'], single: false,
      options: [
        { id: 'book',   label: { ru: 'БРОНИРОВАНИЕ НОМЕРОВ', en: 'ROOM BOOKING' }, price: 2500, days: 1 },
        { id: 'rooms',  label: { ru: 'КАТАЛОГ НОМЕРОВ / ТУРОВ', en: 'ROOMS / TOURS CATALOG' }, price: 1500, days: 0 },
        { id: 'reviews',label: { ru: 'ОТЗЫВЫ И РЕЙТИНГИ', en: 'REVIEWS & RATINGS' }, price: 1000, days: 0 },
      ],
    },
    {
      id: 'autoextra', label: { ru: 'ДЛЯ АВТОСЕРВИСА', en: 'AUTO EXTRAS' }, only: ['auto'], single: false,
      options: [
        { id: 'book', label: { ru: 'ОНЛАЙН-ЗАПИСЬ НА СТО', en: 'SERVICE BOOKING' }, price: 2500, days: 1 },
        { id: 'price',label: { ru: 'ПРАЙС ПО РАБОТАМ', en: 'WORKS PRICE LIST' }, price: 1000, days: 0 },
        { id: 'calc', label: { ru: 'КАЛЬКУЛЯТОР ПО МАРКЕ АВТО', en: 'CALC BY CAR MODEL' }, price: 2000, days: 1 },
      ],
    },
    {
      id: 'logiextra', label: { ru: 'ДЛЯ ПЕРЕВОЗОК', en: 'LOGISTICS EXTRAS' }, only: ['logi'], single: false,
      options: [
        { id: 'calc',  label: { ru: 'КАЛЬКУЛЯТОР ПЕРЕВОЗКИ', en: 'SHIPPING CALCULATOR' }, price: 2500, days: 1 },
        { id: 'crew',  label: { ru: 'ЗАЯВКА НА ГРУЗЧИКОВ', en: 'MOVERS REQUEST' }, price: 2000, days: 0 },
        { id: 'routes',label: { ru: 'ПРАЙС ПО НАПРАВЛЕНИЯМ', en: 'ROUTES PRICE LIST' }, price: 1000, days: 0 },
      ],
    },
    {
      id: 'furnextra', label: { ru: 'ДЛЯ МЕБЕЛИ', en: 'FURNITURE EXTRAS' }, only: ['furn'], single: false,
      options: [
        { id: 'folio', label: { ru: 'ПОРТФОЛИО ИЗДЕЛИЙ', en: 'WORKS PORTFOLIO' }, price: 1000, days: 0 },
        { id: 'config',label: { ru: 'КОНСТРУКТОР ЗАКАЗА', en: 'ORDER CONFIGURATOR' }, price: 3000, days: 1 },
        { id: 'b2b',   label: { ru: 'ЗАПРОС КП ДЛЯ B2B', en: 'B2B QUOTE REQUEST' }, price: 1500, days: 1 },
      ],
    },
    {
      id: 'eventextra', label: { ru: 'ДЛЯ ИВЕНТОВ', en: 'EVENT EXTRAS' }, only: ['event'], single: false,
      options: [
        { id: 'folio', label: { ru: 'ПОРТФОЛИО ПО ДАТАМ', en: 'PORTFOLIO BY DATE' }, price: 1000, days: 0 },
        { id: 'date',  label: { ru: 'БРОНЬ ДАТЫ С ПРЕДОПЛАТОЙ', en: 'DATE BOOKING + DEPOSIT' }, price: 2500, days: 1 },
        { id: 'packs', label: { ru: 'ПАКЕТЫ УСЛУГ', en: 'SERVICE PACKAGES' }, price: 1000, days: 0 },
      ],
    },
    {
      id: 'cleanextra', label: { ru: 'ДЛЯ КЛИНИНГА', en: 'CLEANING EXTRAS' }, only: ['clean'], single: false,
      options: [
        { id: 'calc',  label: { ru: 'КАЛЬКУЛЯТОР УБОРКИ', en: 'CLEANING CALCULATOR' }, price: 2500, days: 1 },
        { id: 'order', label: { ru: 'ОНЛАЙН-ЗАКАЗ', en: 'ONLINE ORDER' }, price: 2000, days: 1 },
        { id: 'price', label: { ru: 'ПРАЙС ПО ПОМЕЩЕНИЯМ', en: 'ROOMS PRICE LIST' }, price: 1000, days: 0 },
      ],
    },
    {
      id: 'fixextra', label: { ru: 'ДЛЯ СЕРВИС-ЦЕНТРА', en: 'REPAIR EXTRAS' }, only: ['fix'], single: false,
      options: [
        { id: 'price', label: { ru: 'ПРАЙС ПО НЕИСПРАВНОСТЯМ', en: 'FAULTS PRICE LIST' }, price: 1000, days: 0 },
        { id: 'req',   label: { ru: 'ЗАЯВКА НА ДИАГНОСТИКУ', en: 'DIAGNOSTICS REQUEST' }, price: 2000, days: 0 },
        { id: 'track', label: { ru: 'СТАТУС РЕМОНТА ПО НОМЕРУ', en: 'REPAIR STATUS TRACKER' }, price: 2500, days: 1 },
      ],
    },
    {
      id: 'finextra', label: { ru: 'ДЛЯ ФИНАНСОВ', en: 'FINANCE EXTRAS' }, only: ['fin'], single: false,
      options: [
        { id: 'calc',  label: { ru: 'КАЛЬКУЛЯТОР УСЛУГ', en: 'SERVICES CALCULATOR' }, price: 2000, days: 1 },
        { id: 'docs',  label: { ru: 'БАЗА ДОКУМЕНТОВ', en: 'DOCUMENTS BASE' }, price: 1000, days: 0 },
        { id: 'book',  label: { ru: 'ЗАПИСЬ НА КОНСУЛЬТАЦИЮ', en: 'CONSULTATION BOOKING' }, price: 2000, days: 1 },
      ],
    },
    {
      id: 'kidsextra', label: { ru: 'ДЛЯ ДЕТЦЕНТРА', en: 'KIDS EXTRAS' }, only: ['kids'], single: false,
      options: [
        { id: 'sched', label: { ru: 'РАСПИСАНИЕ ГРУПП', en: 'GROUPS SCHEDULE' }, price: 1000, days: 0 },
        { id: 'book',  label: { ru: 'ОНЛАЙН-ЗАПИСЬ', en: 'ONLINE ENROLLMENT' }, price: 2500, days: 1 },
        { id: 'docs',  label: { ru: 'ДОКУМЕНТЫ И ЛИЦЕНЗИИ', en: 'DOCS & LICENSES' }, price: 500, days: 0 },
      ],
    },
    {
      id: 'rentextra', label: { ru: 'ДЛЯ ПРОКАТА', en: 'RENTAL EXTRAS' }, only: ['rent'], single: false,
      options: [
        { id: 'cat',   label: { ru: 'КАТАЛОГ С ЦЕНОЙ ЗА ДЕНЬ', en: 'CATALOG + DAY PRICE' }, price: 2000, days: 0 },
        { id: 'book',  label: { ru: 'ОНЛАЙН-БРОНИРОВАНИЕ', en: 'ONLINE RESERVATION' }, price: 3000, days: 1 },
        { id: 'dep',   label: { ru: 'УСЛОВИЯ ЗАЛОГА', en: 'DEPOSIT TERMS' }, price: 500, days: 0 },
      ],
    },
    {
      id: 'spaextra', label: { ru: 'ДЛЯ СПА', en: 'SPA EXTRAS' }, only: ['spa'], single: false,
      options: [
        { id: 'book',  label: { ru: 'БРОНЬ СЕАНСОВ И ЗАЛОВ', en: 'SESSION & HALL BOOKING' }, price: 2500, days: 1 },
        { id: 'progs', label: { ru: 'ПРОГРАММЫ С ЦЕНАМИ', en: 'PROGRAMS & PRICES' }, price: 1500, days: 0 },
        { id: 'reviews',label: { ru: 'ОТЗЫВЫ ГОСТЕЙ', en: 'GUEST REVIEWS' }, price: 1000, days: 0 },
      ],
    },

    {
      id: 'support', label: { ru: 'ПОДДЕРЖКА ПОСЛЕ ЗАПУСКА', en: 'POST-LAUNCH SUPPORT' }, single: true,
      options: [
        { id: 's2w', label: { ru: '2 НЕДЕЛИ (ВКЛЮЧЕНО)', en: '2 WEEKS (INCLUDED)' }, price: 0, def: true },
        { id: 's1m', label: { ru: '1 МЕСЯЦ', en: '1 MONTH' }, price: 1000 },
        { id: 's3m', label: { ru: '3 МЕСЯЦА', en: '3 MONTHS' }, price: 2500 },
      ],
    },
    {
      id: 'speed', label: { ru: 'СРОКИ', en: 'TIMELINE' }, single: true,
      options: [
        { id: 'normal', label: { ru: 'ОБЫЧНЫЕ', en: 'REGULAR' }, factor: 1, tf: 1, def: true },
        { id: 'fast',   label: { ru: 'СРОЧНО',   en: 'EXPEDITED' }, factor: 1.25, tf: 0.75 },
        { id: 'rush',   label: { ru: 'ГОРИТ',     en: 'ON FIRE' }, factor: 1.5, tf: 0.5 },
      ],
    },
  ],
};
