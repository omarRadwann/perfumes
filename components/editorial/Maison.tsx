"use client";

import { withBase } from "@/lib/basePath";
import { Reveal, Figure } from "./motion";

// Full-bleed pull-quote band to break the rhythm between features.
export function Interlude({ quote, attribution }: { quote: string; attribution?: string }) {
  return (
    <section className="bg-ink px-6 py-[18vh] text-center md:px-12">
      <Reveal className="mx-auto max-w-4xl">
        <p className="font-display font-light italic leading-[1.15] text-ivory" style={{ fontSize: "clamp(1.9rem, 4.4vw, 3.6rem)" }}>
          “{quote}”
        </p>
        {attribution && <p className="mt-8 text-[0.66rem] uppercase tracking-[0.4em] text-stone-soft">{attribution}</p>}
      </Reveal>
    </section>
  );
}

export function Maison() {
  return (
    <section id="maison" className="bg-cream px-6 py-[15vh] md:px-12">
      <Reveal className="mx-auto max-w-3xl text-center" stagger={0.08}>
        <p className="eyebrow">The Maison</p>
        <h2 className="mt-5 font-display font-light leading-[1.04] text-ink" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
          Composed in shadow, worn in light
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          Maison Nocté works in extrait de parfum — the highest concentration, the longest
          memory. Our perfumers begin after dusk, building each composition from raw oud,
          aged ambers, cold iris and smoked woods, then drawing it down to a single
          unmistakable signature.
        </p>
        <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          Every flacon is poured into heavy crystal, sealed by hand, and numbered. Six
          fragrances. One house. Made in Paris for the hours after dark.
        </p>
      </Reveal>

      <Figure
        src={withBase("/img/marble.jpg")}
        alt="Maison Nocté atelier"
        className="mx-auto mt-16 aspect-[16/7] w-full max-w-[1300px]"
        parallax={7}
      />
    </section>
  );
}
