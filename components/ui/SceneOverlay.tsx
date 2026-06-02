"use client";

import type { CSSProperties } from "react";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";

const TIERS: [keyof (typeof FRAGRANCES)[number]["notes"], string][] = [
  ["top", "Tête"],
  ["heart", "Cœur"],
  ["base", "Fond"],
];

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const pad = (n: number) => `0${n}`.slice(-2);

export function SceneOverlay({ onGoto }: { onGoto: (i: number) => void }) {
  const active = useScene((s) => s.active);
  const scroll = useScene((s) => s.scroll);
  const hovered = useScene((s) => s.hovered);
  const opened = useScene((s) => s.opened);
  const f = FRAGRANCES[active];
  const n = FRAGRANCES.length;

  const heroOpacity = clamp(1 - scroll * 7);
  const panelOpacity = clamp((scroll - 0.012) * 20);

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* intro splash — fades as you start scrolling */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: heroOpacity }}
      >
        <p className="eyebrow reveal-in">Maison de Parfum · Est. MMXXV</p>
        <h1 className="gold-shimmer mt-3 font-display text-[clamp(3rem,9vw,7rem)] leading-none">NOCTÉ</h1>
        <p className="reveal mt-3 text-sm tracking-[0.2em] text-ink-soft" style={{ animationDelay: "0.3s" }}>
          SIX COMPOSITIONS · SIX WORLDS
        </p>
      </div>

      {/* active scene info panel */}
      <div
        className="absolute bottom-10 left-6 max-w-sm md:bottom-16 md:left-12"
        style={{ opacity: panelOpacity, transition: "opacity 0.45s var(--ease-luxe)" }}
      >
        <div key={active} className="reveal" style={{ ["--accent" as string]: f.palette.accent } as CSSProperties}>
          <p className="eyebrow" style={{ color: f.palette.accent }}>
            {f.family} · {pad(active + 1)} / {pad(n)}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.95] text-ink">{f.name}</h2>
          <p className="mt-2 font-display text-xl italic text-ink-soft">“{f.poem}”</p>
          <div className="hairline my-5 max-w-[14rem]" />
          <div className="notes">
            {TIERS.map(([k, label]) => (
              <div key={k} className="note-row">
                <span className="note-k">{label}</span>
                <span className="note-v">{f.notes[k].join(" · ")}</span>
              </div>
            ))}
          </div>
          <div className="pointer-events-auto mt-6 flex items-center gap-5">
            <span className="font-display text-2xl text-ink">
              {f.currency}
              {f.price}
            </span>
            <button className="btn-gold" onClick={() => {}}>
              Acquire
            </button>
          </div>
        </div>
      </div>

      {/* progress rail */}
      <div className="pointer-events-auto rail absolute right-6 top-1/2 -translate-y-1/2 md:right-10">
        {FRAGRANCES.map((fr, i) => (
          <button key={fr.id} className="rail-dot" data-on={i === active} onClick={() => onGoto(i)} aria-label={`Go to ${fr.name}`} />
        ))}
      </div>

      {/* cues */}
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-center">
        {heroOpacity > 0.5 && (
          <>
            <p className="eyebrow text-stone">Scroll to enter the gallery</p>
            <div className="scroll-cue" />
          </>
        )}
        {hovered && opened == null && heroOpacity < 0.2 && (
          <p className="eyebrow text-stone">Double-click the flacon to reveal it</p>
        )}
      </div>
    </div>
  );
}
