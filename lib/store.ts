import { create } from "zustand";
import type { QualityTier } from "./deviceTier";
import { FRAGRANCES } from "./fragrances";

// Shared state across the React-DOM ⇆ R3F-canvas boundary (zustand works in both).
interface SceneState {
  tier: QualityTier;
  /** the hero canvas (or its static fallback) has signalled first paint */
  ready: boolean;
  /** ambient soundscape enabled (after first user gesture) */
  sound: boolean;
  /** mobile overlay menu open */
  menuOpen: boolean;
  /** id of the active scent — the Scent Library selection + the hero bottle */
  activeScentId: string;
  /** live, lerped accent hex (mirrors the --accent CSS var + the bottle juice target) */
  accent: string;
  /** Add-to-Bag stub counter */
  bag: number;
  setTier: (t: QualityTier) => void;
  setReady: (r: boolean) => void;
  setSound: (s: boolean) => void;
  setMenuOpen: (o: boolean) => void;
  setActiveScent: (id: string) => void;
  setAccent: (hex: string) => void;
  addToBag: () => void;
}

export const useScene = create<SceneState>((set) => ({
  tier: "standard",
  ready: false,
  sound: false,
  menuOpen: false,
  activeScentId: FRAGRANCES[0].id,
  accent: FRAGRANCES[0].palette.accent,
  bag: 0,
  setTier: (t) => set({ tier: t }),
  setReady: (r) => set({ ready: r }),
  setSound: (s) => set({ sound: s }),
  setMenuOpen: (o) => set({ menuOpen: o }),
  setActiveScent: (id) => set({ activeScentId: id }),
  setAccent: (hex) => set({ accent: hex }),
  addToBag: () => set((s) => ({ bag: s.bag + 1 })),
}));
