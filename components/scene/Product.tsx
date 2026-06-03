"use client";

import * as THREE from "three";
import gsap from "gsap";
import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, RoundedBox } from "@react-three/drei";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { withBase } from "@/lib/basePath";
import { prefersReducedMotion } from "@/lib/motion";

const MODEL_COUNT = 4; // real Tripo GLBs exist for scents 0..3
const modelUrl = (i: number) => withBase(`/models/m${i}.glb`);
if (typeof window !== "undefined") {
  for (let i = 0; i < MODEL_COUNT; i++) useGLTF.preload(modelUrl(i));
}

interface Props {
  fragrance: Fragrance;
  index: number;
  active: boolean;
  tier: QualityTier;
}

// Real Tripo flacon (normalized height ~1, centered at origin). Glossed for the scene.
function GlbFlacon({ index }: { index: number }) {
  const { scene } = useGLTF(modelUrl(index));
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.roughness = Math.min(mat.roughness ?? 0.5, 0.28);
          mat.metalness = Math.max(mat.metalness ?? 0, 0.05);
          mat.envMapIntensity = 1.1;
          mat.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);
  return (
    <group scale={1.7}>
      <group position={[0, 0.5, 0]}>
        <primitive object={obj} />
      </group>
    </group>
  );
}

// Stylized crystal flacon — fallback for scents without a model yet.
function CodeFlacon({ p, tier }: { p: Fragrance["palette"]; tier: QualityTier }) {
  const transmissive = tier !== "safe";
  return (
    <group scale={1.4}>
      <RoundedBox args={[0.66, 1.0, 0.4]} radius={0.05} smoothness={5} position={[0, 0.5, 0]} castShadow>
        {transmissive ? (
          <meshPhysicalMaterial transmission={1} thickness={0.4} roughness={0.08} ior={1.49} metalness={0} clearcoat={1} clearcoatRoughness={0.1} color={"#ffffff"} attenuationColor={p.liquid} attenuationDistance={4} envMapIntensity={1.5} />
        ) : (
          <meshPhysicalMaterial transparent opacity={0.42} roughness={0.12} ior={1.45} color={"#f3efe7"} envMapIntensity={1.4} />
        )}
      </RoundedBox>
      <RoundedBox args={[0.56, 0.52, 0.31]} radius={0.03} smoothness={4} position={[0, 0.29, 0]}>
        <meshStandardMaterial color={p.liquid} emissive={p.liquid} emissiveIntensity={0.1} roughness={0.25} />
      </RoundedBox>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.26]} />
        <meshStandardMaterial color={p.cap} metalness={0.95} roughness={0.18} envMapIntensity={1.4} />
      </mesh>
      <RoundedBox args={[0.34, 0.26, 0.24]} radius={0.04} smoothness={5} position={[0, 1.22, 0]} castShadow>
        <meshStandardMaterial color={p.cap} metalness={0.96} roughness={0.14} envMapIntensity={1.6} />
      </RoundedBox>
    </group>
  );
}

export default function Product({ fragrance, index, active, tier }: Props) {
  const { pointer } = useThree();
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const bottle = useRef<THREE.Group>(null);
  const hasModel = index < MODEL_COUNT;

  const hovered = useScene((s) => s.hovered && s.active === index);
  const opened = useScene((s) => s.opened === index);
  const setHovered = useScene((s) => s.setHovered);
  const setOpened = useScene((s) => s.setOpened);

  const reduce = useRef(false);
  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (!active || reduce.current || !bottle.current) return;
    gsap.fromTo(bottle.current.position, { y: 0.18 }, { y: 0, duration: 0.9, ease: "back.out(1.3)", overwrite: "auto" });
    gsap.fromTo(bottle.current.scale, { x: 0.92, y: 0.92, z: 0.92 }, { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.5)", overwrite: "auto" });
  }, [active]);

  useEffect(() => {
    if (!bottle.current) return;
    gsap.to(bottle.current.position, { y: opened ? 0.7 : 0, duration: 0.8, ease: opened ? "back.out(1.4)" : "power2.out", overwrite: "auto" });
  }, [opened]);

  const tiltX = useRef(0);
  const tiltZ = useRef(0);
  const bob = useRef(0);
  const sway = useRef(0);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    if (spin.current) {
      const target = !reduce.current && active ? Math.sin(state.clock.elapsedTime * 0.32) * 0.22 : 0;
      sway.current += (target - sway.current) * k;
      spin.current.rotation.y = sway.current;
    }
    if (tilt.current) {
      const canTilt = active && hovered && !reduce.current;
      const tx = canTilt ? pointer.y * 0.1 : 0;
      const tz = canTilt ? -pointer.x * 0.1 : 0;
      tiltX.current += (tx - tiltX.current) * k;
      tiltZ.current += (tz - tiltZ.current) * k;
      tilt.current.rotation.x = tiltX.current;
      tilt.current.rotation.z = tiltZ.current;
      const bobTarget = !reduce.current && active ? Math.sin(state.clock.elapsedTime * 0.7) * 0.02 : 0;
      bob.current += (bobTarget - bob.current) * k;
      tilt.current.position.y = bob.current;
    }
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
    <group ref={tilt} onPointerOver={over} onPointerOut={out} onDoubleClick={dbl} data-product>
      <group ref={spin}>
        <group ref={bottle}>{hasModel ? <GlbFlacon index={index} /> : <CodeFlacon p={fragrance.palette} tier={tier} />}</group>
      </group>
    </group>
  );
}
