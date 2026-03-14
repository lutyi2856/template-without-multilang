/**
 * Переконвертация фотографий врачей в WebP с высоким качеством (quality: 90)
 *
 * Использование:
 *   node scripts/reprocess-doctor-images.js                    # все врачи
 *   node scripts/reprocess-doctor-images.js abdalieva-uldaulet-parahatovna  # один врач
 *
 * Оригиналы: kan-data/card-photos/*.jpg
 * Результат: kan-data/processed/cards/*.webp (перезапись)
 */

const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const CARD_PHOTOS_DIR = path.join(__dirname, "..", "kan-data", "card-photos");
const PROCESSED_DIR = path.join(__dirname, "..", "kan-data", "processed", "cards");
const QUALITY = 90;

async function convertToWebp(slug) {
  const srcPath = path.join(CARD_PHOTOS_DIR, `${slug}.jpg`);
  const destPath = path.join(PROCESSED_DIR, `${slug}.webp`);

  if (!fs.existsSync(srcPath)) {
    console.error(`  ✗ Не найден оригинал: ${srcPath}`);
    return false;
  }

  try {
    const { size: srcSize } = fs.statSync(srcPath);
    await sharp(srcPath)
      .webp({ quality: QUALITY })
      .toFile(destPath);

    const { size: destSize } = fs.statSync(destPath);
    console.log(
      `  ✓ ${slug}.webp (${(srcSize / 1024).toFixed(0)} KB → ${(destSize / 1024).toFixed(0)} KB)`
    );
    return true;
  } catch (err) {
    console.error(`  ✗ Ошибка ${slug}:`, err.message);
    return false;
  }
}

async function main() {
  const singleSlug = process.argv[2];

  if (!fs.existsSync(CARD_PHOTOS_DIR)) {
    console.error("Папка kan-data/card-photos/ не найдена.");
    process.exit(1);
  }

  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  let slugs;
  if (singleSlug) {
    slugs = [singleSlug];
    console.log(`Переконвертация одного врача: ${singleSlug}\n`);
  } else {
    const files = fs.readdirSync(CARD_PHOTOS_DIR).filter((f) => f.endsWith(".jpg"));
    slugs = files.map((f) => path.basename(f, ".jpg"));
    console.log(`Переконвертация ${slugs.length} фотографий (quality: ${QUALITY})\n`);
  }

  let ok = 0;
  let fail = 0;

  for (const slug of slugs) {
    const success = await convertToWebp(slug);
    if (success) ok++;
    else fail++;
  }

  console.log(`\nГотово: ${ok} успешно, ${fail} ошибок`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
