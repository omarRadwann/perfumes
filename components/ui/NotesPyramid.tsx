"use client";

import { Reveal } from "@/components/fx/motion";
import type { Notes } from "@/lib/fragrances";

const TIERS = [
  { key: "top", label: "Top", w: "68%" },
  { key: "heart", label: "Heart", w: "84%" },
  { key: "base", label: "Base", w: "100%" },
] as const;

// The scent pyramid — three stacked tiers (top → heart → base) that reveal top-down
// on scroll, widening toward the base. note-k labels read var(--accent).
export function NotesPyramid({ notes }: { notes: Notes }) {
  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4" stagger={0.16} y={24}>
      {TIERS.map((t) => (
        <div
          key={t.key}
          className="rounded-[2px] border border-line px-6 py-6 text-center"
          style={{ width: t.w, background: "rgba(18,18,20,0.5)" }}
        >
          <p className="note-k">{t.label} Notes</p>
          <p className="mt-3 font-display font-light leading-snug text-bone" style={{ fontSize: "var(--fs-h3)" }}>
            {notes[t.key].join(" · ")}
          </p>
        </div>
      ))}
    </Reveal>
  );
}
