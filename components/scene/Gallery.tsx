"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sparkles } from "@react-three/drei";
import { FRAGRANCES } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { withBase } from "@/lib/basePath";
import { Alcove } from "./Alcove";

export const STATION_GAP = 8;
export const stationZ = (i: number) => -i * STATION_GAP;

export function Gallery({ tier }: { tier: QualityTier }) {
  const [marble, wall] = useTexture([withBase("/img/marble.jpg"), withBase("/img/wall.jpg")]);

  const floorTex = useMemo(() => {
    const t = marble.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 20);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [marble]);

  const wallTex = useMemo(() => {
    const t = wall.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 2);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [wall]);

  useMemo(() => {
    marble.colorSpace = THREE.SRGBColorSpace;
  }, [marble]);

  const active = useScene((s) => s.active);

  // Shared follow spotlight: glides to the active alcove and takes its light tint.
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const sx = useRef(0);
  const col = useMemo(() => new THREE.Color("#fff3df"), []);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.0025, dt);
    const a = useScene.getState().active;
    const tz = stationZ(a);
    sx.current += (tz - sx.current) * k;
    if (spot.current) {
      spot.current.position.set(1.6, 5.2, sx.current + 2.4);
      target.position.set(0, 1.4, sx.current);
      target.updateMatrixWorld();
      col.lerp(new THREE.Color(FRAGRANCES[a].palette.light), k);
      spot.current.color.copy(col);
      // candle-like flicker
      const t = state.clock.elapsedTime;
      spot.current.intensity = 34 * (1 + Math.sin(t * 8.3) * 0.03 + Math.sin(t * 19.7) * 0.018);
    }
  });

  const len = STATION_GAP * (FRAGRANCES.length - 1) + 16;

  return (
    <group>
      {/* lighting — bright, warm, even (kept low; the env map does a lot) */}
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#fff4e2", "#d8cbb0", 0.3]} />
      <directionalLight position={[4, 9, 6]} intensity={0.45} color="#fff1da" />
      <directionalLight position={[-6, 6, -4]} intensity={0.16} color="#eef0ff" />
      <primitive object={target} />
      <spotLight ref={spot} angle={0.5} penumbra={1} distance={24} intensity={34} color="#fff3df" target={target} />

      {/* drifting dust motes catching the light */}
      {tier !== "safe" && (
        <Sparkles
          count={tier === "high" ? 70 : 40}
          scale={[10, 6, len]}
          position={[0, 3, -STATION_GAP * 2]}
          size={3}
          speed={0.25}
          opacity={0.5}
          color="#ffe9c8"
          noise={1}
        />
      )}

      {/* marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -STATION_GAP * 2]} receiveShadow>
        <planeGeometry args={[12, len]} />
        <meshStandardMaterial map={floorTex} roughness={0.4} metalness={0.2} envMapIntensity={0.5} color="#f3ece0" />
      </mesh>

      {/* side walls */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 4, -STATION_GAP * 2]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[len, 8]} />
          <meshStandardMaterial map={wallTex} color="#f1e9dc" roughness={0.95} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* soft ceiling glow strip */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7.5, -STATION_GAP * 2]}>
        <planeGeometry args={[12, len]} />
        <meshStandardMaterial color="#fff8ee" emissive="#fff3e2" emissiveIntensity={0.1} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* colonnade — slim cream columns with gold bases, between alcoves */}
      {Array.from({ length: FRAGRANCES.length + 1 }).map((_, i) =>
        [-5.4, 5.4].map((x) => (
          <group key={`${i}-${x}`} position={[x, 0, stationZ(i) + STATION_GAP / 2]}>
            <mesh position={[0, 3.5, 0]}>
              <cylinderGeometry args={[0.22, 0.24, 7, 20]} />
              <meshStandardMaterial color="#efe7d8" roughness={0.85} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.32, 0.34, 0.3, 20]} />
              <meshStandardMaterial color="#c9a96a" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))
      )}

      {/* the six alcoves */}
      {FRAGRANCES.map((f, i) => (
        <Alcove key={f.id} fragrance={f} index={i} z={stationZ(i)} active={active === i} tier={tier} marble={marble} />
      ))}
    </group>
  );
}
