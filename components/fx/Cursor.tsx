"use client";

import { useEffect, useRef } from "react";

// Champagne ring + dot + a trailing accent "candlelight" glow, plus magnetic pull on
// [data-magnetic] targets. Desktop (fine pointer) only.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) return;
    document.body.classList.add("cursor-ring");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rp = { ...pos }; // ring (medium lag)
    const gp = { ...pos }; // glow (heavy lag)

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 2.5}px, ${e.clientY - 2.5}px)`;

      // magnetic pull on nearby targets
      const mags = document.querySelectorAll<HTMLElement>("[data-magnetic]");
      mags.forEach((m) => {
        const r = m.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const radius = Math.max(r.width, r.height) * 0.75 + 60;
        if (Math.hypot(dx, dy) < radius) {
          m.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
        } else if (m.style.transform) {
          m.style.transform = "";
        }
      });
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
      gp.x += (pos.x - gp.x) * 0.085;
      gp.y += (pos.y - gp.y) * 0.085;
      if (ring.current) ring.current.style.transform = `translate(${rp.x}px, ${rp.y}px) translate(-50%, -50%)`;
      if (glow.current) glow.current.style.transform = `translate(${gp.x}px, ${gp.y}px) translate(-50%, -50%)`;
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
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((m) => (m.style.transform = ""));
    };
  }, []);

  return (
    <>
      <div ref={glow} className="cursor-glow" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring-el" aria-hidden />
    </>
  );
}
