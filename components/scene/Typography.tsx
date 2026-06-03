"use client";

import { Text3D, Center } from "@react-three/drei";
import type { QualityTier } from "@/lib/deviceTier";
import { withBase } from "@/lib/basePath";

const FONT = withBase("/fonts/serif.json");

// ASCII-fold (the bundled typeface lacks accented glyphs): É→E etc., keep apostrophes.
export const displayName = (s: string) =>
  s.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

interface Props {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
  color?: string;
  tier: QualityTier;
}

// Large extruded serif lettering staged in the 3D space — the scent name standing in
// its arched room, revealed as the camera flies in (depth-of-field does the reveal).
export function SceneTitle({ text, position, rotation, size = 0.82, color = "#f0e7d6", tier }: Props) {
  const curveSegments = tier === "high" ? 8 : tier === "standard" ? 5 : 3;
  const bevelSegments = tier === "safe" ? 0 : 2;
  return (
    <Center position={position} rotation={rotation}>
      <Text3D
        font={FONT}
        size={size}
        height={0.16}
        curveSegments={curveSegments}
        bevelEnabled={tier !== "safe"}
        bevelThickness={0.02}
        bevelSize={0.012}
        bevelOffset={0}
        bevelSegments={bevelSegments}
        letterSpacing={0.02}
      >
        {text}
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.12} envMapIntensity={0.5} />
      </Text3D>
    </Center>
  );
}
