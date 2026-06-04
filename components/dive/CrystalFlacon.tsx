"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";
import { withBase } from "@/lib/basePath";
import type { QualityTier } from "@/lib/deviceTier";

// A crafted extrait flacon modelled in code (scripts/model_flacon.py → a superellipse
// sweep: rounded-rectangular body → tapered glass shoulder → round neck → turned metal
// collar → faceted cap). One mesh set, reused across all six scents; the glass refracts
// the colour-filled juice and the metal takes each scent's gold/silver.
const MODEL = withBase("/models/flacon.glb");

export function CrystalFlacon({ i, tier }: { i: number; tier: QualityTier }) {
  const f = FRAGRANCES[i];
  const p = f.palette;
  const active = useScene((s) => s.active === i);
  // Only the focal flacon + its neighbours refract (glass transmission re-renders the
  // whole scene per bottle — the iGPU crash vector). Distant bottles drop to transmission 0.
  // Same material element throughout (only a uniform flips) so React never swaps it.
  const near = useScene((s) => Math.abs(s.active - i) <= 1);
  const transmissive = tier !== "safe";
  const { nodes } = useGLTF(MODEL) as unknown as { nodes: Record<string, THREE.Mesh> };

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

  // Refractive crystal that lets the emissive juice glow through; focal flacon crisper.
  const glass = transmissive ? (
    <meshPhysicalMaterial
      transmission={near ? 1 : 0}
      thickness={active ? 0.5 : 0.4}
      roughness={near ? (active ? 0.04 : 0.09) : 0.16}
      ior={1.49}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={active ? 0.06 : 0.12}
      color={near ? "#ffffff" : "#d8cba6"}
      attenuationColor={p.liquid}
      attenuationDistance={4}
      envMapIntensity={active ? 1.85 : 1.4}
      specularIntensity={1}
    />
  ) : (
    <meshPhysicalMaterial transparent opacity={0.46} roughness={0.12} ior={1.45} color={"#f3efe7"} envMapIntensity={1.4} />
  );

  return (
    <group>
      {/* the juice — coloured + luminous so each scent reads as itself */}
      <mesh geometry={nodes.juice.geometry}>
        <meshStandardMaterial color={p.liquid} emissive={p.liquid} emissiveIntensity={active ? 0.5 : 0.28} roughness={0.22} metalness={0} />
      </mesh>
      {/* engraved paper label on the body's flat face */}
      {labelTex && (
        <mesh position={[0, 0.4, 0.206]}>
          <planeGeometry args={[0.42, 0.52]} />
          <meshStandardMaterial map={labelTex} roughness={0.5} metalness={0.05} emissiveMap={labelTex} emissive={"#ffffff"} emissiveIntensity={active ? 0.45 : 0.22} />
        </mesh>
      )}
      {/* turned metal collar — kept legibly gold against the dark void */}
      <mesh geometry={nodes.collar.geometry}>
        <meshStandardMaterial color={p.cap} metalness={0.8} roughness={0.22} envMapIntensity={2.2} emissive={p.cap} emissiveIntensity={0.12} />
      </mesh>
      {/* faceted metal cap */}
      <mesh geometry={nodes.cap.geometry} castShadow>
        <meshStandardMaterial color={p.cap} metalness={0.82} roughness={0.18} envMapIntensity={2.4} emissive={p.cap} emissiveIntensity={0.14} />
      </mesh>
      {/* crystal body last (transmissive draws over the juice) */}
      <mesh geometry={nodes.glass.geometry} castShadow>
        {glass}
      </mesh>
    </group>
  );
}

useGLTF.preload(MODEL);
