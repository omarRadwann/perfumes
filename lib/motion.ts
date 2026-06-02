// Shared motion helpers for the GSAP-driven choreography.
import gsap from "gsap";

// Disable GSAP lag-smoothing: it clamps the huge frame-deltas of a throttled /
// backgrounded tab, which makes time-based tweens crawl. With it off, tweens use
// real elapsed time and simply catch up when the tab regains focus.
if (typeof window !== "undefined") {
  gsap.ticker.lagSmoothing(0);
}

/** Honour the user's OS "reduce motion" setting (skip bursts/float/heavy eases). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** GSAP ease strings used across the experience. */
export const EASE = {
  out: "power3.out",
  inOut: "power3.inOut",
  soft: "power2.out",
  back: "back.out(1.5)",
} as const;
