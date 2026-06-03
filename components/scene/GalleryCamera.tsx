"use client";

import * as THREE from "three";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScene, STATION_COUNT } from "@/lib/store";
import { stationZ } from "./Gallery";
import { prefersReducedMotion } from "@/lib/motion";

// CONTINUOUS journey camera. Scroll (float 0..1) scrubs one forward fly-through of
// the arched corridor. The camera always travels FORWARD (no reversing); it DWELLS
// and narrows to a telephoto zoom on each flacon (deep detail), then widens + rises
// to glide through the arch to the next — "one scene that keeps zooming into the
// next." useFrame is the single writer to the camera.
const OFFSET = 2.9; // base distance the camera sits in front of the focus point
const PULL = 1.4; // gentle extra step-back between products
const LIFT = 0.7; // rise between products (a crest over the arch)
const FOV_NEAR = 38; // gentle telephoto compression on the flacon
const FOV_FAR = 46; // slightly wider while flying between (subtle, smooth)
const EYE_Y = 1.6;
const LOOK_Y = 1.5;
const LOOK_X = -0.04;
const CAM_X_PRODUCT = -1.05; // 3/4 framing at the product
const CAM_X_TRAVEL = -0.12; // near-centred flying down the corridor

export function GalleryCamera() {
  const { camera, pointer } = useThree();
  const ready = useScene((s) => s.ready);

  const intro = useRef({ v: 7 });
  const px = useRef(0);
  const py = useRef(0);
  const close = useRef(0);
  const reduce = useRef(false);
  const pos = useRef(new THREE.Vector3(CAM_X_PRODUCT, EYE_Y, OFFSET + 7));
  const look = useRef(new THREE.Vector3(LOOK_X, LOOK_Y, 0));
  const started = useRef(false);

  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (reduce.current) {
      intro.current.v = 0;
      return;
    }
    gsap.to(intro.current, { v: 0, duration: 2.8, ease: "power3.out", overwrite: true });
  }, [ready]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(1e-6, dt); // ~0.23/frame
    const s = useScene.getState().scroll;
    const opened = useScene.getState().opened;
    const N = STATION_COUNT;

    const fidx = Math.max(0, Math.min(N - 1, s * (N - 1)));
    const seg = Math.min(N - 2, Math.floor(fidx));
    const f = fidx - seg;
    const sm = f * f * (3 - 2 * f); // smoothstep → dwell at products, fast between
    const focusZ = stationZ(seg) + (stationZ(seg + 1) - stationZ(seg)) * sm;

    const closeness = (Math.cos(f * Math.PI * 2) + 1) / 2; // 1 at product centres, 0 between
    const camDist = OFFSET + (1 - closeness) * PULL;
    const fov = FOV_NEAR + (1 - closeness) * (FOV_FAR - FOV_NEAR);
    const lift = (1 - closeness) * LIFT;
    const camX = CAM_X_TRAVEL + (CAM_X_PRODUCT - CAM_X_TRAVEL) * closeness;

    close.current += ((opened != null ? 0.8 : 0) - close.current) * k;
    px.current += (pointer.x - px.current) * k;
    py.current += (pointer.y - py.current) * k;

    const tx = camX + px.current * 0.28;
    const ty = EYE_Y + lift - py.current * 0.1;
    const tz = focusZ + camDist + intro.current.v - close.current;

    pos.current.x += (tx - pos.current.x) * k;
    pos.current.y += (ty - pos.current.y) * k;
    pos.current.z += (tz - pos.current.z) * k;
    camera.position.copy(pos.current);

    // smooth FOV → telephoto zoom at products, wide between
    const pcam = camera as THREE.PerspectiveCamera;
    if (Math.abs(pcam.fov - fov) > 0.01) {
      pcam.fov += (fov - pcam.fov) * k;
      pcam.updateProjectionMatrix();
    }

    // look at the flacon; bias the gaze forward down the corridor while flying
    const lookAhead = (1 - closeness) * 2.2;
    look.current.x += (LOOK_X + px.current * 0.07 - look.current.x) * k;
    look.current.y += (LOOK_Y + (1 - closeness) * 0.25 - look.current.y) * k;
    look.current.z += (focusZ - lookAhead - look.current.z) * k;
    camera.lookAt(look.current);
  });

  return null;
}
