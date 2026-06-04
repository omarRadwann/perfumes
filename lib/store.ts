import { create } from "zustand";
import type { QualityTier } from "./deviceTier";
import { FRAGRANCES } from "./fragrances";

const COUNT = FRAGRANCES.length;

// Shared state across the React-DOM ⇆ R3F-canvas boundary (zustand works in both).
interface SceneState {
  /** journey progress 0..1, driven by scroll */
  scroll: number;
  /** active alcove index (0..COUNT-1) */
  active: number;
  /** pointer is over the active product */
  hovered: boolean;
  /** index of a product whose carton is "opened" (hidden gesture), else null */
  opened: number | null;
  tier: QualityTier;
  ready: boolean;
  /** ambient soundscape enabled (after first user gesture) */
  sound: boolean;
  /** debug overlay visible (?debug=1 or Shift+D) */
  debug: boolean;
  setScroll: (s: number) => void;
  setHovered: (h: boolean) => void;
  setOpened: (i: number | null) => void;
  setTier: (t: QualityTier) => void;
  setReady: (r: boolean) => void;
  setSound: (s: boolean) => void;
  setDebug: (d: boolean) => void;
  goto: (i: number) => void;
}

export const useScene = create<SceneState>((set) => ({
  scroll: 0,
  active: 0,
  hovered: false,
  opened: null,
  tier: "standard",
  ready: false,
  sound: false,
  debug: false,
  setScroll: (s) =>
    set({ scroll: s, active: Math.max(0, Math.min(COUNT - 1, Math.round(s * (COUNT - 1)))) }),
  setHovered: (h) => set({ hovered: h }),
  setOpened: (i) => set({ opened: i }),
  setTier: (t) => set({ tier: t }),
  setReady: (r) => set({ ready: r }),
  setSound: (s) => set({ sound: s }),
  setDebug: (d) => set({ debug: d }),
  // Smooth-scroll to a station: handled in the DOM (Lenis); here we just set state.
  goto: (i) => set({ scroll: i / (COUNT - 1), active: i }),
}));

export const STATION_COUNT = COUNT;
