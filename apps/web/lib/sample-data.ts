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
  "sherlock-holmes": {
    label: "Sherlock Holmes (early stories)",
    provenanceNotice:
      "Based on the public-domain early Sherlock Holmes stories by Arthur Conan Doyle.",
    prohibitions: [
      "modern film/TV likenesses (e.g. BBC/Warner adaptations)",
      "trademarked modern adaptations",
    ],
    requiredTransformations: [],
  },
  "alice-in-wonderland": {
    label: "Alice in Wonderland (Tenniel)",
    provenanceNotice:
      "Based on Lewis Carroll's public-domain Alice's Adventures in Wonderland and John Tenniel's illustrations.",
    prohibitions: ["Disney 1951 film styling"],
    requiredTransformations: [],
  },
  dracula: {
    label: "Dracula (Bram Stoker, 1897)",
    provenanceNotice: "Based on Bram Stoker's public-domain novel Dracula (1897).",
    prohibitions: [
      "Bela Lugosi / Universal film likeness",
      "modern film adaptations",
    ],
    requiredTransformations: [],
  },
  frankenstein: {
    label: "Frankenstein's Creature (1818 novel)",
    provenanceNotice:
      "Based on Mary Shelley's public-domain novel Frankenstein (1818).",
    prohibitions: [
      "Universal film monster look (flat head, neck bolts, green skin)",
      "Boris Karloff likeness",
    ],
    requiredTransformations: [],
  },
  "wizard-of-oz": {
    label: "The Wizard of Oz (1900 book)",
    provenanceNotice:
      "Based on L. Frank Baum's public-domain novel and W. W. Denslow's illustrations (1900).",
    prohibitions: ["1939 MGM film elements (ruby slippers, specific film likenesses)"],
    requiredTransformations: [],
  },
  "robin-hood": {
    label: "Robin Hood (folklore)",
    provenanceNotice:
      "Based on the public-domain Robin Hood folklore and early literary versions.",
    prohibitions: ["Disney 1973 film styling"],
    requiredTransformations: [],
  },
  pinocchio: {
    label: "Pinocchio (Collodi, 1883)",
    provenanceNotice:
      "Based on Carlo Collodi's public-domain novel The Adventures of Pinocchio (1883).",
    prohibitions: ["Disney 1940 film styling"],
    requiredTransformations: [],
  },
  "van-gogh-starry-night": {
    label: "Van Gogh — The Starry Night",
    provenanceNotice:
      "Based on Vincent van Gogh's public-domain painting The Starry Night (1889).",
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
    thumbnailUrl: "/assets/steamboat-willie-mickey.svg",
    provenanceNotice:
      "Based on the 1928 public-domain version of Mickey Mouse from Steamboat Willie.",
    publicDomainIn: ["US"],
  },
  {
    id: "betty-boop-early",
    label: "Betty Boop (early)",
    kind: "character",
    thumbnailUrl: "/assets/betty-boop-early.svg",
    provenanceNotice: "Based on the early public-domain version of Betty Boop.",
    publicDomainIn: ["US"],
  },
  {
    id: "nancy-drew-early",
    label: "Nancy Drew (early novels)",
    kind: "character",
    thumbnailUrl: "/assets/nancy-drew-early.svg",
    provenanceNotice: "Based on the early public-domain Nancy Drew novels.",
    publicDomainIn: ["US"],
  },
  {
    id: "albert-einstein",
    label: "Albert Einstein (historical)",
    kind: "historical-figure",
    thumbnailUrl: "/assets/albert-einstein.svg",
    provenanceNotice:
      "A creative depiction based on the historical figure Albert Einstein.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "nikola-tesla",
    label: "Nikola Tesla (historical)",
    kind: "historical-figure",
    thumbnailUrl: "/assets/nikola-tesla.svg",
    provenanceNotice:
      "A creative depiction based on the historical figure Nikola Tesla.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "leonardo-da-vinci",
    label: "Leonardo da Vinci (historical)",
    kind: "historical-figure",
    thumbnailUrl: "/assets/leonardo-da-vinci.svg",
    provenanceNotice:
      "A creative depiction based on the historical figure Leonardo da Vinci.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "hokusai-great-wave",
    label: "Hokusai — The Great Wave",
    kind: "artwork",
    thumbnailUrl: "/assets/hokusai-great-wave.svg",
    provenanceNotice:
      "Based on Katsushika Hokusai's public-domain woodblock print.",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "sherlock-holmes",
    label: "Sherlock Holmes (early stories)",
    kind: "character",
    thumbnailUrl: "/assets/sherlock-holmes.svg",
    provenanceNotice:
      "Based on the public-domain early Sherlock Holmes stories by Arthur Conan Doyle.",
    publicDomainIn: ["US", "EU"],
  },
  {
    id: "alice-in-wonderland",
    label: "Alice in Wonderland (Tenniel)",
    kind: "character",
    thumbnailUrl: "/assets/alice-in-wonderland.svg",
    provenanceNotice:
      "Based on Lewis Carroll's public-domain Alice's Adventures in Wonderland and John Tenniel's illustrations.",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "dracula",
    label: "Dracula (Bram Stoker, 1897)",
    kind: "character",
    thumbnailUrl: "/assets/dracula.svg",
    provenanceNotice: "Based on Bram Stoker's public-domain novel Dracula (1897).",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "frankenstein",
    label: "Frankenstein's Creature (1818 novel)",
    kind: "character",
    thumbnailUrl: "/assets/frankenstein.svg",
    provenanceNotice:
      "Based on Mary Shelley's public-domain novel Frankenstein (1818).",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "wizard-of-oz",
    label: "The Wizard of Oz (1900 book)",
    kind: "character",
    thumbnailUrl: "/assets/wizard-of-oz.svg",
    provenanceNotice:
      "Based on L. Frank Baum's public-domain novel and W. W. Denslow's illustrations (1900).",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "robin-hood",
    label: "Robin Hood (folklore)",
    kind: "character",
    thumbnailUrl: "/assets/robin-hood.svg",
    provenanceNotice:
      "Based on the public-domain Robin Hood folklore and early literary versions.",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "pinocchio",
    label: "Pinocchio (Collodi, 1883)",
    kind: "character",
    thumbnailUrl: "/assets/pinocchio.svg",
    provenanceNotice:
      "Based on Carlo Collodi's public-domain novel The Adventures of Pinocchio (1883).",
    publicDomainIn: ["US", "EU", "JP"],
  },
  {
    id: "van-gogh-starry-night",
    label: "Van Gogh — The Starry Night",
    kind: "artwork",
    thumbnailUrl: "/assets/van-gogh-starry-night.svg",
    provenanceNotice:
      "Based on Vincent van Gogh's public-domain painting The Starry Night (1889).",
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
