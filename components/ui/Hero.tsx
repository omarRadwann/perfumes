"use client";

import { useScene } from "@/lib/store";

// The hero overlay sits above the live shelf (the canvas shows through). It's
// pointer-events-none so hover/click fall through to the 3D flacons; only the copy
// frames the top and bottom, leaving the centre stage to the glass. Fades away when
// a flacon is selected (detail view).
export function Hero() {
  const hidden = useScene((s) => s.selectedId !== null);

  return (
    <section
      id="top"
      className="pointer-events-none relative z-10 h-[100svh]"
      style={{
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.6s var(--ease-luxe)",
      }}
    >
      <div className="absolute inset-x-0 top-[15%] px-6 text-center">
        <p className="eyebrow reveal-in">Parfums de Nuit · Est. MMXXV</p>
        <h1 className="reveal mt-4 font-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] text-bone">
          Composed for the
          <br />
          <em className="gold-shimmer">hours after dark</em>
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-5 px-6 text-center">
        <p
          className="reveal max-w-md text-sm leading-relaxed text-bone-dim"
          style={{ animationDelay: "0.35s" }}
        >
          Five extrait de parfum compositions, each a vial of night. Hover to lift a
          flacon — select one to enter its world.
        </p>
        <div className="scroll-cue reveal" style={{ animationDelay: "0.55s" }} />
      </div>
    </section>
  );
}
