/**
 * Footer tablet (768px) check: buttons visibility, horizontal scroll
 * Report-only: screenshots + console output
 */
import { test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Tablet 768px: footer report', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  // Check horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  // Check buttons in footer
  const footer = page.locator('footer').first();
  const svyazatInFooter = footer.getByRole('link', { name: /Связаться с нами/i });
  const zapisatInFooter = footer.getByRole('link', { name: /Записаться на прием/i });

  const svyazatVisible = await svyazatInFooter.first().isVisible().catch(() => false);
  const zapisatVisible = await zapisatInFooter.first().isVisible().catch(() => false);

  // Screenshot footer
  await footer.screenshot({ path: 'test-results/footer-tablet-768.png' });
  await page.screenshot({ path: 'test-results/footer-tablet-768-full.png', fullPage: true });

  // Report
  console.log('=== FOOTER REPORT (768px tablet) ===');
  console.log('Horizontal scroll:', hasHorizontalScroll ? 'YES' : 'NO');
  console.log('"Связаться с нами" visible:', svyazatVisible);
  console.log('"Записаться на прием" visible:', zapisatVisible);
});
