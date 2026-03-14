#!/usr/bin/env node
/**
 * Build reviews table from google, 2gis, yandex extracted JSON.
 * Output: kan-data/reviews-table.json, kan-data/reviews-table.md, kan-data/reviews-table.csv
 *
 * Includes: filter bad/empty reviews, improved titles (word boundary), rating 5 for positive,
 * platformLogoUrl, HTML sanitization.
 *
 * Run: node kan-data/scripts/build-reviews-table.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KAN_DATA = join(__dirname, "..");

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const PLATFORM_NAMES = {
  google: "Google",
  "2gis": "2GIS",
  yandex: "Яндекс",
};

const PLATFORM_LOGO_URLS = {
  Google: "http://localhost:8002/wp-content/uploads/2026/02/logo3.png",
  Яндекс: "http://localhost:8002/wp-content/uploads/2026/02/logo1.png",
  "2GIS": "http://localhost:8002/wp-content/uploads/2026/03/default-share-2-1-1.webp",
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

function generateTitle(content) {
  if (!content || !content.trim()) return "—";
  const first = content.split(/\n/)[0].trim();
  const match = first.match(/^[^.!?]+[.!?]?/);
  const sentence = match ? match[0].trim() : first;
  if (sentence.length <= 80) return sentence;
  const maxLen = 80;
  const truncated = sentence.slice(0, maxLen + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  const end = lastSpace > 40 ? lastSpace : maxLen;
  return truncated.slice(0, end).trim();
}

function isBadReview(content) {
  if (!content || !content.trim()) return false;
  return BAD_REVIEW_PATTERNS.some((re) => re.test(content));
}

function sanitizeHtml(text) {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRelativeDate(str, baseDate) {
  const s = (str || "").toLowerCase().trim();
  const d = new Date(baseDate);
  if (s.includes("неделю назад") && !s.match(/\d/)) {
    d.setDate(d.getDate() - 7);
    return d;
  }
  const weeks = s.match(/(\d+)\s*недел/i);
  if (weeks) {
    d.setDate(d.getDate() - parseInt(weeks[1], 10) * 7);
    return d;
  }
  if (s === "месяц назад" || s === "1 месяц назад") {
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  const months = s.match(/(\d+)\s*месяц/i);
  if (months) {
    d.setMonth(d.getMonth() - parseInt(months[1], 10));
    return d;
  }
  if (s === "год назад" || s === "1 год назад") {
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }
  const years = s.match(/(\d+)\s*год/i);
  if (years) {
    d.setFullYear(d.getFullYear() - parseInt(years[1], 10));
    return d;
  }
  return null;
}

function parseDateToObject(value, baseDate) {
  if (!value) return null;
  const s = String(value).trim();
  const iso = s.match(/^\d{4}-\d{2}-\d{2}/);
  if (iso) {
    const [y, m, d] = iso[0].split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return parseRelativeDate(s, baseDate);
}

function formatDate(value, baseDate) {
  const parsed = parseDateToObject(value, baseDate);
  if (!parsed) return value ? String(value).trim() : "";
  return `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()} года`;
}

function formatDateIso(value, baseDate) {
  const parsed = parseDateToObject(value, baseDate);
  if (!parsed) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildDoctorPatterns(doctors) {
  const patterns = [];
  for (const d of doctors) {
    const name = d.name || "";
    const slug = d.slug || "";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 3 && slug) {
      const [surname, firstName, patronymic] = parts;
      const p = patronymic.replace(/а$/, "").replace(/ы$/, "").replace(/е$/, "");
      const terms = new Set();
      terms.add(`${firstName} ${patronymic}`);
      terms.add(`${surname} ${firstName}`);
      terms.add(`${firstName} ${surname}`);
      if (p === "Дониярович" || p === "Даниярович" || patronymic.includes("Дония") || patronymic.includes("Дания")) {
        for (const t of [`${firstName} Дониярович`, `${firstName} Даниярович`, `${firstName}а Донияровича`, `${firstName}а Данияровича`, `${firstName}у Донияровичу`, `${firstName}у Данияровичу`]) terms.add(t);
      } else if (patronymic.includes("Хайит") || patronymic.includes("Хаит")) {
        const fGen = firstName.slice(0, -1) + "ы";
        const fDat = firstName.slice(0, -1) + "е";
        for (const t of [`${firstName} Хайитовна`, `${firstName} Хаитовна`, `${fGen} Хайитовны`, `${fGen} Хаитовны`, `${fDat} Хайитовне`]) terms.add(t);
      } else if (patronymic.endsWith("ович") || patronymic.endsWith("евич")) {
        const pGen = patronymic.replace(/ович$/, "овича").replace(/евич$/, "евича");
        const pDat = patronymic.replace(/ович$/, "овичу").replace(/евич$/, "евичу");
        for (const t of [`${firstName} ${patronymic}`, `${firstName} ${pGen}`, `${firstName}а ${pGen}`, `${firstName}у ${pDat}`]) terms.add(t);
        if (surname.endsWith("ов") || surname.endsWith("ев")) terms.add(`${surname}а ${firstName}а`);
      } else if (patronymic.endsWith("овна") || patronymic.endsWith("евна") || patronymic.endsWith("ична")) {
        const pGen = patronymic.replace(/овна$/, "овны").replace(/евна$/, "евны").replace(/ична$/, "ичны");
        for (const t of [`${firstName} ${patronymic}`, `${firstName} ${pGen}`, `${firstName.slice(0, -1)}ы ${pGen}`]) terms.add(t);
      }
      patterns.push({
        fullName: name,
        slug,
        searchTerms: [...terms],
      });
    }
  }
  return patterns;
}

function findDoctorsInText(content, patterns) {
  if (!content || !content.trim()) return [];
  const text = content.toLowerCase();
  const found = [];
  const seen = new Set();
  for (const p of patterns) {
    if (seen.has(p.slug)) continue;
    for (const term of p.searchTerms) {
      if (text.includes(term.toLowerCase())) {
        found.push({ slug: p.slug, name: p.fullName });
        seen.add(p.slug);
        break;
      }
    }
  }
  return found;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function escapeCsv(value) {
  const s = String(value ?? "").replace(/"/g, '""');
  return s.includes(";") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
}

function main() {
  const doctors = loadJson(join(KAN_DATA, "created-doctors.json"));
  const patterns = buildDoctorPatterns(doctors);

  const files = [
    { path: join(KAN_DATA, "google-reviews-extracted.json"), source: "google" },
    { path: join(KAN_DATA, "2gis-reviews-extracted.json"), source: "2gis" },
    { path: join(KAN_DATA, "yandex-reviews-extracted.json"), source: "yandex" },
  ];

  const rows = [];
  let index = 0;

  for (const { path: filePath, source } of files) {
    const data = loadJson(filePath);
    const reviews = data.reviews || [];
    const baseDate = data.fetchedAt ? new Date(data.fetchedAt) : new Date("2026-03-12");

    for (const r of reviews) {
      const content = (r.content || "").trim();
      if (isBadReview(content)) continue;
      if (!content) continue;

      index++;
      const title = generateTitle(content);
      const dateFormatted = formatDate(r.date, baseDate);
      const dateIso = formatDateIso(r.date, baseDate);
      const doctorsFound = findDoctorsInText(content, patterns);
      const doctorSlugs = doctorsFound.map((d) => d.slug);
      const doctorsDisplay = doctorsFound.map((d) => d.name).join("; ");
      const platform = PLATFORM_NAMES[source] || source;
      const rating =
        r.rating != null && r.rating !== ""
          ? r.rating
          : 5;

      rows.push({
        index,
        title,
        content: sanitizeHtml(content),
        rating,
        author: r.authorName || "",
        date: dateFormatted,
        dateIso,
        platform,
        clinicAnswer: sanitizeHtml(r.clinicAnswer || ""),
        doctors: doctorsDisplay,
        doctorSlugs,
        platformLogoUrl: PLATFORM_LOGO_URLS[platform] || PLATFORM_LOGO_URLS.Google,
        platformUrl: PLATFORM_URLS[platform] || PLATFORM_URLS.Google,
      });
    }
  }

  const csvLines = [
    "№;Заголовок;Текст;Рейтинг;Автор;Дата;Площадка;Ответ клиники;Врачи",
    ...rows.map((r) =>
      [
        r.index,
        escapeCsv(r.title),
        escapeCsv(r.content),
        r.rating,
        escapeCsv(r.author),
        escapeCsv(r.date),
        r.platform,
        escapeCsv(r.clinicAnswer),
        escapeCsv(r.doctors),
      ].join(";")
    ),
  ];
  writeFileSync(join(KAN_DATA, "reviews-table.csv"), csvLines.join("\n"), "utf-8");

  const jsonRows = rows.map((r) => ({
    title: r.title,
    content: r.content,
    authorName: r.author || "Аноним",
    rating: r.rating != null && r.rating !== "" ? Number(r.rating) : 5,
    answer: r.clinicAnswer || "",
    platform: r.platform,
    date: r.date,
    dateIso: r.dateIso || null,
    doctorSlugs: r.doctorSlugs,
    platformLogoUrl: r.platformLogoUrl,
    platformUrl: r.platformUrl,
  }));
  writeFileSync(join(KAN_DATA, "reviews-table.json"), JSON.stringify(jsonRows, null, 2), "utf-8");

  function escapeMdCell(s) {
    return String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  }
  const mdHeader = "| № | Заголовок | Текст | Рейтинг | Автор | Дата | Площадка | Ответ клиники | Врачи |";
  const mdSep = "| --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const mdRows = rows.map(
    (r) =>
      `| ${r.index} | ${escapeMdCell(r.title)} | ${escapeMdCell(r.content)} | ${r.rating} | ${escapeMdCell(r.author)} | ${escapeMdCell(r.date)} | ${r.platform} | ${escapeMdCell(r.clinicAnswer)} | ${escapeMdCell(r.doctors)} |`
  );
  const md = `# Отзывы — сводная таблица

Источник: google-reviews-extracted.json, 2gis-reviews-extracted.json, yandex-reviews-extracted.json · Обновлено: ${new Date().toISOString()}

${mdHeader}
${mdSep}
${mdRows.join("\n")}
`;
  writeFileSync(join(KAN_DATA, "reviews-table.md"), md, "utf-8");

  console.log(`Done: ${rows.length} reviews → reviews-table.json, reviews-table.md, reviews-table.csv`);
}

main();
