# Maison Nocté — a fully 3D perfume gallery

> *Six compositions, six worlds.*

A WebGL **maison de parfum** modelled on the reference brief: each fragrance is a
premium **product** (a glass flacon beside its printed gift carton) shown on a
marble plinth in its own luminous alcove of a bright, gold-trimmed gallery you
**scroll** through. Built with **Next.js + React Three Fiber**, shipped fully
**static** (zero runtime external calls).

**Live:** https://omarradwann.github.io/perfumes/

## The reference, implemented

Based on FHILY's "supermarket product packaging in 3D" build. The five steps:

1. **Six individual 3D scenes**, one per product — `components/scene/Alcove.tsx`.
2. Each scene an **intimate alcove with its own world** — every niche glows in the
   scent's accent colour and the follow-spot takes its tint.
3. **Scroll to move between scenes** — Lenis smooth scroll drives a camera dolly
   that rests framed on the active product (`GalleryCamera.tsx`, `Experience.tsx`).
4. **Hidden gestures** — double-click a flacon to make it rise & glow; the Konami
   code reveals the active one.
5. **A soundscape per scene** — a procedural Web-Audio ambient pad that shifts tone
   per alcove (`lib/soundscape.ts`), toggled from the nav.

Plus GSAP-style product rotation/hover and a bright luxury aesthetic (cream marble,
champagne gold, soft museum light).

## On the 3D models

The reference modelled packaging in Blender → GLTF. With no Blender and no Tripo
API key available, the gallery, plinths and products are built **in code** (R3F
geometry) and wrapped in **AI-generated luxury packaging artwork** (the cartons),
which nails the "premium product" look with zero external dependencies. An optional
Tripo image-to-3D pipeline is still included (`scripts/generate-models.js`) per the
original brief, unused at runtime.

## Tech

Next.js 16 (App Router, TS, static export) · React Three Fiber + drei +
@react-three/postprocessing · GSAP · Lenis · zustand · Tailwind v4 · Cormorant
Garamond + Jost. Imagery AI-generated, optimized with sharp.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
```

## Build & deploy (GitHub Pages, gh-pages branch)

```bash
GITHUB_PAGES=true npm run build          # → ./out, basePath /perfumes
echo "" > out/.nojekyll
cd out && git init -b gh-pages && git add -A && git commit -m deploy \
  && git push -f https://github.com/omarRadwann/perfumes.git HEAD:gh-pages
```

Pages → Source: *Deploy from a branch* → `gh-pages` / root. (A ready-made GitHub
Actions workflow is kept at `docs/deploy.workflow.yml`; using it needs a token with
the `workflow` scope.)

## Image pipeline

```bash
node scripts/optimize-images.mjs    # resize + re-encode public/img for the web
```

`public/img/`: `box-<id>.jpg` (six AI carton artworks), `marble.jpg`, `wall.jpg`,
`hero.jpg` (boutique still for OG / mobile), `crest.png` (logo), `og.jpg`.

## Structure

```
components/
  Experience.tsx        Lenis scroll journey, soundscape, hidden gestures, mounts canvas + overlay
  SceneMount.tsx        ssr:false canvas, or StaticFallback (reduced-motion / small phones)
  scene/                SceneCanvas, Gallery, Alcove, Product, GalleryCamera, StudioEnvironment
  ui/                   Nav, SceneOverlay (per-scene info + rail + intro), Cursor, Loader, StaticFallback
lib/                    fragrances (6 products + palette + packaging), store (scroll/active), soundscape,
                        deviceTier (GPU tiers), basePath
scripts/                optimize-images.mjs, serve-out.mjs, generate-models.js (optional Tripo)
```

## Performance

Same composition on every device; cost scales by GPU tier (`lib/deviceTier.ts`) —
real glass transmission + bloom on discrete GPUs, opacity-glass on integrated, a
reduced-motion / small-phone static fallback. Append `?tier=high|standard|safe`.

---

© Maison Nocté — Parfums de Nuit. A design/engineering showcase.
