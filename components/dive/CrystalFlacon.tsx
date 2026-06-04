"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";
import type { QualityTier } from "@/lib/deviceTier";

// A self-authored crystal flacon (real refractive glass + coloured juice + faceted
// metal cap + engraved label), one per scent. Far cleaner than the baked GLBs.
export function CrystalFlacon({ i, tier }: { i: number; tier: QualityTier }) {
  const f = FRAGRANCES[i];
  const p = f.palette;
  const active = useScene((s) => s.active === i);
  const transmissive = tier !== "safe";

  const labelTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 420;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, 320, 420);
    ctx.strokeStyle = "#b1894e";
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, 284, 384);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, 264, 364);
    ctx.textAlign = "center";
    ctx.fillStyle = "#26221c";
    ctx.font = "600 46px Georgia, 'Times New Roman', serif";
    ctx.fillText("NOCTÉ", 160, 120);
    ctx.fillStyle = "#b1894e";
    ctx.fillRect(115, 142, 90, 2);
    ctx.fillStyle = "#3a342b";
    ctx.font = "italic 27px Georgia, serif";
    ctx.fillText(f.name, 160, 205);
    ctx.fillStyle = "#8a7a55";
    ctx.font = "14px Georgia, serif";
    ctx.fillText("EXTRAIT DE PARFUM", 160, 318);
    ctx.fillText("100 ML · PARIS", 160, 348);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [f.name]);

  // Refractive crystal that lets the emissive juice glow through (so every scent
  // reads as its own colour). The focal flacon gets crisper glass + clearcoat.
  // (MeshTransmissionMaterial was dropped — against the nocturnal void it refracts
  // only darkness and washes the juice colour to black.)
  const glass = transmissive ? (
    <meshPhysicalMaterial
      transmission={1}
      thickness={active ? 0.5 : 0.4}
      roughness={active ? 0.04 : 0.09}
      ior={1.49}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={active ? 0.06 : 0.12}
      color={"#ffffff"}
      attenuationColor={p.liquid}
      attenuationDistance={4}
      envMapIntensity={active ? 1.85 : 1.4}
      specularIntensity={1}
    />
  ) : (
    <meshPhysicalMaterial transparent opacity={0.45} roughness={0.12} ior={1.45} color={"#f3efe7"} envMapIntensity={1.4} />
  );

  return (
    <group>
      {/* crystal body */}
      <RoundedBox args={[0.66, 1.0, 0.4]} radius={0.05} smoothness={5} position={[0, 0.5, 0]} castShadow>
        {glass}
      </RoundedBox>
      {/* the juice — fills the bottle so each scent reads as its own colour */}
      <RoundedBox args={[0.58, 0.86, 0.34]} radius={0.04} smoothness={4} position={[0, 0.46, 0]}>
        <meshStandardMaterial color={p.liquid} emissive={p.liquid} emissiveIntensity={active ? 0.5 : 0.28} roughness={0.22} metalness={0} />
      </RoundedBox>
      {/* engraved label — kept legible so each flacon is recognisably branded */}
      {labelTex && (
        <mesh position={[0, 0.52, 0.208]}>
          <planeGeometry args={[0.46, 0.6]} />
          <meshStandardMaterial map={labelTex} roughness={0.5} metalness={0.05} emissiveMap={labelTex} emissive={"#ffffff"} emissiveIntensity={active ? 0.45 : 0.22} />
        </mesh>
      )}
      {/* gold/silver collar + faceted stopper */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.26]} />
        <meshStandardMaterial color={p.cap} metalness={0.95} roughness={0.18} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 32]} />
        <meshStandardMaterial color={p.cap} metalness={0.95} roughness={0.18} envMapIntensity={1.4} />
      </mesh>
      <RoundedBox args={[0.34, 0.26, 0.24]} radius={0.04} smoothness={5} position={[0, 1.26, 0]} castShadow>
        <meshStandardMaterial color={p.cap} metalness={0.96} roughness={0.13} envMapIntensity={1.6} />
      </RoundedBox>
    </group>
  );
}
