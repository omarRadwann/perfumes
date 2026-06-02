"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FRAGRANCES } from "@/lib/fragrances";
import { useScene } from "@/lib/store";
import { slotX } from "./Shelf";

// Cinematic camera. Overview: a slow sway + subtle pointer parallax framing the
// whole shelf — the dolly distance adapts to the viewport aspect so all five
// flacons always fit (wide screens come closer, narrow/portrait pull back). On
// select: glides in to frame the chosen flacon slightly left of centre, leaving
// room for the detail panel. Pure damped lerp — no GSAP/useFrame ownership fights.
const LOOK_Y = 1.04;

function overviewZ(aspect: number) {
  if (aspect >= 1.7) return 9.0;
  if (aspect >= 1.4) return 9.8;
  if (aspect >= 1.1) return 11.2;
  if (aspect >= 0.85) return 13.0;
  return 15.0;
}

export function CameraRig() {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, LOOK_Y, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    const { selectedId } = useScene.getState();
    const k = 1 - Math.pow(0.0009, dt);
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1.6;

    if (selectedId) {
      const i = FRAGRANCES.findIndex((f) => f.id === selectedId);
      const x = slotX(i);
      const wide = aspect >= 1;
      const shift = wide ? 1.05 : 0.05;
      const dist = wide ? 4.4 : 5.6;
      tmpPos.current.set(x + shift, 1.16, dist);
      tmpLook.current.set(x + shift, 1.0, 0);
    } else {
      const z = overviewZ(aspect);
      const sway = Math.sin(t.current * 0.18) * 0.4;
      const bob = Math.cos(t.current * 0.13) * 0.07;
      tmpPos.current.set(sway + pointer.x * 0.6, 1.55 + bob - pointer.y * 0.22, z);
      tmpLook.current.set(pointer.x * 0.2, LOOK_Y, 0);
    }

    camera.position.lerp(tmpPos.current, k);
    look.current.lerp(tmpLook.current, k);
    camera.lookAt(look.current);
  });

  return null;
}
