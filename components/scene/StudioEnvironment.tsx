"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { QualityTier } from "@/lib/deviceTier";

// Bright, warm gallery lighting built from in-scene lightformers (no remote HDRI
// → site stays static). Cream surround + soft overhead + warm/cool side fills +
// a vertical streak so the glass bottles catch a clean highlight.
export function StudioEnvironment({ tier }: { tier: QualityTier }) {
  const resolution = tier === "high" ? 512 : tier === "standard" ? 256 : 128;
  return (
    <Environment resolution={resolution} frames={1}>
      <color attach="background" args={["#e7dcc8"]} />
      <Lightformer form="rect" intensity={0.55} color="#fff7ea" scale={[24, 12, 1]} position={[0, 12, 2]} rotation={[-Math.PI / 2, 0, 0]} />
      <Lightformer form="rect" intensity={0.4} color="#fff0db" scale={[12, 9, 1]} position={[9, 4, 5]} rotation={[0, -Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={0.32} color="#f1ecff" scale={[12, 9, 1]} position={[-9, 4, 5]} rotation={[0, Math.PI / 3, 0]} />
      <Lightformer form="rect" intensity={0.6} color="#ffffff" scale={[0.5, 7, 1]} position={[0, 5, 9]} />
      <Lightformer form="rect" intensity={0.3} color="#fbe9c8" scale={[10, 10, 1]} position={[0, 1, -10]} />
    </Environment>
  );
}
