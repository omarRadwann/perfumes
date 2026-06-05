"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA, DepthOfField } from "@react-three/postprocessing";
import { useScene } from "@/lib/store";
import {
  initialTier,
  readForcedTier,
  readGpuRenderer,
  tierFromGpu,
  isIntegratedGpu,
  clampDpr,
  type QualityTier,
} from "@/lib/deviceTier";
import { Bottle } from "./Bottle";
import { Mist } from "./Mist";
import { HeroLighting } from "./HeroLighting";
import { StaticHero, VoidBackdrop } from "./StaticHero";

// Tier-gated post-processing. high = full; standard = drop DOF; safe = none.
// Stacking the full stack on the transmission pass is the workload that crashed the
// retired "Dive" — so this MUST stay gated.
function Effects({ tier, perf }: { tier: QualityTier; perf: number }) {
  if (tier === "safe") return null;
  const dof = tier === "high" && perf < 1;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      {dof ? <DepthOfField worldFocusDistance={4.6} worldFocusRange={3.2} bokehScale={2.2} /> : <></>}
      <Bloom mipmapBlur intensity={tier === "high" ? 0.6 : 0.42} luminanceThreshold={0.72} luminanceSmoothing={0.4} />
      <Vignette offset={0.32} darkness={0.72} />
    </EffectComposer>
  );
}

export function HeroCanvas() {
  const tier = useScene((s) => s.tier);
  const setTier = useScene((s) => s.setTier);
  const setReady = useScene((s) => s.setReady);
  const forced = useRef<QualityTier | null>(null);
  const integrated = useRef(false);
  // adaptive quality: 0 full · 1 drop DoF · 2 drop DoF + mist
  const [perf, setPerf] = useState(0);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const [lost, setLost] = useState(false);

  useEffect(() => {
    forced.current = readForcedTier();
    setTier(forced.current ?? initialTier());
  }, [setTier]);

  // Pause the render loop when the tab is hidden (no GPU work in the background).
  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Dev-only: a frame-pause hook so a continuously-rendering canvas can be captured
  // for verification (a screenshotter can't get a stable frame from frameloop="always").
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __heroFrameloop?: (v: "always" | "never") => void };
    w.__heroFrameloop = (v) => setFrameloop(v);
    return () => {
      delete w.__heroFrameloop;
    };
  }, []);

  // GPU context died → the crisp CSS void instead of a black canvas.
  if (lost) return <StaticHero />;

  return (
    <div className="absolute inset-0">
      <VoidBackdrop />
      <Canvas
        className="!absolute inset-0"
        frameloop={frameloop}
        dpr={clampDpr(tier, integrated.current)}
        camera={{ position: [0, 0.15, 5.1], fov: 33, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          const r = readGpuRenderer(gl.getContext());
          integrated.current = isIntegratedGpu(r);
          if (!forced.current) {
            const t = tierFromGpu(r);
            if (t) setTier(t);
          }
          gl.toneMappingExposure = 0.92;
          gl.setPixelRatio(clampDpr(useScene.getState().tier, integrated.current));
          // Transmission renders the scene to an offscreen buffer each frame; half-res
          // keeps the refraction convincing at a fraction of the iGPU fill cost.
          const grm = gl as unknown as { transmissionResolutionScale?: number };
          if ("transmissionResolutionScale" in gl) {
            grm.transmissionResolutionScale = useScene.getState().tier === "high" ? 0.5 : 0.34;
          }
          gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              setLost(true);
            },
            { once: true }
          );
          setReady(true);
        }}
      >
        <PerformanceMonitor
          onDecline={() => setPerf((p) => Math.min(2, p + 1))}
          onIncline={() => setPerf((p) => Math.max(0, p - 1))}
        >
          <AdaptiveDpr pixelated={false} />
        </PerformanceMonitor>

        <Suspense fallback={null}>
          <HeroLighting tier={tier} />
          <Bottle tier={tier} />
          {tier !== "safe" && perf < 2 && <Mist tier={tier} />}
        </Suspense>

        <Effects tier={tier} perf={perf} />
      </Canvas>
    </div>
  );
}
