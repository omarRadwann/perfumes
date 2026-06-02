"use client";

import { useEffect, useRef } from "react";
import { useScene } from "@/lib/store";

// Fine champagne ring + dot cursor that trails the pointer and swells over the
// active product. Desktop (fine pointer) only.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const hovered = useScene((s) => s.hovered);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.body.classList.add("cursor-ring");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rp = { ...pos };
    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 2.5}px, ${e.clientY - 2.5}px)`;
    };
    let raf = 0;
    const loop = () => {
      rp.x += (pos.x - rp.x) * 0.2;
      rp.y += (pos.y - rp.y) * 0.2;
      if (ring.current) ring.current.style.transform = `translate(${rp.x}px, ${rp.y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-ring");
    };
  }, []);

  useEffect(() => {
    ring.current?.style.setProperty("--s", hovered ? "2.3" : "1");
  }, [hovered]);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring-el" aria-hidden />
    </>
  );
}
