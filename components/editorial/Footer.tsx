"use client";

import { FRAGRANCES } from "@/lib/fragrances";

const COLS: { title: string; links: string[] }[] = [
  { title: "Maison", links: ["The House", "Craftsmanship", "Sustainability", "Stores"] },
  { title: "Client Care", links: ["Contact", "Shipping", "Returns", "Engraving"] },
  { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Accessibility"] },
];

export function Footer() {
  return (
    <footer className="bg-ink px-6 pt-[10vh] pb-10 text-ivory md:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl leading-none tracking-[0.02em]">NOCTÉ</p>
            <p className="mt-5 max-w-xs text-[0.82rem] leading-relaxed text-stone-soft">
              Parfums de Nuit. Extrait de parfum, composed and bottled in Paris.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="text-[0.62rem] uppercase tracking-[0.34em] text-gold">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-[0.84rem] text-stone-soft transition-colors duration-300 hover:text-ivory">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 h-px w-full bg-[rgba(255,255,255,0.08)]" />

        <div className="mt-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-stone">© MMXXV Maison Nocté — All rights reserved</p>
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-stone">
            {FRAGRANCES.length} Compositions · Extrait de Parfum
          </p>
        </div>
      </div>
    </footer>
  );
}
