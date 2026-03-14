#!/usr/bin/env node
/**
 * Analyze price duplicates: donor (kan.uz) and optionally WordPress.
 *
 * 1. Reads kan-data/services-prices.json
 * 2. Groups by (name, price) - exact duplicates across categories
 * 3. Groups by name - same name, different prices
 * 4. If kan-data/price-analysis-wp.json exists: merges and produces full report
 *
 * Output:
 *   - kan-data/price-analysis-donor.json
 *   - kan-data/price-duplication-report.json (if WP data available)
 *   - Console: readable report
 *
 * Run: node scripts/analyze-price-duplicates.mjs
 * Or:  npm run analyze-price-duplicates
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const KAN_JSON = join(ROOT, "kan-data", "services-prices.json");
const DONOR_OUT = join(ROOT, "kan-data", "price-analysis-donor.json");
const WP_ANALYSIS = join(ROOT, "kan-data", "price-analysis-wp.json");
const REPORT_OUT = join(ROOT, "kan-data", "price-duplication-report.json");

/** Flatten all items from JSON with category */
function flattenItems(data) {
  const items = [];
  for (const cat of data.categories || []) {
    const catName = cat.name || "";
    for (const sub of cat.subcategories || []) {
      for (const item of sub.items || []) {
        const name = (item.name || "").trim();
        const price = parseInt(item.price, 10) || 0;
        if (!name || price <= 0) continue;
        items.push({
          category: catName,
          name,
          price,
          fromPrefix: !!item.fromPrefix,
        });
      }
    }
  }
  return items;
}

/** Analyze donor data */
function analyzeDonor(data) {
  const items = flattenItems(data);
  const byKey = new Map(); // key = "name|price" -> [{ category, ... }]
  const byName = new Map(); // name -> [{ price, category }]

  for (const item of items) {
    const key = `${item.name}|${item.price}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(item);

    if (!byName.has(item.name)) byName.set(item.name, []);
    byName.get(item.name).push(item);
  }

  const exactDuplicates = [];
  for (const [key, entries] of byKey) {
    if (entries.length > 1) {
      const [name, priceStr] = key.split("|");
      exactDuplicates.push({
        name,
        price: parseInt(priceStr, 10),
        categories: [...new Set(entries.map((e) => e.category))],
        count: entries.length,
      });
    }
  }

  const sameNameDifferentPrice = [];
  for (const [name, entries] of byName) {
    const prices = [...new Set(entries.map((e) => e.price))];
    if (prices.length > 1) {
      sameNameDifferentPrice.push({
        name,
        prices,
        entries: entries.map((e) => ({ category: e.category, price: e.price })),
      });
    }
  }

  const uniqueByNamePrice = byKey.size;
  const totalItems = items.length;

  return {
    sourceUrl: data.sourceUrl,
    fetchedAt: data.fetchedAt,
    currency: data.currencySymbol || "сум",
    exactDuplicates,
    sameNameDifferentPrice,
    summary: {
      totalItems,
      uniqueByNamePrice,
      duplicateGroups: exactDuplicates.length,
      sameNameDifferentPriceCount: sameNameDifferentPrice.length,
    },
    allItems: items,
  };
}

/** Print donor report to console */
function printDonorReport(donor) {
  console.log("\n=== АНАЛИЗ ДУБЛИКАТОВ ЦЕН ===\n");
  console.log("1. DONOR (kan.uz)");
  console.log(`   - Всего items: ${donor.summary.totalItems}`);
  console.log(`   - Уникальных (name+price): ${donor.summary.uniqueByNamePrice}`);
  console.log(`   - Групп дубликатов: ${donor.summary.duplicateGroups}`);
  if (donor.summary.sameNameDifferentPriceCount > 0) {
    console.log(
      `   - Одинаковое имя, разная цена: ${donor.summary.sameNameDifferentPriceCount}`
    );
  }

  if (donor.exactDuplicates.length > 0) {
    console.log("\n   Точные дубликаты (одинаковые name+price в разных категориях):");
    for (const d of donor.exactDuplicates) {
      console.log(`   - "${d.name}" ${d.price.toLocaleString()} ${donor.currency}`);
      console.log(`     Категории: ${d.categories.join(", ")}`);
    }
  }

  if (donor.sameNameDifferentPrice.length > 0) {
    console.log("\n   Одинаковое название, разная цена (не дубликаты по смыслу):");
    for (const s of donor.sameNameDifferentPrice) {
      console.log(
        `   - "${s.name}" → цены: ${s.prices.map((p) => p.toLocaleString()).join(", ")} ${donor.currency}`
      );
    }
  }
}

/** Print WP report section */
function printWpReport(wp) {
  console.log("\n2. WORDPRESS");
  console.log(`   - Всего Price: ${wp.summary.totalPrices}`);
  console.log(`   - Дубликатов (title+price): ${wp.summary.duplicateGroups}`);
  if (wp.exactDuplicates?.length > 0) {
    console.log("\n   Дубликаты в WP:");
    for (const d of wp.exactDuplicates) {
      console.log(
        `   - "${d.title}" ${d.regularPrice?.toLocaleString() ?? "?"} (IDs: ${d.ids.join(", ")})`
      );
      console.log(`     Категории: ${(d.categories || []).join(", ")}`);
    }
  }
}

/** Print recommendations */
function printRecommendations(donor, wp) {
  console.log("\n3. РЕКОМЕНДАЦИИ (только анализ, без изменений)");
  if (donor.exactDuplicates.length > 0) {
    console.log("   Кандидаты на объединение (donor):");
    for (const d of donor.exactDuplicates) {
      console.log(
        `   - "${d.name}" ${d.price.toLocaleString()} — в ${d.count} категориях, можно оставить один Price и связать с несколькими категориями/услугами`
      );
    }
  }
  if (wp?.exactDuplicates?.length > 0) {
    console.log("   Дубликаты в WP (можно удалить лишние, оставив один):");
    for (const d of wp.exactDuplicates) {
      console.log(`   - "${d.title}" — IDs: ${d.ids.join(", ")}`);
    }
  }
  if (
    (!donor.exactDuplicates?.length && !wp?.exactDuplicates?.length) ||
    (donor.exactDuplicates.length === 0 && !wp?.exactDuplicates?.length)
  ) {
    console.log("   Дубликатов (name+price) не обнаружено.");
  }
  console.log("\n");
}

/** Main */
function main() {
  if (!existsSync(KAN_JSON)) {
    console.error("ERROR: kan-data/services-prices.json not found.");
    console.error("Run: npm run extract-kan-services-prices");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(KAN_JSON, "utf8"));
  const donor = analyzeDonor(data);

  const outDir = dirname(DONOR_OUT);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(DONOR_OUT, JSON.stringify(donor, null, 2), "utf8");
  console.log("Written:", DONOR_OUT);

  let wp = null;
  if (existsSync(WP_ANALYSIS)) {
    wp = JSON.parse(readFileSync(WP_ANALYSIS, "utf8"));
    const report = {
      generatedAt: new Date().toISOString(),
      donor: {
        summary: donor.summary,
        exactDuplicates: donor.exactDuplicates,
        sameNameDifferentPrice: donor.sameNameDifferentPrice,
      },
      wordpress: wp,
      recommendations: {
        donorMergeCandidates: donor.exactDuplicates.map((d) => ({
          name: d.name,
          price: d.price,
          categories: d.categories,
          count: d.count,
        })),
        wpDuplicateIds: (wp.exactDuplicates || []).flatMap((d) => d.ids),
      },
    };
    writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2), "utf8");
    console.log("Written:", REPORT_OUT);
  } else {
    console.log(
      "\nTip: Run WP analysis to get full report:\n  docker cp scripts/analyze-price-duplicates-wp.php wp-new-wordpress:/var/www/html/scripts/\n  docker exec wp-new-wordpress wp eval-file /var/www/html/scripts/analyze-price-duplicates-wp.php --allow-root > kan-data/price-analysis-wp.json"
    );
  }

  printDonorReport(donor);
  if (wp) printWpReport(wp);
  printRecommendations(donor, wp);
}

main();
