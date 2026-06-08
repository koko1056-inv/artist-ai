import type { MetadataRoute } from "next";

/**
 * Web app manifest so published apps are installable ("Add to home screen") — the core of
 * mobile-first, store-fee-free delivery in the MVP.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PD Forge",
    short_name: "PD Forge",
    description: "Character-powered daily apps you can build and share.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f6b5a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
