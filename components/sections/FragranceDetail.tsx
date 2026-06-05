"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/basePath";
import { useScene } from "@/lib/store";
import type { Fragrance } from "@/lib/fragrances";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { Cursor } from "@/components/fx/Cursor";
import { AccentDriver } from "@/components/fx/AccentDriver";
import { AudioToggle } from "@/components/fx/AudioToggle";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/fx/motion";
import { NotesPyramid } from "@/components/ui/NotesPyramid";
import { SvgFlacon } from "@/components/ui/SvgFlacon";

export function FragranceDetail({ f }: { f: Fragrance }) {
  const setActiveScent = useScene((s) => s.setActiveScent);
  const addToBag = useScene((s) => s.addToBag);
  const [size, setSize] = useState(f.sizes[0]);
  const [added, setAdded] = useState(false);

  // Theme the whole page (accent + future bottle) to this scent.
  useEffect(() => {
    setActiveScent(f.id);
  }, [f.id, setActiveScent]);

  const onAdd = () => {
    addToBag();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <SmoothScroll />
      <Cursor />
      <AccentDriver />
      <AudioToggle />
      <Nav home />
      <main id="main">
        {/* product hero */}
        <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-28 md:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px]"
            style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
          />
          <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <div className="flex justify-center">
              <div className="float">
                <SvgFlacon palette={f.palette} name={f.name} className="h-[52vmin] max-h-[540px] w-auto" />
              </div>
            </div>

            <div className="reveal">
              <a
                href={`${withBase("/")}#shop`}
                className="text-[0.66rem] uppercase tracking-[0.28em] text-muted transition-colors hover:text-bone"
                data-interactive
              >
                ← The Collection
              </a>
              <p className="eyebrow mt-6" style={{ color: "var(--accent)" }}>
                {f.family}
              </p>
              <h1 className="mt-4 font-display font-light leading-[0.92] text-bone" style={{ fontSize: "var(--fs-hero)" }}>
                {f.name}
              </h1>
              <p className="mt-5 font-display text-2xl italic text-muted md:text-[1.7rem]">{f.poem}</p>
              <p className="mt-3 text-[0.7rem] uppercase tracking-[0.3em] text-muted">
                {f.character} · {f.concentration}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <span className="font-display text-4xl text-bone">
                  {f.currency}
                  {f.price}
                </span>
                <div className="flex gap-2">
                  {f.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      data-interactive
                      aria-pressed={size === s}
                      className="border px-4 py-2 text-[0.68rem] uppercase tracking-[0.2em] transition-colors"
                      style={{
                        borderColor: size === s ? "var(--accent)" : "rgba(244,239,230,0.18)",
                        color: size === s ? "var(--color-bone)" : "var(--color-muted)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={onAdd} className="btn-gold mt-8" data-interactive>
                {added ? "Added to Bag ✓" : `Add to Bag — ${size}`}
              </button>
            </div>
          </div>
        </section>

        {/* composition / notes pyramid */}
        <section className="relative bg-ink px-6 py-[16vh] md:px-12">
          <Reveal className="mx-auto mb-[8vh] max-w-2xl text-center">
            <p className="eyebrow">The Composition</p>
            <p className="mt-5 font-display font-light text-bone" style={{ fontSize: "var(--fs-h3)" }}>
              How it unfolds, top to base.
            </p>
          </Reveal>
          <NotesPyramid notes={f.notes} />
        </section>

        {/* story */}
        <section className="relative bg-panel px-6 py-[16vh] md:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="eyebrow">The Story</p>
              <p
                className="mt-8 font-display font-light leading-[1.28] text-bone"
                style={{ fontSize: "var(--fs-h2)" }}
              >
                {f.story}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
