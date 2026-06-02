"use client";

import * as THREE from "three";
import { useMemo, useRef, useEffect } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { makeLabelTexture } from "@/lib/labelTexture";

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

// Silhouette of the house flacon (radius, height), revolved into a lathe and then
// squashed front-to-back (group scale z) into an elegant oval flacon.
const BODY_PROFILE = [
  v2(0.0, 0.0),
  v2(0.6, 0.0),
  v2(0.66, 0.05),
  v2(0.67, 0.2),
  v2(0.66, 0.95),
  v2(0.62, 1.12),
  v2(0.46, 1.3),
  v2(0.26, 1.42),
  v2(0.19, 1.5),
  v2(0.185, 1.62),
  v2(0.205, 1.64),
];

const LIQUID_PROFILE = [
  v2(0.0, 0.05),
  v2(0.57, 0.05),
  v2(0.61, 0.14),
  v2(0.61, 0.98),
  v2(0.57, 1.14),
  v2(0.44, 1.27),
  v2(0.3, 1.3),
  v2(0.0, 1.3),
];

const Z_SQUASH = 0.62;
const NECK_TOP = 1.62;

function Cap({ style, color }: { style: Fragrance["capStyle"]; color: string }) {
  const mat = (
    <meshStandardMaterial color={color} metalness={0.96} roughness={0.18} envMapIntensity={1.3} />
  );
  return (
    <group>
      {/* collar */}
      <mesh position={[0, NECK_TOP + 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.215, 0.2, 0.12, 40]} />
        {mat}
      </mesh>
      {style === "sphere" && (
        <mesh position={[0, NECK_TOP + 0.26, 0]} castShadow>
          <sphereGeometry args={[0.23, 40, 32]} />
          {mat}
        </mesh>
      )}
      {style === "dome" && (
        <mesh position={[0, NECK_TOP + 0.18, 0]} scale={[1, 0.72, 1]} castShadow>
          <sphereGeometry args={[0.26, 40, 32]} />
          {mat}
        </mesh>
      )}
      {style === "facet" && (
        <mesh position={[0, NECK_TOP + 0.27, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
          <octahedronGeometry args={[0.29, 0]} />
          <meshStandardMaterial color={color} metalness={0.96} roughness={0.12} flatShading envMapIntensity={1.5} />
        </mesh>
      )}
      {style === "flat" && (
        <mesh position={[0, NECK_TOP + 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.27, 0.265, 0.24, 44]} />
          {mat}
        </mesh>
      )}
    </group>
  );
}

interface BottleProps {
  fragrance: Fragrance;
  position: [number, number, number];
  tier: QualityTier;
}

export default function Bottle({ fragrance, position, tier }: BottleProps) {
  const inner = useRef<THREE.Group>(null);
  const liquidMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const c = fragrance.colors;

  const hovered = useScene((s) => s.hoveredId === fragrance.id);
  const selected = useScene((s) => s.selectedId === fragrance.id);
  const anySelected = useScene((s) => s.selectedId !== null);
  const setHovered = useScene((s) => s.setHovered);
  const setSelected = useScene((s) => s.setSelected);

  const segments = tier === "high" ? 64 : tier === "standard" ? 40 : 28;
  const transmissive = tier !== "safe";

  const label = useMemo(() => makeLabelTexture(fragrance), [fragrance]);
  useEffect(() => () => label?.dispose(), [label]);

  // smoothed animation state
  const lift = useRef(0);
  const glow = useRef(0.13);
  const scale = useRef(1);

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    const k = 1 - Math.pow(0.001, dt); // frame-rate-independent lerp

    const liftTarget = selected ? 0.04 : hovered && !anySelected ? 0.16 : 0;
    const spin = selected ? 0.55 : hovered && !anySelected ? 0.5 : 0.07;
    const glowTarget = selected ? 0.5 : hovered && !anySelected ? 0.3 : 0.13;
    const scaleTarget = hovered && !anySelected ? 1.04 : 1;

    lift.current += (liftTarget - lift.current) * k;
    glow.current += (glowTarget - glow.current) * k;
    scale.current += (scaleTarget - scale.current) * k;

    g.position.y = lift.current;
    g.rotation.y += spin * dt;
    g.scale.setScalar(scale.current);

    if (liquidMat.current) liquidMat.current.emissiveIntensity = glow.current;
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (anySelected) return;
    setHovered(fragrance.id);
    document.body.style.cursor = "none";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = "";
  };
  const onSelect = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setSelected(fragrance.id);
    setHovered(null);
  };

  return (
    <group position={position}>
      <group
        ref={inner}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onPointerDown={onSelect}
        scale={[1, 1, Z_SQUASH]}
        data-bottle
      >
        {/* glass flacon */}
        <mesh castShadow>
          <latheGeometry args={[BODY_PROFILE, segments]} />
          {transmissive ? (
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.7}
              roughness={tier === "high" ? 0.05 : 0.09}
              ior={1.5}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.25}
              color={"#f5f1e9"}
              attenuationColor={c.liquid}
              attenuationDistance={0.55}
              envMapIntensity={1.25}
            />
          ) : (
            <meshPhysicalMaterial
              transparent
              opacity={0.38}
              roughness={0.12}
              ior={1.45}
              metalness={0}
              color={"#efeae0"}
              envMapIntensity={1.6}
            />
          )}
        </mesh>

        {/* the juice */}
        <mesh>
          <latheGeometry args={[LIQUID_PROFILE, segments]} />
          <meshPhysicalMaterial
            ref={liquidMat}
            color={c.liquid}
            emissive={c.glow}
            emissiveIntensity={0.13}
            roughness={0.28}
            metalness={0}
            transmission={transmissive ? 0.25 : 0}
            transparent={!transmissive}
            opacity={transmissive ? 1 : 0.92}
            ior={1.33}
            attenuationColor={c.liquid}
            attenuationDistance={0.9}
            envMapIntensity={0.6}
          />
        </mesh>

        <Cap style={fragrance.capStyle} color={c.cap} />

        {/* front label (procedural gold text) */}
        {label && (
          <mesh position={[0, 0.66, 0.66]} renderOrder={2}>
            <planeGeometry args={[0.74, 0.74]} />
            <meshBasicMaterial
              map={label}
              transparent
              toneMapped={false}
              depthWrite={false}
              opacity={0.96}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
