"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";

const N = FRAGRANCES.length;

// Soft vertical gradient so the beam reads as a god-ray, not a flat cone.
function makeShaftTex() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "rgba(255,255,255,0.7)");
  g.addColorStop(0.5, "rgba(255,255,255,0.16)");
  g.addColorStop(1.0, "rgba(255,255,255,0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

// Radial fade (opaque centre → transparent rim) so floor + glow melt into black.
function makeRadial(inner: number) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(128, 128, inner, 128, 128, 128);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,0.6)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

// Each scent's *set*: a dark stone plinth, a glossy floor that grounds the flacon,
// a soft pool of the scent's light, and a god-ray. Dramatic glows fade by proximity
// so only the focal world is lit — transitions stay clean instead of cluttered.
export function WorldSet({ i }: { i: number }) {
  const p = FRAGRANCES[i].palette;
  const shaftTex = useMemo(makeShaftTex, []);
  const floorFade = useMemo(() => makeRadial(8), []);
  const glowFade = useMemo(() => makeRadial(2), []);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const orb = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const s = useScene.getState().scroll;
    const fidx = Math.max(0, Math.min(N - 1, s * (N - 1)));
    const prox = Math.max(0, 1 - Math.abs(fidx - i) / 1.15); // 1 focal → 0 by ~1 world away
    const e = prox * prox;
    if (beam.current) beam.current.opacity = 0.015 + e * 0.075;
    if (glow.current) glow.current.opacity = 0.03 + e * 0.16;
    if (orb.current) {
      orb.current.scale.setScalar(0.45 + e * 0.85);
      (orb.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + e * 0.75;
    }
  });

  return (
    <group>
      {/* glossy dark floor — fades to black at the rim */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.965, 0]}>
        <circleGeometry args={[5.5, 72]} />
        <meshStandardMaterial color="#08080b" metalness={0.8} roughness={0.36} envMapIntensity={1.15} alphaMap={floorFade ?? undefined} transparent depthWrite={false} />
      </mesh>

      {/* soft pool of the scent's own light on the wet floor under the flacon */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.945, 0]}>
        <circleGeometry args={[2.6, 56]} />
        <meshBasicMaterial ref={glow} color={p.liquid} alphaMap={glowFade ?? undefined} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* dark stone plinth with a thin metal capstone */}
      <mesh position={[0, -0.76, 0]}>
        <boxGeometry args={[1.25, 0.42, 0.86]} />
        <meshStandardMaterial color="#17171c" metalness={0.4} roughness={0.5} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[1.32, 0.045, 0.92]} />
        <meshStandardMaterial color={p.cap} metalness={0.85} roughness={0.3} envMapIntensity={1.2} />
      </mesh>

      {/* the overhead light source — the Bloom pass haloes this small orb */}
      <mesh ref={orb} position={[0, 2.75, -1.0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color={p.light} transparent toneMapped={false} />
      </mesh>
      {/* a thin faint god-ray falling from it */}
      <mesh position={[0, 2.7, -0.95]}>
        <coneGeometry args={[0.5, 5.0, 40, 1, true]} />
        <meshBasicMaterial ref={beam} color={p.light} alphaMap={shaftTex ?? undefined} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.FrontSide} toneMapped={false} />
      </mesh>
    </group>
  );
}
