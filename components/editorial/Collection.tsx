"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAGRANCES } from "@/lib/fragrances";
import { withBase } from "@/lib/basePath";
import { prefersReducedMotion } from "@/lib/motion";

const pad = (n: number) => `0${n}`.slice(-2);

// Pinned horizontal-scroll strip on desktop; native horizontal swipe on mobile.
export function Collection() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || window.innerWidth < 900) return;
    gsap.registerPlugin(ScrollTrigger);
    const s = section.current;
    const t = track.current;
    if (!s || !t) return;
    s.style.overflow = "hidden";
    const ctx = gsap.context(() => {
      gsap.to(t, {
        x: () => -(t.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: () => "+=" + (t.scrollWidth - window.innerWidth),
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, s);
    return () => ctx.revert();
  }, []);

  return (
    <section id="collection" ref={section} className="collection-section bg-ivory">
      <div ref={track} className="collection-track">
        <div className="collection-intro">
          <p className="eyebrow">The Collection</p>
          <h2 className="mt-4 font-display font-light leading-[0.95] text-ink" style={{ fontSize: "clamp(2.4rem, 5vw, 4.6rem)" }}>
            Six
            <br />
            Compositions
          </h2>
          <p className="mt-6 max-w-[18rem] text-sm leading-relaxed text-ink-soft">
            A house in six chapters. Drift through, then descend into each.
          </p>
        </div>

        {FRAGRANCES.map((f, i) => (
          <a key={f.id} href={`#scent-${f.id}`} className="collection-card">
            <span className="font-display text-lg text-stone">
              {pad(i + 1)} <span className="text-stone-soft">— {pad(FRAGRANCES.length)}</span>
            </span>
            <div className="collection-card-img bg-marble">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(`/img/flacon-${f.id}.jpg`)} alt={f.name} loading="lazy" />
            </div>
            <h3 className="mt-5 font-display text-3xl leading-tight text-ink">{f.name}</h3>
            <p className="eyebrow mt-2" style={{ color: "var(--color-stone)" }}>
              {f.family}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
