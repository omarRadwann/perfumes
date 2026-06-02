"use client";

import * as THREE from "three";
import gsap from "gsap";
import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { prefersReducedMotion } from "@/lib/motion";

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

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
  const { pointer } = useThree();
  const tilt = useRef<THREE.Group>(null); // hover tilt + idle bob
  const spin = useRef<THREE.Group>(null); // rotation + scale pop
  const bottle = useRef<THREE.Group>(null); // opened lift
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

  const reduce = useRef(false);
  const spinVel = useRef(0.05);
  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  const glowTarget = () => (opened ? 0.5 : hovered ? 0.2 : active ? 0.14 : 0.03);

  // Arrival beat when this product becomes the active scene.
  useEffect(() => {
    if (!active) {
      if (spin.current) gsap.to(spin.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.out" });
      if (liquidMat.current) gsap.to(liquidMat.current, { emissiveIntensity: 0.03, duration: 0.5, overwrite: "auto" });
      return;
    }
    if (reduce.current) {
      if (liquidMat.current) liquidMat.current.emissiveIntensity = 0.14;
      return;
    }
    spinVel.current = 4.2; // burst — useFrame eases it back to calm
    if (spin.current) {
      gsap.fromTo(
        spin.current.scale,
        { x: 0.96, y: 0.96, z: 0.96 },
        { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.7)", overwrite: "auto" }
      );
    }
    if (bottle.current) {
      gsap.fromTo(
        bottle.current.position,
        { y: 0.42 + 0.12 },
        { y: 0.42, duration: 0.7, ease: "back.out(1.4)", overwrite: "auto" }
      );
    }
    if (liquidMat.current) {
      gsap.fromTo(
        liquidMat.current,
        { emissiveIntensity: 0.05 },
        { emissiveIntensity: 0.14, duration: 0.9, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [active]);

  // Opened (double-click / Konami) — lift the flacon out and brighten.
  useEffect(() => {
    if (!bottle.current) return;
    gsap.to(bottle.current.position, { y: opened ? 1.0 : 0.42, duration: 0.8, ease: opened ? "back.out(1.4)" : "power2.out", overwrite: "auto" });
    if (liquidMat.current) gsap.to(liquidMat.current, { emissiveIntensity: glowTarget(), duration: 0.6, overwrite: "auto" });
  }, [opened]);

  // Hover glow
  useEffect(() => {
    if (liquidMat.current) gsap.to(liquidMat.current, { emissiveIntensity: glowTarget(), duration: 0.4, overwrite: "auto" });
  }, [hovered]);

  const tiltX = useRef(0);
  const tiltZ = useRef(0);
  const bob = useRef(0);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    // spin velocity eases to a calm idle (the arrival burst decays into this)
    const idle = opened ? 1.3 : hovered ? 0.5 : active ? 0.18 : 0.05;
    spinVel.current += (idle - spinVel.current) * k;
    if (spin.current) spin.current.rotation.y += spinVel.current * dt;

    if (tilt.current) {
      const canTilt = active && hovered && !reduce.current;
      const tx = canTilt ? pointer.y * 0.12 : 0;
      const tz = canTilt ? -pointer.x * 0.12 : 0;
      tiltX.current += (tx - tiltX.current) * k;
      tiltZ.current += (tz - tiltZ.current) * k;
      tilt.current.rotation.x = tiltX.current;
      tilt.current.rotation.z = tiltZ.current;
      const bobTarget = !reduce.current && active ? Math.sin(state.clock.elapsedTime * 0.8) * 0.02 + (hovered ? 0.06 : 0) : 0;
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
    </group>
  );
}
