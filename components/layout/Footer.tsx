"use client";

import { useState } from "react";
import { FRAGRANCES } from "@/lib/fragrances";

const COLS: { title: string; links: string[] }[] = [
  { title: "Maison", links: ["The House", "Atelier", "Sustainability", "Stores"] },
  { title: "Client Care", links: ["Contact", "Shipping", "Returns", "Engraving"] },
  { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Accessibility"] },
];

const SOCIAL = ["Instagram", "Journal", "Pinterest"];

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  // Stub: no network call — just acknowledge (static export, no backend).
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail("");
  };

  return (
    <footer className="relative bg-panel px-6 pt-[12vh] pb-10 text-bone md:px-12">
      {/* Newsletter */}
      <div className="mx-auto max-w-[1500px]">
        <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="eyebrow">The Invisible Letter</p>
            <p className="mt-5 max-w-md font-display font-light leading-[1.05]" style={{ fontSize: "var(--fs-h2)" }}>
              Word of new compositions, kept rare.
            </p>
          </div>
          <form onSubmit={subscribe} className="w-full">
            {sent ? (
              <p className="text-[0.95rem] text-gold-hi" role="status">
                Thank you — you are on the list.
              </p>
            ) : (
              <div className="flex items-center gap-4 border-b border-[rgba(244,239,230,0.18)] pb-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  aria-label="Email address"
                  className="w-full bg-transparent text-[0.95rem] text-bone placeholder:text-muted focus:outline-none"
                />
                <button type="submit" className="eyebrow whitespace-nowrap text-gold transition-colors hover:text-gold-hi">
                  Subscribe
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl leading-none tracking-[0.12em]">ÉTHEREAL</p>
            <p className="mt-5 max-w-xs text-[0.82rem] leading-relaxed text-muted">
              Scent, made visible. Six compositions, made in small batches.
            </p>
            <div className="mt-6 flex gap-5">
              {SOCIAL.map((s) => (
                <a key={s} href="#top" className="text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-bone">
                  {s}
                </a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="text-[0.62rem] uppercase tracking-[0.34em] text-gold">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#top" className="text-[0.84rem] text-muted transition-colors duration-300 hover:text-bone">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 h-px w-full bg-[rgba(244,239,230,0.08)]" />

        <div className="mt-7 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">© MMXXVI ÉTHEREAL — All rights reserved</p>
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">
            {FRAGRANCES.length} Compositions · Eau de Parfum & Extrait
          </p>
        </div>
      </div>
    </footer>
  );
}
