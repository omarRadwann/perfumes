"use client";

import { withBase } from "@/lib/basePath";
import { useScene } from "@/lib/store";

const LINKS = [
  { href: "#collection", label: "Collection" },
  { href: "#maison", label: "Maison" },
  { href: "#craft", label: "Craft" },
];

export function Nav() {
  const setSelected = useScene((s) => s.setSelected);

  const home = () => {
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-12 md:py-7">
      <button onClick={home} className="group flex items-center gap-3" aria-label="Maison Nocté — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBase("/img/crest.png")} alt="" className="h-8 w-8 object-contain md:h-9 md:w-9" />
        <span className="font-display text-xl tracking-[0.34em] text-bone md:text-2xl">NOCTÉ</span>
      </button>

      <nav className="flex items-center gap-7 md:gap-10">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="nav-link hidden sm:inline-block">
            {l.label}
          </a>
        ))}
        <a href="#contact" className="nav-link text-gold">
          Boutique
        </a>
      </nav>
    </header>
  );
}
