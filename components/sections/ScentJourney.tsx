"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { withBase } from "@/lib/basePath";
import { prefersReducedMotion } from "@/lib/motion";

type Chapter = {
  num: string;
  title: string;
  line: string;
  accent: string;
  bg: string;
  video?: string;
  poster?: string;
};

const CHAPTERS: Chapter[] = [
  {
    num: "I",
    title: "The Bloom",
    line: "The green hour opens. Petals and leaf suspended in the first cold light, before the day has decided its colour.",
    accent: "#2FA37D",
    bg: "radial-gradient(120% 90% at 28% 18%, rgba(47,163,125,0.22), transparent 55%), radial-gradient(100% 80% at 78% 82%, rgba(230,225,214,0.10), transparent 60%), #07100c",
  },
  {
    num: "II",
    title: "The Depth",
    line: "Down into smoke and dark wood. Incense curls through a single amber beam, and the warmth refuses to leave.",
    accent: "#D08A2C",
    bg: "radial-gradient(120% 90% at 50% 28%, rgba(208,138,44,0.20), transparent 55%), #0a0806",
    video: withBase("/video/ombre.mp4"),
    poster: withBase("/video/ombre.webp"),
  },
  {
    num: "III",
    title: "The Memory",
    line: "A warm haze that remembers. Gold dissolves into violet, and the scent becomes something you can almost see.",
    accent: "#7B4FB0",
    bg: "radial-gradient(120% 90% at 38% 72%, rgba(123,79,176,0.22), transparent 55%), radial-gradient(90% 70% at 66% 28%, rgba(200,162,74,0.14), transparent 60%), #0b0710",
  },
];

export function ScentJourney() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const chapters = useRef<(HTMLDivElement | null)[]>([]);
  const [pinned, setPinned] = useState(false);

  // Enhance to the pinned/crossfade experience only when motion is allowed. SSR + first
  // client render stay "stacked" (matching markup → no hydration mismatch).
  useEffect(() => {
    if (!prefersReducedMotion()) setPinned(true);
  }, []);

  useEffect(() => {
    if (!pinned || !section.current || !stage.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const chs = chapters.current.filter(Boolean) as HTMLDivElement[];
    const texts = chs.map((c) => c.querySelector<HTMLElement>("[data-text]"));

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section.current!,
        start: "top top",
        end: "+=240%",
        pin: stage.current!,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const seg = Math.min(2.999, self.progress * 3);
          const i = Math.floor(seg);
          const frac = seg - i; // 0..1 within chapter i
          chs.forEach((el, k) => (el.style.opacity = "0"));
          let curOpacity = 1;
          if (frac < 0.8 || i === 2) {
            chs[i].style.opacity = "1";
          } else {
            const t = (frac - 0.8) / 0.2;
            curOpacity = 1 - t;
            chs[i].style.opacity = String(1 - t);
            if (chs[i + 1]) chs[i + 1].style.opacity = String(t);
          }
          // text rises as its chapter settles
          texts.forEach((tEl, k) => {
            if (!tEl) return;
            const o = parseFloat(chs[k].style.opacity || "0");
            tEl.style.transform = `translateY(${(1 - o) * 26}px)`;
          });
        },
      });
      return () => st.kill();
    }, section);

    return () => ctx.revert();
  }, [pinned]);

  return (
    <section ref={section} id="journey" className="relative bg-ink">
      <div
        ref={stage}
        className={pinned ? "relative h-screen w-full overflow-hidden" : ""}
      >
        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.num}
            ref={(el) => {
              chapters.current[i] = el;
            }}
            className={
              pinned
                ? "absolute inset-0 flex h-screen w-full items-center justify-center overflow-hidden"
                : "relative flex min-h-screen w-full items-center justify-center overflow-hidden"
            }
            style={{ background: ch.bg, opacity: pinned && i > 0 ? 0 : 1 }}
          >
            {ch.video && (
              // Blurred into an abstract moving glow — keeps the smoke motion while the
              // reused plate's old branding is unreadable. (Swap for a Higgsfield ÉTHEREAL
              // smoke loop in the asset pass.)
              <video
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50"
                style={{ filter: "blur(14px)" }}
                autoPlay
                muted
                loop
                playsInline
                poster={ch.poster}
                aria-hidden
              >
                <source src={ch.video} type="video/mp4" />
              </video>
            )}
            {/* settle vignette — darker through the centre to keep the reused plate abstract */}
            <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(115% 100% at 50% 45%, rgba(10,10,11,0.45) 0%, transparent 30%, rgba(10,10,11,0.7) 100%)" }} />

            <div data-text className="relative z-10 max-w-3xl px-6 text-center will-change-transform">
              <p className="font-display text-sm tracking-[0.5em]" style={{ color: ch.accent }}>
                CHAPTER {ch.num}
              </p>
              <h2
                className="mt-6 font-display font-light leading-[0.95] text-bone"
                style={{ fontSize: "var(--fs-h1)" }}
              >
                {ch.title}
              </h2>
              <p className="mx-auto mt-7 max-w-xl leading-relaxed text-bone/75" style={{ fontSize: "var(--fs-body)" }}>
                {ch.line}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
