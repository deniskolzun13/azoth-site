// ============================================================
// Проверка согласованности конфигурации (js/config.js vs index.html, sitemap, demo)
// Запуск: node tools/check-config.mjs
// ============================================================

import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BRAND, SITE_URL, CONTACTS, LEAD_API, METRICA_ID } from '../js/config.js';
import { PROJECTS } from '../js/data/projects.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let warnings = 0;
let passes = 0;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
  passes++;
}

function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
  warnings++;
}

async function run() {
  console.log(`\n[AZOTH] Проверка конфигурации проекта...\n`);

  // 1. Проверка index.html
  const indexHtml = await readFile(join(ROOT, 'index.html'), 'utf8');

  if (indexHtml.includes(BRAND)) {
    pass(`index.html содержит имя бренда: ${BRAND}`);
  } else {
    warn(`index.html не содержит имя бренда из config.js: ${BRAND}`);
  }

  if (indexHtml.includes(SITE_URL)) {
    pass(`index.html содержит SITE_URL: ${SITE_URL}`);
  } else {
    warn(`index.html: canonical/og:url не совпадает с SITE_URL (${SITE_URL})`);
  }

  if (indexHtml.includes(CONTACTS.email)) {
    pass(`index.html содержит email: ${CONTACTS.email}`);
  } else {
    warn(`index.html не содержит email (${CONTACTS.email})`);
  }

  // 2. Проверка sitemap.xml
  try {
    const sitemap = await readFile(join(ROOT, 'sitemap.xml'), 'utf8');
    if (sitemap.includes(SITE_URL)) {
      pass(`sitemap.xml согласован с SITE_URL (${SITE_URL})`);
    } else {
      warn(`sitemap.xml содержит ссылки на другой домен; запустите: npm run build:cases`);
    }
  } catch (_) {
    warn(`sitemap.xml не найден`);
  }

  // 3. Проверка проектов и их демо/скриншотов
  console.log(`\nПроверка проектов (${PROJECTS.length} кейсов):`);
  for (const p of PROJECTS) {
    let shotsOk = true;
    for (const shot of (p.shots || [])) {
      if (typeof shot === 'string') {
        const fullPath = join(ROOT, shot.replace(/^\.\//, ''));
        try {
          await access(fullPath);
        } catch {
          warn(`Кейс [${p.id}]: не найден файл скриншота ${shot}`);
          shotsOk = false;
        }
      }
    }
    if (shotsOk) {
      pass(`Кейс [${p.id}] (${p.title}): скриншоты проверены (${(p.shots || []).length} шт.)`);
    }

    if (p.demo) {
      const demoPath = join(ROOT, p.demo.replace(/^\.\//, ''));
      try {
        await access(demoPath);
        pass(`Кейс [${p.id}]: живое демо ${p.demo} доступно`);
      } catch {
        warn(`Кейс [${p.id}]: папка демо ${p.demo} не найдена`);
      }
    }
  }

  // 4. Статус бэкенда и аналитики
  console.log(`\nИнтеграции:`);
  if (LEAD_API) {
    pass(`LEAD_API настроен: ${LEAD_API}`);
  } else {
    console.log(`  ℹ LEAD_API пуст (форма работает в автономном режиме без Worker)`);
  }

  if (METRICA_ID) {
    pass(`METRICA_ID настроен: ${METRICA_ID}`);
  } else {
    console.log(`  ℹ METRICA_ID пуст (Яндекс.Метрика отключена)`);
  }

  console.log(`\nИтог: ${passes} проверок пройдено, ${warnings} предупреждений.\n`);
}

run().catch((err) => {
  console.error('Ошибка проверки:', err);
  process.exit(1);
});
