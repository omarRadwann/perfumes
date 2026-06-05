"use client";

import { Reveal } from "@/components/fx/motion";

// One large pull-quote on near-black + hairline. The calm after the hero.
export function Manifesto() {
  return (
    <section id="manifesto" className="relative bg-ink px-6 py-[18vh] md:px-12">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 md:grid-cols-[0.32fr_0.68fr] md:gap-16">
        <Reveal className="md:pt-3">
          <p className="eyebrow">The House</p>
          <div className="hairline mt-5 max-w-[8rem]" />
        </Reveal>
        <Reveal stagger={0.06}>
          <p
            className="font-display font-light leading-[1.1] tracking-[-0.01em] text-bone"
            style={{ fontSize: "clamp(1.9rem, 4.2vw, 3.6rem)" }}
          >
            ÉTHEREAL is a study of the invisible — scent composed as light, and worn like a second skin.
          </p>
          <p className="mt-8 max-w-2xl leading-relaxed text-muted" style={{ fontSize: "var(--fs-body)" }}>
            Each fragrance is built like a small architecture: rare materials drawn down to a single, lingering
            line. Six compositions, six worlds — made in small batches, finished by hand, and never said out loud.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
