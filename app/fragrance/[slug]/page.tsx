import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FRAGRANCES, getFragrance } from "@/lib/fragrances";
import { FragranceDetail } from "@/components/sections/FragranceDetail";

// Pre-render one static page per scent (required by output: "export").
export function generateStaticParams() {
  return FRAGRANCES.map((f) => ({ slug: f.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFragrance(slug);
  if (!f) return {};
  return {
    title: f.name,
    description: `${f.poem} — ${f.family}, ${f.concentration}. ${f.story}`,
    // url is resolved against metadataBase (set in app/layout.tsx). Per-scent OG
    // images are an asset-pass item; the house OG ships in the meantime.
    openGraph: {
      title: `${f.name} — ÉTHEREAL`,
      description: f.poem,
      images: [{ url: "img/og.jpg", width: 1200, height: 630, alt: f.name }],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFragrance(slug);
  if (!f) notFound();
  return <FragranceDetail f={f} />;
}
