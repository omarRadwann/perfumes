"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

// Reveal: stagger-fades its direct children up as the block scrolls into view (once).
export function Reveal({
  children,
  className,
  stagger = 0.09,
  y = 28,
  delay = 0,
  start = "top 84%",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const targets = el.children.length ? Array.from(el.children) : [el];
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 1.1,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [stagger, y, delay, start]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Figure: a clip-path reveal on enter + slow vertical parallax on the image inside.
export function Figure({
  src,
  alt,
  className,
  dir = "up",
  parallax = 9,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  dir?: "up" | "left";
  parallax?: number;
  priority?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const w = wrap.current;
    const im = img.current;
    if (!w || !im) return;
    gsap.registerPlugin(ScrollTrigger);
    const from = dir === "left" ? "inset(0 100% 0 0)" : "inset(0 0 100% 0)";
    const ctx = gsap.context(() => {
      gsap.set(im, { scale: 1.14 }); // buffer so parallax never reveals edges
      gsap.from(w, {
        clipPath: from,
        duration: 1.35,
        ease: "power3.out",
        scrollTrigger: { trigger: w, start: "top 86%", once: true },
      });
      gsap.fromTo(
        im,
        { yPercent: -parallax },
        { yPercent: parallax, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true } }
      );
    }, w);
    return () => ctx.revert();
  }, [dir, parallax]);
  return (
    <div ref={wrap} className={className} style={{ overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
