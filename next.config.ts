import type { NextConfig } from "next";

// Build with GITHUB_PAGES=true to emit under the repo subpath (/perfumes), matching
// the Pages URL https://omarradwann.github.io/perfumes/. The "/" is a literal here
// (NOT shell-passed) to dodge Git-Bash POSIX-path mangling. Empty for local dev.
const basePath = process.env.GITHUB_PAGES === "true" ? "/perfumes" : "";

const nextConfig: NextConfig = {
  // R3F owns a single long-lived WebGL context; React StrictMode's double-mount
  // disposes/recreates it (and churns contexts under HMR), which can exhaust the
  // GPU's context limit. Disabling StrictMode is standard practice for R3F apps.
  reactStrictMode: false,
  // Pin the workspace root so Turbopack uses THIS project's lockfile, not a parent.
  turbopack: { root: __dirname },
  // Emit a fully static site (out/) for GitHub Pages. The browser only loads local
  // assets — no runtime API calls (no Tripo, no keys) anywhere.
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  // Inline the prefix for client code (lib/basePath → withBase) so raw asset URLs
  // (useTexture, plain <img>, GLB fetches) resolve under the subpath.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    // GitHub Pages has no image-optimization server.
    unoptimized: true,
  },
};

export default nextConfig;
