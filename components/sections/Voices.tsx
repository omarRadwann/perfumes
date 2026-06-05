"use client";

import { Reveal } from "@/components/fx/motion";

const QUOTES = [
  { quote: "I wore Noir Solaire to a winter dinner. By dessert, two strangers had asked its name.", who: "A.M.", where: "Paris" },
  { quote: "Cobalt Hour smells like the sea the moment before it turns black. I have never been complimented more.", who: "J.R.", where: "Lisbon" },
  { quote: "Verdane is a garden I can carry. It reads differently in every weather, on every wrist.", who: "L.K.", where: "Copenhagen" },
  { quote: "Fumée Rare never announces itself. It simply waits until someone leans in.", who: "D.S.", where: "New York" },
];

export function Voices() {
  return (
    <section id="voices" className="relative overflow-hidden bg-ink px-6 py-[18vh] md:px-12">
      <div className="mx-auto max-w-[1300px]">
        <Reveal>
          <p className="eyebrow text-center">Voices</p>
          <p
            className="mx-auto mt-6 max-w-xl text-center font-display font-light leading-[1.1] text-bone"
            style={{ fontSize: "var(--fs-h3)" }}
          >
            What lingers, in their words.
          </p>
        </Reveal>

        <Reveal className="mt-[8vh] grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10" stagger={0.12} y={36}>
          {QUOTES.map((q, i) => (
            <div key={i} className={i % 2 === 1 ? "md:mt-16" : ""}>
              <figure
                className="float rounded-[2px] border border-line p-8 md:p-10"
                style={{ background: "rgba(18,18,20,0.5)", ["--ft" as string]: `${7 + i}s`, ["--fd" as string]: `${i * 0.6}s` }}
              >
                <blockquote className="font-display text-xl italic leading-snug text-bone/90 md:text-2xl">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.28em] text-muted">
                  <span aria-hidden className="h-px w-6" style={{ background: "var(--accent)" }} />
                  {q.who} · {q.where}
                </figcaption>
              </figure>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
