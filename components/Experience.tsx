"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import SceneMount from "@/components/SceneMount";
import { Cursor } from "./ui/Cursor";
import { Loader } from "./ui/Loader";
import { Nav } from "./ui/Nav";
import { SceneOverlay } from "./ui/SceneOverlay";
import { useScene, STATION_COUNT } from "@/lib/store";
import { setSoundEnabled, setStationTone } from "@/lib/soundscape";

export default function Experience() {
  const lenis = useRef<Lenis | null>(null);
  const setScroll = useScene((s) => s.setScroll);
  const sound = useScene((s) => s.sound);
  const active = useScene((s) => s.active);

  // Smooth scroll → journey progress (reference step 3).
  useEffect(() => {
    const l = new Lenis({ lerp: 0.08, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis.current = l;
    l.on("scroll", (e: Lenis) => setScroll(e.progress || 0));
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      lenis.current = null;
    };
  }, [setScroll]);

  // Soundscape (reference step 5) — enabled by the Nav toggle (a user gesture).
  useEffect(() => {
    setSoundEnabled(sound);
  }, [sound]);
  useEffect(() => {
    if (sound) setStationTone(active);
  }, [active, sound]);

  // Hidden gesture (reference step 4): the Konami code reveals the active flacon.
  useEffect(() => {
    const seq = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === seq[i]) {
        i++;
        if (i === seq.length) {
          i = 0;
          const st = useScene.getState();
          st.setOpened(st.active);
        }
      } else {
        i = 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollToStation = (idx: number) => {
    const l = lenis.current;
    if (!l) return;
    const limit = l.limit || document.documentElement.scrollHeight - window.innerHeight;
    l.scrollTo((idx / (STATION_COUNT - 1)) * limit, { duration: 1.5 });
  };

  return (
    <>
      <Cursor />
      <div className="fixed inset-0 z-0">
        <SceneMount />
      </div>
      <Nav onHome={() => scrollToStation(0)} />
      <SceneOverlay onGoto={scrollToStation} />
      <Loader />
      {/* scroll spacer — creates the scroll range that drives the journey */}
      <div style={{ height: `${STATION_COUNT * 100}vh` }} aria-hidden />
    </>
  );
}
