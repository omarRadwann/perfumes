"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, ContactShadows } from "@react-three/drei";
import { FRAGRANCES } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import Bottle from "./Bottle";

const SLOT = 1.66;
export const slotX = (i: number) => (i - (FRAGRANCES.length - 1) / 2) * SLOT;

// The physical "set": a polished onyx floor (true planar reflection on high tier,
// glossy env-reflection + contact shadow otherwise), the five flacons in a row,
// and a warm spotlight that slides to whichever bottle is hovered.
export function Shelf({ tier }: { tier: QualityTier }) {
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const spotX = useRef(0);
  const spotI = useRef(0);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0015, dt);
    const { hoveredId, selectedId } = useScene.getState();
    const activeId = selectedId ?? hoveredId;
    const idx = activeId ? FRAGRANCES.findIndex((f) => f.id === activeId) : -1;
    const targetX = idx >= 0 ? slotX(idx) : 0;
    const targetI = idx >= 0 ? 90 : 0;
    spotX.current += (targetX - spotX.current) * k;
    spotI.current += (targetI - spotI.current) * k;
    if (spot.current) {
      spot.current.position.set(spotX.current, 6.2, 3);
      spot.current.intensity = spotI.current;
      target.position.set(spotX.current, 0.6, 0);
      target.updateMatrixWorld();
    }
  });

  return (
    <group>
      {/* ambient + gentle fills (the env map does most of the lighting) */}
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#3a2f22", "#050403", 0.4]} />
      <directionalLight position={[-6, 7, 4]} intensity={0.5} color="#cdba8f" />
      {/* warm frontal fill so the flacon faces aren't lost to shadow */}
      <directionalLight position={[0, 3, 9]} intensity={0.5} color="#f0d8b0" />

      {/* hover/selection follow spot */}
      <primitive object={target} />
      <spotLight
        ref={spot}
        angle={0.42}
        penumbra={1}
        distance={20}
        color="#ffd9a0"
        intensity={0}
        target={target}
      />

      {/* bottles */}
      {FRAGRANCES.map((f, i) => (
        <Bottle key={f.id} fragrance={f} position={[slotX(i), 0.001, 0]} tier={tier} />
      ))}

      {/* polished onyx floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            resolution={1024}
            mixBlur={1}
            mixStrength={3}
            blur={[260, 70]}
            roughness={0.45}
            depthScale={1}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.2}
            color="#0a0807"
            metalness={0.6}
            mirror={0.55}
          />
        ) : (
          <meshStandardMaterial color="#0a0807" roughness={0.28} metalness={0.7} envMapIntensity={0.9} />
        )}
      </mesh>

      {/* soft contact grounding on the non-mirror tiers */}
      {tier !== "high" && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={18}
          blur={2.6}
          far={3.2}
          resolution={tier === "safe" ? 256 : 512}
          color="#000000"
        />
      )}
    </group>
  );
}
