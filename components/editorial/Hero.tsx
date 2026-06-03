"use client";

import { withBase } from "@/lib/basePath";
import { Figure } from "./motion";

// Asymmetric editorial hero: oversized wordmark + manifesto on the left, a tall hero
// flacon on the right. One staggered page-load reveal (CSS .reveal with delays).
export function Hero() {
  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden bg-ivory">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 items-center gap-10 px-6 pt-28 pb-16 md:grid-cols-[1.15fr_0.85fr] md:px-12 md:pt-20">
        {/* left — type */}
        <div className="order-2 md:order-1">
          <p className="eyebrow reveal" style={{ animationDelay: "0.1s" }}>
            Maison de Parfum · Est. MMXXV
          </p>
          <h1 className="reveal mt-6 font-display font-light leading-[0.88] tracking-[-0.02em] text-ink" style={{ fontSize: "clamp(4.2rem, 13vw, 12rem)", animationDelay: "0.22s" }}>
            NOCTÉ
          </h1>
          <p className="reveal mt-7 max-w-md font-display text-2xl italic leading-snug text-ink-soft md:text-[1.7rem]" style={{ animationDelay: "0.4s" }}>
            Parfums de Nuit — six compositions for the hours after dark.
          </p>
          <div className="reveal mt-10 flex items-center gap-7" style={{ animationDelay: "0.58s" }}>
            <a href="#collection" className="btn-ghost">Explore the Collection</a>
            <span className="hidden items-center gap-3 text-stone sm:flex">
              <span className="scroll-cue" />
              <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
            </span>
          </div>
        </div>

        {/* right — hero flacon */}
        <div className="order-1 md:order-2">
          <Figure
            src={withBase("/img/flacon-ombre-dor.jpg")}
            alt="Ombre d'Or — the Maison Nocté flacon"
            priority
            dir="up"
            parallax={6}
            className="mx-auto aspect-[3/4] w-full max-w-[460px] bg-marble"
          />
        </div>
      </div>

      {/* baseline hairline */}
      <div className="absolute inset-x-6 bottom-0 md:inset-x-12">
        <div className="hairline" />
      </div>
    </section>
  );
}
