"use client";

import { useEffect, useState } from "react";
import { useScene } from "@/lib/store";

const LINKS = [
  { href: "#library", label: "Library" },
  { href: "#journey", label: "Journey" },
  { href: "#atelier", label: "Atelier" },
  { href: "#shop", label: "Shop" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const menuOpen = useScene((s) => s.menuOpen);
  const setMenuOpen = useScene((s) => s.setMenuOpen);
  const bag = useScene((s) => s.bag);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-500"
        style={{
          background: solid ? "rgba(10,10,11,0.72)" : "transparent",
          backdropFilter: solid ? "blur(12px)" : "none",
          WebkitBackdropFilter: solid ? "blur(12px)" : "none",
          borderBottom: `1px solid ${solid ? "rgba(244,239,230,0.08)" : "transparent"}`,
        }}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
          <a
            href="#top"
            className="font-display text-[1.5rem] leading-none tracking-[0.14em] text-bone md:text-[1.75rem]"
          >
            ÉTHEREAL
          </a>

          <div className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
            <a href="#shop" className="nav-link" aria-label={`Bag, ${bag} ${bag === 1 ? "item" : "items"}`}>
              Bag ({bag})
            </a>
          </div>

          <button
            className="flex flex-col gap-[5px] p-2 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="block h-px w-6 bg-bone transition-transform duration-300" style={{ transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
            <span className="block h-px w-6 bg-bone transition-opacity duration-300" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="block h-px w-6 bg-bone transition-transform duration-300" style={{ transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay menu with staggered link reveal. */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-7 transition-[opacity,visibility] duration-500 md:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "rgba(10,10,11,0.97)" }}
      >
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            className="font-display text-4xl text-bone transition-all duration-500"
            style={{
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              opacity: menuOpen ? 1 : 0,
              transitionDelay: `${menuOpen ? 120 + i * 70 : 0}ms`,
            }}
          >
            {l.label}
          </a>
        ))}
        <a
          href="#shop"
          onClick={() => setMenuOpen(false)}
          className="eyebrow mt-3 transition-all duration-500"
          style={{ opacity: menuOpen ? 1 : 0, transitionDelay: menuOpen ? "440ms" : "0ms" }}
        >
          Bag ({bag})
        </a>
      </div>
    </>
  );
}
