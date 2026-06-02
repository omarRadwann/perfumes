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
    "Maison Nocté — five extrait de parfum compositions for the hours after dark. A nocturnal house of oud, amber, rose and iris, rendered in light and glass.",
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
      <body className={`${cormorant.variable} ${jost.variable} grain`}>
        {children}
      </body>
    </html>
  );
}
