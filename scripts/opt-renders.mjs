// Optimize the photoreal flacon renders into web hero imagery.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = "C:/Users/acer/Desktop/perfumes";
const src = path.join(root, "tripo-refs");
const out = path.join(root, "public", "img");
const ids = ["noir-dencre", "ombre-dor", "velours-rouge", "nuit-bleue", "eclipse", "santal-ivoire"];

for (const id of ids) {
  const inp = path.join(src, `${id}.jpg`);
  if (!fs.existsSync(inp)) {
    console.log("MISSING", id);
    continue;
  }
  const info = await sharp(inp)
    .resize(1500, 1500, { fit: "inside" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(out, `flacon-${id}.jpg`));
  console.log(`flacon-${id}.jpg  ${(info.size / 1024) | 0} KB`);
}
