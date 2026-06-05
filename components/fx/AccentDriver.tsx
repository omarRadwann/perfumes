"use client";

import { useEffect, useRef } from "react";
import { useScene } from "@/lib/store";
import { getFragrance, FRAGRANCES } from "@/lib/fragrances";

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
};

// Lerps the global --accent CSS variable toward the active scent's accent whenever the
// Scent Library selection changes. The whole DOM (note labels, rail dots, Library glow,
// glow rings) reads var(--accent), so the site re-tints in sync with the bottle's juice.
// The loop runs only during a transition, then stops.
export function AccentDriver() {
  const activeId = useScene((s) => s.activeScentId);
  const cur = useRef(hexToRgb(FRAGRANCES[0].palette.accent));

  useEffect(() => {
    const target = hexToRgb((getFragrance(activeId) ?? FRAGRANCES[0]).palette.accent);
    let raf = 0;
    const tick = () => {
      const c = cur.current;
      c.r += (target.r - c.r) * 0.1;
      c.g += (target.g - c.g) * 0.1;
      c.b += (target.b - c.b) * 0.1;
      const settled = Math.abs(target.r - c.r) + Math.abs(target.g - c.g) + Math.abs(target.b - c.b) < 1.5;
      const r = Math.round(settled ? target.r : c.r);
      const g = Math.round(settled ? target.g : c.g);
      const b = Math.round(settled ? target.b : c.b);
      if (settled) cur.current = { r: target.r, g: target.g, b: target.b };
      document.documentElement.style.setProperty("--accent", `rgb(${r}, ${g}, ${b})`);
      if (!settled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeId]);

  return null;
}
