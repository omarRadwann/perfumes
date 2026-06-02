"use client";

import { useEffect } from "react";
import SceneMount from "@/components/SceneMount";
import { Cursor } from "./ui/Cursor";
import { Loader } from "./ui/Loader";
import { Nav } from "./ui/Nav";
import { Hero } from "./ui/Hero";
import { DetailPanel } from "./ui/DetailPanel";
import { Sections } from "./ui/Sections";
import { useScene } from "@/lib/store";

export default function Experience() {
  const selectedId = useScene((s) => s.selectedId);
  const setActive = useScene((s) => s.setActive);

  // On select: jump to the top (where the canvas shows through the transparent
  // hero) and lock the page for the focused detail view.
  useEffect(() => {
    if (selectedId) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedId]);

  // Only run the render loop while the hero (the only place the canvas is visible)
  // is on screen — saves GPU when the visitor scrolls into the dark DOM sections.
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.04,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [setActive]);

  // Esc exits a detail view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useScene.getState().setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Cursor />
      {/* The canvas sits behind the DOM (z-0); the hero is transparent so the
          flacons show through. Selecting scrolls to top so the scene is in view. */}
      <div className="fixed inset-0 z-0">
        <SceneMount />
      </div>
      <Nav />
      <DetailPanel />
      {/* main is pe-none so hover/click pass through the hero to the 3D flacons
          behind it; each DOM section re-enables pointer-events (.section). */}
      <main className="pointer-events-none relative z-10">
        <Hero />
        <Sections />
      </main>
      <Loader />
    </>
  );
}
