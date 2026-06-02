"use client";

import * as THREE from "three";
import Product from "./Product";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";

// One station of the gallery: a marble plinth, the product (carton + flacon), and
// a framed niche behind it that glows in the scent's own accent — giving each
// alcove "its own world" without a per-alcove light (the glow is emissive).
interface Props {
  fragrance: Fragrance;
  index: number;
  z: number;
  active: boolean;
  tier: QualityTier;
  marble?: THREE.Texture | null;
}

export function Alcove({ fragrance, index, z, active, tier, marble }: Props) {
  const p = fragrance.palette;
  return (
    <group position={[0, 0, z]}>
      {/* framed niche backdrop, gold frame + accent-glowing panel */}
      <mesh position={[0, 2.0, -1.7]}>
        <boxGeometry args={[3.0, 3.9, 0.12]} />
        <meshStandardMaterial color={p.accent} metalness={0.85} roughness={0.3} emissive={p.accent} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 2.0, -1.6]}>
        <boxGeometry args={[2.7, 3.6, 0.14]} />
        <meshStandardMaterial
          color={"#efe7d8"}
          roughness={0.85}
          metalness={0}
          emissive={p.accent}
          emissiveIntensity={active ? 0.22 : 0.12}
        />
      </mesh>

      {/* marble plinth */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 1.1, 48]} />
        <meshStandardMaterial map={marble ?? undefined} color={marble ? "#ffffff" : "#e9e0cf"} roughness={0.35} metalness={0.15} envMapIntensity={0.6} />
      </mesh>
      {/* thin gold inlay line on the plinth top edge */}
      <mesh position={[0, 1.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.62, 48]} />
        <meshStandardMaterial color={"#c9a96a"} metalness={0.9} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* the product, on the plinth top (y = 1.1) */}
      <group position={[0, 1.1, 0]}>
        <Product fragrance={fragrance} index={index} active={active} tier={tier} />
      </group>
    </group>
  );
}
