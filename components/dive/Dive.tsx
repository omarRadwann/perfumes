"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import Lenis from "lenis";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";
import {
  initialTier,
  readForcedTier,
  readGpuRenderer,
  tierFromGpu,
  isIntegratedGpu,
  clampDpr,
  type QualityTier,
} from "@/lib/deviceTier";
import { withBase } from "@/lib/basePath";
import { prefersReducedMotion } from "@/lib/motion";
import { DebugOverlay } from "./DebugOverlay";
import { Hud } from "./Hud";

const N = FRAGRANCES.length;
const GAP = 9;
const modelUrl = (i: number) => withBase(`/models/m${i % 4}.glb`);
for (let i = 0; i < 4; i++) useGLTF.preload(withBase(`/models/m${i}.glb`));

// Each flacon's anchor along the descent (deeper + lower + gentle lateral drift).
const flaconPos = (i: number) => new THREE.Vector3(Math.sin(i * 1.3) * 1.5, -i * 1.7, -i * GAP);
const smoothstep = (f: number) => f * f * (3 - 2 * f);

// per-scent nocturnal void tints — the world's mood shifts as you descend
const ATMOS = ["#06060a", "#100b04", "#0e0507", "#05070f", "#0a0a0d", "#100c07"].map((h) => new THREE.Color(h));

function curFocus() {
  const s = useScene.getState().scroll;
  const fidx = Math.max(0, Math.min(N - 1, s * (N - 1)));
  const seg = Math.min(N - 2, Math.floor(fidx));
  const f = fidx - seg;
  return { seg, f, focus: flaconPos(seg).lerp(flaconPos(seg + 1), smoothstep(f)) };
}

// Shift background + fog colour per world as the camera descends.
function Atmosphere() {
  const { scene } = useThree();
  const cur = useRef(new THREE.Color(ATMOS[0]));
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0015, dt);
    const { seg, f } = curFocus();
    const target = ATMOS[seg].clone().lerp(ATMOS[seg + 1], f);
    cur.current.lerp(target, k);
    if (scene.background instanceof THREE.Color) scene.background.copy(cur.current);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(cur.current);
  });
  return null;
}

// Warm key + cool rim that follow the focal flacon → crisp highlights, not matte.
function FollowLight() {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const sx = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    const { focus } = curFocus();
    sx.current.lerp(focus, k);
    target.position.copy(sx.current);
    target.updateMatrixWorld();
    if (key.current) key.current.position.set(sx.current.x + 2.6, sx.current.y + 4, sx.current.z + 3.6);
    if (rim.current) rim.current.position.set(sx.current.x - 2.2, sx.current.y + 1, sx.current.z - 2.6);
  });
  return (
    <>
      <primitive object={target} />
      <spotLight ref={key} angle={0.55} penumbra={1} distance={18} intensity={28} color="#fff4e2" target={target} />
      <pointLight ref={rim} intensity={5} distance={10} decay={2} color="#cfe0ff" />
    </>
  );
}

function Effects({ tier }: { tier: QualityTier }) {
  if (tier === "safe") return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <Bloom mipmapBlur intensity={tier === "high" ? 0.7 : 0.5} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
      <Vignette offset={0.3} darkness={0.72} />
    </EffectComposer>
  );
}

function Flacon({ i }: { i: number }) {
  const { scene } = useGLTF(modelUrl(i));
  const ref = useRef<THREE.Group>(null);
  const p = FRAGRANCES[i].palette;
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.roughness = Math.min(mat.roughness ?? 0.5, 0.26);
          mat.envMapIntensity = 1.15;
          mat.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.16;
  });
  const pos = flaconPos(i);
  return (
    <group position={pos}>
      <group ref={ref} scale={1.6} position={[0, -0.5, 0]}>
        <primitive object={obj} />
      </group>
      {/* per-scent colored glow — each flacon a beacon in the dark */}
      <pointLight position={[0, 1.4, 1.6]} intensity={7} distance={10} decay={2} color={p.light} />
      <pointLight position={[-1.5, 0.4, 0.6]} intensity={3} distance={7} decay={2} color={p.accent} />
    </group>
  );
}

// Single camera, scrubbed by scroll: a continuous dive past each flacon.
function Rig() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 1, 6.5));
  const look = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((_, dt) => {
    const k = 1 - Math.pow(1e-6, dt);
    const s = useScene.getState().scroll;
    const fidx = Math.max(0, Math.min(N - 1, s * (N - 1)));
    const seg = Math.min(N - 2, Math.floor(fidx));
    const f = fidx - seg;
    const focus = flaconPos(seg).lerp(flaconPos(seg + 1), smoothstep(f));
    const closeness = (Math.cos(f * Math.PI * 2) + 1) / 2; // 1 at flacons, 0 between
    const dist = 5.4 + (1 - closeness) * 3.6;
    const tx = focus.x * 0.5 + (1 - closeness) * 0.6;
    const ty = focus.y + 0.7 + (1 - closeness) * 0.9;
    const tz = focus.z + dist;
    pos.current.x += (tx - pos.current.x) * k;
    pos.current.y += (ty - pos.current.y) * k;
    pos.current.z += (tz - pos.current.z) * k;
    camera.position.copy(pos.current);
    look.current.x += (focus.x - look.current.x) * k;
    look.current.y += (focus.y + 0.45 - look.current.y) * k;
    look.current.z += (focus.z - look.current.z) * k;
    camera.lookAt(look.current);
  });
  return null;
}

function Scene({ tier }: { tier: QualityTier }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <Environment resolution={tier === "high" ? 512 : 256} frames={1}>
        <Lightformer form="rect" intensity={0.8} color="#fff3df" scale={[10, 10, 1]} position={[0, 6, 8]} />
        <Lightformer form="rect" intensity={0.5} color="#9fb4ff" scale={[8, 8, 1]} position={[-8, 2, -6]} rotation={[0, Math.PI / 3, 0]} />
      </Environment>
      {tier !== "safe" && (
        <Sparkles count={tier === "high" ? 120 : 60} scale={[14, N * GAP, 14]} position={[0, (-N * 1.7) / 2, (-N * GAP) / 2]} size={2} speed={0.12} opacity={0.5} color="#ffe9c8" noise={1} />
      )}
      {FRAGRANCES.map((_, i) => (
        <Flacon key={i} i={i} />
      ))}
      <FollowLight />
      <Atmosphere />
      <Rig />
    </>
  );
}

export function Dive() {
  const setScroll = useScene((s) => s.setScroll);
  const setTier = useScene((s) => s.setTier);
  const setReady = useScene((s) => s.setReady);
  const tier = useScene((s) => s.tier);
  const forced = useRef<QualityTier | null>(null);
  const integrated = useRef(false);

  useEffect(() => {
    forced.current = readForcedTier();
    setTier(forced.current ?? initialTier());
  }, [setTier]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ lerp: 0.075, wheelMultiplier: 1 });
    (window as Window & { __lenis?: Lenis }).__lenis = l;
    l.on("scroll", () => setScroll(l.progress || 0));
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, [setScroll]);

  return (
    <>
      <div className="fixed inset-0" style={{ background: "#06060a" }}>
        <Canvas
          frameloop="always"
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={clampDpr(tier, integrated.current)}
          camera={{ position: [0, 1, 6.5], fov: 44, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={({ gl, scene }) => {
            const r = readGpuRenderer(gl.getContext());
            integrated.current = isIntegratedGpu(r);
            if (!forced.current) {
              const t = tierFromGpu(r);
              if (t) setTier(t);
            }
            gl.toneMappingExposure = 0.95;
            gl.setPixelRatio(clampDpr(useScene.getState().tier, integrated.current));
            scene.background = new THREE.Color("#06060a");
            console.info(`[Dive] tier=${useScene.getState().tier} gpu=${r || "?"}`);
            setReady(true);
          }}
        >
          <fog attach="fog" args={["#06060a", 8, 30]} />
          <PerformanceMonitor />
          <Suspense fallback={null}>
            <Scene tier={tier} />
          </Suspense>
          <Effects tier={tier} />
        </Canvas>
      </div>
      <div style={{ height: `${N * 100}vh` }} aria-hidden />
      <Hud />
      <DebugOverlay />
    </>
  );
}
