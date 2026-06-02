import { create } from "zustand";
import type { QualityTier } from "./deviceTier";

// Shared state across the React-DOM ⇆ R3F-canvas reconciler boundary. A zustand
// store works in both trees (it's an external subscription), so the DOM overlay
// (DetailPanel, hero copy) and the in-canvas scene stay in lock-step without
// bridging React context through the Canvas.
interface SceneState {
  hoveredId: string | null;
  selectedId: string | null;
  tier: QualityTier;
  /** true once the first frame + assets are ready (drops the loader veil) */
  ready: boolean;
  /** hero in view — drives the render loop so we don't burn GPU when scrolled away */
  active: boolean;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  setTier: (t: QualityTier) => void;
  setReady: (r: boolean) => void;
  setActive: (a: boolean) => void;
}

export const useScene = create<SceneState>((set) => ({
  hoveredId: null,
  selectedId: null,
  tier: "standard",
  ready: false,
  active: true,
  setHovered: (id) => set({ hoveredId: id }),
  setSelected: (id) => set({ selectedId: id }),
  setTier: (t) => set({ tier: t }),
  setReady: (r) => set({ ready: r }),
  setActive: (a) => set({ active: a }),
}));
