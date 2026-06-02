"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StaticFallback } from "./ui/StaticFallback";

// R3F must never SSR (it needs the DOM/WebGL). This client wrapper does the
// ssr:false dynamic import — Server Components cannot pass ssr:false themselves.
const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-noir" />,
});

export default function SceneMount() {
  // Decide WebGL vs. static after mount (client-only — avoids hydration mismatch).
  const [mode, setMode] = useState<"canvas" | "static" | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tinyPhone = window.matchMedia("(max-width: 480px) and (pointer: coarse)").matches;
    setMode(reduce || tinyPhone ? "static" : "canvas");
  }, []);

  // When the Canvas mounts post-layout via a dynamic import, R3F can occasionally
  // miss its first size measurement and stay at 300×150. Nudge resize events.
  useEffect(() => {
    if (mode !== "canvas") return;
    const raf = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    const t1 = setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
    const t2 = setTimeout(() => window.dispatchEvent(new Event("resize")), 800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mode]);

  if (mode === null) return <div className="h-full w-full bg-noir" />;
  if (mode === "static") return <StaticFallback />;
  return <SceneCanvas />;
}
