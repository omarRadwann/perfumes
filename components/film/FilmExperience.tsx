"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { FRAGRANCES } from "@/lib/fragrances";
import { withBase } from "@/lib/basePath";
import { prefersReducedMotion } from "@/lib/motion";

// Maison Nocté — "Le Film": a scroll-driven cinematic film. Each scent is a
// photoreal animated scene (Seedance, generated from the approved reference stills)
// playing full-bleed under editorial typography. Pure video + DOM — no WebGL, so it
// cannot crash a GPU and runs on any device.

type Film = { key: string; id: string };
const FILMS: Film[] = [
  { key: "ombre", id: "ombre-dor" },
  { key: "velours", id: "velours-rouge" },
  { key: "nuit", id: "nuit-bleue" },
];
const FILM_IDS = new Set(FILMS.map((f) => f.id));
const byId = (id: string) => FRAGRANCES.find((f) => f.id === id)!;
const pad = (n: number) => `0${n}`.slice(-2);

function useInView<T extends HTMLElement>(threshold = 0.55) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

const NOTE_ROWS = [
  ["top", "Tête"],
  ["heart", "Cœur"],
  ["base", "Fond"],
] as const;

function FilmScene({ film, index, reduce }: { film: Film; index: number; reduce: boolean }) {
  const f = byId(film.id);
  const a = f.palette.accent;
  const [ref, inView] = useInView<HTMLElement>(0.5);
  const vid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = vid.current;
    if (!v || reduce) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduce]);

  return (
    <section ref={ref} className="relative h-[100svh] w-full overflow-hidden bg-black">
      {/* full-bleed cinematic scene */}
      {reduce ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={withBase(`/video/${film.key}.webp`)} alt={f.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video
          ref={vid}
          className="absolute inset-0 h-full w-full object-cover"
          src={withBase(`/video/${film.key}.mp4`)}
          poster={withBase(`/video/${film.key}.webp`)}
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* legibility scrims — dark from the bottom-left where the type sits */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-transparent" />

      {/* descent index, right edge */}
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:right-10 md:flex">
        <span className="text-[0.55rem] uppercase tracking-[0.34em] text-white/45">{pad(index + 1)}</span>
        <span className="h-24 w-px bg-white/15" />
        <span className="text-[0.55rem] uppercase tracking-[0.34em] text-white/45">{pad(FRAGRANCES.length)}</span>
      </div>

      {/* editorial typography, anchored bottom-left */}
      <div
        data-rev
        className="absolute bottom-[8vh] left-6 max-w-xl md:left-14"
        style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(28px)", transition: "opacity 1s ease, transform 1.1s cubic-bezier(.16,1,.3,1)" }}
      >
        <p className="mb-3 flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.4em]" style={{ color: a }}>
          <span className="h-px w-8" style={{ background: a }} />
          {pad(index + 1)} — {f.family}
        </p>
        <h2 className="font-display text-[clamp(3.2rem,10vw,8rem)] font-light leading-[0.86] text-white">{f.name}</h2>
        <p className="mt-4 font-display text-2xl italic text-white/70 md:text-3xl">&ldquo;{f.poem}&rdquo;</p>

        <div className="mt-7 grid max-w-md grid-cols-1 gap-1.5 border-t border-white/15 pt-5">
          {NOTE_ROWS.map(([k, label]) => (
            <div key={k} className="grid grid-cols-[3.6rem_1fr] items-baseline gap-4">
              <span className="text-[0.55rem] uppercase tracking-[0.26em]" style={{ color: a }}>{label}</span>
              <span className="text-sm text-white/85">{f.notes[k].join(" · ")}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center gap-6">
          <span className="font-display text-3xl text-white">
            {f.currency}
            {f.price}
          </span>
          <button className="group flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.32em] text-white/80 transition-colors hover:text-white">
            Acquire
            <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: a }}>⟶</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);
  const fade = (d: number) => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : "translateY(20px)",
    transition: `opacity 1.2s ease ${d}s, transform 1.3s cubic-bezier(.16,1,.3,1) ${d}s`,
  });
  return (
    <section className="relative flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#06060a] text-center">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 60% at 50% 42%, rgba(201,169,106,0.10), transparent 70%)" }} />
      <p style={fade(0.1)} className="mb-6 text-[0.62rem] uppercase tracking-[0.55em] text-gold/80">Maison de Parfum · Paris</p>
      <h1 style={fade(0.25)} className="font-display text-[clamp(4rem,18vw,15rem)] font-light leading-[0.82] text-ivory">
        NOCTÉ
      </h1>
      <p style={fade(0.45)} className="mt-6 max-w-md px-6 font-display text-xl italic text-stone-soft md:text-2xl">
        Six extraits composed for the hours after dark.
      </p>
      <div style={fade(0.7)} className="absolute bottom-10 flex flex-col items-center gap-2">
        <span className="text-[0.55rem] uppercase tracking-[0.4em] text-stone-soft">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}

function Collection() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  return (
    <section className="relative w-full bg-[#06060a] px-6 py-[16vh] md:px-14">
      <div ref={ref} className="mx-auto max-w-5xl">
        <p className="mb-2 text-[0.62rem] uppercase tracking-[0.45em] text-gold/80">The Collection</p>
        <h2 className="mb-12 font-display text-[clamp(2.4rem,6vw,5rem)] font-light leading-[0.9] text-ivory">Six Parfums de Nuit</h2>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {FRAGRANCES.map((f, i) => (
            <li
              key={f.id}
              className="group grid grid-cols-[2.2rem_1fr_auto] items-center gap-4 py-6 md:grid-cols-[3rem_1fr_1fr_auto]"
              style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(16px)", transition: `opacity .7s ease ${i * 0.07}s, transform .8s cubic-bezier(.16,1,.3,1) ${i * 0.07}s` }}
            >
              <span className="text-[0.6rem] tracking-[0.2em] text-white/35">{pad(i + 1)}</span>
              <span className="font-display text-2xl text-ivory transition-colors group-hover:text-white md:text-3xl">
                {f.name}
                {FILM_IDS.has(f.id) && <span className="ml-3 align-middle text-[0.5rem] uppercase tracking-[0.3em]" style={{ color: f.palette.accent }}>● Film</span>}
              </span>
              <span className="hidden text-[0.7rem] uppercase tracking-[0.24em] text-stone-soft md:block">{f.family}</span>
              <span className="font-display text-xl text-white/70">
                {f.currency}
                {f.price}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Maison() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  return (
    <section className="relative w-full bg-[#06060a] px-6 py-[18vh] text-center md:px-14">
      <div
        ref={ref}
        className="mx-auto max-w-2xl"
        style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)", transition: "opacity 1s ease, transform 1.1s cubic-bezier(.16,1,.3,1)" }}
      >
        <p className="mb-6 text-[0.62rem] uppercase tracking-[0.45em] text-gold/80">The Maison</p>
        <p className="font-display text-[clamp(1.8rem,4vw,3rem)] font-light italic leading-[1.15] text-ivory">
          Perfume is the most intimate form of memory. Nocté composes for the hours when the city quiets and scent becomes the only light.
        </p>
        <button className="mt-12 inline-flex items-center gap-3 border border-gold/40 px-9 py-4 text-[0.62rem] uppercase tracking-[0.34em] text-ivory transition-colors hover:bg-gold/10">
          Request the Collection
          <span className="text-gold">⟶</span>
        </button>
      </div>
    </section>
  );
}

export function FilmExperience() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(prefersReducedMotion()), []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ lerp: 0.08, wheelMultiplier: 1 });
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
    };
  }, []);

  return (
    <main className="relative bg-[#06060a]">
      {/* fixed wordmark */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-6 md:px-14">
        <span className="font-display text-xl tracking-[0.05em] text-ivory">NOCTÉ</span>
        <span className="hidden text-[0.55rem] uppercase tracking-[0.34em] text-stone-soft md:block">Parfums de Nuit</span>
      </div>
      {/* film grain */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      <Hero />
      {FILMS.map((film) => (
        <FilmScene key={film.id} film={film} index={FRAGRANCES.findIndex((f) => f.id === film.id)} reduce={reduce} />
      ))}
      <Collection />
      <Maison />
      <footer className="bg-[#06060a] px-6 pb-10 pt-6 text-center md:px-14">
        <p className="text-[0.55rem] uppercase tracking-[0.34em] text-stone-soft">Maison Nocté · Paris · Parfums de Nuit</p>
      </footer>
    </main>
  );
}
