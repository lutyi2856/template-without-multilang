/**
 * Screenshot of Our Works section (Наши работы) for verification
 */
import { test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Our Works section - desktop screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

  const section = page.locator('text=Наши работы').first().locator('..').locator('..');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'test-results/our-works-desktop.png',
    fullPage: false,
  });
});
