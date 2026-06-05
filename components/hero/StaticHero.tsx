"use client";

import { useEffect } from "react";
import { useScene } from "@/lib/store";

// Pure-CSS "luminous void": a god-ray, a vertical light shaft, and a central core of
// light where the flacon sits. No WebGL — this is what reduced-motion / low-tier /
// context-lost users see, and it must stand on its own.
export function StaticHero() {
  const setReady = useScene((s) => s.setReady);
  useEffect(() => {
    setReady(true);
  }, [setReady]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-ink">
      {/* god-ray from the upper-left */}
      <div
        className="absolute inset-0"
        style={{ background: "conic-gradient(from 200deg at 24% 4%, rgba(232,214,160,0.12), transparent 18%)" }}
      />
      {/* warm depth rising from below */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 116%, rgba(208,138,44,0.10), transparent 55%)" }}
      />
      {/* central luminous core — the negative space the bottle occupies */}
      <div
        className="absolute left-1/2 top-1/2 h-[62vmin] w-[34vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(200,162,74,0.20), rgba(200,162,74,0.05) 55%, transparent 72%)",
          filter: "blur(12px)",
        }}
      />
      {/* thin vertical light shaft */}
      <div
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
        style={{ background: "linear-gradient(transparent, rgba(232,214,160,0.18) 35%, rgba(232,214,160,0.18) 60%, transparent)" }}
      />
      {/* settle vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 42%, transparent 48%, rgba(10,10,11,0.55) 100%)" }}
      />
    </div>
  );
}
