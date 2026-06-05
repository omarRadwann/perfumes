import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { Cursor } from "@/components/fx/Cursor";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { FRAGRANCES } from "@/lib/fragrances";

// ÉTHEREAL — a single long scroll: a luminous hero bottle, then the collection,
// the journey, the atelier and the shop. Phases 2–5 insert their sections between
// the Manifesto and the Footer.
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        {/* Phase 2 → #library · Phase 3 → #journey · Phase 4 → #atelier/voices · Phase 5 → #shop */}
        <Footer />
      </main>

      {/* Crawlable content for SEO + screen readers (the visual experience is client-rendered). */}
      <div className="sr-only">
        <h1>ÉTHEREAL — Awaken the Senses</h1>
        <p>Scent, made visible. Six fragrances, six worlds — composed in eau de parfum and extrait.</p>
        {FRAGRANCES.map((f) => (
          <section key={f.id}>
            <h2>{f.name}</h2>
            <p>
              {f.family} · {f.concentration} · {f.currency}
              {f.price} · {f.sizes.join(", ")}
            </p>
            <p>{f.poem}</p>
            <p>{f.story}</p>
            <p>
              Top notes: {f.notes.top.join(", ")}. Heart notes: {f.notes.heart.join(", ")}. Base notes:{" "}
              {f.notes.base.join(", ")}.
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
