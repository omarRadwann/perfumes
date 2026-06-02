/*
 * optimize-images.mjs — shrink the AI-generated art for the web.
 * Run after downloading new art:  node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, stat, readdir, unlink } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "img");

// photographic / texture assets → JPEG, max 1500px long edge
const PHOTOS = [
  "hero.jpg",
  "marble.jpg",
  "wall.jpg",
  "box-noir-dencre.jpg",
  "box-ombre-dor.jpg",
  "box-velours-rouge.jpg",
  "box-nuit-bleue.jpg",
  "box-eclipse.jpg",
  "box-santal-ivoire.jpg",
];

// obsolete assets from the previous (dark) version — remove to slim the repo
const OBSOLETE = ["atelier.jpg", "onyx.jpg", "mood-noir-dencre.jpg", "mood-ombre-dor.jpg", "mood-velours-rouge.jpg", "mood-nuit-bleue.jpg", "mood-eclipse.jpg"];

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function optimizePhoto(name) {
  const p = path.join(DIR, name);
  const before = (await stat(p)).size;
  const input = await readFile(p);
  const out = await sharp(input)
    .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFile(p, out);
  console.log(`• ${name}: ${kb(before)} → ${kb(out.length)}`);
}

async function optimizeCrest() {
  const p = path.join(DIR, "crest.png");
  try {
    await stat(p);
  } catch {
    return;
  }
  const S = 512;
  const r = 150;
  const mask = Buffer.from(`<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${r}" fill="#fff"/></svg>`);
  const before = (await stat(p)).size;
  // Idempotent: only re-mask if it still looks like a full square (large file).
  const out = await sharp(await readFile(p))
    .resize(S, S, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(p, out);
  console.log(`• crest.png: ${kb(before)} → ${kb(out.length)}`);
}

async function buildOg() {
  const hero = await readFile(path.join(DIR, "hero.jpg"));
  const out = await sharp(hero).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  await writeFile(path.join(DIR, "og.jpg"), out);
  console.log(`• og.jpg: built 1200×630 (${kb(out.length)})`);
}

async function buildFavicon() {
  const crest = await readFile(path.join(DIR, "crest.png"));
  const out = await sharp(crest).resize(256, 256, { fit: "contain", background: { r: 244, g: 237, b: 225, alpha: 1 } }).png().toBuffer();
  await writeFile(path.join(process.cwd(), "app", "icon.png"), out);
  console.log(`• app/icon.png: built 256×256 (${kb(out.length)})`);
}

const run = async () => {
  for (const name of PHOTOS) {
    try {
      await optimizePhoto(name);
    } catch (e) {
      console.warn(`! skip ${name}: ${e.message}`);
    }
  }
  await optimizeCrest().catch((e) => console.warn(`! crest: ${e.message}`));
  await buildOg().catch((e) => console.warn(`! og: ${e.message}`));
  await buildFavicon().catch((e) => console.warn(`! favicon: ${e.message}`));
  for (const name of OBSOLETE) {
    try {
      await unlink(path.join(DIR, name));
      console.log(`✕ removed obsolete ${name}`);
    } catch {
      /* already gone */
    }
  }
  const files = await readdir(DIR);
  console.log(`✓ done — public/img now: ${files.join(", ")}`);
};

run();
