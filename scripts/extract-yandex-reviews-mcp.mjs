#!/usr/bin/env node
/**
 * Playwright MCP workflow for Yandex reviews extraction.
 * Use when running extraction via Cursor's Playwright MCP (browser_navigate + browser_run_code).
 *
 * This script outputs the browser_run_code to use. After running it via MCP,
 * save the returned JSON to kan-data/yandex-reviews-extracted.json
 *
 * Workflow:
 * 1. browser_navigate to https://yandex.uz/maps/org/220794203261/reviews/?ll=69.323081%2C41.324594&z=16
 * 2. browser_run_code with the code from this script (run: node scripts/extract-yandex-reviews-mcp.mjs --code)
 * 3. write the result to kan-data/yandex-reviews-extracted.json
 */

const SOURCES = [
  {
    platform: "yandex",
    url: "https://yandex.uz/maps/org/220794203261/reviews/?ll=69.323081%2C41.324594&z=16",
  },
];

const BROWSER_RUN_CODE = `
(async () => {
  const sourceUrl = "${SOURCES[0].url}";
  const reviewLocator = page.locator(".business-reviews-card-view__review");
  await reviewLocator.first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});

  const container = page.locator(".business-reviews-card-view__reviews-container, [role='list']").first();
  let prevCount = 0, stableCount = 0;
  for (let i = 0; i < 30; i++) {
    const count = await reviewLocator.count();
    if (count === prevCount) { stableCount++; if (stableCount >= 3) break; } else stableCount = 0;
    prevCount = count;
    await container.evaluate((el) => el?.scrollBy?.(0, 600)).catch(() => {});
    await page.waitForTimeout(800);
  }

  const clickExpand = async (sel, maxClicks = 80) => {
    let n = 0;
    while (n < maxClicks) {
      const btns = page.locator(sel);
      if ((await btns.count()) === 0) break;
      try {
        await btns.first().scrollIntoViewIfNeeded({ timeout: 2000 });
        await btns.first().click({ timeout: 2000 });
        await page.waitForTimeout(400);
        n++;
      } catch { break; }
    }
  };
  await clickExpand('button[aria-label="Ещё"], button:has-text("Ещё")');
  await clickExpand('button:has-text("Посмотреть ответ"), a:has-text("Посмотреть ответ")');
  await clickExpand('button[aria-label="Ещё"], button:has-text("Ещё")');
  await page.waitForTimeout(500);

  return await page.evaluate((url) => {
    const result = [];
    document.querySelectorAll(".business-reviews-card-view__review").forEach((card) => {
      const authorEl = card.querySelector(".business-review-view__author-name a, [itemprop='author'] a, .business-review-view__user-link");
      const authorName = authorEl?.textContent?.trim() || "Аноним";
      const dateEl = card.querySelector("[itemprop='datePublished']") || card.querySelector(".business-review-view__body span") || card.querySelector(".business-review-view__info > div:nth-of-type(2)");
      const date = dateEl?.textContent?.trim() || null;
      const bodyEl = card.querySelector("[itemprop='reviewBody']");
      const content = (bodyEl?.textContent?.trim() || "").replace(/\\s*…\\s*[Ее]щё\\s*$/i, "");
      const orgEl = card.querySelector(".business-review-view__organization-response, [class*='organization-response']");
      let clinicAnswer = orgEl?.textContent?.trim() || null;
      if (clinicAnswer) { clinicAnswer = clinicAnswer.replace(/^Ответ организации:\\s*/i, "").trim(); if (clinicAnswer.length < 5) clinicAnswer = null; }
      const ratingMeta = card.querySelector('meta[itemprop="ratingValue"]');
      const ratingEl = card.querySelector("[itemprop='reviewRating']");
      let rating = ratingMeta?.content ? parseInt(ratingMeta.content, 10) : null;
      if (!rating && ratingEl) { const r = ratingEl.querySelector('meta[itemprop="ratingValue"]'); rating = r?.content ? parseInt(r.content, 10) : null; }
      if (!rating) { const m = card.querySelector('[aria-label*="звезд"], [aria-label*="star"]')?.getAttribute("aria-label")?.match(/(\\d+)/); rating = m ? parseInt(m[1], 10) : null; }
      const likesEl = card.querySelector(".business-reactions-view__counter");
      const likes = likesEl?.textContent?.trim() || null;
      const imgs = card.querySelectorAll(".business-review-media__item-img, [class*='review-media'] img");
      const images = Array.from(imgs).map((img) => img.src).filter(Boolean);
      if (content.length >= 5) result.push({ authorName, date, content, rating, clinicAnswer, likes, images, sourceUrl: url });
    });
    return result;
  }, sourceUrl);
})();
`;

if (process.argv.includes("--code")) {
  console.log(BROWSER_RUN_CODE.trim());
} else {
  console.log("Usage: node scripts/extract-yandex-reviews-mcp.mjs --code");
  console.log("");
  console.log("Outputs the browser_run_code for Playwright MCP.");
  console.log("Workflow:");
  console.log("1. browser_navigate to", SOURCES[0].url);
  console.log("2. browser_run_code with the output of this script");
  console.log("3. Save result to kan-data/yandex-reviews-extracted.json");
}
