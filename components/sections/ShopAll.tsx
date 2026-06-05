"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { withBase } from "@/lib/basePath";
import { FRAGRANCES } from "@/lib/fragrances";
import { Reveal } from "@/components/fx/motion";
import { Kinetic } from "@/components/fx/Kinetic";
import { SvgFlacon } from "@/components/ui/SvgFlacon";

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const PRICES = [
  { key: "all", label: "Any price" },
  { key: "under", label: "Under $230" },
  { key: "over", label: "$230 & up" },
];

const families = Array.from(new Set(FRAGRANCES.map((f) => f.family)));
const allNotes = Array.from(
  new Set(FRAGRANCES.flatMap((f) => [...f.notes.top, ...f.notes.heart, ...f.notes.base]))
).sort();

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-interactive
        className="min-w-[9rem] border-b border-line bg-transparent pb-2 font-display text-lg text-bone outline-none transition-colors focus:border-[color:var(--accent)]"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key} className="bg-panel text-bone">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ShopAll() {
  const [family, setFamily] = useState("all");
  const [season, setSeason] = useState("all");
  const [price, setPrice] = useState("all");
  const [note, setNote] = useState("all");

  const results = useMemo(
    () =>
      FRAGRANCES.filter((f) => {
        if (family !== "all" && f.family !== family) return false;
        if (season !== "all" && !f.season.includes(season)) return false;
        if (price === "under" && f.price >= 230) return false;
        if (price === "over" && f.price < 230) return false;
        if (note !== "all" && ![...f.notes.top, ...f.notes.heart, ...f.notes.base].includes(note)) return false;
        return true;
      }),
    [family, season, price, note]
  );

  const reset = () => {
    setFamily("all");
    setSeason("all");
    setPrice("all");
    setNote("all");
  };
  const filtered = family !== "all" || season !== "all" || price !== "all" || note !== "all";

  return (
    <section id="shop" className="relative bg-ink px-6 py-[16vh] md:px-12">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <p className="eyebrow">Shop All</p>
          <div className="hairline mt-5 max-w-[8rem]" />
          <Kinetic
            as="h2"
            by="word"
            text="The complete collection."
            className="mt-8 font-display font-light leading-[1.0] text-bone"
            style={{ fontSize: "var(--fs-h2)" }}
          />
        </Reveal>

        {/* filters */}
        <div className="mt-12 flex flex-wrap items-end gap-x-8 gap-y-6 border-y border-line py-6">
          <Select
            label="Family"
            value={family}
            onChange={setFamily}
            options={[{ key: "all", label: "All families" }, ...families.map((f) => ({ key: f, label: f }))]}
          />
          <Select
            label="Season"
            value={season}
            onChange={setSeason}
            options={[{ key: "all", label: "All seasons" }, ...SEASONS.map((s) => ({ key: s, label: s }))]}
          />
          <Select
            label="Notes"
            value={note}
            onChange={setNote}
            options={[{ key: "all", label: "All notes" }, ...allNotes.map((n) => ({ key: n, label: n }))]}
          />
          <Select label="Price" value={price} onChange={setPrice} options={PRICES} />
          <div className="ml-auto flex items-center gap-5 pb-2">
            <span className="text-[0.66rem] uppercase tracking-[0.24em] text-muted">
              {results.length} {results.length === 1 ? "scent" : "scents"}
            </span>
            {filtered && (
              <button onClick={reset} data-interactive className="text-[0.66rem] uppercase tracking-[0.24em] text-gold transition-opacity hover:opacity-70">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* grid */}
        {results.length === 0 ? (
          <p className="py-[12vh] text-center text-muted">No scent matches that combination — try fewer filters.</p>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8 lg:grid-cols-3">
            {results.map((f) => (
              <Link
                key={f.id}
                href={withBase(`/fragrance/${f.id}/`)}
                data-interactive
                className="group block"
                style={{ ["--c" as string]: f.palette.accent }}
              >
                <div
                  className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[2px] border border-line transition-all duration-500 group-hover:-translate-y-1.5"
                  style={{ background: "rgba(18,18,20,0.5)" }}
                >
                  {/* accent glow, intensifies on hover */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-70"
                    style={{ background: "radial-gradient(70% 60% at 50% 45%, var(--c), transparent 70%)" }}
                  />
                  {/* glow ring on hover */}
                  <div
                    aria-hidden
                    className="absolute inset-3 rounded-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ boxShadow: "inset 0 0 0 1px var(--c)" }}
                  />
                  <SvgFlacon
                    palette={f.palette}
                    name={f.name}
                    className="relative h-[70%] w-auto transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-bone">{f.name}</p>
                    <p className="mt-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">{f.family}</p>
                  </div>
                  <p className="font-display text-lg text-bone">
                    {f.currency}
                    {f.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
