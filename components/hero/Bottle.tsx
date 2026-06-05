"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useGLTF, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { withBase } from "@/lib/basePath";
import { useScene } from "@/lib/store";
import { getFragrance, FRAGRANCES } from "@/lib/fragrances";
import type { QualityTier } from "@/lib/deviceTier";

// The flacon.glb is pre-split into four nodes (glass / juice / collar / cap) at model
// scale. We repaint per scent in code — one mesh set, no remodelling.
const MODEL = withBase("/models/flacon.glb");

// Build the ÉTHEREAL paper label as a canvas texture (canvas 2D fonts are independent
// of web-font loading, so it renders deterministically).
function makeLabel(name: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 420;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(0, 0, 320, 420);
  ctx.strokeStyle = "#c8a24a";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 280, 380);
  ctx.textAlign = "center";
  ctx.fillStyle = "#1a1813";
  ctx.font = "600 40px Georgia, 'Times New Roman', serif";
  ctx.fillText("ÉTHEREAL", 160, 118);
  ctx.fillStyle = "#c8a24a";
  ctx.fillRect(118, 140, 84, 2);
  ctx.fillStyle = "#3a342b";
  ctx.font = "italic 26px Georgia, serif";
  ctx.fillText(name, 160, 210);
  ctx.fillStyle = "#8a7a55";
  ctx.font = "13px Georgia, serif";
  ctx.fillText("EAU DE PARFUM", 160, 322);
  ctx.fillText("50 ML", 160, 350);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const SCALE = 1.18;
const OFFSET_Y = -0.64;

export function Bottle({ tier }: { tier: QualityTier }) {
  const { nodes } = useGLTF(MODEL) as unknown as { nodes: Record<string, THREE.Mesh> };
  const activeId = useScene((s) => s.activeScentId);
  const f = useMemo(() => getFragrance(activeId) ?? FRAGRANCES[0], [activeId]);

  const outer = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const juiceMat = useRef<THREE.MeshStandardMaterial>(null);
  const collarMat = useRef<THREE.MeshStandardMaterial>(null);
  const capMat = useRef<THREE.MeshStandardMaterial>(null);

  const label = useMemo(() => makeLabel(f.name), [f.name]);

  // Target colours per active scent (allocated only when the selection changes).
  const target = useMemo(
    () => ({ liquid: new THREE.Color(f.palette.liquid), cap: new THREE.Color(f.palette.cap) }),
    [f.palette.liquid, f.palette.cap]
  );
  const juiceColor = useRef(new THREE.Color(f.palette.liquid));
  const capColor = useRef(new THREE.Color(f.palette.cap));

  const transmissive = tier !== "safe";

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.05, dt);
    // lerp juice + metal toward the active scent (no per-frame allocation)
    juiceColor.current.lerp(target.liquid, k);
    capColor.current.lerp(target.cap, k);
    if (juiceMat.current) {
      juiceMat.current.color.copy(juiceColor.current);
      juiceMat.current.emissive.copy(juiceColor.current);
    }
    if (collarMat.current) collarMat.current.color.copy(capColor.current);
    if (capMat.current) capMat.current.color.copy(capColor.current);

    // scroll progress across the first viewport (0 at top → 1 a screen down)
    const sp =
      typeof window !== "undefined"
        ? Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)))
        : 0;

    // slow stately spin + a barely-there bob — winds up + recedes as you scroll
    if (spin.current) {
      spin.current.rotation.y += dt * (0.16 + sp * 2.4);
      spin.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03 - sp * 0.5;
    }
    // ease the whole flacon back + down as the hero hands off to the page below
    if (outer.current) {
      const targetScale = SCALE * (1 - sp * 0.18);
      outer.current.scale.setScalar(outer.current.scale.x + (targetScale - outer.current.scale.x) * k);
      outer.current.rotation.z = -sp * 0.12;
    }
    // subtle tilt toward the cursor (≈8° max) — the bottle "looks" at the pointer
    if (tilt.current) {
      const tx = -state.pointer.y * 0.1;
      const tz = state.pointer.x * 0.06;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * k;
      tilt.current.rotation.z += (tz - tilt.current.rotation.z) * k;
    }
  });

  return (
    <group ref={outer} scale={SCALE} position={[0, OFFSET_Y, 0]}>
      <group ref={tilt}>
        <group ref={spin}>
          {/* juice — coloured + faintly luminous so each scent reads as itself */}
          <mesh geometry={nodes.juice.geometry}>
            <meshStandardMaterial
              ref={juiceMat}
              color={f.palette.liquid}
              emissive={f.palette.liquid}
              emissiveIntensity={0.32}
              roughness={0.22}
              metalness={0}
            />
          </mesh>

          {/* printed paper label on the body's flat face */}
          {label && (
            <mesh position={[0, 0.4, 0.206]}>
              <planeGeometry args={[0.42, 0.52]} />
              <meshStandardMaterial
                map={label}
                emissiveMap={label}
                emissive="#ffffff"
                emissiveIntensity={0.04}
                roughness={0.6}
                metalness={0.05}
              />
            </mesh>
          )}

          {/* turned metal collar */}
          <mesh geometry={nodes.collar.geometry}>
            <meshStandardMaterial ref={collarMat} color={f.palette.cap} metalness={0.85} roughness={0.2} envMapIntensity={2.2} />
          </mesh>

          {/* faceted metal cap */}
          <mesh geometry={nodes.cap.geometry} castShadow>
            <meshStandardMaterial ref={capMat} color={f.palette.cap} metalness={0.85} roughness={0.18} envMapIntensity={2.4} />
          </mesh>

          {/* crystal body, drawn last so the transmission composites over the juice */}
          <mesh geometry={nodes.glass.geometry} castShadow>
            {transmissive ? (
              <MeshTransmissionMaterial
                transmission={1}
                thickness={1.1}
                roughness={0.05}
                ior={1.5}
                chromaticAberration={0.04}
                anisotropicBlur={0.3}
                distortion={0.06}
                distortionScale={0.25}
                temporalDistortion={0.05}
                clearcoat={1}
                clearcoatRoughness={0.08}
                attenuationColor={target.liquid}
                attenuationDistance={3.2}
                color="#ffffff"
                envMapIntensity={1.7}
                backside={tier === "high"}
                samples={tier === "high" ? 12 : 8}
                resolution={tier === "high" ? 1024 : 768}
                backsideResolution={512}
              />
            ) : (
              // safe tier: no transmission render pass → no iGPU fill-rate crash
              <meshPhysicalMaterial transparent opacity={0.46} roughness={0.12} ior={1.45} color="#f3efe7" metalness={0} clearcoat={1} envMapIntensity={1.4} />
            )}
          </mesh>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL);
