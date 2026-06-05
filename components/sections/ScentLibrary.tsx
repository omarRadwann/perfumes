"use client";

import Link from "next/link";
import { withBase } from "@/lib/basePath";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";
import { Reveal } from "@/components/fx/motion";

// Deterministic mote positions (no Math.random → no hydration mismatch).
const MOTES = [
  { l: 12, t: 22, md: 8, d: 0 },
  { l: 22, t: 64, md: 6.5, d: 1.2 },
  { l: 31, t: 38, md: 9, d: 0.5 },
  { l: 44, t: 78, md: 7, d: 2.1 },
  { l: 57, t: 28, md: 8.5, d: 0.9 },
  { l: 66, t: 58, md: 6, d: 1.6 },
  { l: 73, t: 18, md: 9.5, d: 0.3 },
  { l: 81, t: 70, md: 7.5, d: 2.4 },
  { l: 88, t: 40, md: 8, d: 1.1 },
  { l: 38, t: 14, md: 6.8, d: 1.9 },
  { l: 52, t: 86, md: 9.2, d: 0.7 },
  { l: 17, t: 48, md: 7.8, d: 2.6 },
];

function Motes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="mote"
          style={{ left: `${m.l}%`, top: `${m.t}%`, ["--md" as string]: `${m.md}s`, ["--mdelay" as string]: `${m.d}s` }}
        />
      ))}
    </div>
  );
}

export function ScentLibrary() {
  const activeId = useScene((s) => s.activeScentId);
  const setActive = useScene((s) => s.setActiveScent);

  const idx = Math.max(0, FRAGRANCES.findIndex((f) => f.id === activeId));
  const f = FRAGRANCES[idx] ?? FRAGRANCES[0];
  const select = (i: number) => setActive(FRAGRANCES[(i + FRAGRANCES.length) % FRAGRANCES.length].id);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      select(idx + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      select(idx - 1);
    }
  };

  return (
    <section id="library" className="relative overflow-hidden bg-ink px-6 py-[16vh] md:px-12" onKeyDown={onKey}>
      {/* accent glow that shifts with the active scent */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-1/2 h-[64vmin] w-[64vmin] -translate-y-1/2 rounded-full opacity-40 blur-[90px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
      />
      <Motes />

      <div className="relative mx-auto max-w-[1500px]">
        <Reveal>
          <p className="eyebrow">The Scent Library</p>
          <div className="hairline mt-5 max-w-[8rem]" />
          <p
            className="mt-8 max-w-xl font-display font-light leading-[1.12] text-bone"
            style={{ fontSize: "var(--fs-h3)" }}
          >
            Six compositions, six worlds. Choose one — the room takes its colour.
          </p>
        </Reveal>

        {/* stage */}
        <div className="mt-[9vh] grid grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          {/* identity */}
          <Reveal>
            <div className="flex items-center gap-5">
              <span className="font-display text-lg" style={{ color: "var(--accent)" }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="h-px max-w-[5rem] flex-1" style={{ background: "var(--accent)" }} />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.32em]" style={{ color: "var(--accent)" }}>
                {f.family}
              </span>
            </div>
            <h2
              className="mt-6 font-display font-light leading-[0.9] text-bone"
              style={{ fontSize: "var(--fs-h1)", transition: "color 0.6s" }}
            >
              {f.name}
            </h2>
            <p className="mt-5 font-display text-2xl italic text-muted md:text-[1.7rem]">{f.poem}</p>
            <p className="mt-3 text-[0.7rem] uppercase tracking-[0.3em] text-muted">{f.character}</p>
          </Reveal>

          {/* info panel */}
          <Reveal>
            <div
              className="rounded-[2px] border border-line p-8 md:p-10"
              style={{ background: "rgba(18,18,20,0.6)", boxShadow: "inset 0 1px 90px -50px var(--accent)" }}
            >
              <p className="leading-relaxed text-bone/90" style={{ fontSize: "var(--fs-body)" }}>
                {f.story}
              </p>
              <div className="notes mt-8">
                <div className="note-row">
                  <span className="note-k">Top</span>
                  <span className="note-v">{f.notes.top.join(" · ")}</span>
                </div>
                <div className="note-row">
                  <span className="note-k">Heart</span>
                  <span className="note-v">{f.notes.heart.join(" · ")}</span>
                </div>
                <div className="note-row">
                  <span className="note-k">Base</span>
                  <span className="note-v">{f.notes.base.join(" · ")}</span>
                </div>
              </div>
              <div className="mt-9 flex items-center justify-between border-t border-line pt-6">
                <div>
                  <span className="font-display text-3xl text-bone">
                    {f.currency}
                    {f.price}
                  </span>
                  <span className="ml-3 text-[0.66rem] uppercase tracking-[0.24em] text-muted">
                    {f.concentration} · {f.sizes[0]}
                  </span>
                </div>
                <Link
                  href={withBase(`/fragrance/${f.id}/`)}
                  className="text-[0.7rem] uppercase tracking-[0.24em] transition-opacity hover:opacity-70"
                  style={{ color: "var(--accent)" }}
                  data-interactive
                >
                  Explore →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        {/* selector rail */}
        <div className="mt-[9vh] flex gap-px overflow-x-auto" role="tablist" aria-label="Fragrance selector">
          {FRAGRANCES.map((s, i) => {
            const on = i === idx;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={on}
                onClick={() => select(i)}
                data-interactive
                className="min-w-[8.5rem] flex-1 border-t px-3 py-5 text-left transition-colors duration-500"
                style={{ borderColor: on ? "var(--accent)" : "rgba(244,239,230,0.12)" }}
              >
                <span
                  className="block text-[0.66rem] tracking-[0.2em] transition-colors duration-500"
                  style={{ color: on ? "var(--accent)" : "var(--color-muted)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="mt-2 block font-display text-lg transition-colors duration-500"
                  style={{ color: on ? "var(--color-bone)" : "var(--color-muted)" }}
                >
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
