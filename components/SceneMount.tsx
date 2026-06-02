"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StaticFallback } from "./ui/StaticFallback";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-cream" />,
});

export default function SceneMount() {
  const [mode, setMode] = useState<"canvas" | "static" | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tinyPhone = window.matchMedia("(max-width: 480px) and (pointer: coarse)").matches;
    setMode(reduce || tinyPhone ? "static" : "canvas");
  }, []);

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

  if (mode === null) return <div className="h-full w-full bg-cream" />;
  if (mode === "static") return <StaticFallback />;
  return <SceneCanvas />;
}
