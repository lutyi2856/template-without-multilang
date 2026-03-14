#!/usr/bin/env node
/**
 * Extract 3 "our works" from kan.uz/nashi-raboty/ — titles, doctors, before/after image URLs.
 * Fetches HTML from case detail pages and parses img src for before/after images.
 *
 * Output: kan-data/nashi-raboty-works.json
 * Run: node scripts/extract-kan-nashi-raboty-works.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "kan-data");
const OUT_PATH = join(OUT_DIR, "nashi-raboty-works.json");

const WORKS = [
  {
    url: "https://kan.uz/chto-takoe-doverie/",
    title: "Что такое доверие?",
    slug: "chto-takoe-doverie",
    doctorSlugs: [
      "kan-anna-aleksandrovna",
      "kan-stanislav-aleksandrovich",
      "tulegenova-asel-turahanovna",
    ],
    serviceCategorySlugs: [
      "hirurgiya-i-implantaciya",
      "ispravlenie-prikusa",
      "otbelivanie-zubov",
      "terapevticheskoe-i-endodonticheskoe-lechenie",
      "ortopediya-koronki",
    ],
  },
  {
    url: "https://kan.uz/novyj-vzglyad-na-ulybku-nazimy/",
    title: "Новый взгляд на улыбку Назимы",
    slug: "novyj-vzglyad-na-ulybku-nazimy",
    doctorSlugs: [
      "kan-anna-aleksandrovna",
      "askarov-mansur-anvarovich",
      "kim-dmitrij-moiseevich",
      "tulegenova-asel-turahanovna",
    ],
    serviceCategorySlugs: [
      "terapevticheskoe-i-endodonticheskoe-lechenie",
      "hirurgiya-i-implantaciya",
      "otbelivanie-zubov",
      "ortopediya-koronki",
    ],
  },
  {
    url: "https://kan.uz/preobrazhenie-ulybki/",
    title: "Преображение улыбки нашей пациентки",
    slug: "preobrazhenie-ulybki",
    doctorSlugs: ["kan-stanislav-aleksandrovich"],
    serviceCategorySlugs: ["hirurgiya-i-implantaciya", "ispravlenie-prikusa"],
  },
];

/** Extract img src URLs from HTML — prefer full-size (no -768x432 etc) */
function extractImageUrls(html) {
  const urls = [];
  const re = /src=["'](https?:\/\/[^"']*wp-content\/uploads\/[^"']+\.(?:jpg|jpeg|png|webp))["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    if (!url.includes("-scaled") && !url.includes("avatar") && !url.includes("logo")) {
      const fullUrl = url.replace(/-?\d+x\d+\.(jpg|jpeg|png|webp)$/i, ".$1");
      if (!urls.includes(fullUrl)) {
        urls.push(fullUrl);
      }
    }
  }
  return urls;
}

/** Fetch HTML with User-Agent */
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

async function main() {
  console.log("=== Extract KAN nashi-raboty works ===\n");

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const results = [];

  for (const work of WORKS) {
    console.log(`Fetching: ${work.url}`);
    try {
      const html = await fetchHtml(work.url);
      const urls = extractImageUrls(html);

      let beforeUrl = null;
      let afterUrl = null;

      if (urls.length >= 2) {
        beforeUrl = urls[0];
        afterUrl = urls[1];
        console.log(`  Found ${urls.length} images, using first two`);
      } else if (urls.length === 1) {
        beforeUrl = urls[0];
        console.log(`  Found 1 image only — afterUrl will be empty`);
      } else {
        console.log(`  No images found (${urls.length}) — check HTML structure`);
      }

      results.push({
        ...work,
        beforeUrl: beforeUrl || "",
        afterUrl: afterUrl || "",
      });
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      results.push({
        ...work,
        beforeUrl: "",
        afterUrl: "",
      });
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nWritten: ${OUT_PATH}`);
  console.log("Done.");
}

main().catch(console.error);
