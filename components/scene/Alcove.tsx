"use client";

import * as THREE from "three";
import Product from "./Product";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";

// One arched room: a curved cream apse (concave scooped niche) cradling a single hero
// flacon on a soft cream-stone plinth, with a warm glow pooling in the recess.
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
  const p = fragrance.palette;
  const stone = (
    <meshStandardMaterial map={plinthTex ?? undefined} color={STONE} roughness={0.6} metalness={0.04} envMapIntensity={0.4} />
  );
  return (
    <group position={[0, 0, z]}>
      {/* curved cream apse — a concave scooped niche behind the flacon */}
      <mesh position={[0, 2.6, -1.9]}>
        <cylinderGeometry args={[2.7, 2.7, 5.2, 48, 1, true, Math.PI * 0.5, Math.PI]} />
        <meshStandardMaterial color="#efe7d7" roughness={0.95} metalness={0} side={THREE.BackSide} envMapIntensity={0.4} />
      </mesh>
      {/* soft warm glow pooling in the recess (backlights the flacon) */}
      {tier !== "safe" && (
        <pointLight position={[0, 2.6, -1.5]} intensity={active ? 1.5 : 0.8} distance={6} decay={2} color={p.light} />
      )}

      {/* cream-stone plinth banded with thin gold reveals */}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.92, 1.0, 0.18, 56]} />
        {stone}
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.86, 0.88, 0.04, 56]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.3} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.64, 0.72, 0.8, 56]} />
        {stone}
      </mesh>
      <mesh position={[0, 1.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.66, 0.06, 56]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.28} envMapIntensity={1.0} />
      </mesh>

      {/* the single hero flacon */}
      <group position={[0, 1.1, 0]}>
        <Product fragrance={fragrance} index={index} active={active} tier={tier} />
      </group>
    </group>
  );
}
