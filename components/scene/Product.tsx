"use client";

import * as THREE from "three";
import gsap from "gsap";
import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useTexture, RoundedBox, MeshTransmissionMaterial } from "@react-three/drei";
import type { Fragrance } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { prefersReducedMotion } from "@/lib/motion";

interface Props {
  fragrance: Fragrance;
  index: number;
  active: boolean;
  tier: QualityTier;
}

// The product: a printed carton that slowly turns to show its art, and — standing
// in front of it on the plinth — a faceted heavy-glass flacon (the niche-perfume
// silhouette). The active flacon gets true refraction; the rest use cheaper glass.
export default function Product({ fragrance, index, active, tier }: Props) {
  const { pointer } = useThree();
  const tilt = useRef<THREE.Group>(null); // hover tilt + idle bob (whole product)
  const spin = useRef<THREE.Group>(null); // carton rotation + scale pop
  const bottle = useRef<THREE.Group>(null); // flacon — static, lifts when opened
  const liquidMat = useRef<THREE.MeshStandardMaterial>(null);
  const p = fragrance.palette;

  const hovered = useScene((s) => s.hovered && s.active === index);
  const opened = useScene((s) => s.opened === index);
  const setHovered = useScene((s) => s.setHovered);
  const setOpened = useScene((s) => s.setOpened);

  const transmissive = tier !== "safe";

  const packaging = useTexture(fragrance.packaging);
  useMemo(() => {
    packaging.colorSpace = THREE.SRGBColorSpace;
    packaging.anisotropy = 8;
  }, [packaging]);

  // Engraved house label drawn to a canvas (house name + scent + concentration).
  const labelTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 400;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, 320, 400);
    ctx.strokeStyle = "#b1894e";
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, 284, 364);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, 264, 344);
    ctx.textAlign = "center";
    ctx.fillStyle = "#26221c";
    ctx.font = "600 46px Georgia, 'Times New Roman', serif";
    ctx.fillText("NOCTÉ", 160, 120);
    ctx.fillStyle = "#b1894e";
    ctx.fillRect(115, 140, 90, 2);
    ctx.fillStyle = "#3a342b";
    ctx.font = "italic 28px Georgia, serif";
    ctx.fillText(fragrance.name, 160, 198);
    ctx.fillStyle = "#8a7a55";
    ctx.font = "15px Georgia, serif";
    ctx.fillText("EXTRAIT DE PARFUM", 160, 300);
    ctx.fillText("100 ML · PARIS", 160, 330);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [fragrance.name]);

  const reduce = useRef(false);
  const spinVel = useRef(0.05);
  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  const glowTarget = () => (opened ? 0.5 : hovered ? 0.22 : active ? 0.16 : 0.04);

  // Arrival beat when this product becomes the active scene.
  useEffect(() => {
    if (!active) {
      if (spin.current) gsap.to(spin.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.out" });
      if (liquidMat.current) gsap.to(liquidMat.current, { emissiveIntensity: 0.04, duration: 0.5, overwrite: "auto" });
      return;
    }
    if (reduce.current) {
      if (liquidMat.current) liquidMat.current.emissiveIntensity = 0.16;
      return;
    }
    spinVel.current = 3.4; // burst — useFrame eases it back to a calm idle turn
    if (spin.current) {
      gsap.fromTo(spin.current.scale, { x: 0.96, y: 0.96, z: 0.96 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: "back.out(1.6)", overwrite: "auto" });
    }
    if (bottle.current) {
      gsap.fromTo(bottle.current.position, { y: 0.16 }, { y: 0, duration: 0.8, ease: "back.out(1.3)", overwrite: "auto" });
      gsap.fromTo(bottle.current.scale, { x: 0.9, y: 0.9, z: 0.9 }, { x: 1, y: 1, z: 1, duration: 0.8, ease: "back.out(1.6)", overwrite: "auto" });
    }
    if (liquidMat.current) {
      gsap.fromTo(liquidMat.current, { emissiveIntensity: 0.06 }, { emissiveIntensity: 0.16, duration: 0.9, ease: "power2.out", overwrite: "auto" });
    }
  }, [active]);

  // Opened (double-click / Konami) — lift the flacon out and brighten.
  useEffect(() => {
    if (!bottle.current) return;
    gsap.to(bottle.current.position, { y: opened ? 0.8 : 0, duration: 0.8, ease: opened ? "back.out(1.4)" : "power2.out", overwrite: "auto" });
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
    // carton turns slowly to showcase its art; the arrival burst decays into this
    const idle = hovered ? 0.5 : active ? 0.2 : 0.05;
    spinVel.current += (idle - spinVel.current) * k;
    if (spin.current) spin.current.rotation.y += spinVel.current * dt;

    if (tilt.current) {
      const canTilt = active && hovered && !reduce.current;
      const tx = canTilt ? pointer.y * 0.1 : 0;
      const tz = canTilt ? -pointer.x * 0.1 : 0;
      tiltX.current += (tx - tiltX.current) * k;
      tiltZ.current += (tz - tiltZ.current) * k;
      tilt.current.rotation.x = tiltX.current;
      tilt.current.rotation.z = tiltZ.current;
      const bobTarget = !reduce.current && active ? Math.sin(state.clock.elapsedTime * 0.8) * 0.02 + (hovered ? 0.05 : 0) : 0;
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

  const glass = active && transmissive ? (
    // hero glass: true refraction (samples the scene) — only on the active flacon
    <MeshTransmissionMaterial
      backside={tier === "high"}
      backsideThickness={0.3}
      samples={tier === "high" ? 10 : 6}
      resolution={tier === "high" ? 512 : 256}
      transmission={1}
      thickness={0.55}
      roughness={0.02}
      ior={1.49}
      chromaticAberration={0.05}
      anisotropicBlur={0.06}
      distortion={0.05}
      distortionScale={0.15}
      temporalDistortion={0}
      clearcoat={1}
      clearcoatRoughness={0.08}
      attenuationColor={p.liquid}
      attenuationDistance={1.4}
      color={"#ffffff"}
      envMapIntensity={1.7}
    />
  ) : transmissive ? (
    <meshPhysicalMaterial transmission={1} thickness={0.4} roughness={0.08} ior={1.49} metalness={0} clearcoat={1} clearcoatRoughness={0.1} color={"#ffffff"} attenuationColor={p.liquid} attenuationDistance={1.2} envMapIntensity={1.5} />
  ) : (
    <meshPhysicalMaterial transparent opacity={0.42} roughness={0.12} ior={1.45} metalness={0} color={"#f3efe7"} envMapIntensity={1.4} />
  );

  return (
    <group ref={tilt} onPointerOver={over} onPointerOut={out} onDoubleClick={dbl} data-product>
      {/* printed carton — turns slowly to show its art (front & back) */}
      <group ref={spin} position={[0, 0.71, -0.2]}>
        <RoundedBox args={[1.0, 1.42, 0.5]} radius={0.05} smoothness={5} castShadow receiveShadow>
          <meshPhysicalMaterial color={p.box} roughness={0.5} metalness={0.15} clearcoat={0.5} clearcoatRoughness={0.35} envMapIntensity={0.8} />
        </RoundedBox>
        <mesh position={[0, 0, 0.252]}>
          <planeGeometry args={[0.9, 1.3]} />
          <meshStandardMaterial map={packaging} roughness={0.42} metalness={0.18} envMapIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.252]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.9, 1.3]} />
          <meshStandardMaterial map={packaging} roughness={0.42} metalness={0.18} envMapIntensity={0.9} />
        </mesh>
      </group>

      {/* faceted heavy-glass flacon, standing on the plinth in front of the carton */}
      <group ref={bottle} position={[0.04, 0, 0.55]}>
        {/* crystal body */}
        <RoundedBox args={[0.66, 1.0, 0.4]} radius={0.05} smoothness={5} position={[0, 0.5, 0]} castShadow>
          {glass}
        </RoundedBox>
        {/* the juice (fills the lower half) */}
        <RoundedBox args={[0.56, 0.52, 0.31]} radius={0.03} smoothness={4} position={[0, 0.29, 0]}>
          <meshStandardMaterial ref={liquidMat} color={p.liquid} emissive={p.liquid} emissiveIntensity={0.04} roughness={0.25} metalness={0} />
        </RoundedBox>
        {/* engraved house label on the front */}
        {labelTex && (
          <mesh position={[0, 0.52, 0.206]}>
            <planeGeometry args={[0.46, 0.58]} />
            <meshStandardMaterial map={labelTex} roughness={0.55} metalness={0.05} emissive={"#fff7ec"} emissiveIntensity={0.04} />
          </mesh>
        )}
        {/* gold shoulder + neck + faceted stopper */}
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
    </group>
  );
}
