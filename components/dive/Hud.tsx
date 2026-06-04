"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";
import { prefersReducedMotion } from "@/lib/motion";

const pad = (n: number) => `0${n}`.slice(-2);
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const TIERS = [
  ["top", "Tête"],
  ["heart", "Cœur"],
  ["base", "Fond"],
] as const;

// Diegetic overlay: descent indicator + per-scent narrative panel (crawlable HTML),
// minimal wordmark, scroll cue. No conventional top nav over the experience.
export function Hud() {
  const active = useScene((s) => s.active);
  const scroll = useScene((s) => s.scroll);
  const f = FRAGRANCES[active];
  const n = FRAGRANCES.length;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !panel.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-rv]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", delay: 0.05 });
      gsap.from("[data-nm]", { yPercent: 14, opacity: 0, duration: 0.9, ease: "power3.out" });
    }, panel.current);
    return () => ctx.revert();
  }, [active]);

  const goto = (i: number) => {
    const l = (window as Window & { __lenis?: { scrollTo: (y: number, o?: object) => void; limit: number } }).__lenis;
    if (l) l.scrollTo((i / (n - 1)) * l.limit, { duration: 1.4 });
  };

  const heroGone = scroll > 0.04;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 text-ivory">
      {/* wordmark */}
      <div className="absolute left-6 top-6 md:left-10 md:top-8">
        <span className="font-display text-2xl tracking-[0.04em]">NOCTÉ</span>
      </div>
      <div className="absolute right-6 top-7 md:right-10">
        <span className="text-[0.6rem] uppercase tracking-[0.34em] text-stone-soft">Parfums de Nuit</span>
      </div>

      {/* descent indicator */}
      <div className="absolute right-7 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-stone-soft">{pad(active + 1)}</span>
        <div className="relative h-44 w-px bg-[rgba(255,255,255,0.16)]">
          <div className="absolute left-0 top-0 w-px bg-gold transition-[height] duration-300" style={{ height: `${clamp(scroll) * 100}%` }} />
        </div>
        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-stone-soft">{pad(n)}</span>
      </div>

      {/* per-scent narrative panel (crawlable) */}
      <div ref={panel} className="absolute bottom-10 left-6 max-w-sm md:bottom-14 md:left-10">
        <p data-rv className="text-[0.62rem] uppercase tracking-[0.34em]" style={{ color: f.palette.accent }}>
          {pad(active + 1)} / {pad(n)} · {f.family}
        </p>
        <h2 data-nm className="mt-2 overflow-hidden font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95]">
          {f.name}
        </h2>
        <p data-rv className="mt-2 font-display text-xl italic text-stone-soft">“{f.poem}”</p>
        <div data-rv className="my-4 h-px w-40 bg-[rgba(255,255,255,0.18)]" />
        <div className="space-y-1.5">
          {TIERS.map(([k, label]) => (
            <div key={k} data-rv className="grid grid-cols-[3.4rem_1fr] gap-3 text-[0.82rem]">
              <span className="text-[0.55rem] uppercase tracking-[0.2em]" style={{ color: f.palette.accent }}>
                {label}
              </span>
              <span className="font-display text-base text-ivory/90">{f.notes[k].join(" · ")}</span>
            </div>
          ))}
        </div>
        <div data-rv className="pointer-events-auto mt-5 flex items-center gap-5">
          <span className="font-display text-2xl">
            {f.currency}
            {f.price}
          </span>
          <button className="text-[0.62rem] uppercase tracking-[0.28em] text-gold transition-colors hover:text-ivory">Acquire ⟶</button>
        </div>
      </div>

      {/* rail */}
      <div className="pointer-events-auto absolute bottom-12 right-6 flex gap-2 md:hidden">
        {FRAGRANCES.map((fr, i) => (
          <button key={fr.id} onClick={() => goto(i)} aria-label={fr.name} className="h-1.5 w-1.5 rounded-full" style={{ background: i === active ? "var(--color-gold)" : "rgba(255,255,255,0.3)" }} />
        ))}
      </div>

      {/* scroll cue */}
      {!heroGone && (
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.34em] text-stone-soft">Scroll to descend</span>
          <span className="block h-9 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </div>
      )}
    </div>
  );
}
