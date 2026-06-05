"use client";

import { HeroMount } from "@/components/hero/HeroMount";

// Full-viewport hero. The 3D bottle (or its static fallback) lives in <HeroMount> as
// the background layer; this DOM copy is overlaid above it.
export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
      {/* background layer — the one WebGL canvas (device-tiered) or a static void */}
      <div className="absolute inset-0 z-0">
        <HeroMount />
      </div>

      {/* faint vignette to seat the copy over the canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "radial-gradient(120% 100% at 50% 50%, transparent 40%, rgba(10,10,11,0.55) 100%)" }}
      />

      {/* overlay copy */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="eyebrow reveal" style={{ animationDelay: "0.15s" }}>
          ÉTHEREAL
        </p>
        <h1
          className="reveal mt-6 font-display font-light leading-[0.92] tracking-[-0.02em] text-bone"
          style={{ fontSize: "var(--fs-hero)", animationDelay: "0.3s" }}
        >
          Awaken the Senses
        </h1>
        <p
          className="reveal mt-7 max-w-md font-display text-2xl italic leading-snug text-muted md:text-[1.6rem]"
          style={{ animationDelay: "0.5s" }}
        >
          Scent, made visible.
        </p>
        <div className="reveal mt-11" style={{ animationDelay: "0.7s" }}>
          <a href="#library" className="btn-ghost" data-interactive>
            Discover
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
        <span className="scroll-cue" />
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted">Scroll</span>
      </div>
    </section>
  );
}
