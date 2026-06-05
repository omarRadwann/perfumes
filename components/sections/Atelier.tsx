"use client";

import { withBase } from "@/lib/basePath";
import { Reveal, Figure } from "@/components/fx/motion";

const STATS = [
  { n: "VI", label: "Compositions" },
  { n: "Small", label: "Batches" },
  { n: "By hand", label: "Finished" },
];

export function Atelier() {
  return (
    <section id="atelier" className="relative overflow-hidden bg-ink px-6 py-[18vh] md:px-12">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
        {/* imagery — the black marble of the house */}
        <div className="relative">
          <Figure
            src={withBase("/img/nero.jpg")}
            alt="Gold-veined black marble — the surface of the ÉTHEREAL atelier"
            className="aspect-[4/5] w-full"
            dir="left"
            parallax={7}
          />
          {/* a soft floating gold orb for depth */}
          <div
            aria-hidden
            className="float pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-70 blur-[2px]"
            style={{ background: "radial-gradient(circle at 35% 30%, #e8d6a0, #9a7327 60%, #5a4418)", boxShadow: "0 0 60px rgba(200,162,74,0.35)" }}
          />
        </div>

        {/* copy */}
        <Reveal>
          <p className="eyebrow">The Atelier</p>
          <div className="hairline mt-5 max-w-[8rem]" />
          <h2 className="mt-8 font-display font-light leading-[1.02] text-bone" style={{ fontSize: "var(--fs-h2)" }}>
            Composed slowly,
            <br />
            bottled by hand.
          </h2>
          <p className="mt-7 max-w-lg leading-relaxed text-muted" style={{ fontSize: "var(--fs-body)" }}>
            Every ÉTHEREAL begins as a short list of rare materials — saffron, oud, ambergris, orris — sourced for
            character rather than yield, and held until the season is right.
          </p>
          <p className="mt-5 max-w-lg leading-relaxed text-muted" style={{ fontSize: "var(--fs-body)" }}>
            We compose in extrait and eau de parfum, never diluted to fill a bottle. Each batch is small, finished by
            hand, and numbered — a little architecture of scent, and a little restraint.
          </p>

          <div className="mt-12 flex gap-10 md:gap-14">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl text-gold md:text-3xl">{s.n}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
