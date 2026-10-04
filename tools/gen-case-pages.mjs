// ============================================================
// Генератор SEO-страниц кейсов: works/<slug>/index.html
// для каждого проекта из js/data/projects.js + sitemap.xml.
// Запуск: node tools/gen-case-pages.mjs
// Сгенерированные файлы коммитятся — GitHub Pages отдаёт их как
// статические страницы с полными мета-тегами, человек попадает
// на кейс через редирект на #case-<slug>.
// ============================================================

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PROJECTS } from '../js/data/projects.js';
import { SITE_URL, BRAND } from '../js/config.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const today = new Date().toISOString().slice(0, 10);

for (const p of PROJECTS) {
  const url = `${SITE_URL}/works/${p.id}/`;
  const home = `${SITE_URL}/`;
  const title = `${p.title} — ${BRAND}®`;
  const desc = p.desc.ru;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    headline: title,
    description: desc,
    inLanguage: 'ru',
    url,
    genre: p.catLabel.ru,
    dateCreated: p.year,
    keywords: p.tags.ru.join(', '),
    creator: { '@type': 'Person', name: BRAND, url: home },
  });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <!-- СГЕНЕРИРОВАНО tools/gen-case-pages.mjs — не редактировать вручную -->
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE_URL}/og-cover.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE_URL}/og-cover.jpg">
  <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20fill='%23050505'/%3E%3Cpath%20d='M16%204%20L29%2028%20H21.8%20L16%2016.4%20L10.2%2028%20H3%20Z'%20fill='%23ffffff'/%3E%3C/svg%3E">
  <script type="application/ld+json">${jsonld}</script>
  <meta http-equiv="refresh" content="0;url=../../#case-${p.id}">
  <script>location.replace('../../#case-${p.id}');</script>
  <style>
    body { background: #050505; color: #f2f2f2; font-family: monospace;
           display: grid; place-items: center; min-height: 100dvh; margin: 0; }
    a { color: inherit; }
  </style>
</head>
<body>
  <p>Открываю кейс ${esc(p.title)}…<br><a href="../../#case-${p.id}">Если ничего не произошло — нажмите здесь</a></p>
</body>
</html>
`;

  const dir = join(ROOT, 'works', p.id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html);
  console.log(`✓ works/${p.id}/index.html`);
}

// ---------- sitemap.xml: главная + все кейсы ----------
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Генерируется tools/gen-case-pages.mjs. При переезде на свой домен
     замените SITE_URL в js/config.js и перегенерируйте. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
${PROJECTS.map((p) => `  <url>
    <loc>${SITE_URL}/works/${p.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>
`;
await writeFile(join(ROOT, 'sitemap.xml'), sitemap);
console.log(`✓ sitemap.xml (${PROJECTS.length + 1} URL)`);
