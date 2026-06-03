"use client";

import * as THREE from "three";
import Product from "./Product";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";

// One arched room of the journey: a soft cream-stone plinth banded in gold, with the
// product (carton + crystal flacon) on top. The arch portals (in Gallery) frame it
// and reveal the next room beyond — so no per-room backdrop is needed here.
interface Props {
  fragrance: Fragrance;
  index: number;
  z: number;
  active: boolean;
  tier: QualityTier;
  plinthTex?: THREE.Texture | null;
  archW?: number;
  archH?: number;
}

const GOLD = "#c4a163";
const STONE = "#e7ddc9";

export function Alcove({ fragrance, index, z, active, tier, plinthTex }: Props) {
  const stone = (
    <meshStandardMaterial map={plinthTex ?? undefined} color={STONE} roughness={0.55} metalness={0.04} envMapIntensity={0.4} />
  );
  return (
    <group position={[0, 0, z]}>
      {/* cream-stone plinth, banded with thin gold reveals */}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.98, 0.18, 56]} />
        {stone}
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.84, 0.86, 0.04, 56]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.3} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.84, 56]} />
        {stone}
      </mesh>
      <mesh position={[0, 1.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.64, 0.06, 56]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.28} envMapIntensity={1.0} />
      </mesh>

      {/* the product, on the plinth top */}
      <group position={[0, 1.12, 0]}>
        <Product fragrance={fragrance} index={index} active={active} tier={tier} />
      </group>
    </group>
  );
}
