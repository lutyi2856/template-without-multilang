/**
 * Capture mobile header screenshot (hamburger + logo)
 * Usage: node scripts/mobile-header-screenshot.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../../assets/mobile-header-check.png');

async function main() {
  const outDir = dirname(OUT_PATH);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Screenshot header area: top portion (hamburger + logo visible on mobile)
  const header = page.locator('header').first();
  await header.screenshot({ path: OUT_PATH });

  await browser.close();
  console.log('Screenshot saved to:', OUT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
