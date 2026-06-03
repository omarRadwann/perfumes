"use client";

import * as THREE from "three";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScene } from "@/lib/store";
import { STATION_GAP } from "./Gallery";
import { prefersReducedMotion } from "@/lib/motion";

// Choreographed gallery camera. GSAP tweens the *base* pose (camBase/lookBase) and
// a transition *arc*; useFrame is the single writer to the real camera, adding
// smoothed pointer parallax + the opened-product push-in. This keeps GSAP and the
// render loop from fighting over camera.position.
const CAM_DIST = 3.85;
const EYE_Y = 1.78;
const LOOK_Y = 1.62;
const CAM_X = -1.35; // viewing the centred plinths from a 3/4 angle
const LOOK_X = -0.05;
const stationZ = (i: number) => -i * STATION_GAP;

export function GalleryCamera() {
  const { camera, pointer } = useThree();
  const active = useScene((s) => s.active);
  const ready = useScene((s) => s.ready);

  // establishing pose at boot (intro pushes in from here)
  const camBase = useRef(new THREE.Vector3(0, EYE_Y + 1.5, stationZ(0) + CAM_DIST + 6.5));
  const lookBase = useRef(new THREE.Vector3(LOOK_X, LOOK_Y + 0.3, stationZ(0)));
  const arc = useRef({ y: 0 });
  const look = useRef(new THREE.Vector3().copy(lookBase.current));
  const close = useRef(0);
  const px = useRef(0);
  const py = useRef(0);
  const firstRun = useRef(true);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, []);

  // Glide the FULL camera pose to the active alcove. First run (once ready) is the
  // cinematic intro push-in from the establishing pose; later runs are quicker
  // eased transitions with a gentle vertical arc. Tweening x,y,z every time keeps
  // the 3/4 lateral offset locked in.
  useEffect(() => {
    if (!ready) return;
    const cam = { x: CAM_X, y: EYE_Y, z: stationZ(active) + CAM_DIST };
    const lk = { x: LOOK_X, y: LOOK_Y, z: stationZ(active) };
    if (reduce.current) {
      camBase.current.set(cam.x, cam.y, cam.z);
      lookBase.current.set(lk.x, lk.y, lk.z);
      firstRun.current = false;
      return;
    }
    const intro = firstRun.current;
    firstRun.current = false;
    const dur = intro ? 2.6 : 1.3;
    const ease = intro ? "power3.out" : "power3.inOut";
    gsap.to(camBase.current, { x: cam.x, y: cam.y, z: cam.z, duration: dur, ease, overwrite: true });
    gsap.to(lookBase.current, { x: lk.x, y: lk.y, z: lk.z, duration: dur, ease, overwrite: true });
    if (!intro) {
      gsap.to(arc.current, {
        keyframes: [
          { y: 0.3, duration: 0.65, ease: "power2.out" },
          { y: 0, duration: 0.65, ease: "power2.in" },
        ],
        overwrite: true,
      });
    }
  }, [active, ready]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.0009, dt);
    const opened = useScene.getState().opened;
    close.current += ((opened != null ? 1.1 : 0) - close.current) * k;
    px.current += (pointer.x - px.current) * k;
    py.current += (pointer.y - py.current) * k;

    camera.position.set(
      camBase.current.x + px.current * 0.45,
      camBase.current.y + arc.current.y - py.current * 0.15,
      camBase.current.z - close.current
    );
    look.current.set(lookBase.current.x + px.current * 0.12, lookBase.current.y, lookBase.current.z);
    camera.lookAt(look.current);
  });

  return null;
}
