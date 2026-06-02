import { withBase } from "./basePath";

// ============================================================================
// MAISON NOCTÉ — the collection.
// Single source of truth for the 3D scene (bottle colours, cap style, liquid)
// and the DOM (notes, story, price). One cohesive house silhouette; each scent
// is told apart by its liquid colour, cap finish, label and accent — the way a
// real niche maison (Le Labo, Frédéric Malle) builds a line.
// ============================================================================

export type CapStyle = "sphere" | "dome" | "facet" | "flat";

export interface Notes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface FragranceColors {
  /** tint of the glass flacon itself */
  glass: string;
  /** the juice inside */
  liquid: string;
  /** cap / collar metal */
  cap: string;
  /** UI + lighting accent */
  accent: string;
  /** warm glow cast under the bottle / behind the panel */
  glow: string;
}

export interface Fragrance {
  id: string;
  name: string;
  /** one-line poem shown on hover + in the detail panel */
  poem: string;
  family: string;
  /** three-word character line */
  character: string;
  concentration: string;
  sizes: string[];
  price: number;
  currency: string;
  notes: Notes;
  story: string;
  colors: FragranceColors;
  capStyle: CapStyle;
  /** label decal (alpha PNG) projected onto the glass */
  label: string;
  /** editorial mood still for the detail view + collection card */
  mood: string;
}

export const FRAGRANCES: Fragrance[] = [
  {
    id: "noir-dencre",
    name: "Noir d'Encre",
    poem: "Ink spilled across midnight skin.",
    family: "Leather Oud",
    character: "Oud · Leather · Incense",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 345,
    currency: "$",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Black Plum"],
      heart: ["Oud", "Leather", "Incense"],
      base: ["Black Amber", "Vanilla", "Labdanum"],
    },
    story:
      "The darkest chord in the house. Smoked oud and tanned leather bleed into black amber, drawn down with a single line of vanilla — a fragrance worn like ink that never quite dries.",
    colors: {
      glass: "#2a2018",
      liquid: "#1f1409",
      cap: "#c9a96a",
      accent: "#b98a4e",
      glow: "#7a4a1e",
    },
    capStyle: "sphere",
    label: withBase("/labels/noir-dencre.png"),
    mood: withBase("/img/mood-noir-dencre.jpg"),
  },
  {
    id: "ombre-dor",
    name: "Ombre d'Or",
    poem: "A shadow, gilded.",
    family: "Amber Saffron",
    character: "Saffron · Amber · Honey",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 320,
    currency: "$",
    notes: {
      top: ["Saffron", "Mandarin", "Cardamom"],
      heart: ["Amber", "Orris", "Jasmine"],
      base: ["Honey", "Sandalwood", "Tonka Bean"],
    },
    story:
      "Saffron struck like a match over warm amber, then sweetened with raw honey and sandalwood. The glow of candlelight on gold leaf, made wearable.",
    colors: {
      glass: "#3a2a12",
      liquid: "#d6a44e",
      cap: "#e8d3a0",
      accent: "#d6a44e",
      glow: "#caa24f",
    },
    capStyle: "dome",
    label: withBase("/labels/ombre-dor.png"),
    mood: withBase("/img/mood-ombre-dor.jpg"),
  },
  {
    id: "velours-rouge",
    name: "Velours Rouge",
    poem: "Velvet drawn over a thorn.",
    family: "Rose Chypre",
    character: "Rose · Raspberry · Patchouli",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 310,
    currency: "$",
    notes: {
      top: ["Raspberry", "Pink Pepper", "Bergamot"],
      heart: ["Turkish Rose", "Peony", "Violet"],
      base: ["Patchouli", "Musk", "Vanilla"],
    },
    story:
      "A thousand Turkish roses pressed into crushed raspberry and dark patchouli. Opulent, carnal, and deeply red — the house at its most romantic.",
    colors: {
      glass: "#2e1418",
      liquid: "#97243a",
      cap: "#c9a96a",
      accent: "#b8364f",
      glow: "#8e2233",
    },
    capStyle: "facet",
    label: withBase("/labels/velours-rouge.png"),
    mood: withBase("/img/mood-velours-rouge.jpg"),
  },
  {
    id: "nuit-bleue",
    name: "Nuit Bleue",
    poem: "The hour the sky turns to ink.",
    family: "Iris Woody",
    character: "Iris · Vetiver · Ambergris",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 330,
    currency: "$",
    notes: {
      top: ["Bergamot", "Juniper", "Sea Salt"],
      heart: ["Iris", "Violet Leaf", "Cypress"],
      base: ["Vetiver", "Ambergris", "Cedar"],
    },
    story:
      "Cool powdered iris over a tide of vetiver and ambergris. The blue hush of the night air just before it turns fully to ink — composed, mineral, infinite.",
    colors: {
      glass: "#141d33",
      liquid: "#2c4691",
      cap: "#cfd6e0",
      accent: "#5a78c8",
      glow: "#33529c",
    },
    capStyle: "dome",
    label: withBase("/labels/nuit-bleue.png"),
    mood: withBase("/img/mood-nuit-bleue.jpg"),
  },
  {
    id: "eclipse",
    name: "Éclipse",
    poem: "Light, withheld.",
    family: "Mineral Smoke",
    character: "Vetiver · Smoke · Musk",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 360,
    currency: "$",
    notes: {
      top: ["Grapefruit", "Cardamom", "Aldehydes"],
      heart: ["Vetiver", "Smoked Tea", "Geranium"],
      base: ["Mineral Musk", "Ambroxan", "Cedar"],
    },
    story:
      "The rarest in the house. Smoked tea and grey vetiver suspended in mineral musk and ambroxan — clean, cold, and lunar. Light held just out of reach.",
    colors: {
      glass: "#1b1e20",
      liquid: "#6e7378",
      cap: "#d7dbde",
      accent: "#9aa0a6",
      glow: "#5b6166",
    },
    capStyle: "flat",
    label: withBase("/labels/eclipse.png"),
    mood: withBase("/img/mood-eclipse.jpg"),
  },
];

export const getFragrance = (id: string): Fragrance | undefined =>
  FRAGRANCES.find((f) => f.id === id);
