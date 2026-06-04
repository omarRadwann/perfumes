"use client";

import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA, DepthOfField } from "@react-three/postprocessing";
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
import { prefersReducedMotion } from "@/lib/motion";
import { DebugOverlay } from "./DebugOverlay";
import { Hud } from "./Hud";
import { CrystalFlacon } from "./CrystalFlacon";

const N = FRAGRANCES.length;
const GAP = 9;

// Each flacon's anchor along the descent (deeper + lower + gentle lateral drift).
const flaconPos = (i: number) => new THREE.Vector3(Math.sin(i * 1.3) * 1.5, -i * 1.7, -i * GAP);
const smoothstep = (f: number) => f * f * (3 - 2 * f);

// per-scent nocturnal void tints — the world's mood shifts as you descend
const ATMOS = ["#06060a", "#100b04", "#0e0507", "#05070f", "#0a0a0d", "#100c07"].map((h) => new THREE.Color(h));

// per-world fog depth — smoke worlds close in, the starfield opens up
const FOG_FAR = [30, 28, 26, 38, 24, 30];

// Each scent inhabits its own atmosphere: ink-smoke, rising embers, drifting
// rose dust, a cold starfield, slow lunar smoke, warm sandal haze. Distinct in
// colour + density + size + speed so the six worlds read apart, not just the bottles.
type WorldAir = { color: string; count: number; size: number; speed: number; opacity: number; noise: number; scale: [number, number, number] };
const WORLD_ATMOS: WorldAir[] = [
  { color: "#b9a98a", count: 26, size: 1.6, speed: 0.05, opacity: 0.3, noise: 1.3, scale: [6, 7, 6] }, // Noir d'Encre — ink smoke
  { color: "#ffb24d", count: 64, size: 2.5, speed: 0.55, opacity: 0.75, noise: 2.2, scale: [6, 7.5, 6] }, // Ombre d'Or — rising embers
  { color: "#d8556b", count: 74, size: 2.7, speed: 0.16, opacity: 0.55, noise: 0.9, scale: [6.5, 7, 6.5] }, // Velours Rouge — rose dust
  { color: "#cdd8ff", count: 120, size: 1.25, speed: 0.03, opacity: 0.85, noise: 0.35, scale: [10, 10, 10] }, // Nuit Bleue — cold starfield
  { color: "#aeb6bd", count: 40, size: 2.9, speed: 0.09, opacity: 0.42, noise: 1.7, scale: [6, 7, 6] }, // Éclipse — lunar smoke
  { color: "#ffd9a0", count: 52, size: 2.1, speed: 0.12, opacity: 0.6, noise: 1.0, scale: [6, 6.5, 6] }, // Santal Ivoire — sandal haze
];

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
  const far = useRef(FOG_FAR[0]);
  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0015, dt);
    const { seg, f } = curFocus();
    const target = ATMOS[seg].clone().lerp(ATMOS[seg + 1], f);
    cur.current.lerp(target, k);
    far.current += (THREE.MathUtils.lerp(FOG_FAR[seg], FOG_FAR[seg + 1], f) - far.current) * k;
    if (scene.background instanceof THREE.Color) scene.background.copy(cur.current);
    if (scene.fog) {
      (scene.fog as THREE.Fog).color.copy(cur.current);
      (scene.fog as THREE.Fog).far = far.current;
    }
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

function Effects({ tier, perf }: { tier: QualityTier; perf: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bloom = useRef<any>(null);
  const base = tier === "high" ? 0.62 : 0.46;
  // Bloom swells as the camera passes between worlds — a veil of light to fall
  // through (the cheap, robust cousin of an FBO portal), calm again at each flacon.
  useFrame(() => {
    if (!bloom.current) return;
    const { f } = curFocus();
    const m = Math.sin(Math.max(0, Math.min(1, f)) * Math.PI);
    bloom.current.intensity = base + m * 0.5;
  });
  if (tier === "safe") return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      {/* macro focus-pull: the focal flacon stays crisp (camera holds ~5.6u from it),
          neighbouring worlds melt to bokeh — the cinematic "deep details" look. */}
      {tier === "high" && perf < 1 ? (
        <DepthOfField worldFocusDistance={5.6} worldFocusRange={5.5} bokehScale={2.6} />
      ) : (
        <></>
      )}
      <Bloom ref={bloom} mipmapBlur intensity={base} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
      <Vignette offset={0.3} darkness={0.72} />
    </EffectComposer>
  );
}

// The drifting medium each scent lives in. One localized field per world (faded
// by fog at distance) — never a single global dust, which would flatten all six.
function WorldAtmosphere({ i, tier }: { i: number; tier: QualityTier }) {
  const a = WORLD_ATMOS[i];
  const pos = flaconPos(i);
  const count = tier === "high" ? a.count : Math.round(a.count * 0.55);
  return (
    <Sparkles
      count={count}
      scale={a.scale}
      position={[pos.x, pos.y + 0.4, pos.z]}
      size={a.size}
      speed={a.speed}
      opacity={a.opacity}
      color={a.color}
      noise={a.noise}
    />
  );
}

function Flacon({ i, tier }: { i: number; tier: QualityTier }) {
  const spin = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);
  const key = useRef<THREE.PointLight>(null);
  const acc = useRef<THREE.PointLight>(null);
  const p = FRAGRANCES[i].palette;
  const phase = i * 1.7;
  useFrame((state, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.14;
    const t = state.clock.elapsedTime;
    if (bob.current) {
      const isActive = useScene.getState().active === i;
      const k = 1 - Math.pow(0.05, dt);
      bob.current.position.y = Math.sin(t * 0.5 + phase) * 0.07;
      // the focal flacon swells almost imperceptibly and leans toward the lens — an arrival beat
      const want = isActive ? 1.66 : 1.5;
      bob.current.scale.setScalar(bob.current.scale.x + (want - bob.current.scale.x) * k);
      const tilt = isActive ? 0.1 : 0;
      bob.current.rotation.x += (tilt - bob.current.rotation.x) * k;
    }
    // each world lights up as the camera arrives, and dims behind you → depth
    const sc = useScene.getState().scroll;
    const fidx = Math.max(0, Math.min(N - 1, sc * (N - 1)));
    const flare = Math.max(0, 1 - Math.abs(fidx - i)) ** 2;
    if (key.current) key.current.intensity = 2.2 + flare * 1.5;
    if (acc.current) acc.current.intensity = 1.3 + flare * 1.1;
  });
  const pos = flaconPos(i);
  return (
    <group position={pos}>
      <group ref={bob} scale={1.5} position={[0, -0.55, 0]}>
        <group ref={spin}>
          <CrystalFlacon i={i} tier={tier} />
        </group>
      </group>
      {/* per-scent colored glow — lights the juice + label from the front,
          kept low so the metal cap catches highlights instead of blooming out */}
      <pointLight ref={key} position={[0, 0.35, 1.9]} intensity={2.2} distance={11} decay={2} color={p.light} />
      <pointLight ref={acc} position={[-1.5, 0.5, 0.7]} intensity={1.3} distance={7} decay={2} color={p.accent} />
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

function Scene({ tier, perf }: { tier: QualityTier; perf: number }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <Environment resolution={tier === "high" ? 512 : 256} frames={1}>
        <Lightformer form="rect" intensity={0.8} color="#fff3df" scale={[10, 10, 1]} position={[0, 6, 8]} />
        <Lightformer form="rect" intensity={0.5} color="#9fb4ff" scale={[8, 8, 1]} position={[-8, 2, -6]} rotation={[0, Math.PI / 3, 0]} />
        {/* tall narrow softbox streaks — the vertical highlight that makes glass + metal
            read as expensive product photography rather than plain shiny */}
        <Lightformer form="rect" intensity={2.0} color="#ffffff" scale={[0.5, 6, 1]} position={[2.6, 1.4, 4.2]} />
        <Lightformer form="rect" intensity={1.1} color="#ffe7c6" scale={[0.35, 5, 1]} position={[-2.8, 1.0, 3.4]} />
      </Environment>
      {FRAGRANCES.map((_, i) => (
        <Flacon key={i} i={i} tier={tier} />
      ))}
      {tier !== "safe" && perf < 2 && FRAGRANCES.map((_, i) => <WorldAtmosphere key={`air-${i}`} i={i} tier={tier} />)}
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
  // adaptive quality level: 0 full · 1 drop DoF · 2 drop DoF + thin particles
  const [perf, setPerf] = useState(0);

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
          shadows={false}
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
            // Transmission renders the whole scene to an offscreen buffer each frame;
            // half-res keeps the refraction convincing at a fraction of the fill cost.
            const grm = gl as unknown as { transmissionResolutionScale?: number };
            const hasTRS = "transmissionResolutionScale" in gl;
            if (hasTRS) grm.transmissionResolutionScale = tier === "high" ? 0.5 : 0.4;
            scene.background = new THREE.Color("#06060a");
            console.info(`[Dive] tier=${useScene.getState().tier} gpu=${r || "?"} transmissionScale=${hasTRS ? grm.transmissionResolutionScale : "UNSUPPORTED"}`);
            setReady(true);
          }}
        >
          <fog attach="fog" args={["#06060a", 8, 30]} />
          <PerformanceMonitor
            onDecline={() => setPerf((p) => Math.min(2, p + 1))}
            onIncline={() => setPerf((p) => Math.max(0, p - 1))}
          >
            <AdaptiveDpr pixelated={false} />
          </PerformanceMonitor>
          <Suspense fallback={null}>
            <Scene tier={tier} perf={perf} />
          </Suspense>
          <Effects tier={tier} perf={perf} />
        </Canvas>
      </div>
      <div style={{ height: `${N * 100}vh` }} aria-hidden />
      <Hud />
      <DebugOverlay />
    </>
  );
}
