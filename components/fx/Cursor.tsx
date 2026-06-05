"use client";

import { useEffect, useRef } from "react";

// Champagne ring + dot cursor that trails the pointer and swells over links/buttons.
// Desktop (fine pointer) only. Decoupled from any store.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;
    document.body.classList.add("cursor-ring");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rp = { ...pos };
    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 2.5}px, ${e.clientY - 2.5}px)`;
    };
    const swell = (v: string) => (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("a, button, [data-interactive]")) ring.current?.style.setProperty("--s", v);
    };
    const over = swell("2.1");
    const out = swell("1");
    let raf = 0;
    const loop = () => {
      rp.x += (pos.x - rp.x) * 0.2;
      rp.y += (pos.y - rp.y) * 0.2;
      if (ring.current) ring.current.style.transform = `translate(${rp.x}px, ${rp.y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-ring");
    };
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring-el" aria-hidden />
    </>
  );
}
