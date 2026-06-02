"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useScene } from "@/lib/store";
import { getFragrance, type Notes } from "@/lib/fragrances";

const TIERS: { key: keyof Notes; label: string }[] = [
  { key: "top", label: "Tête" },
  { key: "heart", label: "Cœur" },
  { key: "base", label: "Fond" },
];

export function DetailPanel() {
  const selectedId = useScene((s) => s.selectedId);
  const setSelected = useScene((s) => s.setSelected);
  const inner = useRef<HTMLDivElement>(null);
  const f = selectedId ? getFragrance(selectedId) : null;

  useEffect(() => {
    if (!selectedId || !inner.current) return;
    const els = inner.current.querySelectorAll<HTMLElement>("[data-rv]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.075, ease: "power3.out", delay: 0.35 }
      );
    });
    return () => ctx.revert();
  }, [selectedId]);

  return (
    <div className={`detail ${selectedId ? "detail-open" : ""}`} aria-hidden={!selectedId}>
      {f && (
        <div
          ref={inner}
          className="detail-inner"
          style={{ "--accent": f.colors.accent } as CSSProperties}
        >
          <button className="detail-close" onClick={() => setSelected(null)} data-rv>
            ← The Collection
          </button>

          <p className="eyebrow" data-rv style={{ color: f.colors.accent }}>
            {f.family} · {f.concentration}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.6rem,8vw,4rem)] leading-[0.95] text-bone" data-rv>
            {f.name}
          </h2>
          <p className="mt-3 font-display text-2xl italic text-bone-dim" data-rv>
            “{f.poem}”
          </p>

          <div className="hairline my-7" data-rv />

          <div className="notes" data-rv>
            {TIERS.map((t) => (
              <div key={t.key} className="note-row">
                <span className="note-k">{t.label}</span>
                <span className="note-v">{f.notes[t.key].join(" · ")}</span>
              </div>
            ))}
          </div>

          <p className="mt-7 text-sm leading-relaxed text-bone-dim" data-rv>
            {f.story}
          </p>

          <div className="detail-buy" data-rv>
            <div>
              <span className="font-display text-3xl text-bone">
                {f.currency}
                {f.price}
              </span>
              <span className="ml-2 text-sm text-smoke">/ {f.sizes[0]}</span>
            </div>
            <button className="btn-gold" onClick={() => setSelected(null)}>
              Acquire
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
