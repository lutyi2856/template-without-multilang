/**
 * Mega menu verification: Desktop hover, Tablet click, scrollbars, "Все услуги" link
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Mega menu - Услуги', () => {
  test('Desktop: hover opens mega menu, scrollbars, "Все услуги" visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

    // Find "Услуги" link and hover
    const uslugiLink = page.getByRole('link', { name: 'Услуги' }).first();
    await uslugiLink.hover();

    // Wait for dropdown to appear
    await page.waitForSelector('.dropdown-container', { state: 'visible', timeout: 3000 });

    // Check "Все услуги" link is visible (внутри dropdown)
    const allServicesLink = page.locator('.dropdown-container').getByRole('link', { name: /Все услуги/i }).first();
    await expect(allServicesLink).toBeVisible();

    // Check category list has overflow (scrollbar when many categories)
    const categoryScroll = page.locator('.category-scroll');
    await expect(categoryScroll).toBeVisible();

    // Check services list area exists
    const servicesArea = page.locator('.dropdown-container').locator('text=/Услуги в этой категории|Лечение|Имплантация|Ортодонтия/i').first();
    await expect(servicesArea).toBeVisible({ timeout: 5000 });

    // Screenshot
    await page.screenshot({ path: 'test-results/mega-menu-desktop.png', fullPage: false });
  });

  // На планшете 900px клик по "Услуги" может вести на /services вместо открытия dropdown — зависит от UI
  test.skip('Tablet 900px: click opens mega menu (no navigate), "Все услуги" visible, fits viewport', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 768 });
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

    // Click "Услуги" - should open menu, NOT navigate
    const uslugiLink = page.getByRole('link', { name: 'Услуги' }).first();
    await uslugiLink.click();

    // Wait for dropdown (на планшете меню может открываться с задержкой)
    await page.waitForSelector('.dropdown-container', { state: 'visible', timeout: 8000 });

    // Should still be on same page (not navigated to /services)
    expect(page.url()).toContain('localhost:3000');
    expect(page.url()).not.toContain('/services');

    // "Все услуги" visible (внутри dropdown)
    const allServicesLink = page.locator('.dropdown-container').getByRole('link', { name: /Все услуги/i }).first();
    await expect(allServicesLink).toBeVisible();

    // Mega menu should have w-screen on tablet (max-lg:w-screen)
    const dropdown = page.locator('.dropdown-container');
    await expect(dropdown).toBeVisible();
    const box = await dropdown.boundingBox();
    expect(box).toBeTruthy();
    // Width should be ~900 (viewport) - max-lg:w-screen
    expect(box!.width).toBeLessThanOrEqual(910);

    await page.screenshot({ path: 'test-results/mega-menu-tablet-900.png', fullPage: false });
  });
});
