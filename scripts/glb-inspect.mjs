import fs from "node:fs";
import path from "node:path";

const dir = "C:/Users/acer/Desktop/perfumes/public/models";
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".glb")).sort()) {
  const buf = fs.readFileSync(path.join(dir, f));
  const magic = buf.toString("utf8", 0, 4);
  const ver = buf.readUInt32LE(4);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));
  const meshes = json.meshes || [];
  const mats = (json.materials || []).map((m) => ({
    name: m.name,
    alpha: m.alphaMode,
    metal: m.pbrMetallicRoughness?.metallicFactor,
    rough: m.pbrMetallicRoughness?.roughnessFactor,
    transmission: m.extensions?.KHR_materials_transmission?.transmissionFactor,
  }));
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  let prims = 0;
  for (const m of meshes)
    for (const pr of m.primitives) {
      prims++;
      const acc = json.accessors?.[pr.attributes?.POSITION];
      if (acc?.min && acc?.max) for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], acc.min[i]); max[i] = Math.max(max[i], acc.max[i]); }
    }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const ctr = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  console.log(`\n${f}  (${magic} v${ver})`);
  console.log(`  meshes=${meshes.length} prims=${prims} nodes=${(json.nodes || []).length} images=${(json.images || []).length}`);
  console.log(`  size=[${size.map((s) => s.toFixed(3)).join(", ")}]  center=[${ctr.map((s) => s.toFixed(3)).join(", ")}]`);
  console.log(`  materials=${JSON.stringify(mats)}`);
}
