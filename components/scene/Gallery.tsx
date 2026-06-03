"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sparkles, MeshReflectorMaterial } from "@react-three/drei";
import { FRAGRANCES } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";
import { useScene } from "@/lib/store";
import { withBase } from "@/lib/basePath";
import { Alcove } from "./Alcove";

export const STATION_GAP = 8;
export const stationZ = (i: number) => -i * STATION_GAP;

export function Gallery({ tier }: { tier: QualityTier }) {
  const [marble, wall, nero] = useTexture([
    withBase("/img/marble.jpg"),
    withBase("/img/wall.jpg"),
    withBase("/img/nero.jpg"),
  ]);

  const floorTex = useMemo(() => {
    const t = marble.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 10); // larger slabs → less obvious tiling
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [marble]);

  const wallTex = useMemo(() => {
    const t = wall.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 1.5);
    t.anisotropy = 4;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [wall]);

  const neroTex = useMemo(() => {
    nero.colorSpace = THREE.SRGBColorSpace;
    nero.anisotropy = 8;
    return nero;
  }, [nero]);

  const neroLong = useMemo(() => {
    const t = nero.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(20, 0.5);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [nero]);

  const active = useScene((s) => s.active);
  const reflective = tier !== "safe";

  // Shared follow spotlight: glides to the active alcove, takes its light tint, and
  // casts the product's grounding shadow onto the plinth.
  const spot = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const shaft = useRef<THREE.Mesh>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const sx = useRef(0);
  const col = useMemo(() => new THREE.Color("#fff3df"), []);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.0025, dt);
    const a = useScene.getState().active;
    const tz = stationZ(a);
    sx.current += (tz - sx.current) * k;
    if (spot.current) {
      spot.current.position.set(1.4, 5.6, sx.current + 2.2);
      target.position.set(0, 1.3, sx.current);
      target.updateMatrixWorld();
      col.lerp(new THREE.Color(FRAGRANCES[a].palette.light), k);
      spot.current.color.copy(col);
      // candle-like flicker
      const t = state.clock.elapsedTime;
      spot.current.intensity = 58 * (1 + Math.sin(t * 8.3) * 0.03 + Math.sin(t * 19.7) * 0.018);
    }
    if (rim.current) {
      // warm rim/back light between product and niche, grazing toward camera
      rim.current.position.set(-1.25, 2.4, sx.current - 0.7);
    }
    if (shaft.current) {
      shaft.current.position.z = sx.current + 0.15;
      const mat = shaft.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.7) * 0.012; // gentle breathe
    }
  });

  const len = STATION_GAP * (FRAGRANCES.length - 1) + 16;

  return (
    <group>
      {/* lighting — bright, warm, even (kept low; the env map does a lot) */}
      <ambientLight intensity={0.16} />
      <hemisphereLight args={["#fff4e2", "#c4b696", 0.2]} />
      <directionalLight position={[4, 9, 6]} intensity={0.34} color="#fff1da" />
      <directionalLight position={[-6, 6, -4]} intensity={0.12} color="#eef0ff" />
      <primitive object={target} />
      <spotLight
        ref={spot}
        angle={0.46}
        penumbra={0.9}
        distance={26}
        intensity={58}
        color="#fff3df"
        target={target}
        castShadow={reflective}
        shadow-mapSize-width={tier === "high" ? 2048 : 1024}
        shadow-mapSize-height={tier === "high" ? 2048 : 1024}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={18}
      />
      <spotLight ref={rim} angle={0.6} penumbra={1} distance={7} intensity={12} color="#ffeccf" target={target} />

      {/* volumetric light shaft over the active product (museum downlight catching dust) */}
      {tier !== "safe" && (
        <mesh ref={shaft} position={[0.2, 4.0, 0]} rotation={[0, 0, -0.08]} renderOrder={2}>
          <coneGeometry args={[1.3, 5.4, 56, 1, true]} />
          <meshBasicMaterial
            color="#ffe6c4"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* drifting dust motes catching the light */}
      {tier !== "safe" && (
        <Sparkles
          count={tier === "high" ? 80 : 44}
          scale={[10, 6, len]}
          position={[0, 3, -STATION_GAP * 2]}
          size={3}
          speed={0.22}
          opacity={0.5}
          color="#ffe9c8"
          noise={1}
        />
      )}

      {/* polished marble floor — reflects the products on high/standard tiers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -STATION_GAP * 2]} receiveShadow>
        <planeGeometry args={[12, len]} />
        {reflective ? (
          <MeshReflectorMaterial
            resolution={tier === "high" ? 1024 : 512}
            mixBlur={1}
            mixStrength={1.5}
            blur={[420, 220]}
            roughness={0.85}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            metalness={0.2}
            color="#ece4d6"
            map={floorTex}
            envMapIntensity={0.5}
          />
        ) : (
          <meshStandardMaterial map={floorTex} roughness={0.45} metalness={0.2} envMapIntensity={0.5} color="#f3ece0" />
        )}
      </mesh>

      {/* side walls */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 4, -STATION_GAP * 2]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[len, 8]} />
          <meshStandardMaterial map={wallTex} color="#efe7d9" roughness={0.95} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* dark marble baseboard + gold cornice run the length of each wall */}
      {[-5.92, 5.92].map((x) => (
        <group key={`trim-${x}`}>
          <mesh position={[x, 0.16, -STATION_GAP * 2]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.32, len]} />
            <meshStandardMaterial map={neroLong} color="#cfc6b6" roughness={0.4} metalness={0.25} envMapIntensity={0.6} />
          </mesh>
          <mesh position={[x, 7.3, -STATION_GAP * 2]}>
            <boxGeometry args={[0.18, 0.16, len]} />
            <meshStandardMaterial color="#c9a96a" metalness={0.85} roughness={0.3} envMapIntensity={1.1} />
          </mesh>
        </group>
      ))}

      {/* soft ceiling glow strip */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7.5, -STATION_GAP * 2]}>
        <planeGeometry args={[12, len]} />
        <meshStandardMaterial color="#fff8ee" emissive="#fff3e2" emissiveIntensity={0.12} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* colonnade — slim cream columns with gold base + capital, between alcoves */}
      {Array.from({ length: FRAGRANCES.length + 1 }).map((_, i) =>
        [-5.4, 5.4].map((x) => (
          <group key={`${i}-${x}`} position={[x, 0, stationZ(i) + STATION_GAP / 2]}>
            <mesh position={[0, 3.5, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.24, 7, 24]} />
              <meshStandardMaterial color="#efe7d8" roughness={0.85} metalness={0.05} />
            </mesh>
            {/* gold base */}
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.32, 0.34, 0.36, 24]} />
              <meshStandardMaterial color="#c9a96a" metalness={0.85} roughness={0.28} envMapIntensity={1.1} />
            </mesh>
            {/* gold capital */}
            <mesh position={[0, 6.95, 0]}>
              <cylinderGeometry args={[0.3, 0.26, 0.22, 24]} />
              <meshStandardMaterial color="#c9a96a" metalness={0.85} roughness={0.28} envMapIntensity={1.1} />
            </mesh>
          </group>
        ))
      )}

      {/* the six alcoves */}
      {FRAGRANCES.map((f, i) => (
        <Alcove key={f.id} fragrance={f} index={i} z={stationZ(i)} active={active === i} tier={tier} plinthTex={neroTex} />
      ))}
    </group>
  );
}
