"use client";

import { Sparkles } from "@react-three/drei";
import { useScene } from "@/lib/store";
import { getFragrance, FRAGRANCES } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";

// Drifting mist around the flacon, tinted to the active scent's accent. Count scales
// by tier; omitted entirely on `safe`. Requires frameloop="always".
export function Mist({ tier }: { tier: QualityTier }) {
  const activeId = useScene((s) => s.activeScentId);
  const f = getFragrance(activeId) ?? FRAGRANCES[0];
  const count = tier === "high" ? 60 : 34;
  return (
    <Sparkles
      count={count}
      scale={[7, 8, 4]}
      position={[0, 0.6, 0]}
      size={tier === "high" ? 2.2 : 1.8}
      speed={0.18}
      opacity={0.5}
      color={f.palette.accent}
      noise={1.4}
    />
  );
}
