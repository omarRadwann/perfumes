/*
 * optimize-images.mjs — shrink the AI-generated art for the web.
 * Raw 2K renders (some PNG) are 5–20 MB each — far too heavy for a static site.
 * This resizes + re-encodes them to fast, sharp JPEGs (logo stays PNG), and
 * builds a correctly-sized OG image. Run once after downloading new art:
 *     node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "img");

// photographic assets → JPEG, max 1920px on the long edge
const PHOTOS = [
  "hero.jpg",
  "atelier.jpg",
  "onyx.jpg",
  "mood-noir-dencre.jpg",
  "mood-ombre-dor.jpg",
  "mood-velours-rouge.jpg",
  "mood-nuit-bleue.jpg",
  "mood-eclipse.jpg",
];

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function optimizePhoto(name) {
  const p = path.join(DIR, name);
  const before = (await stat(p)).size;
  const input = await readFile(p);
  const out = await sharp(input)
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFile(p, out);
  console.log(`• ${name}: ${kb(before)} → ${kb(out.length)}`);
}

async function optimizeCrest() {
  const p = path.join(DIR, "crest.png");
  const before = (await stat(p)).size;
  // The emblem is a circular coin on a white field. Mask to a circle so the white
  // corners become transparent; the dark coin then blends into the dark site,
  // leaving the gold N + crescent + ring floating.
  const S = 512;
  const r = 150;
  const mask = Buffer.from(
    `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${r}" fill="#fff"/></svg>`
  );
  const out = await sharp(await readFile(p))
    .resize(S, S, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(p, out);
  console.log(`• crest.png: ${kb(before)} → ${kb(out.length)} (circle-masked, transparent)`);
}

async function buildOg() {
  const hero = await readFile(path.join(DIR, "hero.jpg"));
  const out = await sharp(hero)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  await writeFile(path.join(DIR, "og.jpg"), out);
  console.log(`• og.jpg: built 1200×630 (${kb(out.length)})`);
}

async function buildFavicon() {
  // Next serves app/icon.png automatically (with basePath). Derive it from the crest.
  const crest = await readFile(path.join(DIR, "crest.png"));
  const out = await sharp(crest)
    .resize(256, 256, { fit: "contain", background: { r: 10, g: 9, b: 8, alpha: 1 } })
    .png()
    .toBuffer();
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
  try {
    await optimizeCrest();
  } catch (e) {
    console.warn(`! skip crest.png: ${e.message}`);
  }
  try {
    await buildOg();
  } catch (e) {
    console.warn(`! skip og.jpg: ${e.message}`);
  }
  try {
    await buildFavicon();
  } catch (e) {
    console.warn(`! skip app/icon.png: ${e.message}`);
  }
  console.log("✓ image optimization complete");
};

run();
