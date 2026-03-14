/**
 * Take screenshot of reviews section (#reviews) at mobile viewport 375x812
 */
import { test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Featured reviews section - mobile 375x812 screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

  const reviewsSection = page.locator('#reviews');
  try {
    await reviewsSection.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    test.skip(true, 'Reviews section not rendered - no reviews data from WordPress');
  }

  await reviewsSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  await reviewsSection.screenshot({
    path: 'test-results/featured-reviews-mobile.png',
  });
});
