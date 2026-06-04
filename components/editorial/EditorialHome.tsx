"use client";

import { Fragment } from "react";
import { FRAGRANCES } from "@/lib/fragrances";
import { SmoothScroll } from "./SmoothScroll";
import { Cursor } from "./Cursor";
import { EditorialNav } from "./EditorialNav";
import { Hero } from "./Hero";
import { Manifesto } from "./Manifesto";
import { Collection } from "./Collection";
import { ScentFeature } from "./ScentFeature";
import { Maison, Interlude } from "./Maison";
import { Footer } from "./Footer";

// The refined editorial site — also the graceful fallback for reduced-motion / no-WebGL.
export function EditorialHome() {
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
