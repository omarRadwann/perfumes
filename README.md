# Maison Nocté — a fully 3D luxury perfume experience

> *Composed for the hours after dark.*

A WebGL **maison de parfum**: five glass flacons stand on a polished onyx floor in
real-time 3D. Hover to lift a bottle, click to fly the camera in and reveal its
note pyramid and story. Built with **Next.js + React Three Fiber**, shipped as a
fully **static** site (the browser makes zero external calls at runtime).

**Live:** https://omarradwann.github.io/perfumes/

---

## Why the bottles are crafted in code (not Tripo)

The brief suggested generating 3D models from images via Tripo's image-to-3D API.
That rule fits **opaque retail packaging** — the case image-to-3D is good at. But a
perfume bottle is **transparent glass**: a single photo can't encode refraction,
index-of-refraction, or the liquid inside, so image-to-3D yields a blobby, opaque
mesh — the opposite of luxury.

So the flacons are crafted in real WebGL (lathe geometry + physically-based glass
with true transmission + an in-scene HDRI built from lightformers). The Tripo
pipeline is still included (`scripts/generate-models.js`) and documented below, but
the shipped site never calls it.

## Tech stack

- **Next.js 16** (App Router, TypeScript, static export)
- **React Three Fiber** + **drei** + **@react-three/postprocessing** (Three.js)
- **GSAP** (detail-panel choreography), **zustand** (scene ⇆ DOM state)
- **Tailwind CSS v4**, Cormorant Garamond + Jost typography
- Imagery generated with AI; optimized with **sharp**

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build & deploy (GitHub Pages)

```bash
# local production build → ./out  (root basePath, for `npm run preview`)
npm run build

# build under the /perfumes subpath (what gets published to Pages)
GITHUB_PAGES=true npm run build
```

This repo is published to the `gh-pages` branch (Pages → Source: *Deploy from a
branch* → `gh-pages` / root). To redeploy:

```bash
GITHUB_PAGES=true npm run build
echo "" > out/.nojekyll                      # keep /_next/* from being stripped
cd out && git init -b gh-pages && git add -A && git commit -m deploy \
  && git push -f https://github.com/omarRadwann/perfumes.git HEAD:gh-pages
```

> A ready-made GitHub Actions workflow lives at `docs/deploy.workflow.yml`. To use
> Actions-based auto-deploy instead, copy it to `.github/workflows/deploy.yml`
> (requires a token with the `workflow` scope) and set Pages → Source: *GitHub
> Actions*.

## Image pipeline

All art lives in `public/img/`. The originals were AI-generated, then optimized:

```bash
node scripts/optimize-images.mjs   # resize + re-encode (JPEG/PNG) for the web
```

Bottle labels are **not** images — they're drawn procedurally to a canvas texture
(`lib/labelTexture.ts`) for perfect alpha and crisp type at any resolution.

## Optional — Tripo image-to-3D (`npm run models`)

Provided per the brief; **not used by the site**. To experiment (e.g. for opaque
packaging props):

1. `cp .env.example .env` and set `TRIPO_API_KEY` (https://platform.tripo3d.ai)
2. Put product images in `assets/source-images/`
3. `npm run models` → textured GLBs download to `public/models/` (existing ones are
   skipped, so re-runs don't spend credits)

The key is read server-side only and is git-ignored. No browser code references it.

## Project structure

```
app/                  layout (fonts, metadata) + page
components/
  Experience.tsx      orchestrates canvas + DOM, scroll-lock, render gating
  SceneMount.tsx      ssr:false dynamic import of the canvas
  scene/              SceneCanvas, Shelf, Bottle, CameraRig, StudioEnvironment
  ui/                 Nav, Hero, DetailPanel, Sections, Cursor, Loader
lib/                  fragrances (data), store, deviceTier, basePath, labelTexture
scripts/              optimize-images.mjs, generate-models.js (optional Tripo)
public/img/           AI-generated, optimized art
```

## Performance

The scene runs the same composition on every device but scales cost by GPU tier
(`lib/deviceTier.ts`): real glass **transmission** + a mirror floor on discrete
GPUs; tinted fake-glass + contact shadows on integrated GPUs; a reduced-motion /
small-mobile path drops effects. DPR is clamped per tier and never below 1.0.
Append `?tier=high|standard|safe` to the URL to pin a tier.

---

© Maison Nocté — Parfums de Nuit. A design/engineering showcase.
