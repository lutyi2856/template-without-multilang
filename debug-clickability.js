const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000); // Wait for React hydration
  
  console.log('2. Taking initial screenshot...');
  await page.screenshot({ path: '.playwright-mcp/initial-page.png', fullPage: true });
  
  console.log('3. Checking element at coordinates (500, 400)...');
  const elementAtPoint = await page.evaluate(() => {
    const el = document.elementFromPoint(500, 400);
    return {
      tagName: el?.tagName,
      className: el?.className,
      id: el?.id,
      innerHTML: el?.innerHTML?.substring(0, 200),
      zIndex: window.getComputedStyle(el).zIndex,
      position: window.getComputedStyle(el).position,
      pointerEvents: window.getComputedStyle(el).pointerEvents
    };
  });
  console.log('Element at (500, 400):', JSON.stringify(elementAtPoint, null, 2));
  
  console.log('4. Counting fixed/absolute elements...');
  const fixedAbsoluteCount = await page.evaluate(() => {
    return document.querySelectorAll('[style*="position: fixed"], [style*="position: absolute"]').length;
  });
  console.log('Fixed/Absolute elements count:', fixedAbsoluteCount);
  
  console.log('5. Checking for BVI elements...');
  const bviCount = await page.evaluate(() => {
    return document.querySelectorAll('.bvi-panel, .bvi-body, .bvi-open, [class*="bvi"]').length;
  });
  console.log('BVI elements count:', bviCount);
  
  console.log('6. Checking pointer-events on body...');
  const bodyPointerEvents = await page.evaluate(() => {
    return window.getComputedStyle(document.body).pointerEvents;
  });
  console.log('Body pointer-events:', bodyPointerEvents);
  
  console.log('7. Trying to click navigation link "Врачи"...');
  try {
    const doctorsLink = page.locator('a:has-text("Врачи")').first();
    await doctorsLink.click({ timeout: 5000 });
    console.log('Click successful! Current URL:', page.url());
  } catch (error) {
    console.log('Click failed:', error.message);
  }
  
  console.log('8. Taking final screenshot...');
  await page.screenshot({ path: '.playwright-mcp/after-click.png', fullPage: true });
  
  console.log('9. Getting all elements with high z-index...');
  const highZIndexElements = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'));
    return allElements
      .map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        zIndex: window.getComputedStyle(el).zIndex,
        position: window.getComputedStyle(el).position,
        pointerEvents: window.getComputedStyle(el).pointerEvents
      }))
      .filter(el => el.zIndex !== 'auto' && parseInt(el.zIndex) > 100)
      .sort((a, b) => parseInt(b.zIndex) - parseInt(a.zIndex));
  });
  console.log('High z-index elements:', JSON.stringify(highZIndexElements, null, 2));
  
  console.log('\n=== Investigation Complete ===');
  
  await browser.close();
})();
