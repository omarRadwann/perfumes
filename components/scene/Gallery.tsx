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
import { ArchWall } from "./ArchWall";
import { SceneTitle, displayName } from "./Typography";

export const STATION_GAP = 8;
export const stationZ = (i: number) => -i * STATION_GAP;

const HALF_W = 4.5; // corridor half-width
const WALL_H = 7.5;
const CEIL_Y = 7.4;

export function Gallery({ tier }: { tier: QualityTier }) {
  const [marble, wall] = useTexture([withBase("/img/marble.jpg"), withBase("/img/wall.jpg")]);
  const N = FRAGRANCES.length;
  const len = STATION_GAP * (N - 1) + 28;
  const midZ = (-STATION_GAP * (N - 1)) / 2;

  const floorTex = useMemo(() => {
    const t = marble.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 16);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [marble]);

  const wallTex = useMemo(() => {
    const t = wall.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 2);
    t.anisotropy = 4;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [wall]);

  const plinthTex = useMemo(() => {
    const t = wall.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 1);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, [wall]);

  const active = useScene((s) => s.active);
  const reflective = tier !== "safe";

  // Soft follow key + warm rim, gliding along the CONTINUOUS journey focus point.
  const spot = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const sx = useRef(0);
  const col = useMemo(() => new THREE.Color("#fff3df"), []);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.0025, dt);
    const s = useScene.getState().scroll;
    const fidx = Math.max(0, Math.min(N - 1, s * (N - 1)));
    const seg = Math.min(N - 2, Math.floor(fidx));
    const f = fidx - seg;
    const sm = f * f * (3 - 2 * f);
    const focusZ = stationZ(seg) + (stationZ(seg + 1) - stationZ(seg)) * sm;
    const a = Math.round(fidx);
    sx.current += (focusZ - sx.current) * k;
    if (spot.current) {
      spot.current.position.set(1.2, 5.4, sx.current + 2.2);
      target.position.set(0, 1.3, sx.current);
      target.updateMatrixWorld();
      col.lerp(new THREE.Color(FRAGRANCES[a].palette.light), k);
      spot.current.color.copy(col);
      const t = state.clock.elapsedTime;
      spot.current.intensity = 22 * (1 + Math.sin(t * 8.3) * 0.02 + Math.sin(t * 19.7) * 0.012);
    }
    if (rim.current) rim.current.position.set(-1.2, 2.3, sx.current - 0.7);
  });

  return (
    <group>
      {/* soft creamy lighting */}
      <ambientLight intensity={0.32} />
      <hemisphereLight args={["#fff6ec", "#d8cdb6", 0.4]} />
      <directionalLight position={[4, 9, 6]} intensity={0.28} color="#fff1da" />
      <directionalLight position={[-6, 6, -4]} intensity={0.12} color="#eef0ff" />
      <primitive object={target} />
      <spotLight
        ref={spot}
        angle={0.5}
        penumbra={1}
        distance={26}
        intensity={22}
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
      <spotLight ref={rim} angle={0.6} penumbra={1} distance={7} intensity={6} color="#ffeccf" target={target} />

      {/* drifting dust motes */}
      {tier !== "safe" && (
        <Sparkles count={tier === "high" ? 70 : 40} scale={[7, 5, len]} position={[0, 3, midZ]} size={2.4} speed={0.18} opacity={0.4} color="#fff1d8" noise={1} />
      )}

      {/* polished cream marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]} receiveShadow>
        <planeGeometry args={[HALF_W * 2, len]} />
        {reflective ? (
          <MeshReflectorMaterial
            resolution={tier === "high" ? 1024 : 512}
            mixBlur={1.4}
            mixStrength={0.7}
            blur={[520, 280]}
            roughness={0.9}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            metalness={0.12}
            color="#efe8da"
            map={floorTex}
            envMapIntensity={0.4}
          />
        ) : (
          <meshStandardMaterial map={floorTex} roughness={0.5} metalness={0.1} envMapIntensity={0.4} color="#efe8da" />
        )}
      </mesh>

      {/* soft cream side walls */}
      {[-HALF_W, HALF_W].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, midZ]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[len, WALL_H]} />
          <meshStandardMaterial map={wallTex} color="#f1ebdf" roughness={0.95} metalness={0} side={THREE.DoubleSide} envMapIntensity={0.4} />
        </mesh>
      ))}

      {/* soft cream ceiling with a gentle cove glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL_Y, midZ]}>
        <planeGeometry args={[HALF_W * 2, len]} />
        <meshStandardMaterial color="#fbf5ea" emissive="#fff3e2" emissiveIntensity={0.06} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* fly-through arch portals (thick → reads as a vaulted tunnel): entrance + between each pair */}
      <ArchWall position={[0, 0, STATION_GAP / 2]} width={HALF_W * 2} height={WALL_H} depth={1.5} archWidth={3.0} archHeight={5.6} spring={2.8} />
      {Array.from({ length: N - 1 }).map((_, i) => (
        <ArchWall key={`portal-${i}`} position={[0, 0, stationZ(i) - STATION_GAP / 2]} width={HALF_W * 2} height={WALL_H} depth={1.5} archWidth={3.0} archHeight={5.6} spring={2.8} />
      ))}

      {/* the six arched product rooms */}
      {FRAGRANCES.map((f, i) => (
        <Alcove key={f.id} fragrance={f} index={i} z={stationZ(i)} active={active === i} tier={tier} plinthTex={plinthTex} archW={HALF_W * 2} archH={WALL_H} />
      ))}

      {/* gilded extruded scent-name title behind each hero flacon, against the apse */}
      {FRAGRANCES.map((f, i) => (
        <SceneTitle key={`title-${i}`} text={displayName(f.name)} position={[0, 1.7, stationZ(i) - 2.5]} size={0.62} color="#c7a96b" tier={tier} />
      ))}
    </group>
  );
}
