"use client";

import { withBase } from "@/lib/basePath";
import { useScene } from "@/lib/store";

export function Nav({ onHome }: { onHome: () => void }) {
  const sound = useScene((s) => s.sound);
  const setSound = useScene((s) => s.setSound);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-12 md:py-7">
      <button onClick={onHome} className="flex items-center gap-3" aria-label="Maison Nocté — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBase("/img/crest.png")} alt="" className="h-8 w-8 object-contain md:h-9 md:w-9" />
        <span className="font-display text-xl tracking-[0.34em] text-ink md:text-2xl">NOCTÉ</span>
      </button>

      <div className="flex items-center gap-7 md:gap-10">
        <span className="eyebrow hidden sm:inline">Maison de Parfum</span>
        <button onClick={() => setSound(!sound)} className="nav-link inline-flex items-center gap-2" aria-pressed={sound}>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: sound ? "var(--color-gold)" : "transparent", boxShadow: sound ? "none" : "inset 0 0 0 1px var(--color-stone)" }}
          />
          Ambience
        </button>
      </div>
    </header>
  );
}
