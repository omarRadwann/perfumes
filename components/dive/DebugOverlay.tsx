"use client";

import { useEffect, useState } from "react";
import { useScene } from "@/lib/store";

// Diagnostic overlay (FitSole §8). Toggle: ?debug=1 or Shift+D. Off by default.
export function DebugOverlay() {
  const debug = useScene((s) => s.debug);
  const setDebug = useScene((s) => s.setDebug);
  const tier = useScene((s) => s.tier);
  const scroll = useScene((s) => s.scroll);
  const [fps, setFps] = useState(0);
  const [gpu, setGpu] = useState("…");
  const [dpr, setDpr] = useState(0);
  const [webgl2, setWebgl2] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("debug") === "1") setDebug(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "d") setDebug(!useScene.getState().debug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDebug]);

  useEffect(() => {
    if (!debug) return;
    setDpr(Math.round((window.devicePixelRatio || 1) * 100) / 100);
    try {
      const c = document.createElement("canvas");
      const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      setWebgl2(!!c.getContext("webgl2"));
      const e = gl?.getExtension("WEBGL_debug_renderer_info");
      setGpu(e && gl ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : "n/a");
    } catch {
      setGpu("n/a");
    }
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames);
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [debug]);

  if (!debug) return null;
  const lines = [
    `TIER:    ${tier.toUpperCase()}`,
    `DPR:     ${dpr}  (floor 1.0)`,
    `WEBGL2:  ${webgl2 ? "yes" : "no"}`,
    `GPU:     ${gpu.slice(0, 48)}`,
    `FPS:     ${fps}`,
    `SCROLL:  ${scroll.toFixed(3)}`,
  ].join("\n");
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 100,
        font: "11px/1.55 ui-monospace, Menlo, monospace",
        color: "#bfe9c8",
        background: "rgba(0,0,0,0.72)",
        padding: "10px 13px",
        whiteSpace: "pre",
        pointerEvents: "none",
        letterSpacing: "0.02em",
        borderLeft: "2px solid #b8924f",
      }}
    >
      {lines}
    </div>
  );
}
