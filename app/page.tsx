import DiveMount from "@/components/dive/DiveMount";
import { FRAGRANCES } from "@/lib/fragrances";

// Maison Nocté — "La Descente": a cinematic scroll-driven 3D journey through six
// nocturnal scent-worlds (reduced-motion / no-WebGL → the editorial fallback).
export default function Home() {
  return (
    <>
      <DiveMount />
      {/* Crawlable content for SEO + screen readers (the visual experience is client-rendered). */}
      <div className="sr-only">
        <h1>Maison Nocté — Parfums de Nuit</h1>
        <p>Six extrait de parfum compositions for the hours after dark, composed and bottled in Paris.</p>
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
