"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Kinetic headline: splits text into words (or chars), each masked in an overflow-hidden
// box and revealed with a staggered rise. CSS-driven (compositor, immune to rAF/focus
// throttling) and triggered by IntersectionObserver — load triggers fire immediately.
// SSR-deterministic + accessible (aria-label on the tag, pieces aria-hidden).
export function Kinetic({
  text,
  as: Tag = "span",
  by = "word",
  className,
  style,
  delay = 0,
  stagger,
  duration = 0.9,
  trigger = "scroll",
}: {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  by?: "word" | "char";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
  duration?: number;
  trigger?: "scroll" | "load";
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");
  const stg = stagger ?? (by === "char" ? 0.03 : 0.07);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || trigger === "load") {
      // load: reveal on the next frame so the masked initial state paints first
      const id = requestAnimationFrame(() => el.classList.add("kin-go"));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("kin-go");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  let idx = 0;
  const vars = {
    ...style,
    ["--kd" as string]: `${duration}s`,
    ["--ks" as string]: `${stg}s`,
    ["--kdelay" as string]: `${delay}s`,
  } as React.CSSProperties;

  return (
    // @ts-expect-error polymorphic tag ref
    <Tag ref={ref} className={`kinetic ${className ?? ""}`} style={vars} aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={wi}
          aria-hidden
          className="kin-mask"
          style={{ marginRight: wi < words.length - 1 ? "0.26em" : 0 }}
        >
          {by === "char"
            ? word.split("").map((ch, ci) => (
                <span key={ci} className="kin-piece" style={{ ["--i" as string]: idx++ } as React.CSSProperties}>
                  {ch}
                </span>
              ))
            : (
                <span className="kin-piece" style={{ ["--i" as string]: idx++ } as React.CSSProperties}>
                  {word}
                </span>
              )}
        </span>
      ))}
    </Tag>
  );
}
