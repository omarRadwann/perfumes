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
  title: {
    default: "ÉTHEREAL — Awaken the Senses",
    template: "%s — ÉTHEREAL",
  },
  description:
    "ÉTHEREAL — a niche house of six fragrances. Scent, made visible: a luminous glass and six jewel-lit worlds you move through.",
  keywords: [
    "ÉTHEREAL",
    "niche perfume",
    "luxury fragrance",
    "eau de parfum",
    "extrait de parfum",
    "Noir Solaire",
    "Fumée Rare",
  ],
  authors: [{ name: "ÉTHEREAL" }],
  openGraph: {
    title: "ÉTHEREAL — Awaken the Senses",
    description: "Scent, made visible. Six fragrances, six worlds.",
    type: "website",
    images: [{ url: "img/og.jpg", width: 1200, height: 630, alt: "ÉTHEREAL" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ÉTHEREAL — Awaken the Senses",
    description: "Scent, made visible.",
    images: ["img/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Font CSS vars live on <html> (:root) so Tailwind's @theme --font-display /
    // --font-sans (which reference them) resolve — next/font on <body> would scope
    // them below :root and the @theme vars would compute empty.
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="grain">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
