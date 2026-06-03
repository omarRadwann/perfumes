"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA, DepthOfField } from "@react-three/postprocessing";
import {
  initialTier,
  readForcedTier,
  readGpuRenderer,
  tierFromGpu,
  isIntegratedGpu,
  clampDpr,
  type QualityTier,
} from "@/lib/deviceTier";
import { useScene, STATION_COUNT } from "@/lib/store";
import { StudioEnvironment } from "./StudioEnvironment";
import { Gallery, STATION_GAP } from "./Gallery";
import { GalleryCamera } from "./GalleryCamera";

function Effects({ tier, integrated }: { tier: QualityTier; integrated: boolean }) {
  const bloom = tier !== "safe" && !integrated;
  const dof = tier === "high" || (tier === "standard" && !integrated);

  // Rack focus: keep the flacon the camera is approaching razor sharp while the
  // corridor softens — tracks the CONTINUOUS journey point (not the discrete index).
  const focus = useRef(new THREE.Vector3(0, 1.5, 0.4));
  useFrame((_, dt) => {
    if (!dof) return;
    const s = useScene.getState().scroll;
    const N = STATION_COUNT;
    const fidx = Math.max(0, Math.min(N - 1, s * (N - 1)));
    const fz = -fidx * STATION_GAP + 0.4; // flacon sits a touch in front of plinth centre
    const k = 1 - Math.pow(0.002, dt);
    focus.current.z += (fz - focus.current.z) * k;
  });

  const passes = [<SMAA key="smaa" />];
  if (bloom) {
    passes.push(
      <Bloom key="bloom" mipmapBlur intensity={0.15} luminanceThreshold={0.9} luminanceSmoothing={0.3} />
    );
  }
  if (dof) {
    passes.push(
      <DepthOfField key="dof" target={focus.current} focalLength={0.022} bokehScale={1.3} height={480} />
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
      shadows={{ type: THREE.PCFShadowMap }}
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
        gl.toneMappingExposure = 0.6;
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
