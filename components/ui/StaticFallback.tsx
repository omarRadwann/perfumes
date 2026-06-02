"use client";

import { useEffect } from "react";
import { withBase } from "@/lib/basePath";
import { useScene } from "@/lib/store";

// Shown instead of the WebGL gallery for reduced-motion / very small phones: a
// still of the bright boutique with a soft scrim so the (dark ink) scroll-overlay
// copy stays readable on top. The scroll-driven info still cycles the 6 scents.
export function StaticFallback() {
  const setReady = useScene((s) => s.setReady);
  useEffect(() => {
    setReady(true);
  }, [setReady]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-cream">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase("/img/hero.jpg")}
        alt="Maison Nocté — the boutique"
        className="kenburns h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-cream/55" />
    </div>
  );
}
