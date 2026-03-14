#!/usr/bin/env node
/**
 * Fix reviews-table.json: titles, rating, platformLogoUrl, remove bad/empty, sanitize HTML.
 * Run: node kan-data/scripts/fix-reviews-table.mjs
 *
 * Note: build-reviews-table.mjs now includes this logic. Use fix for one-off cleanup
 * of existing reviews-table.json built with older build script.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KAN_DATA = join(__dirname, "..");

const PLATFORM_LOGO_URLS = {
  Google: "http://localhost:8002/wp-content/uploads/2026/02/logo3.png",
  Яндекс: "http://localhost:8002/wp-content/uploads/2026/02/logo1.png",
  "2GIS": "http://localhost:8002/wp-content/uploads/2026/03/default-share-1.webp",
};

const PLATFORM_URLS = {
  Google:
    "https://www.google.com/maps/place/Kan+Dental+Clinic/@41.324343,69.3235313,17z/data=!3m1!4b1!4m6!3m5!1s0x38aef5ff8d720db1:0xb34f9cfec67171bd!8m2!3d41.324343!4d69.3235313!16s%2Fg%2F11vf6wt68y?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D",
  Яндекс:
    "https://yandex.uz/maps/org/220794203261/reviews/?ll=69.323081%2C41.324594&z=16",
  "2GIS": "https://2gis.uz/tashkent/firm/70000001080407266",
};

const BAD_REVIEW_PATTERNS = [
  /ужасн/i,
  /крайне не советую/i,
  /не рекомендую/i,
  /никому не советую/i,
  /никому не рекомендую/i,
];

function isBadReview(content) {
  if (!content || !content.trim()) return false;
  const text = content.toLowerCase();
  return BAD_REVIEW_PATTERNS.some((re) => re.test(text));
}

function isEmptyReview(review) {
  return (
    (review.title === "—" || !review.title?.trim()) &&
    (!review.content || !review.content.trim())
  );
}

function sanitizeHtml(text) {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fixTruncatedTitle(title, content) {
  if (!title || !title.endsWith("…")) return title;
  if (!content || !content.trim()) return title;

  const firstLine = content.split(/\n/)[0].trim();
  const firstSentenceMatch = firstLine.match(/^[^.!?]+[.!?]?/);
  const sentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : firstLine;

  if (sentence.length <= 80) return sentence;

  const maxLen = 80;
  const truncated = sentence.slice(0, maxLen + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const end = lastSpace > 40 ? lastSpace : maxLen;
  return truncated.slice(0, end).trim();
}

function setRating5IfPositive(review) {
  if (review.rating != null && review.rating !== "") return review.rating;
  if (isBadReview(review.content)) return null;
  return 5;
}

function main() {
  const inputPath = join(KAN_DATA, "reviews-table.json");
  const reviews = JSON.parse(readFileSync(inputPath, "utf-8"));

  const report = {
    totalBefore: reviews.length,
    removedBad: 0,
    removedEmpty: 0,
    titlesFixed: 0,
    ratingsSet: 0,
    withoutDoctors: 0,
  };

  let filtered = reviews.filter((r) => {
    if (isBadReview(r.content)) {
      report.removedBad++;
      return false;
    }
    if (isEmptyReview(r)) {
      report.removedEmpty++;
      return false;
    }
    return true;
  });

  filtered = filtered.map((r) => {
    const title = fixTruncatedTitle(r.title, r.content);
    if (title !== r.title) report.titlesFixed++;

    const rating = setRating5IfPositive(r);
    if (rating === 5 && (r.rating == null || r.rating === "")) report.ratingsSet++;

    const platform = r.platform || "Google";
    const platformLogoUrl = PLATFORM_LOGO_URLS[platform] || PLATFORM_LOGO_URLS.Google;
    const platformUrl = PLATFORM_URLS[platform] || PLATFORM_URLS.Google;

    return {
      title,
      content: sanitizeHtml(r.content),
      authorName: r.authorName || "Аноним",
      rating: rating ?? null,
      answer: sanitizeHtml(r.answer || ""),
      platform,
      date: r.date,
      dateIso: r.dateIso,
      doctorSlugs: r.doctorSlugs || [],
      platformLogoUrl,
      platformUrl,
    };
  });

  report.withoutDoctors = filtered.filter((r) => !r.doctorSlugs?.length).length;
  report.totalAfter = filtered.length;

  writeFileSync(
    inputPath,
    JSON.stringify(filtered, null, 2),
    "utf-8"
  );

  console.log(`
=== Отчёт обработки reviews-table.json ===

До обработки:     ${report.totalBefore} отзывов
После обработки:  ${filtered.length} отзывов

Удалено:
  - Плохие отзывы:  ${report.removedBad}
  - Пустые отзывы:  ${report.removedEmpty}

Исправлено:
  - Заголовки:      ${report.titlesFixed}
  - Рейтинг 5:      ${report.ratingsSet} (было null, стало 5)

Данные:
  - Без врачей:     ${report.withoutDoctors} (doctorSlugs: [])

Добавлено:
  - platformLogoUrl для каждого отзыва (Google/Яндекс/2GIS)
  - platformUrl для каждого отзыва (прямые ссылки на страницы клиники)

Файл сохранён: ${inputPath}
`);
}

main();
