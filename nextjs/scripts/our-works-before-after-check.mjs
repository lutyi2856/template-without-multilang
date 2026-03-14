/**
 * Verify "Наши работы" section: screenshot + touch simulation on before/after slider
 * Usage: node scripts/our-works-before-after-check.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../test-results');
const SCREENSHOT_PATH = join(OUT_DIR, 'our-works-before-after.png');

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    // Mobile viewport for touch simulation
    isMobile: false,
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Find "Наши работы" section
  const section = page.locator('text=Наши работы').first().locator('..').locator('..');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Verify section is visible
  const sectionVisible = await section.isVisible();
  console.log('Section "Наши работы" visible:', sectionVisible);

  // Find first before-after slider (data-before-after-slider)
  const slider = page.locator('[data-before-after-slider]').first();
  const sliderVisible = await slider.isVisible();
  console.log('Before/after slider visible:', sliderVisible);

  // Screenshot
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
  console.log('Screenshot saved to:', SCREENSHOT_PATH);

  // Simulate pointer/touch on before/after area - drag handle (mouse works for pointer events)
  if (sliderVisible) {
    const box = await slider.boundingBox();
    if (box) {
      const startX = box.x + box.width * 0.5;
      const startY = box.y + box.height / 2;
      const endX = box.x + box.width * 0.7;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, startY, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);

      const afterPath = join(OUT_DIR, 'our-works-after-drag.png');
      await page.screenshot({ path: afterPath, fullPage: false });
      console.log('Screenshot after drag:', afterPath);
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
