# ÉTHEREAL — *Awaken the Senses*

> *Scent, made visible.*

An immersive luxury-perfume site for a niche house of six fragrances. A single long
scroll — a luminous glass flacon, the collection, a pinned scent-journey, the atelier,
voices, and a filterable shop — plus a static detail page per scent. Built with
**Next.js + React Three Fiber**, shipped **fully static** (no runtime external calls).

**Live:** https://omarradwann.github.io/perfumes/

## The approach — *hybrid 3D*

Photoreal real-time WebGL is a trap on the open web (and an earlier all-3D build of this
repo crashed integrated GPUs). So ÉTHEREAL uses **exactly one WebGL surface** — the hero
flacon — and renders everything else in DOM / CSS / video:

- **Hero (`components/hero/`)** — a procedural glass flacon (`flacon.glb`, repainted per
  scent) with drei `MeshTransmissionMaterial`, drifting mist, and tier-gated post-fx. It
  is **device-tiered and crash-guarded**: `safe` hardware gets an opaque-material bottle
  (no transmission pass), a lost GPU context falls back to a CSS void, the render loop
  pauses on tab-blur, and reduced-motion / small phones never start WebGL at all.
- **Everything else** — the Scent Library, the pinned Journey, Atelier, Voices, Shop, and
  the `/fragrance/[slug]` detail pages — is DOM/CSS/SVG/video. The detail page's flacon is
  a tinted **SVG** (`components/ui/SvgFlacon.tsx`), not a second canvas.

A unified **accent system** ties it together: choosing a scent in the Library lerps a
global `--accent` CSS variable *and* the hero bottle's juice colour at once.

## Tech

Next.js 16 (App Router, TS, `output: "export"`) · React Three Fiber 9 + drei 10 +
@react-three/postprocessing 3 · GSAP + ScrollTrigger · Lenis · Zustand · Tailwind v4 ·
Cormorant Garamond + Jost. Imagery is AI-generated and optimised with `sharp`.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
```

> Tip: after a production `npm run build`, delete `.next` before `npm run dev` — Turbopack
> can otherwise serve a stale CSS chunk.

Append `?tier=high|standard|safe` to force a render tier (useful on weak GPUs and for
headless capture, where the GL string reports a software rasteriser).

## Build & deploy (GitHub Pages, `gh-pages` branch)

```bash
GITHUB_PAGES=true npm run build          # → ./out, basePath /perfumes
echo "" > out/.nojekyll
cd out && git init -b gh-pages && git add -A && git commit -m deploy \
  && git push -f https://github.com/omarRadwann/perfumes.git HEAD:gh-pages
```

Pages → Source: *Deploy from a branch* → `gh-pages` / root. Every internal link and raw
asset URL is prefixed with `withBase()` (`lib/basePath.ts`) so it resolves under the
`/perfumes` sub-path; `/fragrance/[slug]` is pre-rendered via `generateStaticParams`.

## Structure

```
app/
  layout.tsx              fonts (on <html> so @theme resolves) + metadata + grain
  page.tsx                the long-scroll composition + SEO fallback
  globals.css             the "luminous void" design system (tokens + utilities)
  fragrance/[slug]/       static detail route (generateStaticParams)
components/
  hero/                   HeroMount · HeroCanvas (the one canvas) · Bottle · Mist ·
                          HeroLighting · StaticHero (void / fallback)
  sections/               Hero · Manifesto · ScentLibrary · ScentJourney · Atelier ·
                          Voices · ShopAll · FragranceDetail
  layout/                 Nav (scroll-blur + mobile overlay) · Footer (newsletter stub)
  fx/                     SmoothScroll · Cursor · AccentDriver · AudioToggle · motion
  ui/                     SvgFlacon · NotesPyramid
lib/                      fragrances (the six scents) · store · deviceTier · basePath ·
                          soundscape · motion
public/                   models/flacon.glb · img/ · video/
```

## Performance & assets

Cost scales by GPU tier (`lib/deviceTier.ts`) — real glass transmission + post-fx on
discrete GPUs, opacity-glass on integrated, a WebGL-free static hero for reduced-motion /
small phones. Reused art: `img/nero.jpg` (the atelier's marble), `video/ombre.mp4` (the
Journey's "Depth", heavily blurred so it reads as abstract amber smoke). **Asset gaps to
fill** (e.g. via the Higgsfield connector): per-scent shop/OG plates and dedicated
Journey smoke/petal/haze loops.

---

© ÉTHEREAL — a design/engineering showcase.
