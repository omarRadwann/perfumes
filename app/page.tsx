import Experience from "@/components/Experience";

// Maison Nocté — a fully 3D luxury perfume experience. The shelf of glass flacons
// is a live WebGL scene (client-only); the Hero/Collection/Maison/Craft copy is
// pre-rendered to static HTML for SEO. Fully static at runtime — no external calls.
export default function Home() {
  return <Experience />;
}
