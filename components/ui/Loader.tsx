"use client";

import { useEffect, useState } from "react";
import { useScene } from "@/lib/store";
import { withBase } from "@/lib/basePath";

// Full-screen veil over the scene boot. Fades once the renderer signals ready.
export function Loader() {
  const ready = useScene((s) => s.ready);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [ready]);

  if (gone) return null;

  return (
    <div className={`loader ${ready ? "loader-out" : ""}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase("/img/crest.png")} alt="" className="loader-crest" />
      <div className="eyebrow mt-7">Maison de Parfum</div>
      <div className="font-display gold-shimmer mt-1 text-5xl tracking-[0.18em]">NOCTÉ</div>
      <div className="loader-bar">
        <span />
      </div>
    </div>
  );
}
