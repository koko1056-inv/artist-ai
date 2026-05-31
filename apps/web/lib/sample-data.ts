/**
 * In-memory fallback data so the web UI is fully demoable without a live Postgres.
 * The PD assets mirror `packages/db/src/seed.ts`; listings are illustrative samples.
 *
 * API routes try Prisma first and fall back to these when the DB is unavailable.
 */
import type { Listing, PdAsset } from "@pd/contracts";
import type { StyleGuide } from "@pd/core";

/** Style guides keyed by asset id, mirroring the seed (server-side only). */
export const SAMPLE_STYLE_GUIDES: Record<string, StyleGuide> = {
  "steamboat-willie-mickey": {
    label: "Steamboat Willie Mickey (1928)",
    provenanceNotice:
      "Based on the 1928 public-domain version of Mickey Mouse from Steamboat Willie.",
    prohibitions: [
      "red shorts",
      "yellow shoes",
      "modern Disney styling",
      "use of the name 'Mickey Mouse' as a product brand",
    ],
    requiredTransformations: [],
  },
  "betty-boop-early": {
    label: "Betty Boop (early)",
    provenanceNotice: "Based on the early public-domain version of Betty Boop.",
    prohibitions: [
      "registered Betty Boop trademarks",
      "modern licensed merchandise styling",
    ],
    requiredTransformations: [],
  },
  "nancy-drew-early": {
    label: "Nancy Drew (early novels)",
    provenanceNotice: "Based on the early public-domain Nancy Drew novels.",
    prohibitions: ["later illustrated cover art", "TV/film likenesses"],
    requiredTransformations: [],
  },
  "albert-einstein": {
    label: "Albert Einstein (historical)",
    provenanceNotice:
      "A creative depiction based on the historical figure Albert Einstein.",
    prohibitions: ["photographic likeness", "endorsement implication"],
    requiredTransformations: ["stylized / cartoon depiction"],
    publicityNote:
      "Use as a transformed, creative depiction only; avoid implying endorsement.",
  },
  "nikola-tesla": {
    label: "Nikola Tesla (historical)",
    provenanceNotice:
      "A creative depiction based on the historical figure Nikola Tesla.",
    prohibitions: ["photographic likeness", "endorsement implication"],
    requiredTransformations: ["stylized / cartoon depiction"],
    publicityNote: "Use as a transformed, creative depiction only.",
  },
  "leonardo-da-vinci": {
    label: "Leonardo da Vinci (historical)",
    provenanceNotice:
      "A creative depiction based on the historical figure Leonardo da Vinci.",
    prohibitions: ["endorsement implication"],
    requiredTransformations: ["stylized / cartoon depiction"],
  },
  "hokusai-great-wave": {
    label: "Hokusai — The Great Wave (public domain)",
    provenanceNotice:
      "Based on Katsushika Hokusai's public-domain woodblock print.",
    prohibitions: [],
    requiredTransformations: [],
  },
};

/** The PD asset kind in the DB seed uses snake_case; the client contract uses kebab. */
export const SAMPLE_ASSETS: PdAsset[] = [
  {
    id: "steamboat-willie-mickey",
    label: "Steamboat Willie Mickey (1928)",
    kind: "character",
    thumbnailUrl: "https://assets.pdforge.dev/seed/steamboat-mickey.png",
    provenanceNotice:
      "Based on the 1928 public-domain version of Mickey Mouse from Steamboat Willie.",
    publicDomainIn: ["US"],
  },
  {
    id: "betty-boop-early",
    label: "Betty Boop (early)",
    kind: "character",
    thumbnailUrl: "https://assets.pdforge.dev/seed/betty-boop.png",
    provenanceNotice: "Based on the early public-domain version of Betty Boop.",
    publicDomainIn: ["US"],
  },
  {
    id: "nancy-drew-early",
    label: "Nancy Drew (early novels)",
    kind: "character",
    thumbnailUrl: "https://assets.pdforge.dev/seed/nancy-drew.png",
    provenanceNotice: "Based on the early public-domain Nancy Drew novels.",
    publicDomainIn: ["US"],
  },
  {
    id: "albert-einstein",
    label: "Albert Einstein (historical)",
    kind: "historical-figure",
    thumbnailUrl: "https://assets.pdforge.dev/seed/einstein.png",
    provenanceNotice:
      "A creative depiction based on the historical figure Albert Einstein.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "nikola-tesla",
    label: "Nikola Tesla (historical)",
    kind: "historical-figure",
    thumbnailUrl: "https://assets.pdforge.dev/seed/tesla.png",
    provenanceNotice:
      "A creative depiction based on the historical figure Nikola Tesla.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "leonardo-da-vinci",
    label: "Leonardo da Vinci (historical)",
    kind: "historical-figure",
    thumbnailUrl: "https://assets.pdforge.dev/seed/da-vinci.png",
    provenanceNotice:
      "A creative depiction based on the historical figure Leonardo da Vinci.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "hokusai-great-wave",
    label: "Hokusai — The Great Wave",
    kind: "artwork",
    thumbnailUrl: "https://assets.pdforge.dev/seed/great-wave.png",
    provenanceNotice:
      "Based on Katsushika Hokusai's public-domain woodblock print.",
    publicDomainIn: ["US", "EU", "JP"],
  },
];

export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "lst_steamboat_tasks",
    appId: "app_steamboat_tasks",
    title: "Steamboat To-Do",
    summary:
      "A cheerful task manager where 1928 Steamboat Willie toots the whistle when you finish a task.",
    templateId: "task-manager",
    creatorName: "Ada Rivers",
    priceMinor: 299,
    currency: "USD",
    aiAssisted: true,
    provenanceNotice:
      "Based on the 1928 public-domain version of Mickey Mouse from Steamboat Willie.",
    installCount: 12840,
    rating: 4.6,
  },
  {
    id: "lst_betty_habits",
    appId: "app_betty_habits",
    title: "Boop Streaks",
    summary:
      "Build daily habits with gentle encouragement from an early public-domain Betty Boop.",
    templateId: "habit-tracker",
    creatorName: "Marco Vey",
    priceMinor: 0,
    currency: "USD",
    aiAssisted: true,
    provenanceNotice: "Based on the early public-domain version of Betty Boop.",
    installCount: 30210,
    rating: 4.8,
  },
  {
    id: "lst_einstein_notes",
    appId: "app_einstein_notes",
    title: "Relativity Notes",
    summary:
      "Quick notes with a stylized Einstein who sketches your ideas into the margins.",
    templateId: "notes",
    creatorName: "Priya N.",
    priceMinor: 199,
    currency: "USD",
    aiAssisted: true,
    provenanceNotice:
      "A creative depiction based on the historical figure Albert Einstein.",
    installCount: 5470,
    rating: 4.3,
  },
  {
    id: "lst_wave_calendar",
    appId: "app_wave_calendar",
    title: "Great Wave Calendar",
    summary:
      "A serene monthly calendar themed around Hokusai's public-domain Great Wave.",
    templateId: "calendar",
    creatorName: "Kenji O.",
    priceMinor: 499,
    currency: "USD",
    aiAssisted: true,
    provenanceNotice:
      "Based on Katsushika Hokusai's public-domain woodblock print.",
    installCount: 8920,
    rating: 4.5,
  },
];

/** Sample purchases used by the dashboard revenue summary (USD minor units). */
export const SAMPLE_PURCHASES: ReadonlyArray<{
  listingTitle: string;
  grossMinor: number;
  currency: "USD";
  count: number;
}> = [
  { listingTitle: "Steamboat To-Do", grossMinor: 299, currency: "USD", count: 412 },
  { listingTitle: "Relativity Notes", grossMinor: 199, currency: "USD", count: 233 },
  { listingTitle: "Great Wave Calendar", grossMinor: 499, currency: "USD", count: 76 },
];

export function findSampleAsset(id: string): PdAsset | undefined {
  return SAMPLE_ASSETS.find((a) => a.id === id);
}
