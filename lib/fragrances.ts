// ============================================================================
// ÉTHEREAL — the collection. Six fragrances, six worlds.
// One source of truth for the 3D hero (palette), the DOM (notes, story, price),
// the Shop filters (family, season, notes) and the static routes (id → slug).
// Scent data is from the ÉTHEREAL brief, verbatim.
// ============================================================================

export interface Notes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Palette {
  /** legible-on-near-black UI accent: drives --accent (note labels, hairlines,
   *  glow rings, particles). Onyx (Fumée Rare) is lifted to a smoky pewter so it
   *  stays readable on ink — the brief's "never small text in a dark accent" rule. */
  accent: string;
  /** the scent's true atmospheric hue (brief accent) — backgrounds, world tint */
  world: string;
  /** the juice inside the glass */
  liquid: string;
  /** turned metal collar + cap */
  cap: string;
  /** warm/cool tint of the product spotlight */
  light: string;
}

export interface Fragrance {
  /** slug — used by /fragrance/[slug] + generateStaticParams */
  id: string;
  name: string;
  /** one-line poem (brief "story" line) — also the .sr-only SEO summary */
  poem: string;
  /** three-word character line */
  character: string;
  /** olfactive family — a Shop filter facet */
  family: string;
  /** seasons it wears best — a Shop filter facet */
  season: string[];
  /** particle motif key for the Scent Library / hero mist */
  particle: "embers" | "petals" | "droplets" | "haze" | "dust" | "smoke";
  concentration: string;
  sizes: string[];
  price: number;
  currency: string;
  notes: Notes;
  /** the longer detail-page story (ÉTHEREAL voice: spare, sensual, restrained) */
  story: string;
  palette: Palette;
}

export const FRAGRANCES: Fragrance[] = [
  {
    id: "noir-solaire",
    name: "Noir Solaire",
    poem: "A sun that refuses to set.",
    character: "Amber · Oud · Saffron",
    family: "Amber / Oriental",
    season: ["Autumn", "Winter"],
    particle: "embers",
    concentration: "Eau de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 245,
    currency: "$",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Saffron"],
      heart: ["Bulgarian Rose", "Orris", "Immortelle"],
      base: ["Amber", "Oud", "Bourbon Vanilla", "Labdanum"],
    },
    story:
      "Resin and gold held at the last hour of light. Saffron strikes against Bulgarian rose; amber, oud and bourbon vanilla draw the warmth down into something eternal. Worn close, it never quite goes dark.",
    palette: { accent: "#D08A2C", world: "#D08A2C", liquid: "#C77A1E", cap: "#E8D6A0", light: "#FFE7C0" },
  },
  {
    id: "verdane",
    name: "Verdane",
    poem: "The first green hour after rain, kept in glass.",
    character: "Galbanum · Fig · Vetiver",
    family: "Green / Floral",
    season: ["Spring", "Summer"],
    particle: "petals",
    concentration: "Eau de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 220,
    currency: "$",
    notes: {
      top: ["Galbanum", "Violet Leaf", "Bergamot"],
      heart: ["Fig", "Jasmine Sambac", "Tuberose"],
      base: ["Vetiver", "Cedar", "Oakmoss"],
    },
    story:
      "Galbanum and crushed violet leaf open cold and wet. Fig and jasmine sambac soften the green; vetiver and oakmoss root it to the earth. A garden kept in glass, just after the storm.",
    palette: { accent: "#2FA37D", world: "#2FA37D", liquid: "#1E7E5C", cap: "#C8A24A", light: "#E4F3EA" },
  },
  {
    id: "cobalt-hour",
    name: "Cobalt Hour",
    poem: "The minute the sea turns from blue to black.",
    character: "Salt · Iris · Ambergris",
    family: "Aquatic / Woody",
    season: ["Spring", "Summer"],
    particle: "droplets",
    concentration: "Eau de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 230,
    currency: "$",
    notes: {
      top: ["Sea Salt", "Yuzu", "Juniper"],
      heart: ["Iris", "Lavender", "Geranium"],
      base: ["Ambergris", "Driftwood", "White Musk"],
    },
    story:
      "Sea salt and yuzu over cold juniper. Iris and lavender hold the surface still while ambergris and driftwood pull toward the deep. The exact blue of dusk on water, made wearable.",
    palette: { accent: "#5C8DE8", world: "#3B6FD4", liquid: "#2B4A9E", cap: "#CFD6E0", light: "#DFE6FF" },
  },
  {
    id: "amethyste",
    name: "Améthyste",
    poem: "A confession written in velvet.",
    character: "Violet · Cacao · Tonka",
    family: "Gourmand / Floral",
    season: ["Autumn", "Winter"],
    particle: "haze",
    concentration: "Eau de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 235,
    currency: "$",
    notes: {
      top: ["Black Currant", "Plum", "Bergamot"],
      heart: ["Violet", "Heliotrope", "Rose"],
      base: ["Cacao", "Tonka", "Sandalwood"],
    },
    story:
      "Black currant and plum bleed into violet and heliotrope. Beneath, cacao, tonka and sandalwood turn the floral carnal. Soft, dark and close to the skin — a secret you can almost hear.",
    palette: { accent: "#A06FD6", world: "#7B4FB0", liquid: "#5C3A8C", cap: "#C8A24A", light: "#ECE2F5" },
  },
  {
    id: "blanc-absolu",
    name: "Blanc Absolu",
    poem: "Light, before it becomes color.",
    character: "Neroli · Gardenia · Musk",
    family: "White Floral / Clean",
    season: ["Spring", "Summer"],
    particle: "dust",
    concentration: "Eau de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 215,
    currency: "$",
    notes: {
      top: ["Aldehydes", "Neroli", "Petitgrain"],
      heart: ["Orange Blossom", "Ylang-Ylang", "Gardenia"],
      base: ["White Amber", "Musk", "Sandalwood"],
    },
    story:
      "Aldehydes and neroli flare bright and clean. Orange blossom, ylang and gardenia open like a held breath; white amber and musk leave only a luminous trace. The colour of early light, worn as skin.",
    palette: { accent: "#E6E1D6", world: "#E6E1D6", liquid: "#ECE7DC", cap: "#E8D6A0", light: "#FBF7EF" },
  },
  {
    id: "fumee-rare",
    name: "Fumée Rare",
    poem: "Smoke that remembers the fire.",
    character: "Incense · Leather · Guaiac",
    family: "Smoky / Leather",
    season: ["Autumn", "Winter"],
    particle: "smoke",
    concentration: "Extrait de Parfum",
    sizes: ["50 ml", "100 ml"],
    price: 260,
    currency: "$",
    notes: {
      top: ["Incense", "Cardamom", "Pink Pepper"],
      heart: ["Leather", "Birch Tar", "Violet"],
      base: ["Guaiac Wood", "Vetiver", "Amber"],
    },
    story:
      "Incense and cardamom rise over leather and birch tar. Guaiac wood, vetiver and amber smoulder underneath — dry, dark and slow. The last grey curl of smoke after the flame is gone. Composed in extrait, never diluted.",
    palette: { accent: "#AEB3BA", world: "#3A3A40", liquid: "#27272C", cap: "#9AA0A6", light: "#D7DBDE" },
  },
];

export const getFragrance = (id: string): Fragrance | undefined =>
  FRAGRANCES.find((f) => f.id === id);
