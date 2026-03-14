#!/usr/bin/env node
import "dotenv/config";
/**
 * Extract reviews from Yandex Maps, 2GIS, Google Maps.
 * Output: kan-data/imported-reviews.json
 *
 * Run: node scripts/extract-external-reviews.mjs
 *      node scripts/extract-external-reviews.mjs --google-html ./kan-data/google-reviews.html
 *      node scripts/extract-external-reviews.mjs --yandex-html ./kan-data/yandex-reviews.html
 *      node scripts/extract-external-reviews.mjs --2gis-html ./kan-data/2gis-reviews.html
 *      node scripts/extract-external-reviews.mjs --yandex-only  # Yandex only, saves to yandex-reviews-extracted.json
 *      APIFY_TOKEN в .env или: APIFY_TOKEN=xxx node ... --yandex-only  # Apify (full text + clinicAnswer)
 *      node scripts/extract-external-reviews.mjs --2gis-only   # 2GIS only, saves to 2gis-reviews-extracted.json
 *      APIFY_TOKEN в .env или: APIFY_TOKEN=xxx node ... --2gis-only  # Apify (full text + clinicAnswer)
 *      node scripts/extract-external-reviews.mjs --google-only  # Google only, saves to google-reviews-extracted.json
 *      APIFY_TOKEN в .env или: APIFY_TOKEN=xxx node ... --google-only  # Apify (full text)
 */

import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ApifyClient } from "apify-client";

chromium.use(StealthPlugin());
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "kan-data");
const OUT_PATH = join(OUT_DIR, "imported-reviews.json");

const SOURCES = [
  {
    platform: "yandex",
    url: "https://yandex.uz/maps/org/220794203261/reviews/?ll=69.323081%2C41.324594&z=16",
    rating: 5,
  },
  {
    platform: "2gis",
    url: "https://2gis.uz/tashkent/firm/70000001080407266/tab/reviews",
    rating: 5,
  },
  {
    platform: "google",
    url: "https://www.google.com/maps/place/Kan+Dental+Clinic/@41.324343,69.3235313,17z/data=!4m8!3m7!1s0x38aef5ff8d720db1:0xb34f9cfec67171bd!8m2!3d41.324343!4d69.3235313!9m1!1b1!16s%2Fg%2F11vf6wt68y?entry=ttu",
    rating: 4.7,
  },
];

/** Parse Yandex reviews from HTML (saved from browser or copied snippet).
 * Structure: business-reviews-card-view__review blocks, business-review-view__author-name, schema.org Review. */
function parseYandexReviewsFromHtml(html) {
  const reviews = [];
  const blockRe =
    /<div[^>]*class="[^"]*business-reviews-card-view__review[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*business-reviews-card-view__review[^"]*"|<div class="business-reviews-card-view__space"|$)/gi;
  const authorRe =
    /<div[^>]*class="[^"]*business-review-view__author-name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i;
  const authorFallbackRe = /itemprop="author"[^>]*>[\s\S]*?>([^<]+)</i;
  const dateRe = /(\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+\d{4})?)/i;
  const datePublishedRe = /itemprop="datePublished"[^>]*content="([^"]+)"/i;
  const reviewBodyRe = /itemprop="reviewBody"[^>]*>([\s\S]*?)<\/[a-z]+(?:\s|>)/i;
  const ratingRe = /itemprop="reviewRating"[^>]*>[\s\S]*?content="(\d)"/i;
  const ratingFallbackRe = /(?:aria-label|title)="(\d)\s*(?:звезд|star)/i;
  const orgResponseRe =
    /<div[^>]*class="[^"]*organization-response[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
  const orgResponseAltRe =
    /(?:Ответ организации|Ответ владельца)[\s\S]*?<div[^>]*class="[^"]*organization[^"]*"[^>]*>([\s\S]*?)<\/div>/i;

  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const block = m[1];
    const authorM = block.match(authorRe) || block.match(authorFallbackRe);
    const authorName = authorM ? authorM[1].replace(/<[^>]+>/g, "").trim() : "Аноним";

    const dateM = block.match(datePublishedRe) || block.match(dateRe);
    const date = dateM ? (dateM[1].includes("-") ? dateM[1].slice(0, 10) : dateM[1].trim()) : null;

    const contentM = block.match(reviewBodyRe);
    let content = contentM ? contentM[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
    if (!content) {
      const textBlock = block.replace(/<script[\s\S]*?<\/script>/gi, "");
      const afterAuthor = textBlock.slice(textBlock.indexOf("business-review-view__") + 100);
      const contentEnd = afterAuthor.search(/Посмотреть ответ|Ответ организации|Ответ владельца|Подписаться/);
      content = (contentEnd >= 0 ? afterAuthor.slice(0, contentEnd) : afterAuthor)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    content = content.replace(/\s*…\s*ещё\s*$/i, "").trim();
    if (content.length < 10) continue;

    const ratingM = block.match(ratingRe) || block.match(ratingFallbackRe);
    const rating = ratingM ? parseInt(ratingM[1], 10) : null;

    const orgM = block.match(orgResponseRe) || block.match(orgResponseAltRe);
    let clinicAnswer = orgM ? orgM[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
    if (clinicAnswer) clinicAnswer = clinicAnswer.replace(/^(?:Ответ организации|Ответ владельца):\s*/i, "").trim();
    if (clinicAnswer && clinicAnswer.length < 5) clinicAnswer = null;
    if (block.includes("Посмотреть ответ организации") && !clinicAnswer) clinicAnswer = "(есть)";

    const likesRe = /business-reactions-view__counter[^>]*>([^<]+)/;
    const likesM = block.match(likesRe);
    const likes = likesM ? likesM[1].trim() : null;

    const imgs = block.match(/business-review-media__item-img[^>]*src="([^"]+)"/g) || [];
    const images = imgs.map((m) => {
      const src = m.match(/src="([^"]+)"/);
      return src ? src[1] : null;
    }).filter(Boolean);

    reviews.push({
      source: "yandex",
      authorName,
      date,
      content,
      clinicAnswer,
      rating,
      likes,
      images,
      sourceUrl: SOURCES[0].url,
    });
  }
  return reviews;
}

/** Parse Yandex reviews from page text (innerText) */
function parseYandexText(text) {
  const reviews = [];
  const dateRe = /(\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+\d{4})?)/g;

  const blocks = text.split(/(?=Знаток города \d+ уровня)/);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const prevBlock = blocks[i - 1];
    const dateMatch = block.match(dateRe);
    if (!dateMatch) continue;
    const date = dateMatch[0];
    const afterDate = block.slice(block.indexOf(date) + date.length);
    const contentEnd = afterDate.indexOf("Посмотреть ответ организации");
    let content = (contentEnd >= 0 ? afterDate.slice(0, contentEnd) : afterDate)
      .replace(/Подписаться/g, "")
      .replace(/^\s*[\d]+\s*$/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    if (content.length < 15) continue;

    const authorLine = prevBlock.trim().split(/\n/).pop() || "";
    const authorName = authorLine
      .replace(/^\[|\].*$/g, "")
      .replace(/\(https?:\/\/[^)]+\)/g, "")
      .trim();
    const finalAuthor = authorName && !authorName.includes("Знаток") ? authorName : "Аноним";

    reviews.push({
      source: "yandex",
      authorName: finalAuthor,
      date,
      content,
      clinicAnswer: block.includes("Посмотреть ответ организации") ? "(есть)" : null,
      sourceUrl: SOURCES[0].url,
    });
  }
  return reviews;
}

/** Extract Yandex reviews via Playwright with full expansion (Ещё, Посмотреть ответ организации). */
async function extractYandexReviewsFull(page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(SOURCES[0].url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  if (title.includes("робот") || title.includes("Вы не робот")) {
    console.log("  Yandex captcha detected. Use --yandex-html <file> with manually saved HTML after solving captcha.");
  }

  const reviewLocator = page.locator(".business-reviews-card-view__review");
  let waitOk = false;
  try {
    await reviewLocator.first().waitFor({ state: "visible", timeout: 12000 });
    waitOk = true;
  } catch {
    // Fall through - may have different structure
  }

  const container = page.locator(".business-reviews-card-view__reviews-container, [role='list']").first();
  let prevCount = 0;
  let stableCount = 0;
  const maxScrolls = 30;

  if (waitOk) {
    try {
      for (let i = 0; i < maxScrolls; i++) {
        const count = await reviewLocator.count();
        if (count === prevCount) {
          stableCount++;
          if (stableCount >= 3) break;
        } else {
          stableCount = 0;
        }
        prevCount = count;
        await container.evaluate((el) => el?.scrollBy?.(0, 600));
        await page.waitForTimeout(800);
      }
    } catch {
      // Container may not exist
    }
  }

  // Context7 pattern: wait for network response after click (Playwright waitForResponse)
  const clickExpandButtons = async (selector, maxClicks = 100, waitMs = 800) => {
    let clickCount = 0;
    while (clickCount < maxClicks) {
      const buttons = page.locator(selector);
      const count = await buttons.count();
      if (count === 0) break;
      try {
        const btn = buttons.first();
        await btn.scrollIntoViewIfNeeded({ timeout: 3000 });
        // Wait for any Yandex API response after click (expand may trigger fetch)
        const responsePromise = page.waitForResponse(
          (r) => r.url().includes("yandex") && r.request().method() === "GET",
          { timeout: 5000 },
        ).catch(() => null);
        await btn.click({ timeout: 3000, force: true });
        await responsePromise;
        await page.waitForTimeout(waitMs);
        clickCount++;
      } catch {
        break;
      }
    }
  };

  await clickExpandButtons('button[aria-label="Ещё"], button:has-text("Ещё")', 100, 800);
  await clickExpandButtons(
    'button:has-text("Посмотреть ответ"), a:has-text("Посмотреть ответ")',
    100,
    1200,
  );
  await clickExpandButtons('button[aria-label="Ещё"], button:has-text("Ещё")', 50, 800);

  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1000);

  const reviews = await page.evaluate((sourceUrl) => {
    const result = [];
    const cards = document.querySelectorAll(".business-reviews-card-view__review");
    cards.forEach((card) => {
      const authorEl = card.querySelector(
        ".business-review-view__author-name a, [itemprop='author'] a, .business-review-view__user-link",
      );
      const authorName = authorEl?.textContent?.trim() || "Аноним";

      const dateRe =
        /\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+\d{4})?/i;
      const dateMeta = card.querySelector("[itemprop='datePublished']");
      let date =
        (dateMeta?.tagName === "META" ? dateMeta?.content : dateMeta?.textContent?.trim()) ||
        card.querySelector(".business-review-view__body span")?.textContent?.trim() ||
        card.querySelector(".business-review-view__info > div:nth-of-type(2)")?.textContent?.trim() ||
        null;
      if (!date && card.textContent) {
        const m = card.textContent.match(dateRe);
        date = m ? m[0].trim() : null;
      }

      const bodyEl = card.querySelector("[itemprop='reviewBody']");
      const content = bodyEl?.textContent?.trim() || "";

      const orgEl = card.querySelector(
        ".business-review-view__organization-response, [class*='organization-response']",
      );
      let clinicAnswer = orgEl?.textContent?.trim() || null;
      if (clinicAnswer) {
        clinicAnswer = clinicAnswer.replace(/^Ответ организации:\s*/i, "").trim();
        if (clinicAnswer.length < 5) clinicAnswer = null;
      }

      const ratingMeta = card.querySelector('meta[itemprop="ratingValue"]');
      const ratingEl = card.querySelector("[itemprop='reviewRating']");
      let rating = ratingMeta?.content ? parseInt(ratingMeta.content, 10) : null;
      if (!rating && ratingEl) {
        const r = ratingEl.querySelector('meta[itemprop="ratingValue"]');
        rating = r?.content ? parseInt(r.content, 10) : null;
      }
      if (!rating) {
        const starEl = card.querySelector('[aria-label*="звезд"], [aria-label*="star"]');
        const m = starEl?.getAttribute("aria-label")?.match(/(\d+)/);
        rating = m ? parseInt(m[1], 10) : null;
      }

      const likesEl = card.querySelector(".business-reactions-view__counter");
      const likes = likesEl?.textContent?.trim() || null;

      const imgs = card.querySelectorAll(".business-review-media__item-img, [class*='review-media'] img");
      const images = Array.from(imgs).map((img) => img.src).filter(Boolean);

      if (content.length >= 5) {
        result.push({
          authorName,
          date,
          content: content.replace(/\s*…\s*[Ее]щё\s*$/i, "").trim(),
          rating,
          clinicAnswer,
          likes,
          images,
          sourceUrl,
        });
      }
    });
    return result;
  }, SOURCES[0].url);

  if (reviews.length === 0) {
    const html = await page.content();
    mkdirSync(OUT_DIR, { recursive: true });
    const debugPath = join(OUT_DIR, "yandex-reviews-debug.html");
    writeFileSync(debugPath, html, "utf8");
    console.log(`  Saved debug HTML to ${debugPath}`);
    const parsed = parseYandexReviewsFromHtml(html);
    if (parsed.length > 0) return parsed;
    const text = await page.evaluate(() => document.body.innerText);
    return parseYandexText(text).length > 0
      ? parseYandexText(text)
      : [{ source: "yandex", content: text.slice(0, 5000), sourceUrl: SOURCES[0].url }];
  }

  return reviews.map((r) => ({
    source: "yandex",
    authorName: r.authorName,
    date: r.date,
    content: r.content,
    rating: r.rating,
    clinicAnswer: r.clinicAnswer,
    likes: r.likes,
    images: r.images,
    sourceUrl: r.sourceUrl,
  }));
}

/** Extract Yandex reviews via Playwright (delegates to full extraction). */
async function extractYandexReviews(page) {
  return extractYandexReviewsFull(page);
}

/** Extract 2GIS reviews via Playwright */
async function extract2GisReviews(page) {
  await page.goto(SOURCES[1].url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(5000);

  const reviews = await page.evaluate(() => {
    const result = [];
    const items = document.querySelectorAll('[class*="review"], [class*="Review"], [data-testid*="review"]');
    if (items.length === 0) {
      const text = document.body.innerText;
      const reviewMatch = text.match(/Отзывы(\d+)/);
      if (reviewMatch) {
        return [{ _raw: "reviews_count", count: parseInt(reviewMatch[1], 10) }];
      }
    }
    items.forEach((el, i) => {
      const text = el.innerText || "";
      if (text.length > 20 && !text.includes("Нашли ошибку")) {
        result.push({ content: text, index: i });
      }
    });
    return result.length ? result : [{ _raw: "body_preview", text: document.body.innerText.slice(0, 2000) }];
  });

  if (reviews[0]?._raw === "reviews_count") {
    return [{ source: "2gis", content: `Отзывов: ${reviews[0].count}`, sourceUrl: SOURCES[1].url }];
  }
  if (reviews[0]?._raw === "body_preview") {
    return [{ source: "2gis", content: reviews[0].text, sourceUrl: SOURCES[1].url }];
  }
  return reviews.map((r) => ({
    source: "2gis",
    content: r.content,
    sourceUrl: SOURCES[1].url,
  }));
}

/** Parse 2GIS reviews from HTML (saved from browser or copied snippet).
 * 2GIS uses obfuscated class names (e.g. _16s5yj36, _a5f6uz, _49x36f, _1msln3t, _92aljh).
 * Uses regex for review blocks and flexible fallbacks when structure differs. */
function parse2GisReviewsFromHtml(html) {
  const reviews = [];
  // Try to find review blocks — 2GIS often wraps each review in a container with review-like classes
  const blockPatterns = [
    /<div[^>]*class="[^"]*_[a-z0-9]+[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*_[a-z0-9]+[^"]*"[^>]*data-|$)/gi,
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<div[^>]*role="listitem"[^>]*>([\s\S]*?)(?=<div[^>]*role="listitem"|$)/gi,
  ];

  let blocks = [];
  for (const re of blockPatterns) {
    let m;
    const found = [];
    while ((m = re.exec(html)) !== null) {
      const block = m[1];
      if (block && block.length > 50 && !block.includes("Нашли ошибку")) found.push(block);
    }
    if (found.length > 0) {
      blocks = found;
      break;
    }
  }

  if (blocks.length === 0) {
    // Fallback: split by common 2GIS patterns
    const parts = html.split(/(?=<div[^>]*class="[^"]*_1[a-z0-9]{6,}[^"]*")/i);
    blocks = parts.filter((p) => p.length > 100 && (p.includes("звезд") || p.includes("star")));
  }

  const dateRe = /(\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+\d{4})?)/i;
  const dateIsoRe = /(\d{4}-\d{2}-\d{2})/;
  const ratingRe = /(?:aria-label|title)="(\d)\s*(?:звезд|star)/i;
  const ratingSvgRe = /<svg[^>]*>[\s\S]*?<\/svg>\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<svg[^>]*>[\s\S]*?<\/svg>\s*<svg[^>]*>[\s\S]*?<\/svg>/;
  const officialAnswerRe = /(?:официальный ответ|ответ организации)[\s\S]*?<div[^>]*class="[^"]*_[a-z0-9]+[^"]*"[^>]*>([\s\S]*?)<\/div>/i;
  const authorRe = /<[^>]*(?:title|aria-label)="([^"]+)"[^>]*>/i;
  const authorFallbackRe = /<a[^>]*class="[^"]*_[a-z0-9]+[^"]*"[^>]*>([^<]+)</i;

  for (const block of blocks) {
    const authorM = block.match(authorRe) || block.match(authorFallbackRe);
    const authorName = authorM ? authorM[1].replace(/<[^>]+>/g, "").trim() : "Аноним";
    if (authorName.length > 100) continue;

    const dateM = block.match(dateIsoRe) || block.match(dateRe);
    const date = dateM ? (dateM[1].includes("-") ? dateM[1].slice(0, 10) : dateM[1].trim()) : null;

    let content = block
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    const contentMatch = content.match(/<div[^>]*class="[^"]*_49x36f[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
      || content.match(/<p[^>]*>([\s\S]*?)<\/p>/)
      || content.match(/<span[^>]*>([\s\S]*?)<\/span>/);
    content = contentMatch
      ? contentMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    content = content.replace(/\s*Читать целиком\s*$/i, "").trim();
    if (content.length < 10) continue;

    const ratingM = block.match(ratingRe);
    const rating = ratingM ? parseInt(ratingM[1], 10) : null;

    const orgM = block.match(officialAnswerRe);
    let clinicAnswer = orgM ? orgM[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null;
    if (clinicAnswer && clinicAnswer.length < 5) clinicAnswer = null;

    reviews.push({
      source: "2gis",
      authorName,
      date,
      content,
      rating,
      clinicAnswer,
      likes: null,
      images: [],
      sourceUrl: SOURCES[1].url,
    });
  }
  return reviews;
}

/** Parse Google reviews from HTML (saved from browser or page content). */
function parseGoogleReviewsFromHtml(html) {
  const reviews = [];
  // Primary: jftiEf blocks with aria-label; fallback: data-review-id blocks
  const blockRe =
    /<div[^>]*class="[^"]*jftiEf[^"]*"[^>]*aria-label="([^"]*)"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*jftiEf[^"]*"|<\/div>\s*<div class="AyRUI"|$)/gi;
  const imgRe = /<img[^>]*class="[^"]*NBa7we[^"]*"[^>]*src="([^"]+)"/;
  const ratingRe = /aria-label="(\d+)[^"]*звезд[а]?/i;  // "5 звезд", "5&nbsp;звезд", "1 звезда"
  const dateRe = /class="rsqaWe"[^>]*>([^<]+)</;
  const contentRe = /class="MyEned"[^>]*>[\s\S]*?<span class="wiI7pd">([\s\S]*?)<\/span>/;
  const clinicRe = /class="CDe7pd"[\s\S]*?<(?:div|span) class="wiI7pd"[\s\S]*?>([\s\S]*?)<\/(?:div|span)>/;

  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const authorName = (m[1] || "").trim();
    const block = m[2];
    const imgM = block.match(imgRe);
    const authorImageUrl = imgM ? imgM[1] : null;
    const ratingM = block.match(ratingRe);
    const rating = ratingM ? parseInt(ratingM[1], 10) : null;
    const dateM = block.match(dateRe);
    const date = dateM ? dateM[1].trim() : null;
    const contentM = block.match(contentRe);
    let content = contentM ? contentM[1].replace(/<[^>]+>/g, "").trim() : "";
    content = content.replace(/\s*…\s*$/, "").replace(/\s*Ещё\s*$/i, "").trim();
    const clinicM = block.match(clinicRe);
    let clinicAnswer = clinicM ? clinicM[1].replace(/<[^>]+>/g, "").trim() : null;
    if (clinicAnswer) clinicAnswer = clinicAnswer.replace(/\s*…\s*$/, "").replace(/\s*Ещё\s*$/i, "").trim();

    reviews.push({
      source: "google",
      authorName,
      authorImageUrl,
      rating,
      date,
      content,
      clinicAnswer,
      sourceUrl: SOURCES[2].url,
    });
  }
  return reviews;
}

/** Extract Yandex Maps reviews via Apify API (when APIFY_TOKEN is set).
 * zen-studio/yandex-maps-reviews-scraper — full text, businessComment, no browser/captcha. */
async function extractYandexReviewsViaApify() {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;

  const client = new ApifyClient({ token });
  const run = await client.actor("zen-studio/yandex-maps-reviews-scraper").call({
    startUrls: [{ url: "https://yandex.uz/maps/org/220794203261/reviews/" }],
    language: "ru",
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map((r) => ({
    source: "yandex",
    authorName: r.authorName || "Аноним",
    date: r.date ? (typeof r.date === "string" && r.date.length >= 10 ? r.date.slice(0, 10) : r.date) : null,
    content: r.text || "",
    rating: r.rating ?? null,
    clinicAnswer: r.businessComment || null,
    likes: r.likeCount != null ? String(r.likeCount) : null,
    images: Array.isArray(r.photos) ? r.photos : [],
    sourceUrl: SOURCES[0].url,
  }));
}

/** Extract 2GIS reviews via Apify API (when APIFY_TOKEN is set).
 * zen-studio/2gis-reviews-scraper — full text, officialAnswer, no browser. */
async function extract2GisReviewsViaApify() {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;

  const client = new ApifyClient({ token });
  const run = await client.actor("zen-studio/2gis-reviews-scraper").call({
    startUrls: ["https://2gis.uz/tashkent/firm/70000001080407266"],
    maxReviews: 500,
    language: "ru",
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map((r) => ({
    source: "2gis",
    authorName: r.authorName || "Аноним",
    date: r.dateCreated ? r.dateCreated.slice(0, 10) : null,
    content: r.text || "",
    rating: r.rating ?? null,
    clinicAnswer: r.officialAnswer?.text || null,
    likes: r.likesCount != null ? String(r.likesCount) : null,
    images: Array.isArray(r.photos) ? r.photos : [],
    sourceUrl: SOURCES[1].url,
  }));
}

/** Extract Google Maps reviews via Apify API (when APIFY_TOKEN is set). */
async function extractGoogleReviewsViaApify() {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;

  const client = new ApifyClient({ token });
  const run = await client.actor("api-ninja/google-maps-reviews-scraper").call({
    startUrls: [SOURCES[2].url],
    maxReviewsPerPlace: 100,
    language: "ru",
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items.map((r) => ({
    source: "google",
    authorName: r.user_name,
    authorImageUrl: r.user_avatar || null,
    rating: r.review_rate,
    date: r.review_time,
    content: r.review_text || "",
    clinicAnswer: r.business_response_text || r.owner_answer?.text || null,
    sourceUrl: SOURCES[2].url,
  }));
}

/** Extract Google Maps reviews via Playwright (Kan Dental Clinic).
 * Uses div[data-review-id][jsaction] - stable across Google's obfuscated classes.
 * Scrolls div[role="feed"] to load all reviews. */
async function extractGoogleReviews(page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(SOURCES[2].url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(5000);

  // Dismiss cookie consent if present
  try {
    const consent = page
      .locator('[jsname="V67aGc"]')
      .or(page.locator('button:has-text("Accept all")'))
      .or(page.locator('button:has-text("Принять все")'))
      .first();
    if (await consent.isVisible({ timeout: 2000 })) {
      await consent.click();
      await page.waitForTimeout(1500);
    }
  } catch {
    // No consent or already dismissed
  }

  await page.waitForTimeout(4000);

  // Click Reviews tab to open reviews panel (required on Place page)
  try {
    const reviewsTab = page
      .locator('[role="tab"][aria-label*="Отзывы"]')
      .or(page.locator('[role="tab"][aria-label*="Reviews"]'))
      .or(page.locator('button:has-text("Отзывы")'))
      .or(page.locator('button:has-text("Reviews")'))
      .first();
    if (await reviewsTab.isVisible({ timeout: 5000 })) {
      await reviewsTab.click();
      await page.waitForTimeout(5000);
    }
  } catch {
    // Tab may already be selected or structure differs
  }

  // Wait for reviews and scroll to load more (infinite scroll)
  const reviewLocator = page.locator('div[data-review-id][jsaction]');
  let waitOk = false;
  try {
    await reviewLocator.first.waitFor({ state: "visible", timeout: 12000 });
    waitOk = true;
  } catch {
    // Fall through to HTML parse - page may have different structure
  }

  const feed = page.locator('div[role="feed"]').first();
  let prevCount = 0;
  let stableCount = 0;
  const maxScrolls = 30;

  try {
    for (let i = 0; i < (waitOk ? maxScrolls : 5); i++) {
      const count = await reviewLocator.count();
      if (count === prevCount) {
        stableCount++;
        if (stableCount >= 3) break;
      } else {
        stableCount = 0;
      }
      prevCount = count;
      await feed.evaluate((el) => el?.scrollBy(0, 600));
      await page.waitForTimeout(1200);
    }
  } catch {
    // Feed may not exist, continue with visible reviews
  }

  // Click "See more" / "Ещё" to expand truncated reviews (full text)
  const clickExpandButtons = async (selector, maxClicks = 100, waitMs = 800) => {
    let clickCount = 0;
    while (clickCount < maxClicks) {
      const buttons = page.locator(selector);
      const count = await buttons.count();
      if (count === 0) break;
      try {
        const btn = buttons.first();
        await btn.scrollIntoViewIfNeeded({ timeout: 3000 });
        await btn.click({ timeout: 3000, force: true });
        await page.waitForTimeout(waitMs);
        clickCount++;
      } catch {
        break;
      }
    }
  };
  await clickExpandButtons(
    'button[aria-label="Ещё"], button[aria-label="See more"], button:has-text("Ещё")',
    100,
    800,
  );

  const reviews = await page.evaluate(() => {
    const result = [];
    const cards = document.querySelectorAll('div[data-review-id][jsaction]');
    cards.forEach((card) => {
      // User: button[data-href*="/maps/contrib/"]:not([aria-label]) -> first div = name
      const userBtn = card.querySelector('button[data-href*="/maps/contrib/"]:not([aria-label])');
      const authorName = userBtn?.querySelector("div")?.textContent?.trim() || card.closest?.("[aria-label]")?.getAttribute("aria-label") || "";

      const imgEl = card.querySelector('button[data-href*="/maps/contrib/"] img');
      const authorImageUrl = imgEl?.src || null;

      const ratingEl = card.querySelector('[aria-label*="звезд"], [aria-label*="star"]');
      const ratingMatch = ratingEl?.getAttribute("aria-label")?.match(/(\d+)/);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;

      const dateEl = ratingEl?.nextElementSibling;
      const date = dateEl?.textContent?.trim() || null;

      const textEl = card.querySelector('div[tabindex="-1"][id][lang]');
      const content = textEl?.textContent?.trim() || "";

      const ownerBlock = card.querySelector('div.CDe7pd, [class*="CDe7pd"]');
      const clinicAnswer =
        ownerBlock?.querySelector('span.wiI7pd, div.wiI7pd, [class*="wiI7pd"]')?.textContent?.trim() || null;

      result.push({ authorName, authorImageUrl, rating, date, content, clinicAnswer });
    });
    return result;
  });

  // Fallback: parse from raw HTML when evaluate returns nothing
  if (reviews.length === 0) {
    const html = await page.content();
    const parsed = parseGoogleReviewsFromHtml(html);
    if (parsed.length > 0) return parsed;
    mkdirSync(OUT_DIR, { recursive: true });
    const debugPath = join(OUT_DIR, "google-page-debug.html");
    writeFileSync(debugPath, html, "utf8");
    console.log(`  Saved page HTML to ${debugPath} for inspection`);
    // Log page title and body snippet for debugging
    const title = await page.title();
    const hasConsent = html.includes("cookie") || html.includes("Cookie") || html.includes("Before you continue");
    const hasReviewBlock = html.includes("jftiEf") || html.includes("data-review-id");
    console.log(`  Debug: title="${title.slice(0, 60)}..." hasConsent=${hasConsent} hasReviewBlock=${hasReviewBlock}`);
    console.log(`  Tip: Use APIFY_TOKEN + --google-only for reliable Google reviews, or --google-html <file> with manually copied HTML`);
  }

  return reviews.map((r) => ({
    source: "google",
    authorName: r.authorName,
    authorImageUrl: r.authorImageUrl,
    rating: r.rating,
    date: r.date,
    content: r.content,
    clinicAnswer: r.clinicAnswer,
    sourceUrl: SOURCES[2].url,
  }));
}

const YANDEX_EXTRACTED_PATH = join(OUT_DIR, "yandex-reviews-extracted.json");
const GIS2_EXTRACTED_PATH = join(OUT_DIR, "2gis-reviews-extracted.json");
const GOOGLE_EXTRACTED_PATH = join(OUT_DIR, "google-reviews-extracted.json");

function parseArgs() {
  const args = process.argv.slice(2);
  const getPath = (flag) =>
    args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
  return {
    googleHtmlPath: getPath("--google-html"),
    yandexHtmlPath: getPath("--yandex-html"),
    gis2HtmlPath: getPath("--2gis-html"),
    yandexOnly: args.includes("--yandex-only"),
    gis2Only: args.includes("--2gis-only"),
    googleOnly: args.includes("--google-only"),
    headed: args.includes("--headed"),
  };
}

async function main() {
  const { googleHtmlPath, yandexHtmlPath, gis2HtmlPath, yandexOnly, gis2Only, googleOnly, headed } = parseArgs();
  console.log("=== Extract External Reviews ===\n");

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const allReviews = [];
  const errors = [];

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "ru-RU",
  });
  const page = await context.newPage();

  if (googleOnly) {
    console.log("Extracting Google Maps (--google-only)...");
    try {
      let googleReviews;
      let extractedVia;
      if (googleHtmlPath && existsSync(googleHtmlPath)) {
        const html = readFileSync(googleHtmlPath, "utf8");
        googleReviews = parseGoogleReviewsFromHtml(html);
        console.log(`  Parsed ${googleReviews.length} from HTML file`);
        extractedVia = "parseGoogleReviewsFromHtml (--google-html)";
      } else if (process.env.APIFY_TOKEN) {
        let usedApify = false;
        try {
          const apifyReviews = await extractGoogleReviewsViaApify();
          if (apifyReviews && apifyReviews.length > 0) {
            googleReviews = apifyReviews;
            usedApify = true;
            extractedVia = "Apify api-ninja/google-maps-reviews-scraper";
            console.log(`  Apify: ${googleReviews.length} reviews (full text)`);
          } else {
            googleReviews = await extractGoogleReviews(page);
            extractedVia = "Playwright extractGoogleReviews (fallback)";
            console.log(`  Fallback Playwright: ${googleReviews.length} reviews`);
          }
        } catch (apifyErr) {
          console.log(`  Apify failed: ${apifyErr.message}, trying Playwright...`);
          googleReviews = await extractGoogleReviews(page);
          extractedVia = "Playwright extractGoogleReviews (fallback after Apify error)";
          console.log(`  Playwright: ${googleReviews.length} reviews`);
        }
      } else {
        googleReviews = await extractGoogleReviews(page);
        extractedVia = "Playwright extractGoogleReviews";
        console.log(`  Found ${googleReviews.length} reviews`);
      }
      const googleOutput = {
        fetchedAt: new Date().toISOString(),
        source: "google",
        sourceUrl: SOURCES[2].url,
        extractedVia,
        reviewCount: googleReviews.length,
        reviews: googleReviews.map((r) => ({
          source: r.source ?? "google",
          authorName: r.authorName ?? "Аноним",
          authorImageUrl: r.authorImageUrl ?? null,
          date: r.date ?? null,
          content: r.content ?? "",
          rating: r.rating ?? null,
          clinicAnswer: r.clinicAnswer ?? null,
          sourceUrl: r.sourceUrl ?? SOURCES[2].url,
        })),
      };
      writeFileSync(GOOGLE_EXTRACTED_PATH, JSON.stringify(googleOutput, null, 2), "utf8");
      console.log(`\nWritten Google: ${GOOGLE_EXTRACTED_PATH}`);
    } catch (err) {
      console.error("  Google failed:", err.message);
      errors.push({ source: "google", error: err.message });
    }
    await browser.close();
    return;
  }

  if (gis2Only) {
    console.log("Extracting 2GIS (--2gis-only)...");
    try {
      let gisReviews;
      let extractedVia;
      if (gis2HtmlPath && existsSync(gis2HtmlPath)) {
        const html = readFileSync(gis2HtmlPath, "utf8");
        gisReviews = parse2GisReviewsFromHtml(html);
        if (gisReviews.length === 0) {
          console.log("  Parsed 0 from HTML - falling back to Playwright");
          gisReviews = await extract2GisReviews(page);
          extractedVia = "Playwright extract2GisReviews (fallback after empty HTML parse)";
        } else {
          console.log(`  Parsed ${gisReviews.length} from HTML file`);
          extractedVia = "parse2GisReviewsFromHtml (--2gis-html)";
        }
      } else if (process.env.APIFY_TOKEN) {
        let usedApify = false;
        try {
          const apifyReviews = await extract2GisReviewsViaApify();
          if (apifyReviews && apifyReviews.length > 0) {
            gisReviews = apifyReviews;
            usedApify = true;
            extractedVia = "Apify zen-studio/2gis-reviews-scraper";
            console.log(`  Apify: ${gisReviews.length} reviews (full text + clinicAnswer)`);
          } else {
            gisReviews = await extract2GisReviews(page);
            extractedVia = "Playwright extract2GisReviews (fallback)";
            console.log(`  Fallback Playwright: ${gisReviews.length} reviews`);
          }
        } catch (apifyErr) {
          console.log(`  Apify failed: ${apifyErr.message}, trying Playwright...`);
          gisReviews = await extract2GisReviews(page);
          extractedVia = "Playwright extract2GisReviews (fallback after Apify error)";
          console.log(`  Playwright: ${gisReviews.length} reviews`);
        }
      } else {
        gisReviews = await extract2GisReviews(page);
        extractedVia = "Playwright extract2GisReviews";
        console.log(`  Found ${gisReviews.length} items`);
      }
      const gis2Output = {
        fetchedAt: new Date().toISOString(),
        source: "2gis",
        sourceUrl: SOURCES[1].url,
        extractedVia,
        reviewCount: gisReviews.length,
        reviews: gisReviews.map((r) => ({
          source: r.source ?? "2gis",
          authorName: r.authorName ?? "Аноним",
          date: r.date ?? null,
          content: r.content ?? "",
          rating: r.rating ?? null,
          clinicAnswer: r.clinicAnswer ?? null,
          likes: r.likes ?? null,
          images: r.images ?? [],
          sourceUrl: r.sourceUrl ?? SOURCES[1].url,
        })),
      };
      writeFileSync(GIS2_EXTRACTED_PATH, JSON.stringify(gis2Output, null, 2), "utf8");
      console.log(`\nWritten 2GIS: ${GIS2_EXTRACTED_PATH}`);
    } catch (err) {
      console.error("  2GIS failed:", err.message);
      errors.push({ source: "2gis", error: err.message });
    }
    await browser.close();
    return;
  }

  if (!googleOnly) {
    console.log("Extracting Yandex...");
    try {
      let yandexReviews;
      if (yandexHtmlPath && existsSync(yandexHtmlPath)) {
        const html = readFileSync(yandexHtmlPath, "utf8");
        yandexReviews = parseYandexReviewsFromHtml(html);
        console.log(`  Parsed ${yandexReviews.length} from HTML file`);
        if (yandexOnly) {
          const yandexOutput = {
            fetchedAt: new Date().toISOString(),
            source: "yandex",
            sourceUrl: SOURCES[0].url,
            extractedVia: "parseYandexReviewsFromHtml (--yandex-html)",
            reviewCount: yandexReviews.length,
            reviews: yandexReviews.map((r) => ({
              ...r,
              likes: r.likes ?? null,
              images: r.images ?? [],
            })),
          };
          writeFileSync(YANDEX_EXTRACTED_PATH, JSON.stringify(yandexOutput, null, 2), "utf8");
          console.log(`\nWritten Yandex: ${YANDEX_EXTRACTED_PATH}`);
          await browser.close();
          return;
        }
      } else if (process.env.APIFY_TOKEN) {
        let usedApify = false;
        try {
          const apifyReviews = await extractYandexReviewsViaApify();
          if (apifyReviews && apifyReviews.length > 0) {
            yandexReviews = apifyReviews;
            usedApify = true;
            console.log(`  Apify: ${yandexReviews.length} reviews (full text + clinicAnswer)`);
          } else {
            yandexReviews = await extractYandexReviews(page);
            console.log(`  Fallback Playwright: ${yandexReviews.length} reviews`);
          }
        } catch (apifyErr) {
          console.log(`  Apify failed: ${apifyErr.message}, trying Playwright...`);
          yandexReviews = await extractYandexReviews(page);
          console.log(`  Playwright: ${yandexReviews.length} reviews`);
        }
        if (yandexOnly) {
          const extractedVia = usedApify
            ? "Apify zen-studio/yandex-maps-reviews-scraper (full text + businessComment)"
            : "Playwright extractYandexReviewsFull (scroll + Ещё + Посмотреть ответ)";
          const yandexOutput = {
            fetchedAt: new Date().toISOString(),
            source: "yandex",
            sourceUrl: SOURCES[0].url,
            extractedVia,
            reviewCount: yandexReviews.length,
            reviews: yandexReviews,
          };
          writeFileSync(YANDEX_EXTRACTED_PATH, JSON.stringify(yandexOutput, null, 2), "utf8");
          console.log(`\nWritten Yandex: ${YANDEX_EXTRACTED_PATH}`);
          await browser.close();
          return;
        }
      } else {
        yandexReviews = await extractYandexReviews(page);
        console.log(`  Found ${yandexReviews.length} reviews`);
      }
      allReviews.push(...yandexReviews);

      if (yandexOnly) {
        const yandexOutput = {
          fetchedAt: new Date().toISOString(),
          source: "yandex",
          sourceUrl: SOURCES[0].url,
          extractedVia: "Playwright extractYandexReviewsFull (scroll + Ещё + Посмотреть ответ)",
          reviewCount: yandexReviews.length,
          reviews: yandexReviews,
        };
        writeFileSync(YANDEX_EXTRACTED_PATH, JSON.stringify(yandexOutput, null, 2), "utf8");
        console.log(`\nWritten Yandex: ${YANDEX_EXTRACTED_PATH}`);
        await browser.close();
        return;
      }
    } catch (err) {
      console.error("  Yandex failed:", err.message);
      errors.push({ source: "yandex", error: err.message });
    }

    console.log("Extracting 2GIS...");
    try {
      let gisReviews;
      if (gis2HtmlPath && existsSync(gis2HtmlPath)) {
        const html = readFileSync(gis2HtmlPath, "utf8");
        gisReviews = parse2GisReviewsFromHtml(html);
        if (gisReviews.length === 0) {
          console.log("  Parsed 0 from HTML (parser stub) - falling back to Playwright");
          gisReviews = await extract2GisReviews(page);
        } else {
          console.log(`  Parsed ${gisReviews.length} from HTML file`);
        }
      } else if (process.env.APIFY_TOKEN) {
        try {
          gisReviews = await extract2GisReviewsViaApify();
          if (gisReviews && gisReviews.length > 0) {
            console.log(`  Apify: ${gisReviews.length} reviews`);
          } else {
            gisReviews = await extract2GisReviews(page);
            console.log(`  Fallback Playwright: ${gisReviews.length} items`);
          }
        } catch (apifyErr) {
          console.log(`  Apify failed: ${apifyErr.message}, trying Playwright...`);
          gisReviews = await extract2GisReviews(page);
          console.log(`  Playwright: ${gisReviews.length} items`);
        }
      } else {
        gisReviews = await extract2GisReviews(page);
        console.log(`  Found ${gisReviews.length} items`);
      }
      allReviews.push(...(gisReviews || []));
    } catch (err) {
      console.error("  2GIS failed:", err.message);
      errors.push({ source: "2gis", error: err.message });
    }
  }

  console.log("Extracting Google Maps...");
  try {
    let googleReviews;
    if (googleHtmlPath && existsSync(googleHtmlPath)) {
      const html = readFileSync(googleHtmlPath, "utf8");
      googleReviews = parseGoogleReviewsFromHtml(html);
      console.log(`  Parsed ${googleReviews.length} from HTML file`);
    } else if (process.env.APIFY_TOKEN) {
      googleReviews = (await extractGoogleReviewsViaApify()) ?? [];
      console.log(`  Apify: ${googleReviews.length} items`);
    } else {
      googleReviews = await extractGoogleReviews(page);
      console.log(`  Found ${googleReviews?.length ?? 0} items`);
    }
    allReviews.push(...googleReviews);
  } catch (err) {
    console.error("  Google failed:", err.message);
    errors.push({ source: "google", error: err.message });
  }

  await browser.close();

  const output = {
    fetchedAt: new Date().toISOString(),
    sources: SOURCES,
    reviews: allReviews,
    errors: errors.length ? errors : undefined,
  };

  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf8");
  console.log(`\nWritten: ${OUT_PATH}`);
  console.log(`Total reviews: ${allReviews.length}`);
  if (errors.length) console.log("Errors:", errors);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
