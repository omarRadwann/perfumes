"use client";

import type { Fragrance } from "@/lib/fragrances";
import { withBase } from "@/lib/basePath";
import { Reveal, Figure } from "./motion";

const TIERS = [
  ["top", "Tête"],
  ["heart", "Cœur"],
  ["base", "Fond"],
] as const;

const pad = (n: number) => `0${n}`.slice(-2);

export function ScentFeature({ f, index, total, flip }: { f: Fragrance; index: number; total: number; flip: boolean }) {
  return (
    <section id={`scent-${f.id}`} className={`px-6 py-[13vh] md:px-12 ${flip ? "bg-cream" : "bg-ivory"}`}>
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-20">
        <div className={flip ? "md:order-2" : ""}>
          <Figure
            src={withBase(`/img/flacon-${f.id}.jpg`)}
            alt={`${f.name} flacon`}
            dir={flip ? "left" : "up"}
            className="mx-auto aspect-[4/5] w-full max-w-[520px] bg-marble"
          />
        </div>

        <div className={flip ? "md:order-1" : ""}>
          <Reveal stagger={0.075} className="max-w-xl">
            <p className="eyebrow" style={{ color: f.palette.accent }}>
              {pad(index + 1)} / {pad(total)} · {f.family}
            </p>
            <h2 className="mt-4 font-display font-light leading-[0.94] text-ink" style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.8rem)" }}>
              {f.name}
            </h2>
            <p className="mt-4 font-display text-2xl italic leading-snug text-ink-soft">“{f.poem}”</p>
            <div className="hairline my-7 max-w-[16rem]" />
            <div className="notes">
              {TIERS.map(([k, label]) => (
                <div key={k} className="note-row">
                  <span className="note-k" style={{ color: f.palette.accent }}>
                    {label}
                  </span>
                  <span className="note-v">{f.notes[k].join(" · ")}</span>
                </div>
              ))}
            </div>
            <p className="mt-7 max-w-lg text-[0.96rem] leading-relaxed text-ink-soft">{f.story}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-display text-2xl text-ink">
                {f.currency}
                {f.price}
              </span>
              <span className="text-[0.7rem] uppercase tracking-[0.24em] text-stone">{f.sizes.join("  ·  ")}</span>
              <button className="btn-ghost">Acquire</button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
