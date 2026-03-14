#!/usr/bin/env node
/**
 * Generate HTML table from imported-reviews.json (all sources).
 * Output: kan-data/reviews-table.html
 *
 * Columns: № | Заголовок | Текст отзыва | Рейтинг | Автор | Ответ клиники | Врач из отзыва | Источник
 *
 * Run: node scripts/reviews-to-table.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "kan-data", "imported-reviews.json");
const OUT_DIR = join(__dirname, "..", "kan-data");

/** Extract doctor names from review text (Имя Отчество pattern after врач/врачу/врача/доктор) */
function extractDoctorsFromText(text) {
  if (!text || typeof text !== "string") return [];
  const doctors = new Set();
  // Patterns: "врачу Хусану Донияровичу", "врачу Мансуру Анваровичу", "врач Екатерина Александровна", "доктору Азизе Хайитовне"
  const re =
    /(?:врач[уа]?|доктор[уа]?|терапевт[уа]?|хирург[уа]?|гигиенист[уа]?|стоматолог[уа]?)\s+([А-Яа-яЁё]+\s+[А-Яа-яЁё]+(?:вич|вна|вична|овна|евич|евна)?)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    doctors.add(m[1].trim());
  }
  return [...doctors];
}

/** Generate headline from content (first ~60 chars) */
function generateHeadline(content) {
  if (!content) return "—";
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > 80 ? clean.slice(0, 80) + "…" : clean;
}

function escapeHtml(s) {
  if (s == null || s === "") return "—";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  if (!existsSync(DATA_PATH)) {
    console.error(`File not found: ${DATA_PATH}`);
    console.error("Run: node scripts/extract-external-reviews.mjs first");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const reviews = data.reviews ?? [];

  const sourceLabels = {
    google: "Google Maps",
    yandex: "Яндекс Карты",
    "2gis": "2GIS",
  };

  const rows = reviews.map((r, i) => {
    const headline = generateHeadline(r.content);
    const doctors = extractDoctorsFromText(r.content);
    const doctorStr = doctors.length ? doctors.join("; ") : "—";
    const source = sourceLabels[r.source] ?? r.source ?? "—";

    return `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(headline)}</td>
      <td>${escapeHtml(r.content)}</td>
      <td>${r.rating ?? "—"}</td>
      <td>${escapeHtml(r.authorName ?? "—")}</td>
      <td>${escapeHtml(r.clinicAnswer ?? "—")}</td>
      <td>${escapeHtml(doctorStr)}</td>
      <td>${escapeHtml(source)}</td>
    </tr>`;
  });

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Отзывы — сводная таблица</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 20px; background: #f5f7f9; }
    h1 { font-size: 1.5rem; margin-bottom: 16px; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 16px; }
    .table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; min-width: 900px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; font-size: 0.8125rem; }
    td { font-size: 0.875rem; vertical-align: top; }
    td:nth-child(3), td:nth-child(6) { max-width: 320px; word-break: break-word; }
    tr:hover td { background: #fafafa; }
  </style>
</head>
<body>
  <h1>Все отзывы (сводная таблица)</h1>
  <p class="meta">Источник: imported-reviews.json · Обновлено: ${data.fetchedAt ?? "—"}</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Заголовок</th>
          <th>Текст отзыва</th>
          <th>Рейтинг</th>
          <th>Автор</th>
          <th>Ответ клиники</th>
          <th>Врач из отзыва</th>
          <th>Источник</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  mkdirSync(OUT_DIR, { recursive: true });
  const htmlPath = join(OUT_DIR, "reviews-table.html");
  writeFileSync(htmlPath, html, "utf8");
  console.log(`HTML: ${htmlPath}`);

  // CSV for Excel
  const csvRows = [
    ["№", "Заголовок", "Текст отзыва", "Рейтинг", "Автор", "Ответ клиники", "Врач из отзыва", "Источник"].join("\t"),
    ...reviews.map((r, i) => {
      const headline = generateHeadline(r.content);
      const doctors = extractDoctorsFromText(r.content);
      const doctorStr = doctors.length ? doctors.join("; ") : "";
      const source = sourceLabels[r.source] ?? r.source ?? "";
      const escape = (s) => (s ?? "").replace(/\t/g, " ").replace(/\n/g, " ");
      return [i + 1, escape(headline), escape(r.content), r.rating ?? "", escape(r.authorName), escape(r.clinicAnswer), escape(doctorStr), source].join("\t");
    }),
  ];
  const csvPath = join(OUT_DIR, "reviews-table.csv");
  writeFileSync(csvPath, "\uFEFF" + csvRows.join("\n"), "utf8");
  console.log(`CSV:  ${csvPath}`);
  console.log(`Total: ${reviews.length} reviews`);
}

main();
