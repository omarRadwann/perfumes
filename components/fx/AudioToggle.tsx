"use client";

import { useEffect } from "react";
import { useScene } from "@/lib/store";
import { setSoundEnabled, setStationTone } from "@/lib/soundscape";
import { FRAGRANCES } from "@/lib/fragrances";

const BARS = [0, 0.2, 0.4, 0.15];

// Muted-by-default ambient drone toggle. The procedural pad (lib/soundscape) shifts
// tone to the active scent. First enabled on a user gesture (autoplay policy).
export function AudioToggle() {
  const sound = useScene((s) => s.sound);
  const setSound = useScene((s) => s.setSound);
  const activeId = useScene((s) => s.activeScentId);

  useEffect(() => {
    setSoundEnabled(sound);
  }, [sound]);

  useEffect(() => {
    if (!sound) return;
    const i = Math.max(0, FRAGRANCES.findIndex((f) => f.id === activeId));
    setStationTone(i);
  }, [activeId, sound]);

  return (
    <button
      onClick={() => setSound(!sound)}
      data-interactive
      aria-pressed={sound}
      aria-label={sound ? "Mute ambient sound" : "Play ambient sound"}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-line px-4 py-2.5 text-bone backdrop-blur-md transition-colors hover:border-[color:var(--accent)]"
      style={{ background: "rgba(10,10,11,0.5)" }}
    >
      <span className="flex h-[14px] items-end gap-[2px]" style={{ color: sound ? "var(--accent)" : "var(--color-muted)" }} aria-hidden>
        {BARS.map((d, i) => (
          <span key={i} className={`sbar ${sound ? "sbar-on" : ""}`} style={{ ["--sd" as string]: `${d}s` }} />
        ))}
      </span>
      <span className="text-[0.58rem] uppercase tracking-[0.24em] text-muted">{sound ? "Sound" : "Silence"}</span>
    </button>
  );
}
