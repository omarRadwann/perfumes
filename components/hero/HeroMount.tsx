"use client";

import { StaticHero } from "./StaticHero";

// Gate for the hero background. Phase 0 renders the static luminous void; Phase 1
// adds the device-tiered, ssr:false WebGL bottle canvas branch (reduced-motion /
// low-tier / context-lost always fall back to <StaticHero />).
export function HeroMount() {
  return <StaticHero />;
}
