"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import {
  initialTier,
  readForcedTier,
  readGpuRenderer,
  tierFromGpu,
  isIntegratedGpu,
  clampDpr,
  type QualityTier,
} from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { StudioEnvironment } from "./StudioEnvironment";
import { Shelf } from "./Shelf";
import { CameraRig } from "./CameraRig";

function Effects({ tier, integrated }: { tier: QualityTier; integrated: boolean }) {
  const bloom = tier !== "safe" && !integrated;
  // Build the pass list as an array so conditional inclusion typechecks (a
  // `false` child is not assignable to EffectComposer's element children).
  const passes = [<SMAA key="smaa" />];
  if (bloom) {
    passes.push(
      <Bloom key="bloom" mipmapBlur intensity={0.72} luminanceThreshold={0.62} luminanceSmoothing={0.3} />
    );
  }
  passes.push(<Vignette key="vignette" offset={0.26} darkness={0.82} />);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {passes}
    </EffectComposer>
  );
}

export default function SceneCanvas() {
  const tier = useScene((s) => s.tier);
  const setTier = useScene((s) => s.setTier);
  const setReady = useScene((s) => s.setReady);
  const forced = useRef<QualityTier | null>(null);
  const integrated = useRef(false);

  // Boot tier from synchronous signals (refined by the GPU read in onCreated).
  useEffect(() => {
    forced.current = readForcedTier();
    setTier(forced.current ?? initialTier());
  }, [setTier]);

  const stepDown = () => {
    const cur = useScene.getState().tier;
    if (cur === "high") setTier("standard");
    else if (cur === "standard") setTier("safe");
  };

  return (
    <Canvas
      frameloop="always"
      dpr={clampDpr(tier, integrated.current)}
      camera={{ position: [0, 1.45, 8.9], fov: 38, near: 0.1, far: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl, scene }) => {
        const renderer = readGpuRenderer(gl.getContext());
        integrated.current = isIntegratedGpu(renderer);
        if (!forced.current) {
          const t = tierFromGpu(renderer);
          if (t) setTier(t);
        }
        gl.toneMappingExposure = 1.15;
        gl.setPixelRatio(clampDpr(useScene.getState().tier, integrated.current));
        scene.background = new THREE.Color("#0a0908");
        setReady(true);
      }}
    >
      <color attach="background" args={["#0a0908"]} />
      <fog attach="fog" args={["#0a0908", 12, 26]} />

      <PerformanceMonitor flipflops={4} onDecline={stepDown} />

      <Suspense fallback={null}>
        <StudioEnvironment tier={tier} />
        <Shelf tier={tier} />
      </Suspense>

      <CameraRig />
      <Effects tier={tier} integrated={integrated.current} />
    </Canvas>
  );
}
