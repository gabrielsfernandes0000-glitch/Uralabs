#!/usr/bin/env node
// Converte PNGs de /public/cosmetics/banners/ em dois WebPs:
//   <slug>.webp       — full 2400×400 quality 85 (perfil/modal) — ratio 6:1
//   <slug>-thumb.webp — thumb 900×150 quality 78  (grid de seleção/cards) — ratio 6:1
//
// Thumb pesa ~15-30KB (vs 500KB-1.7MB do full). 22 thumbs = ~0.5MB total
// — abre sem travar decoding/GPU mesmo com 50+ banners no catálogo.
//
// Se o full WebP já existe e não há PNG, só gera o thumb faltando.
// Idempotente — pode rodar várias vezes.
import sharp from "sharp";
import { readdir, stat, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "public", "cosmetics", "banners");

const FULL_QUALITY = 85;
const THUMB_QUALITY = 78;
const FULL_WIDTH = 2400;
const FULL_HEIGHT = 400;
const THUMB_WIDTH = 900;
const THUMB_HEIGHT = 150;

const mb = (n) => (n / 1024 / 1024).toFixed(2);
const kb = (n) => (n / 1024).toFixed(1);

const files = await readdir(DIR);
const pngs = files.filter((f) => f.endsWith(".png"));
const fullWebps = files.filter((f) => f.endsWith(".webp") && !f.endsWith("-thumb.webp"));

// Coleta todos os slugs únicos (PNG + WebP existente)
const slugs = new Set([
  ...pngs.map((f) => f.replace(/\.png$/, "")),
  ...fullWebps.map((f) => f.replace(/\.webp$/, "")),
]);

if (slugs.size === 0) {
  console.log("Nenhum banner pra processar.");
  process.exit(0);
}

let totalBefore = 0;
let totalAfter = 0;
let thumbsBytes = 0;

for (const slug of [...slugs].sort()) {
  const pngPath = join(DIR, `${slug}.png`);
  const fullPath = join(DIR, `${slug}.webp`);
  const thumbPath = join(DIR, `${slug}-thumb.webp`);

  const hasPng = existsSync(pngPath);
  const hasFull = existsSync(fullPath);
  const hasThumb = existsSync(thumbPath);

  // Fonte pro sharp: PNG se existir (mais fiel), senão o full WebP
  const source = hasPng ? pngPath : fullPath;
  if (!existsSync(source)) continue;

  // Gera full se não existir
  if (!hasFull) {
    const { size: sizeBefore } = await stat(source);
    totalBefore += sizeBefore;

    await sharp(source)
      .resize(FULL_WIDTH, FULL_HEIGHT, { fit: "cover", position: "centre" })
      .webp({ quality: FULL_QUALITY, effort: 6 })
      .toFile(fullPath);

    const { size: sizeAfter } = await stat(fullPath);
    totalAfter += sizeAfter;

    const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
    console.log(`[full]  ${slug.padEnd(28)} ${mb(sizeBefore)}MB → ${mb(sizeAfter)}MB (-${pct}%)`);
  }

  // Gera thumb se não existir
  if (!hasThumb) {
    await sharp(source)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover", position: "centre" })
      .webp({ quality: THUMB_QUALITY, effort: 6 })
      .toFile(thumbPath);

    const { size: thumbSize } = await stat(thumbPath);
    thumbsBytes += thumbSize;
    console.log(`[thumb] ${slug.padEnd(28)} ${kb(thumbSize)}KB`);
  }

  // Remove PNG original
  if (hasPng) await unlink(pngPath);
}

if (totalBefore > 0) {
  const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(`\nFulls: ${mb(totalBefore)}MB → ${mb(totalAfter)}MB (-${pct}%)`);
}
if (thumbsBytes > 0) {
  console.log(`Thumbs gerados: ${mb(thumbsBytes)}MB total`);
}
