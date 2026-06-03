import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://omarradwann.github.io/perfumes/"),
  title: "Maison Nocté — Parfums de Nuit",
  description:
    "Maison Nocté — a fully 3D perfumery. Six extrait de parfum compositions, each presented as a premium product in its own luminous alcove of a marble-and-gold gallery you scroll through.",
  keywords: [
    "luxury perfume",
    "extrait de parfum",
    "Maison Nocté",
    "niche fragrance",
    "oud",
    "amber",
  ],
  authors: [{ name: "Maison Nocté" }],
  openGraph: {
    title: "Maison Nocté — Parfums de Nuit",
    description: "Five compositions for the hours after dark.",
    type: "website",
    images: [{ url: "img/og.jpg", width: 1200, height: 630, alt: "Maison Nocté" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison Nocté — Parfums de Nuit",
    description: "Five compositions for the hours after dark.",
    images: ["img/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${cormorant.variable} ${jost.variable} grain`}>
        {children}
      </body>
    </html>
  );
}
