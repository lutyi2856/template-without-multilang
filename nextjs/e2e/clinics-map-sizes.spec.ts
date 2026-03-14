/**
 * Verify clinics-on-map section dimensions on desktop (1024px+)
 * Map: min-height 597px, Card: width 387px
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Desktop 1280px: clinics map and card dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });

  // Scroll to clinics section (заголовок может быть "Наши клиники на карте Москвы" или из конфига)
  const clinicsSection = page.locator('[data-slider="clinics-on-map"]').first();
  await clinicsSection.scrollIntoViewIfNeeded({ timeout: 15000 });
  await page.waitForTimeout(2000); // Wait for map/card to render

  // Get dimensions via evaluate
  const dims = await page.evaluate(() => {
    const slider = document.querySelector('[data-slider="clinics-on-map"]');
    if (!slider) return { mapHeight: 0, mapWidth: 0, cardWidth: 0 };
    const mapContainer = slider.closest('.relative.w-full');
    const mapRect = mapContainer?.getBoundingClientRect();
    const sliderRect = slider.getBoundingClientRect();
    return {
      mapHeight: mapRect?.height ?? 0,
      mapWidth: mapRect?.width ?? 0,
      cardWidth: sliderRect.width,
    };
  });

  // Screenshot
  await page.screenshot({ path: 'test-results/clinics-map-desktop-1280.png', fullPage: false });

  // Report
  console.log('=== CLINICS MAP REPORT (1280px desktop) ===');
  console.log('Map container height:', dims.mapHeight);
  console.log('Map container width:', dims.mapWidth);
  console.log('Card/slider width:', dims.cardWidth);

  // Skip assertions если секция не отрендерилась (нет данных клиник из WordPress)
  test.skip(dims.mapHeight === 0, 'Clinics section not rendered - no clinics data');

  // Assert: map height ~597, card width ~387
  expect(dims.mapHeight).toBeGreaterThanOrEqual(590);
  expect(dims.mapHeight).toBeLessThanOrEqual(620);
  expect(dims.cardWidth).toBeGreaterThanOrEqual(382);
  expect(dims.cardWidth).toBeLessThanOrEqual(395);
});
