"use client";

import { Reveal } from "./motion";

export function Manifesto() {
  return (
    <section className="bg-cream px-6 py-[14vh] md:px-12">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 md:grid-cols-[0.32fr_0.68fr] md:gap-16">
        <Reveal className="md:pt-3">
          <p className="eyebrow">The House</p>
          <div className="hairline mt-5 max-w-[8rem]" />
        </Reveal>
        <Reveal stagger={0.06}>
          <p className="font-display font-light leading-[1.12] tracking-[-0.01em] text-ink" style={{ fontSize: "clamp(1.9rem, 3.8vw, 3.4rem)" }}>
            Nocté is a study of the dark hours — composed in extrait, never diluted.
          </p>
          <p className="mt-8 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">
            Each fragrance is built like a small architecture: a structure of rare
            materials drawn down to a single, lingering line. Bottled in heavy crystal,
            finished by hand, made in Paris for those who keep their own hours.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
