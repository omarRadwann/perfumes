"use client";

import { useEffect, useState } from "react";

export function EditorialNav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background,border-color,padding] duration-500"
      style={{
        background: solid ? "rgba(244,237,225,0.82)" : "transparent",
        backdropFilter: solid ? "blur(10px)" : "none",
        borderBottom: `1px solid ${solid ? "rgba(184,146,79,0.18)" : "transparent"}`,
      }}
    >
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
        <a href="#top" className="font-display text-2xl leading-none tracking-[0.02em] text-ink md:text-[1.7rem]">
          NOCTÉ
        </a>
        <div className="flex items-center gap-7 md:gap-10">
          <a href="#collection" className="nav-link hidden sm:inline">The Collection</a>
          <a href="#maison" className="nav-link hidden sm:inline">The Maison</a>
          <a href="#collection" className="nav-link">Discover</a>
        </div>
      </nav>
    </header>
  );
}
