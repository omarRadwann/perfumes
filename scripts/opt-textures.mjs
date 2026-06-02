// One-off: optimize the regenerated stone textures into repeat-safe POT JPGs.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = path.join(__dirname, "..", "public", "img", "_raw");
const out = path.join(__dirname, "..", "public", "img");

const jobs = [
  { src: "calacatta.png", dst: "marble.jpg", size: 2048, q: 82 }, // hero reflective floor
  { src: "travertine.png", dst: "wall.jpg", size: 1024, q: 84 },
  { src: "nero.png", dst: "nero.jpg", size: 1024, q: 86 }, // dark plinth marble
];

for (const j of jobs) {
  const info = await sharp(path.join(raw, j.src))
    .resize(j.size, j.size, { fit: "cover" })
    .jpeg({ quality: j.q, mozjpeg: true })
    .toFile(path.join(out, j.dst));
  console.log(`${j.dst}  ${j.size}px  ${(info.size / 1024).toFixed(0)} KB`);
}
