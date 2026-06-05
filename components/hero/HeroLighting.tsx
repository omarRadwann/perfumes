"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { QualityTier } from "@/lib/deviceTier";

// Dark-void product lighting from in-scene lightformers (no remote HDRI → static
// export stays self-contained). A warm key + cool rim separate the glass from the
// void; tall narrow softbox streaks give the vertical highlight that reads as
// expensive product photography rather than plain shiny.
export function HeroLighting({ tier }: { tier: QualityTier }) {
  const res = tier === "high" ? 512 : tier === "standard" ? 256 : 128;
  return (
    <>
      <ambientLight intensity={0.08} />
      {/* warm key, upper-left */}
      <spotLight position={[-4.5, 5, 4]} angle={0.5} penumbra={1} intensity={26} distance={22} color="#fff3df" />
      {/* cool rim, behind — separates the bottle from the void */}
      <pointLight position={[3, 1.2, -3.5]} intensity={4} distance={14} decay={2} color="#cfe0ff" />

      <Environment resolution={res} frames={1}>
        <Lightformer form="rect" intensity={0.7} color="#fff3df" scale={[10, 10, 1]} position={[0, 6, 8]} />
        <Lightformer
          form="rect"
          intensity={0.45}
          color="#9fb4ff"
          scale={[8, 8, 1]}
          position={[-8, 2, -6]}
          rotation={[0, Math.PI / 3, 0]}
        />
        {/* tall narrow softbox streaks — the vertical glass/metal highlight */}
        <Lightformer form="rect" intensity={2.2} color="#ffffff" scale={[0.5, 6, 1]} position={[2.6, 1.4, 4.2]} />
        <Lightformer form="rect" intensity={1.2} color="#ffe7c6" scale={[0.35, 5, 1]} position={[-2.8, 1, 3.4]} />
      </Environment>
    </>
  );
}
