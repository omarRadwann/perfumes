"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { QualityTier } from "@/lib/deviceTier";

// A studio HDRI built entirely from in-scene <Lightformer>s — rendered to an env
// map locally, so there is NO remote HDRI fetch (the site stays fully static) and
// glass/metal have rich, art-directed things to reflect: a soft key from above, a
// warm gold side, a cool rim, and two bright vertical streaks that read as gallery
// strip-lights sliding across the flacons. frames={1} bakes it once (cheap).
export function StudioEnvironment({ tier }: { tier: QualityTier }) {
  const resolution = tier === "high" ? 512 : tier === "standard" ? 256 : 128;

  return (
    <Environment resolution={resolution} frames={1}>
      {/* dark surround so refraction shows deep shadow between the highlights */}
      <color attach="background" args={["#050403"]} />

      {/* key softbox — warm, from above-front */}
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#fff1d6"
        scale={[12, 7, 1]}
        position={[0, 7, 3]}
        rotation={[-Math.PI / 2.1, 0, 0]}
      />
      {/* warm gold fill from camera-right */}
      <Lightformer
        form="rect"
        intensity={1.5}
        color="#e9b878"
        scale={[7, 9, 1]}
        position={[7, 2, 3]}
        rotation={[0, -Math.PI / 3, 0]}
      />
      {/* cool rim from back-left to separate the glass edges */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#a7bce0"
        scale={[7, 9, 1]}
        position={[-8, 3, -2]}
        rotation={[0, Math.PI / 3, 0]}
      />
      {/* two bright vertical streaks — the signature gallery reflections on glass */}
      <Lightformer form="rect" intensity={3.4} color="#ffffff" scale={[0.35, 6, 1]} position={[-2.4, 4, 5]} />
      <Lightformer form="rect" intensity={3.0} color="#ffd9a0" scale={[0.3, 6, 1]} position={[2.4, 4, 5]} />
      {/* low gold bounce so bottle bases catch warmth */}
      <Lightformer form="ring" intensity={1.3} color="#caa24f" scale={[5, 5, 1]} position={[0, -3, -3]} />
    </Environment>
  );
}
