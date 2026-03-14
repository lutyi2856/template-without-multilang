#!/usr/bin/env node
/**
 * Extract services and prices from kan.uz donor site.
 * Parses Elementor Price List by CSS classes:
 *   .elementor-price-list-title, .elementor-price-list-price, .elementor-price-list-description
 *
 * Output: kan-data/services-prices.json
 * Run: node scripts/extract-kan-services-prices.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "kan-data", "services-prices.json");
const SOURCE_URL = "https://kan.uz/uslugi-i-czeny/";

const CATEGORY_NAMES = [
  "Исправление прикуса",
  "Отбеливание зубов",
  "Диагностика",
  "Ортопедия - коронки",
  "Ортопедия - виниры",
  "Терапевтическое и эндодонтическое лечение",
  "Проф. гигиена",
  "Хирургия и имплантация",
  "Детское лечение",
  "Седация ЗАКС",
];

/** Decode HTML entities */
function decodeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

/** Extract text from tag content, strip inner HTML */
function getText(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

/** Parse price string: "480.000 сум" or "от 47.910.000 сум" -> { price, fromPrefix } */
function parsePrice(str) {
  const s = getText(str);
  const fromMatch = /от\s+/i.exec(s);
  const fromPrefix = !!fromMatch;
  const numMatch = s.match(/(\d[\d.]*)\s*сум/);
  if (!numMatch) return null;
  const price = parseInt(numMatch[1].replace(/\./g, ""), 10);
  return isNaN(price) ? null : { price, fromPrefix };
}

/** Extract single item from <li class="elementor-price-list-item">...</li> */
function extractItem(liHtml) {
  const titleMatch = liHtml.match(
    /<span[^>]*class="[^"]*elementor-price-list-title[^"]*"[^>]*>([\s\S]*?)<\/span>/i
  );
  const priceMatch = liHtml.match(
    /<span[^>]*class="[^"]*elementor-price-list-price[^"]*"[^>]*>([\s\S]*?)<\/span>/i
  );
  const descMatch = liHtml.match(
    /<p[^>]*class="[^"]*elementor-price-list-description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
  );

  const name = titleMatch ? getText(titleMatch[1]) : "";
  if (!name) return null;

  const parsed = priceMatch ? parsePrice(priceMatch[1]) : null;
  if (!parsed) return null;

  const description = descMatch ? getText(descMatch[1]) : "";
  return {
    name,
    price: parsed.price,
    fromPrefix: parsed.fromPrefix,
    description: description || undefined,
  };
}

/** Find H2 positions and their category index */
function findCategoryPositions(html) {
  const positions = [];
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = h2Regex.exec(html)) !== null) {
    const text = getText(m[1]);
    const idx = CATEGORY_NAMES.findIndex((c) => text.includes(c) || c.includes(text));
    if (idx >= 0) {
      positions.push({ index: m.index, categoryIndex: idx, categoryName: CATEGORY_NAMES[idx] });
    }
  }
  return positions.sort((a, b) => a.index - b.index);
}

/** Find all li.elementor-price-list-item with their start positions */
function findListItems(html) {
  const items = [];
  const liRegex = /<li[^>]*class="[^"]*elementor-price-list-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRegex.exec(html)) !== null) {
    items.push({ index: m.index, html: m[1] });
  }
  return items;
}

/** Assign each item to a category based on position (last H2 before item) */
function assignToCategories(html, categoryPositions, listItems) {
  const categories = CATEGORY_NAMES.map((name) => ({ name, subcategories: [{ items: [] }] }));

  for (const { index: itemPos, html: liHtml } of listItems) {
    const item = extractItem(liHtml);
    if (!item) continue;

    let lastCatIdx = 0;
    for (const { index: h2Pos, categoryIndex } of categoryPositions) {
      if (h2Pos < itemPos) lastCatIdx = categoryIndex;
    }

    categories[lastCatIdx].subcategories[0].items.push(item);
  }

  return categories;
}

async function main() {
  console.log("Fetching", SOURCE_URL);
  const res = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();

  const categoryPositions = findCategoryPositions(html);
  const listItems = findListItems(html);

  if (categoryPositions.length === 0) {
    console.warn("No H2 category headings found. Check if page structure changed.");
  }
  if (listItems.length === 0) {
    console.warn("No elementor-price-list-item found. Check if page structure changed.");
  }

  const categories = assignToCategories(html, categoryPositions, listItems);

  const output = {
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    currency: "UZS",
    currencySymbol: "сум",
    categories,
  };

  const outDir = dirname(OUT_PATH);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf8");

  const total = categories.reduce((sum, c) => sum + c.subcategories.reduce((s, sc) => s + sc.items.length, 0), 0);
  console.log("Written", OUT_PATH);
  console.log("Categories:", categories.length);
  console.log("Total items:", total);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
