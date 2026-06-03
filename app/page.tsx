import { Fragment } from "react";
import { FRAGRANCES } from "@/lib/fragrances";
import { SmoothScroll } from "@/components/editorial/SmoothScroll";
import { Cursor } from "@/components/editorial/Cursor";
import { EditorialNav } from "@/components/editorial/EditorialNav";
import { Hero } from "@/components/editorial/Hero";
import { Manifesto } from "@/components/editorial/Manifesto";
import { Collection } from "@/components/editorial/Collection";
import { ScentFeature } from "@/components/editorial/ScentFeature";
import { Maison, Interlude } from "@/components/editorial/Maison";
import { Footer } from "@/components/editorial/Footer";

// Maison Nocté — refined editorial luxury homepage. Big cinematic flacon photography,
// oversized serif typography, smooth scroll + tasteful scroll-reveal motion.
export default function Home() {
  const total = FRAGRANCES.length;
  return (
    <>
      <SmoothScroll />
      <Cursor />
      <EditorialNav />
      <main>
        <Hero />
        <Manifesto />
        <Collection />
        {FRAGRANCES.map((f, i) => (
          <Fragment key={f.id}>
            <ScentFeature f={f} index={i} total={total} flip={i % 2 === 1} />
            {i === 2 && <Interlude quote="The hour the sky turns to ink." attribution="Nuit Bleue · Maison Nocté" />}
          </Fragment>
        ))}
        <Maison />
        <Footer />
      </main>
    </>
  );
}
