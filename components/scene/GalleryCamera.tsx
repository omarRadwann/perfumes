"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScene } from "@/lib/store";
import { STATION_GAP } from "./Gallery";

// Scroll drives a smooth dolly down the gallery (reference step 3: "use scroll to
// move between scenes"). A damped lerp keeps it buttery; pointer adds gentle
// parallax. The opened product pulls the camera slightly closer.
const CAM_DIST = 4.1;
const EYE_Y = 1.8;
const LOOK_Y = 1.65;

export function GalleryCamera() {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, LOOK_Y, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const { active, opened } = useScene.getState();
    const k = 1 - Math.pow(0.0016, dt);
    // Rest framed on the ACTIVE station and glide between them as scroll changes it
    // (keeps the camera and the info panel in sync; never strands on empty hall).
    const targetZ = -active * STATION_GAP;
    const dist = opened != null ? CAM_DIST - 1.1 : CAM_DIST;

    // Offset left of the centred plinths so the camera views each product at a 3/4
    // angle (no clipping) with the product right-of-centre, panel lower-left.
    tmpPos.current.set(-1.35 + pointer.x * 0.4, EYE_Y - pointer.y * 0.15, targetZ + dist);
    tmpLook.current.set(-0.05 + pointer.x * 0.1, LOOK_Y, targetZ);

    camera.position.lerp(tmpPos.current, k);
    look.current.lerp(tmpLook.current, k);
    camera.lookAt(look.current);
  });

  return null;
}
