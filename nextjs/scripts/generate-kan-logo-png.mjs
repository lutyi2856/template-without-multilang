import sharp from "sharp";
import { writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, "../../assets/kan-logo-white.png");
const outPath = path.join(__dirname, "../../assets/kan-logo-dark.png");

if (!existsSync(inputPath)) {
  console.error(
    "Source PNG not found. Place your white KAN logo PNG at:",
    inputPath,
  );
  process.exit(1);
}

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

// #191E35 → rgb(25, 30, 53)
const hex = "191E35";
const R = parseInt(hex.slice(0, 2), 16),
  G = parseInt(hex.slice(2, 4), 16),
  B = parseInt(hex.slice(4, 6), 16);

// Perceptual luminance (preserves anti-aliasing), no hard thresholds
for (let i = 0; i < data.length; i += 4) {
  const r = data[i],
    g = data[i + 1],
    b = data[i + 2];
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  data[i] = R;
  data[i + 1] = G;
  data[i + 2] = B;
  data[i + 3] = Math.round(lum * 255);
}

const buffer = await sharp(data, { raw: info })
  .png({ compressionLevel: 0, palette: false })
  .toBuffer();
writeFileSync(outPath, buffer);
console.log("Generated:", outPath);
