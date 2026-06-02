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
import { Gallery } from "./Gallery";
import { GalleryCamera } from "./GalleryCamera";

function Effects({ tier, integrated }: { tier: QualityTier; integrated: boolean }) {
  const bloom = tier !== "safe" && !integrated;
  const passes = [<SMAA key="smaa" />];
  if (bloom) {
    passes.push(
      <Bloom key="bloom" mipmapBlur intensity={0.26} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
    );
  }
  passes.push(<Vignette key="vignette" offset={0.3} darkness={0.5} />);
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
      camera={{ position: [0, 1.6, 4.9], fov: 42, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ gl, scene }) => {
        const renderer = readGpuRenderer(gl.getContext());
        integrated.current = isIntegratedGpu(renderer);
        if (!forced.current) {
          const t = tierFromGpu(renderer);
          if (t) setTier(t);
        }
        gl.toneMappingExposure = 0.82;
        gl.setPixelRatio(clampDpr(useScene.getState().tier, integrated.current));
        scene.background = new THREE.Color("#efe7d8");
        setReady(true);
      }}
    >
      <color attach="background" args={["#efe7d8"]} />
      <fog attach="fog" args={["#efe7d8", 12, 60]} />

      <PerformanceMonitor flipflops={4} onDecline={stepDown} />

      <Suspense fallback={null}>
        <StudioEnvironment tier={tier} />
        <Gallery tier={tier} />
      </Suspense>

      <GalleryCamera />
      <Effects tier={tier} integrated={integrated.current} />
    </Canvas>
  );
}
