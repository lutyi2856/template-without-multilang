/**
 * Аудит изображений: проверка оптимизации через next/image
 * Запуск: node scripts/audit-images.mjs
 */
import { chromium } from 'playwright';

const PAGES = [
  'http://localhost:3000',
  'http://localhost:3000/services',
  'http://localhost:3000/doctors',
  'http://localhost:3000/promotions',
  'http://localhost:3000/prices',
  'http://localhost:3000/our-works',
  'http://localhost:3000/reviews',
  'http://localhost:3000/blog',
];

const results = {
  totalImages: 0,
  optimized: [],
  direct: [],
  noAlt: [],
  errors: [],
  formatSample: [],
};

async function auditPage(page, url) {
  const imgs = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.map((img) => ({
      src: img.src,
      alt: img.alt || '',
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
  });

  for (const img of imgs) {
    results.totalImages++;
    const isOptimized = img.src.includes('/_next/image');
    const hasAlt = img.alt && img.alt.trim().length > 0;

    if (isOptimized) {
      results.optimized.push({ url, src: img.src, alt: img.alt });
    } else {
      results.direct.push({ url, src: img.src, alt: img.alt });
    }
    if (!hasAlt) {
      results.noAlt.push({ url, src: img.src });
    }
  }
}

async function main() {
  console.log('=== Аудит изображений ===\n');
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    for (const url of PAGES) {
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        if (!response || response.status() >= 400) {
          results.errors.push({ url, error: `HTTP ${response?.status() || 'timeout'}` });
          continue;
        }
        await auditPage(page, url);
        console.log(`✓ ${url}`);
      } catch (e) {
        results.errors.push({ url, error: e.message });
        console.log(`✗ ${url}: ${e.message}`);
      }
    }

    // Проверка формата оптимизированных изображений (Content-Type)
    const formatSample = [];
    const optUrls = [...new Set(results.optimized.map((o) => o.src))].slice(0, 5);
    for (const u of optUrls) {
      try {
        const res = await page.goto(u, { waitUntil: 'commit', timeout: 5000 });
        const ct = res?.headers()['content-type'] || '';
        formatSample.push({ url: u.substring(0, 100), contentType: ct });
      } catch (_) {}
    }
    results.formatSample = formatSample;

    await browser.close();
  } catch (e) {
    console.error('Browser error:', e.message);
    process.exit(1);
  }

  // Отчёт
  console.log('\n=== Результаты ===');
  console.log(`Всего изображений: ${results.totalImages}`);
  console.log(`Оптимизированы (/_next/image): ${results.optimized.length}`);
  console.log(`Прямые URL (неоптимизированы): ${results.direct.length}`);
  console.log(`Без alt: ${results.noAlt.length}`);
  if (results.errors.length) {
    console.log(`Ошибки загрузки страниц: ${results.errors.length}`);
  }

  if (results.direct.length > 0) {
    console.log('\n--- Прямые URL (первые 15) ---');
    const unique = [...new Map(results.direct.map((d) => [d.src, d])).values()];
    unique.slice(0, 15).forEach((d) => console.log(d.src));
  }

  if (results.noAlt.length > 0) {
    console.log('\n--- Изображения без alt (первые 10) ---');
    results.noAlt.slice(0, 10).forEach((d) => console.log(d.src));
  }

  // JSON для плана
  console.log('\n--- JSON (для плана) ---');
  console.log(
    JSON.stringify(
      {
        totalImages: results.totalImages,
        optimizedCount: results.optimized.length,
        directCount: results.direct.length,
        noAltCount: results.noAlt.length,
        optimizedContentTypes: results.formatSample || [],
        directUrlsSample: [...new Set(results.direct.map((d) => d.src))].slice(0, 15),
        noAltSample: results.noAlt.slice(0, 10).map((d) => d.src),
        errors: results.errors,
      },
      null,
      2
    )
  );
}

main();
