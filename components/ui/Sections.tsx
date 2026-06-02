"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { withBase } from "@/lib/basePath";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";

// Reveal-on-scroll wrapper (IntersectionObserver → adds the .reveal animation).
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.animationDelay = `${delay}s`;
          el.classList.add("reveal");
          io.disconnect();
        }
      },
      { threshold: 0.16 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} style={{ opacity: 0 }} className={className}>
      {children}
    </div>
  );
}

const PILLARS = [
  {
    n: "I",
    t: "Extrait Concentration",
    d: "Every composition is bottled at 24–30% perfume oil — a true extrait that unfolds for hours and lingers into the next morning.",
  },
  {
    n: "II",
    t: "Natural Absolutes",
    d: "Turkish rose, Laotian oud, Florentine orris. We source raw materials at their origin and refuse the synthetic shortcut wherever nature can be coaxed.",
  },
  {
    n: "III",
    t: "Six-Month Maceration",
    d: "Each batch rests in the dark for half a year so the notes marry completely before a single flacon is filled by hand.",
  },
];

export function Sections() {
  const setSelected = useScene((s) => s.setSelected);

  // Experience scrolls to the top (where the canvas is visible) on select.
  const open = (id: string) => setSelected(id);

  return (
    <>
      {/* ============================================ COLLECTION ========== */}
      <section id="collection" className="section section-pad">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="section-num mb-3">01 — The Collection</p>
              <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-none text-bone">
                Five vials of night
              </h2>
            </div>
            <p className="hidden max-w-xs text-sm text-bone-dim md:block">
              Select a flacon to step inside its composition — the camera draws near
              and the notes reveal themselves.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
            {FRAGRANCES.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.08}>
                <button
                  onClick={() => open(f.id)}
                  className="card group aspect-[3/4] w-full"
                  aria-label={`Open ${f.name}`}
                >
                  {/* f.mood already includes basePath (via withBase in fragrances.ts) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.mood} alt={f.name} className="card-img absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-left md:p-5">
                    <span
                      className="card-line mb-3 block h-px w-6"
                      style={{ background: f.colors.accent }}
                    />
                    <p
                      className="mb-1 text-[0.58rem] uppercase tracking-[0.2em]"
                      style={{ color: f.colors.accent }}
                    >
                      {f.family}
                    </p>
                    <h3 className="font-display text-xl text-bone md:text-2xl">{f.name}</h3>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================== MAISON =========== */}
      <section id="maison" className="section section-pad">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal className="relative aspect-[3/4] overflow-hidden md:aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBase("/img/atelier.jpg")}
              alt="The Maison Nocté atelier"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-gold/15" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-num mb-3">02 — The Maison</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-tight text-bone">
              A house built for the dark
            </h2>
            <div className="mt-6 space-y-5 text-bone-dim">
              <p>
                Maison Nocté began with a conviction: that the truest version of a
                person appears only after sundown. Our perfumer composes for that
                hour — when light is low, conversation is honest, and scent does the
                talking.
              </p>
              <p>
                Each fragrance is an extrait, built from naturals gathered at their
                source and aged in darkness until the notes settle into a single
                voice. Nothing is rushed. Nothing is loud. Everything is meant to be
                discovered up close.
              </p>
            </div>
            <a href="#craft" className="mt-9 inline-block">
              <span className="btn-ghost">Our Craft</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* =============================================== CRAFT ============ */}
      <section id="craft" className="section section-pad">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <p className="section-num mb-3">03 — The Craft</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-tight text-bone">
              Slow perfumery, by hand
            </h2>
          </Reveal>
          <div className="grid gap-px overflow-hidden md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div className="h-full border-t border-gold/15 px-2 py-8 md:px-8">
                  <p className="font-display text-4xl text-gold">{p.n}</p>
                  <h3 className="mt-4 font-display text-2xl text-bone">{p.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-bone-dim">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================== CONTACT / FOOTER ========= */}
      <section id="contact" className="section relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${withBase("/img/hero.jpg")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-noir via-noir/85 to-noir" />
        <div className="relative mx-auto max-w-3xl px-6 py-32 text-center md:py-44">
          <Reveal>
            <p className="eyebrow">Le Cercle Nocté</p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-tight text-bone">
              Join the after-dark list
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm text-bone-dim">
              Private launches, samples before they sell out, and the occasional
              letter from the perfumer. No noise.
            </p>
            <form
              className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Your email"
                className="flex-1 border border-gold/25 bg-transparent px-5 py-3.5 text-sm text-bone placeholder:text-smoke focus:border-gold focus:outline-none"
              />
              <button type="submit" className="btn-gold">
                Subscribe
              </button>
            </form>
          </Reveal>
        </div>

        <footer className="relative border-t border-gold/12 px-6 py-10 md:px-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase("/img/crest.png")} alt="" className="h-7 w-7 object-contain" />
              <span className="font-display text-lg tracking-[0.32em] text-bone">NOCTÉ</span>
            </div>
            <p className="text-xs tracking-[0.18em] text-smoke">
              © MMXXVI MAISON NOCTÉ · PARFUMS DE NUIT · PARIS
            </p>
            <div className="flex gap-6 text-xs uppercase tracking-[0.2em] text-bone-dim">
              <a href="#top" className="ln">Instagram</a>
              <a href="#top" className="ln">Journal</a>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}
