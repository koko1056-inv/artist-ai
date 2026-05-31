import type { NextConfig } from "next";

/**
 * The shared `@pd/*` packages ship raw TypeScript (their `main`/`types` point at
 * `src/index.ts`), so Next must transpile them rather than expecting prebuilt JS.
 */
const nextConfig: NextConfig = {
  transpilePackages: ["@pd/core", "@pd/contracts", "@pd/db", "@pd/ai"],
  // Prisma's generated client and engine are server-only; keep them external so they
  // are not bundled for the browser. (Next 15 top-level `serverExternalPackages`.)
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.pdforge.dev" },
      { protocol: "https", hostname: "bundles.local" },
    ],
  },
  // The shared packages use ESM `.js` import specifiers that resolve to `.ts` sources.
  // Teach webpack to map `.js` -> TypeScript extensions so it can bundle them.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
