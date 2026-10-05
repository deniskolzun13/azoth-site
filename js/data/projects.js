// ============================================================
// ДАННЫЕ ПРОЕКТОВ — РАБОЧИЕ ДЕМО-САЙТЫ (витрина навыков, не
// реальные заказчики: бренды придуманы, метрики — из lab-тестов).
// demo — путь к живому демо-сайту (demo/<id>/), открывается по
//   кнопке «ОТКРЫТЬ САЙТ» в кейс-вью.
// cover/shots — скриншоты демо (demo/<id>/shots/), рисуются в
//   карточках и галерее кейс-вью. Пустой shots = процедурный шейдер.
// cat — категория фильтра (catLabel — подпись на кнопке фильтра).
// Реальная работа = та же структура: залей shots скриншотами и укажи demo.
// ============================================================

export const PROJECTS = [
  {
    id: 'salt',
    title: 'СОЛЬ',
    year: '2026',
    cat: 'site',
    catLabel: { ru: 'САЙТЫ', en: 'SITES' },
    demo: './demo/salt/',
    cover: './demo/salt/shots/shot-1.jpg',
    tags: { ru: ['Бронирование', 'Меню-табы', 'Формы'], en: ['Booking', 'Menu tabs', 'Forms'] },
    desc: {
      ru: 'Сайт ресторана авторской кухни: тёмная сцена вечера на первом экране, меню с табами и бронь столика в два клика.',
      en: 'Fine-dining restaurant site: an evening mood hero, tabbed menu and two-click table booking.',
    },
    task: {
      ru: 'Чтобы бронь шла с сайта, а не по телефону в час пик: показать атмосферу, донести сет-меню и собрать заявку на столик без бэкенда.',
      en: 'Move bookings from the phone to the site: show the atmosphere, present the tasting menu and collect table requests without a backend.',
    },
    solution: {
      ru: 'Герой на всю высоту с одной главной кнопкой, меню на табах, форма с валидацией даты и человечным подтверждением. Чистые HTML/CSS/JS — вся страница легче мегабайта.',
      en: 'A full-height hero with one main action, tabbed menu, a form with date validation and a humane confirmation. Pure HTML/CSS/JS — the whole page is under a megabyte.',
    },
    role: { ru: 'ДИЗАЙН + РАЗРАБОТКА', en: 'DESIGN + DEVELOPMENT' },
    duration: { ru: '2 НЕД.', en: '2 WKS' },
    client: { ru: 'РЕСТОРАН АВТОРСКОЙ КУХНИ', en: 'FINE-DINING RESTAURANT' },
    stack: { ru: ['HTML', 'CSS', 'Vanilla JS'], en: ['HTML', 'CSS', 'Vanilla JS'] },
    results: {
      ru: ['БРОНЬ СТОЛИКА ЗА 2 КЛИКА', 'ВЕС СТРАНИЦЫ — 0.4 МБ', 'ФОРМЫ ПОЛНОСТЬЮ С КЛАВИАТУРЫ'],
      en: ['TABLE BOOKED IN 2 CLICKS', 'PAGE WEIGHT — 0.4 MB', 'FORMS FULLY KEYBOARD-ACCESSIBLE'],
    },
    shots: [
      './demo/salt/shots/shot-1.jpg',
      './demo/salt/shots/shot-2.jpg',
      './demo/salt/shots/shot-3.jpg',
    ],
  },
  {
    id: 'forma',
    title: 'ФОРМА',
    year: '2026',
    cat: 'shop',
    catLabel: { ru: 'МАГАЗИНЫ', en: 'STORES' },
    demo: './demo/forma/',
    cover: './demo/forma/shots/shot-1.jpg',
    tags: { ru: ['Каталог', 'Конфигуратор', 'Расчёт цены'], en: ['Catalog', 'Configurator', 'Live pricing'] },
    desc: {
      ru: 'Витрина мебельной мастерской: конфигуратор дивана перекрашивает изделие и пересчитывает цену при смене ткани и размера.',
      en: 'A furniture workshop storefront: the sofa configurator recolors the piece and recalculates the price as fabric and size change.',
    },
    task: {
      ru: 'Перенести шоурум в онлайн: подбор ткани и размера без менеджера, чтобы в заявку приезжала готовая конфигурация.',
      en: 'Bring the showroom online: fabric and size picked without a manager, so the order arrives as a finished configuration.',
    },
    solution: {
      ru: 'Конфигуратор на чистом JS: свотчи тканей перекрашивают диван, размеры пересчитывают цену, кнопка заказа забирает собранное. Каталог с реальными ценами и этапами производства.',
      en: 'A vanilla-JS configurator: fabric swatches recolor the sofa, sizes recalculate the price, the order button picks up the result. Catalog with real prices and build stages.',
    },
    role: { ru: 'ДИЗАЙН + РАЗРАБОТКА', en: 'DESIGN + DEVELOPMENT' },
    duration: { ru: '3 НЕД.', en: '3 WKS' },
    client: { ru: 'МЕБЕЛЬНАЯ МАСТЕРСКАЯ', en: 'FURNITURE WORKSHOP' },
    stack: { ru: ['HTML', 'CSS', 'Vanilla JS'], en: ['HTML', 'CSS', 'Vanilla JS'] },
    results: {
      ru: ['ЦЕНА ПЕРЕСЧИТЫВАЕТСЯ МГНОВЕННО', 'ЗАЯВКА УНОСИТ КОНФИГУРАЦИЮ', 'LCP 1.1 С В LAB-ТЕСТАХ'],
      en: ['PRICE RECALCULATES INSTANTLY', 'THE ORDER CARRIES THE CONFIG', 'LCP 1.1 S IN LAB TESTS'],
    },
    shots: [
      './demo/forma/shots/shot-1.jpg',
      './demo/forma/shots/shot-2.jpg',
      './demo/forma/shots/shot-3.jpg',
    ],
  },
  {
    id: 'pulse',
    title: 'ПУЛЬС',
    year: '2025',
    cat: 'site',
    catLabel: { ru: 'САЙТЫ', en: 'SITES' },
    demo: './demo/pulse/',
    cover: './demo/pulse/shots/shot-1.jpg',
    tags: { ru: ['Расписание', 'Тарифы', 'Запись'], en: ['Schedule', 'Pricing', 'Sign-up'] },
    desc: {
      ru: 'Сеть фитнес-клубов: расписание по дням на табах, тарифы без звёздочек и запись на бесплатную первую тренировку.',
      en: 'A gym chain site: weekly schedule in day tabs, no-asterisk pricing and a free first workout sign-up.',
    },
    task: {
      ru: 'Перестать терять клиентов на «позвоните и уточните»: расписание, цены и запись — на одной странице, за один визит.',
      en: 'Stop losing people to “call us to check”: schedule, prices and sign-up on one page, in one visit.',
    },
    solution: {
      ru: 'Неделя тренировок на четырёх табах, три тарифа рядом с формой, главный акцент — бесплатная первая тренировка. Контрастная тёмная тема с лаймовым акцентом.',
      en: 'A week of classes in four tabs, three plans next to the form, the free first workout as the hero action. High-contrast dark theme with a lime accent.',
    },
    role: { ru: 'ДИЗАЙН + РАЗРАБОТКА', en: 'DESIGN + DEVELOPMENT' },
    duration: { ru: '2 НЕД.', en: '2 WKS' },
    client: { ru: 'СЕТЬ ФИТНЕС-КЛУБОВ', en: 'GYM CHAIN' },
    stack: { ru: ['HTML', 'CSS', 'Vanilla JS'], en: ['HTML', 'CSS', 'Vanilla JS'] },
    results: {
      ru: ['РАСПИСАНИЕ — В ОДИН КЛИК', 'ФОРМА ЗАПОЛНЯЕТСЯ ЗА 20 СЕКУНД', 'КОНТРАСТ ТЕКСТА AA+'],
      en: ['SCHEDULE IN ONE CLICK', 'FORM FILLS IN 20 SECONDS', 'AA+ TEXT CONTRAST'],
    },
    shots: [
      './demo/pulse/shots/shot-1.jpg',
      './demo/pulse/shots/shot-2.jpg',
      './demo/pulse/shots/shot-3.jpg',
    ],
  },
  {
    id: 'indigo',
    title: 'ИНДИГО',
    year: '2025',
    cat: 'site',
    catLabel: { ru: 'САЙТЫ', en: 'SITES' },
    demo: './demo/indigo/',
    cover: './demo/indigo/shots/shot-1.jpg',
    tags: { ru: ['Портфолио', 'Фильтры', 'Лайтбокс'], en: ['Portfolio', 'Filters', 'Lightbox'] },
    desc: {
      ru: 'Студия татуировки: галерея работ с фильтрами по стилям, лайтбокс, честный прайс и заявка на эскиз.',
      en: 'A tattoo studio site: style-filtered gallery with a lightbox, honest pricing and a sketch request form.',
    },
    task: {
      ru: 'Студии тяжело продавать тату по фото в мессенджере: нужна витрина работ с фильтрами и цены, видные до первого сообщения.',
      en: 'Selling tattoos over messenger photos is painful: the studio needs a work gallery with filters and prices visible before the first message.',
    },
    solution: {
      ru: 'Галерея с фильтрами по стилям и лайтбоксом на чистом JS, прайс таблицей без «зависит от сложности», заявка собирает стиль и мастера.',
      en: 'A vanilla-JS gallery with style filters and a lightbox, a price table with no “depends on complexity”, a form that captures style and artist.',
    },
    role: { ru: 'ДИЗАЙН + РАЗРАБОТКА', en: 'DESIGN + DEVELOPMENT' },
    duration: { ru: '2 НЕД.', en: '2 WKS' },
    client: { ru: 'СТУДИЯ ТАТУИРОВКИ', en: 'TATTOO STUDIO' },
    stack: { ru: ['HTML', 'CSS', 'Vanilla JS'], en: ['HTML', 'CSS', 'Vanilla JS'] },
    results: {
      ru: ['ФИЛЬТР ГАЛЕРЕИ БЕЗ ПЕРЕЗАГРУЗОК', 'ПРАЙС ВИДЕН ДО ПЕРВОГО СООБЩЕНИЯ', 'ЛАЙТБОКС ЗАКРЫВАЕТСЯ ПО ESC'],
      en: ['GALLERY FILTERS WITH ZERO RELOADS', 'PRICES SEEN BEFORE THE FIRST DM', 'LIGHTBOX CLOSES ON ESC'],
    },
    shots: [
      './demo/indigo/shots/shot-1.jpg',
      './demo/indigo/shots/shot-2.jpg',
      './demo/indigo/shots/shot-3.jpg',
    ],
  },
  {
    id: 'glubina',
    title: 'ГЛУБИНА',
    year: '2024',
    cat: 'promo',
    catLabel: { ru: 'ПРОМО', en: 'PROMO' },
    demo: './demo/glubina/',
    cover: './demo/glubina/shots/shot-1.jpg',
    tags: { ru: ['Афиша', 'Билеты', 'Погружение'], en: ['Promo', 'Tickets', 'Immersion'] },
    desc: {
      ru: 'Промо-сайт иммерсивной выставки об океане: три зала-слоя глубины и выбор сеанса с билетом в пару шагов.',
      en: 'Promo site for an immersive ocean exhibition: three depth-layer halls and a two-step session and ticket picker.',
    },
    task: {
      ru: 'Продавать сеансы выставки онлайн и за пять секунд объяснить, что это не «картинки на стенах», а маршрут с погружением.',
      en: 'Sell exhibition sessions online and explain in five seconds that this is not “pictures on walls” but a descent you walk through.',
    },
    solution: {
      ru: 'Герой с погружением в толщу воды, залы как три слоя глубины с датчиками высоты, конструктор сеанса: дата × время × тип билета со мгновенной суммой.',
      en: 'A hero that sinks you into the water column, halls presented as three depth layers with depth tags, a session builder: date × time × ticket type with an instant total.',
    },
    role: { ru: 'ДИЗАЙН + РАЗРАБОТКА', en: 'DESIGN + DEVELOPMENT' },
    duration: { ru: '3 НЕД.', en: '3 WKS' },
    client: { ru: 'ОРГАНИЗАТОР ВЫСТАВКИ', en: 'EXHIBITION ORGANIZER' },
    stack: { ru: ['HTML', 'CSS', 'Vanilla JS'], en: ['HTML', 'CSS', 'Vanilla JS'] },
    results: {
      ru: ['БИЛЕТ — ЗА 3 КЛИКА', 'СЕАНС ВИДЕН ДО ОПЛАТЫ', 'ВЕС СТРАНИЦЫ — 0.3 МБ'],
      en: ['TICKET IN 3 CLICKS', 'SESSION SEEN BEFORE PAYMENT', 'PAGE WEIGHT — 0.3 MB'],
    },
    shots: [
      './demo/glubina/shots/shot-1.jpg',
      './demo/glubina/shots/shot-2.jpg',
      './demo/glubina/shots/shot-3.jpg',
    ],
  },
];
