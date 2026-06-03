"use client";

import * as THREE from "three";
import { useMemo } from "react";

// A soft cream wall spanning the corridor with a tall arched opening — the Cartier
// signature. Used as a fly-through PORTAL (camera passes through the arch) and, with
// a back panel behind it, as the arched NICHE that frames each product.
interface Props {
  position?: [number, number, number];
  width?: number;
  height?: number;
  archWidth?: number;
  archHeight?: number;
  spring?: number; // height where the arch curve begins
  depth?: number;
  color?: string;
  roughness?: number;
}

export function ArchWall({
  position = [0, 0, 0],
  width = 9,
  height = 7.5,
  archWidth = 3.4,
  archHeight = 5.4,
  spring = 3.0,
  depth = 0.5,
  color = "#efe7d9",
  roughness = 0.92,
}: Props) {
  const geo = useMemo(() => {
    const W = width;
    const H = height;
    const hw = archWidth / 2;
    const ry = archHeight - spring;

    const wall = new THREE.Shape();
    wall.moveTo(-W / 2, 0);
    wall.lineTo(W / 2, 0);
    wall.lineTo(W / 2, H);
    wall.lineTo(-W / 2, H);
    wall.closePath();

    // arch-shaped hole (rectangle base + elliptical top), drawn as an explicit loop
    const hole = new THREE.Path();
    hole.moveTo(-hw, 0);
    hole.lineTo(-hw, spring);
    const segs = 28;
    for (let i = 0; i <= segs; i++) {
      const a = Math.PI - (i / segs) * Math.PI; // π → 0, sweeping over the top
      hole.lineTo(Math.cos(a) * hw, spring + Math.sin(a) * ry);
    }
    hole.lineTo(hw, 0);
    hole.lineTo(-hw, 0);
    wall.holes.push(hole);

    const g = new THREE.ExtrudeGeometry(wall, { depth, bevelEnabled: false, steps: 1 });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  }, [width, height, archWidth, archHeight, spring, depth]);

  return (
    <mesh geometry={geo} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={0} side={THREE.DoubleSide} envMapIntensity={0.5} />
    </mesh>
  );
}
