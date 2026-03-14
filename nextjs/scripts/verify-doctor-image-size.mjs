/**
 * Verify doctor card image URL - should NOT contain -226x300 (MEDIUM size)
 * GraphQL change: MEDIUM -> LARGE for doctor card images
 * Run: node scripts/verify-doctor-image-size.mjs
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:3000/doctors';
const SCREENSHOT_PATH = 'd:/template/.playwright-mcp/doctors-page-verify.png';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('img[src*="wp-content"], img[src*="unident"], img[src*="i.pravatar"]', { timeout: 5000 }).catch(() => null);

    // Full page screenshot
    await page.screenshot({
      path: SCREENSHOT_PATH.replace(/\//g, '\\'),
      fullPage: true,
    });
    console.log('SCREENSHOT_PATH:', SCREENSHOT_PATH);

    // Get first doctor card image src - Next.js Image renders img with src that may be optimized
    const imgSrc = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="doctor"], [data-testid="doctor-card"]');
      const imgs = document.querySelectorAll('main img, [class*="doctor"] img');
      for (const img of imgs) {
        const src = img.src || img.getAttribute('src');
        if (src && (src.includes('wp-content') || src.includes('unident') || src.includes('pravatar') || src.includes('_next/image'))) {
          return src;
        }
      }
      const firstImg = document.querySelector('main img, [role="img"]');
      return firstImg ? (firstImg.src || firstImg.getAttribute('src')) : null;
    });

    console.log('IMAGE_SRC:', imgSrc || 'NOT_FOUND');
    const hasOldSize = imgSrc && imgSrc.includes('-226x300');
    console.log('HAS_226x300:', hasOldSize ? 'YES (FAIL - old MEDIUM size)' : 'NO (PASS - LARGE or other size)');

    await browser.close();
    process.exit(hasOldSize ? 1 : 0);
  } catch (err) {
    console.error('Error:', err.message);
    await browser.close();
    process.exit(1);
  }
}

main();
