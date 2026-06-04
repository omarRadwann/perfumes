"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { EditorialHome } from "@/components/editorial/EditorialHome";

// WebGL must not run during SSR/static prerender → load the dive client-only.
const Dive = dynamic(() => import("./Dive").then((m) => m.Dive), { ssr: false });

// Route the immersive dive vs the editorial fallback. Reduced-motion or no-WebGL →
// the crisp editorial site ("simpler premium", never broken). ?mode=dive|flat overrides.
export default function DiveMount() {
  const [mode, setMode] = useState<"loading" | "dive" | "flat">("loading");
  useEffect(() => {
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    const forced = new URLSearchParams(location.search).get("mode");
    if (forced === "flat" || forced === "dive") setMode(forced);
    else setMode(prefersReducedMotion() || !webgl ? "flat" : "dive");
  }, []);

  if (mode === "loading") return null;
  if (mode === "flat") return <EditorialHome />;
  return <Dive />;
}
