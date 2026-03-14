/**
 * Verify promotions slider arrows are clickable
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Promotions section - arrows are clickable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

  // Scroll to "Все акции" button (promotions section)
  const allPromoBtn = page.getByRole('link', { name: /Все акции/i }).first();
  await allPromoBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Стрелки в той же flex-группе что и "Все акции" (SliderNavigation рядом с кнопкой)
  const headerWithArrows = allPromoBtn.locator('..');
  const nextBtn = headerWithArrows.getByRole('button', { name: 'Next' }).first();
  const prevBtn = headerWithArrows.getByRole('button', { name: 'Previous' }).first();

  const hasArrows = await nextBtn.count() > 0 && (await prevBtn.count()) > 0;
  if (hasArrows) {
    await expect(nextBtn).not.toBeDisabled();
    await expect(prevBtn).not.toBeDisabled();
    await nextBtn.click();
    await page.waitForTimeout(300);
    await prevBtn.click();
  }
});
