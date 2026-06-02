"use client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import Product from "./Product";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { prefersReducedMotion } from "@/lib/motion";

// One station of the gallery: a dark-marble plinth banded in gold, the product
// (carton + flacon), and a framed niche behind it that glows in the scent's own
// accent — giving each alcove "its own world" without a per-alcove light.
interface Props {
  fragrance: Fragrance;
  index: number;
  z: number;
  active: boolean;
  tier: QualityTier;
  plinthTex?: THREE.Texture | null;
}

const GOLD = "#c9a96a";

export function Alcove({ fragrance, index, z, active, tier, plinthTex }: Props) {
  const p = fragrance.palette;
  const panelMat = useRef<THREE.MeshStandardMaterial>(null);
  const reduce = useRef(false);
  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);
  useFrame((state, dt) => {
    const m = panelMat.current;
    if (!m) return;
    if (active && !reduce.current) {
      m.emissiveIntensity = 0.24 + Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.07; // breathing
    } else {
      const k = 1 - Math.pow(0.02, dt);
      m.emissiveIntensity += ((active ? 0.26 : 0.1) - m.emissiveIntensity) * k;
    }
  });

  const stone = (
    <meshStandardMaterial
      map={plinthTex ?? undefined}
      color={plinthTex ? "#d4cabb" : "#3a3631"}
      roughness={0.34}
      metalness={0.28}
      envMapIntensity={0.7}
    />
  );

  return (
    <group position={[0, 0, z]}>
      {/* framed niche backdrop — gold frame, inner liner, accent-glowing panel */}
      <mesh position={[0, 2.05, -1.75]}>
        <boxGeometry args={[3.1, 4.0, 0.12]} />
        <meshStandardMaterial color={GOLD} metalness={0.88} roughness={0.28} emissive={p.accent} emissiveIntensity={0.12} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[0, 2.05, -1.69]}>
        <boxGeometry args={[2.86, 3.76, 0.1]} />
        <meshStandardMaterial color={"#1b1916"} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.05, -1.64]}>
        <boxGeometry args={[2.66, 3.56, 0.12]} />
        <meshStandardMaterial
          ref={panelMat}
          color={"#efe7d8"}
          roughness={0.85}
          metalness={0}
          emissive={p.accent}
          emissiveIntensity={active ? 0.26 : 0.1}
        />
      </mesh>

      {/* dark-marble plinth, banded in gold */}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.86, 0.94, 0.18, 56]} />
        {stone}
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.8, 0.82, 0.05, 56]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.26} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.66, 0.84, 56]} />
        {stone}
      </mesh>
      <mesh position={[0, 1.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.62, 0.06, 56]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.24} envMapIntensity={1.2} />
      </mesh>

      {/* the product, on the plinth top (y = 1.12) */}
      <group position={[0, 1.12, 0]}>
        <Product fragrance={fragrance} index={index} active={active} tier={tier} />
      </group>
    </group>
  );
}
