// ============================================================================
// MAISON NOCTÉ — the collection, as six 3D "alcove" worlds.
// Each fragrance is a product (glass bottle + a premium printed carton) shown
// on a plinth in its own niche of a bright marble-and-gold gallery. One source
// of truth for the scene (palette, packaging art) and the DOM (notes, story).
// ============================================================================

import { withBase } from "./basePath";

export interface Notes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Palette {
  /** carton body / accent colour for the alcove "world" */
  box: string;
  /** UI + alcove backlight accent */
  accent: string;
  /** warm/cool tint of the alcove's product spotlight */
  light: string;
  /** the juice inside the bottle */
  liquid: string;
  /** metal cap / collar */
  cap: string;
}

export interface Fragrance {
  id: string;
  name: string;
  /** one-line poem */
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
  palette: Palette;
  /** printed carton artwork (AI-generated), mapped onto the box */
  packaging: string;
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
    palette: { box: "#23201c", accent: "#c9a96a", light: "#ffe7c0", liquid: "#2a1c0e", cap: "#c9a96a" },
    packaging: withBase("/img/box-noir-dencre.jpg"),
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
    palette: { box: "#8a5a1e", accent: "#d6a44e", light: "#ffeec6", liquid: "#d6a44e", cap: "#e8d3a0" },
    packaging: withBase("/img/box-ombre-dor.jpg"),
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
    palette: { box: "#6e1b28", accent: "#c0445c", light: "#ffd9d2", liquid: "#97243a", cap: "#c9a96a" },
    packaging: withBase("/img/box-velours-rouge.jpg"),
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
    palette: { box: "#1c2748", accent: "#6a86d6", light: "#dfe6ff", liquid: "#2c4691", cap: "#cfd6e0" },
    packaging: withBase("/img/box-nuit-bleue.jpg"),
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
    palette: { box: "#5e6469", accent: "#aab0b6", light: "#eef1f4", liquid: "#6e7378", cap: "#d7dbde" },
    packaging: withBase("/img/box-eclipse.jpg"),
  },
  {
    id: "santal-ivoire",
    name: "Santal Ivoire",
    poem: "Warm wood, worn close.",
    family: "Creamy Woods",
    character: "Sandalwood · Iris · Musk",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 335,
    currency: "$",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Cardamom"],
      heart: ["Sandalwood", "Orris", "Almond Milk"],
      base: ["Cashmeran", "White Musk", "Tonka Bean"],
    },
    story:
      "Mysore-style sandalwood folded into orris and warm almond milk. Soft, second-skin, and luminous — the quiet luxury of the collection, worn like ivory cashmere.",
    palette: { box: "#c8b48c", accent: "#b89b6a", light: "#fff4dc", liquid: "#c9a36a", cap: "#e6d2a4" },
    packaging: withBase("/img/box-santal-ivoire.jpg"),
  },
];

export const getFragrance = (id: string): Fragrance | undefined =>
  FRAGRANCES.find((f) => f.id === id);
