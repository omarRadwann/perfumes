"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StaticHero } from "./StaticHero";
import { prefersReducedMotion } from "@/lib/motion";

// The WebGL canvas is dynamically imported with ssr:false — three.js must not run
// during static prerender, and the chunk should not weigh down first paint.
const HeroCanvas = dynamic(() => import("./HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
  loading: () => <StaticHero />,
});

// Gate: reduced-motion or a small touch device → the WebGL-free void. Everything else
// gets the (device-tiered, crash-guarded) canvas, which itself degrades to an opaque
// bottle on `safe` hardware and to <StaticHero/> on context loss.
export function HeroMount() {
  const [mode, setMode] = useState<"static" | "canvas" | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMode("static");
      return;
    }
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = Math.min(window.innerWidth, window.innerHeight) <= 540;
    setMode(coarse && small ? "static" : "canvas");
  }, []);

  // SSR + first client paint: the static void (also the loader for the canvas chunk).
  if (mode !== "canvas") return <StaticHero />;
  return <HeroCanvas />;
}
