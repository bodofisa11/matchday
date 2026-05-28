import type { NextConfig } from "next";

// Production builds always target GitHub Pages at /matchday.
// `next dev` keeps NODE_ENV=development → basePath "" → API routes work.
// Keying off NODE_ENV (auto-inlined by Next) lets client utils derive the
// same basePath without separate env plumbing.
const isProd = process.env.NODE_ENV === "production";

const basePath = isProd ? "/matchday" : "";

const nextConfig: NextConfig = {
  ...(isProd ? { output: "export" } : {}),
  basePath,
  assetPrefix: isProd ? "/matchday/" : "",
  // Ensures nested routes export as <path>/index.html so GitHub Pages serves
  // deep-link refreshes without 404s.
  trailingSlash: true,
};

export default nextConfig;
