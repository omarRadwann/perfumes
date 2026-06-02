import * as THREE from "three";
import type { Fragrance } from "./fragrances";

// Build the bottle's front label as a crisp canvas texture (gold typography on a
// transparent ground). Doing it procedurally — instead of a generated image —
// guarantees perfect alpha, razor-sharp text at any DPR, on-brand colour, and zero
// asset weight / 404 risk. Mapped onto a thin plane on the flacon's front face.
export function makeLabelTexture(f: Fragrance): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, S, S);
  const gold = "#e9cd88";
  const ink = "#ecd9a6";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // maison
  ctx.fillStyle = ink;
  ctx.font = "600 30px Georgia, 'Times New Roman', serif";
  try { ctx.letterSpacing = "12px"; } catch {}
  ctx.fillText("NOCTÉ", S / 2 + 6, 150);

  // top rule
  try { ctx.letterSpacing = "0px"; } catch {}
  ctx.fillStyle = gold;
  ctx.fillRect(S / 2 - 64, 182, 128, 1.5);

  // fragrance name (1–2 lines, auto-fit)
  const words = f.name.split(" ");
  const lines = words.length >= 2 ? [words[0], words.slice(1).join(" ")] : [f.name];
  ctx.fillStyle = ink;
  const fit = (text: string, base: number) => {
    let size = base;
    do {
      ctx.font = `italic 400 ${size}px Georgia, 'Times New Roman', serif`;
      if (ctx.measureText(text).width <= S - 90) break;
      size -= 2;
    } while (size > 20);
    return size;
  };
  try { ctx.letterSpacing = "1px"; } catch {}
  if (lines.length === 1) {
    fit(lines[0], 58);
    ctx.fillText(lines[0], S / 2, 270);
  } else {
    fit(lines[0], 54);
    ctx.fillText(lines[0], S / 2, 248);
    fit(lines[1], 54);
    ctx.fillText(lines[1], S / 2, 306);
  }

  // bottom rule + concentration
  ctx.fillStyle = gold;
  ctx.fillRect(S / 2 - 40, 350, 80, 1);
  ctx.fillStyle = ink;
  ctx.font = "500 19px Georgia, 'Times New Roman', serif";
  try { ctx.letterSpacing = "7px"; } catch {}
  ctx.fillText("EXTRAIT", S / 2 + 4, 392);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
