import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // pdf-parse (via pdfjs-dist) resolves its worker script relative to its own
  // package files at runtime; letting Next.js bundle it into the server chunk
  // breaks that resolution ("Setting up fake worker failed"). Keep it external
  // so it's loaded via native Node `require` instead.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
