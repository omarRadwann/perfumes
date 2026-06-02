"use client";

import { useEffect } from "react";
import { withBase } from "@/lib/basePath";
import { useScene } from "@/lib/store";

// Shown instead of the WebGL canvas for prefers-reduced-motion and very small
// phones: a still of the collection with a slow Ken-Burns drift. The DOM hero copy
// and all sections still render over/after it, so the page stays complete.
export function StaticFallback() {
  const setReady = useScene((s) => s.setReady);
  useEffect(() => {
    setReady(true);
  }, [setReady]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-noir">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={withBase("/img/hero.jpg")}
        alt="Maison Nocté — the collection of five extrait de parfum"
        className="kenburns h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/25 to-noir/50" />
    </div>
  );
}
