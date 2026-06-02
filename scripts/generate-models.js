/*
 * generate-models.js — OPTIONAL Tripo AI image-to-3D pipeline.
 * ---------------------------------------------------------------------------
 * The shipped Maison Nocté site does NOT use this. The flacons are crafted in
 * real WebGL (lib + components/scene) because image-to-3D cannot reproduce
 * transparent glass, refraction, or the liquid inside a perfume bottle.
 *
 * This script is provided per the project brief so the image-to-3D workflow is
 * available if you ever want GLB props (e.g. opaque packaging / cartons, which
 * image-to-3D handles well). It reads every image in assets/source-images/,
 * sends each to Tripo, polls until done, and downloads the textured GLB to
 * public/models/<name>.glb — skipping any image that already has a GLB.
 *
 * Setup:
 *   1) Get an API key at https://platform.tripo3d.ai and put it in .env:
 *        TRIPO_API_KEY=tcli_xxx
 *   2) Drop product images into assets/source-images/
 *   3) npm run models
 *
 * NOTE: Tripo's API evolves — validate the endpoints/fields below against the
 * live docs at https://platform.tripo3d.ai/docs before a serious run. The key is
 * read ONLY here (server-side); it is never referenced by any browser code.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const API = "https://api.tripo3d.ai/v2/openapi";
const KEY = process.env.TRIPO_API_KEY;
const SRC = path.join(__dirname, "..", "assets", "source-images");
const OUT = path.join(__dirname, "..", "public", "models");
const POLL_MS = 4000;
const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log("•", ...a);

async function uploadImage(file) {
  const buf = fs.readFileSync(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  const form = new FormData();
  form.append("file", new Blob([buf]), path.basename(file));
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || json.code !== 0) {
    throw new Error(`upload failed: ${res.status} ${JSON.stringify(json)}`);
  }
  // Tripo returns an image/file token used to reference the upload in a task.
  return { token: json.data.image_token || json.data.file_token, type: ext === "jpeg" ? "jpg" : ext };
}

async function createTask(token, type) {
  const res = await fetch(`${API}/task`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "image_to_model",
      file: { type, file_token: token },
      texture: true,
      pbr: true,
    }),
  });
  const json = await res.json();
  if (!res.ok || json.code !== 0) {
    throw new Error(`task create failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json.data.task_id;
}

async function pollTask(taskId) {
  for (;;) {
    const res = await fetch(`${API}/task/${taskId}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const json = await res.json();
    const d = json.data || {};
    const status = d.status;
    if (status === "success") {
      const out = d.output || {};
      const url = out.pbr_model || out.model || out.base_model;
      if (!url) throw new Error(`finished but no model url: ${JSON.stringify(out)}`);
      return url;
    }
    if (status === "failed" || status === "cancelled" || status === "banned") {
      throw new Error(`task ${status}: ${JSON.stringify(d)}`);
    }
    log(`  …${status}${d.progress != null ? ` ${d.progress}%` : ""}`);
    await sleep(POLL_MS);
  }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  if (!KEY) {
    console.error("✗ TRIPO_API_KEY is not set. Add it to .env (see .env.example).");
    process.exit(1);
  }
  if (!fs.existsSync(SRC) || fs.readdirSync(SRC).filter((f) => IMG_EXT.has(path.extname(f).toLowerCase())).length === 0) {
    console.error(`✗ No images in ${SRC}\n  Add product images (one object per image), then re-run: npm run models`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const images = fs
    .readdirSync(SRC)
    .filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()));

  log(`Found ${images.length} image(s) in assets/source-images/`);
  for (const img of images) {
    const name = path.basename(img, path.extname(img));
    const dest = path.join(OUT, `${name}.glb`);
    if (fs.existsSync(dest)) {
      log(`✓ ${name}.glb already exists — skipping (no credits spent).`);
      continue;
    }
    try {
      log(`→ ${img}: uploading…`);
      const { token, type } = await uploadImage(path.join(SRC, img));
      log(`  creating image_to_model task…`);
      const taskId = await createTask(token, type);
      log(`  task ${taskId} — polling…`);
      const url = await pollTask(taskId);
      log(`  downloading GLB → public/models/${name}.glb`);
      await download(url, dest);
      log(`✓ ${name}.glb done`);
    } catch (err) {
      console.error(`✗ ${img}: ${err.message}`);
    }
  }
  log("All done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
