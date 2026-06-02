"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

// A slim flacon silhouette (revolved + squashed front-to-back into an oval).
const BODY = [
  v2(0.0, 0.0), v2(0.3, 0.0), v2(0.33, 0.03), v2(0.33, 0.5), v2(0.3, 0.62),
  v2(0.19, 0.72), v2(0.105, 0.8), v2(0.1, 0.92), v2(0.12, 0.94),
];
const LIQUID = [
  v2(0.0, 0.03), v2(0.28, 0.03), v2(0.3, 0.08), v2(0.3, 0.5), v2(0.26, 0.6), v2(0.16, 0.68), v2(0.0, 0.7),
];

interface Props {
  fragrance: Fragrance;
  index: number;
  active: boolean;
  tier: QualityTier;
}

export default function Product({ fragrance, index, active, tier }: Props) {
  const spin = useRef<THREE.Group>(null);
  const bottle = useRef<THREE.Group>(null);
  const liquidMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const p = fragrance.palette;

  const hovered = useScene((s) => s.hovered && s.active === index);
  const opened = useScene((s) => s.opened === index);
  const setHovered = useScene((s) => s.setHovered);
  const setOpened = useScene((s) => s.setOpened);

  const segments = tier === "high" ? 56 : tier === "standard" ? 36 : 24;
  const transmissive = tier !== "safe";

  const packaging = useTexture(fragrance.packaging);
  useMemo(() => {
    packaging.colorSpace = THREE.SRGBColorSpace;
    packaging.anisotropy = 8;
  }, [packaging]);

  const rot = useRef(0);
  const lift = useRef(0);
  const glow = useRef(0);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0015, dt);
    const speed = opened ? 0.8 : active ? (hovered ? 0.45 : 0.22) : 0.05;
    rot.current += speed * dt;
    if (spin.current) spin.current.rotation.y = rot.current;

    const liftTarget = opened ? 0.6 : 0;
    lift.current += (liftTarget - lift.current) * k;
    if (bottle.current) bottle.current.position.y = 0.42 + lift.current;

    const glowTarget = opened ? 0.5 : active ? 0.12 : 0.03;
    glow.current += (glowTarget - glow.current) * k;
    if (liquidMat.current) liquidMat.current.emissiveIntensity = glow.current;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (active) {
      setHovered(true);
      document.body.style.cursor = "none";
    }
  };
  const out = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "";
  };
  const dbl = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (active) setOpened(opened ? null : index);
  };

  return (
    <group
      ref={spin}
      onPointerOver={over}
      onPointerOut={out}
      onDoubleClick={dbl}
      data-product
    >
      {/* premium carton */}
      <mesh position={[0, 0.72, -0.06]} castShadow>
        <boxGeometry args={[1.0, 1.42, 0.5]} />
        <meshStandardMaterial attach="material-0" color={p.box} roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-1" color={p.box} roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-2" color={p.box} roughness={0.6} metalness={0.1} />
        <meshStandardMaterial attach="material-3" color={p.box} roughness={0.7} metalness={0.05} />
        <meshStandardMaterial attach="material-4" map={packaging} roughness={0.45} metalness={0.12} envMapIntensity={0.7} />
        <meshStandardMaterial attach="material-5" map={packaging} roughness={0.45} metalness={0.12} envMapIntensity={0.7} />
      </mesh>

      {/* glass flacon in front */}
      <group ref={bottle} position={[0, 0.42, 0.5]} scale={[1, 1, 0.74]}>
        <mesh castShadow>
          <latheGeometry args={[BODY, segments]} />
          {transmissive ? (
            <meshPhysicalMaterial
              transmission={1}
              thickness={0.45}
              roughness={tier === "high" ? 0.05 : 0.09}
              ior={1.5}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.2}
              color={"#ffffff"}
              attenuationColor={p.liquid}
              attenuationDistance={0.5}
              envMapIntensity={1.3}
            />
          ) : (
            <meshPhysicalMaterial transparent opacity={0.4} roughness={0.12} ior={1.45} metalness={0} color={"#f2eee6"} envMapIntensity={1.5} />
          )}
        </mesh>
        <mesh>
          <latheGeometry args={[LIQUID, segments]} />
          <meshPhysicalMaterial
            ref={liquidMat}
            color={p.liquid}
            emissive={p.liquid}
            emissiveIntensity={0.03}
            roughness={0.3}
            metalness={0}
            transmission={transmissive ? 0.2 : 0}
            transparent={!transmissive}
            opacity={transmissive ? 1 : 0.92}
            ior={1.33}
          />
        </mesh>
        {/* cap */}
        <mesh position={[0, 0.99, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.115, 0.16, 32]} />
          <meshStandardMaterial color={p.cap} metalness={0.95} roughness={0.18} envMapIntensity={1.3} />
        </mesh>
        <mesh position={[0, 1.12, 0]} castShadow>
          <sphereGeometry args={[0.13, 32, 24]} />
          <meshStandardMaterial color={p.cap} metalness={0.95} roughness={0.16} envMapIntensity={1.4} />
        </mesh>
      </group>
    </group>
  );
}
