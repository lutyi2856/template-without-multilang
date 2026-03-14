/**
 * Capture review card screenshots at multiple viewports
 * Usage: node scripts/review-card-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../assets');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch('http://localhost:' + port);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  let serverRunning = false;
  try {
    const res = await fetch('http://localhost:3000');
    serverRunning = res.ok;
  } catch {
    serverRunning = false;
  }

  if (!serverRunning) {
    console.log('Dev server not running. Starting npm run dev...');
    const { spawn } = await import('child_process');
    spawn('npm', ['run', 'dev'], {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    });
    const ready = await waitForServer(3000);
    if (!ready) {
      console.error('Dev server failed to start within 30 seconds');
      process.exit(1);
    }
    console.log('Dev server ready.');
  }

  const browser = await chromium.launch();

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(OUT_DIR, 'review-card-' + vp.name + '.png'),
      fullPage: true,
    });
    console.log('Saved review-card-' + vp.name + '.png');

    await page.goto('http://localhost:3000/reviews', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: join(OUT_DIR, 'review-card-reviews-' + vp.name + '.png'),
      fullPage: true,
    });
    console.log('Saved review-card-reviews-' + vp.name + '.png');

    await context.close();
  }

  await browser.close();
  console.log('All screenshots saved to:', OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
