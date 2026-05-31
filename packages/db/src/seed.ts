/**
 * Seeds the initial public-domain asset library. Each asset carries a style guide that
 * the publish-time review enforces (trademark avoidance, late-design prohibitions,
 * required transformations for historical figures).
 */
import type { StyleGuide } from "@pd/core";
import { prisma } from "./index.js";

interface SeedAsset {
  slug: string;
  label: string;
  kind: "character" | "historical_figure" | "artwork";
  thumbnailUrl: string;
  publicDomainIn: string[];
  styleGuide: StyleGuide;
}

const ASSETS: SeedAsset[] = [
  {
    slug: "steamboat-willie-mickey",
    label: "Steamboat Willie Mickey (1928)",
    kind: "character",
    thumbnailUrl: "https://assets.pdforge.dev/seed/steamboat-mickey.png",
    publicDomainIn: ["US"],
    styleGuide: {
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
  },
  {
    slug: "betty-boop-early",
    label: "Betty Boop (early)",
    kind: "character",
    thumbnailUrl: "https://assets.pdforge.dev/seed/betty-boop.png",
    publicDomainIn: ["US"],
    styleGuide: {
      label: "Betty Boop (early)",
      provenanceNotice: "Based on the early public-domain version of Betty Boop.",
      prohibitions: ["registered Betty Boop trademarks", "modern licensed merchandise styling"],
      requiredTransformations: [],
    },
  },
  {
    slug: "nancy-drew-early",
    label: "Nancy Drew (early novels)",
    kind: "character",
    thumbnailUrl: "https://assets.pdforge.dev/seed/nancy-drew.png",
    publicDomainIn: ["US"],
    styleGuide: {
      label: "Nancy Drew (early novels)",
      provenanceNotice:
        "Based on the early public-domain Nancy Drew novels.",
      prohibitions: ["later illustrated cover art", "TV/film likenesses"],
      requiredTransformations: [],
    },
  },
  {
    slug: "albert-einstein",
    label: "Albert Einstein (historical)",
    kind: "historical_figure",
    thumbnailUrl: "https://assets.pdforge.dev/seed/einstein.png",
    publicDomainIn: ["US", "EU"],
    styleGuide: {
      label: "Albert Einstein (historical)",
      provenanceNotice: "A creative depiction based on the historical figure Albert Einstein.",
      prohibitions: ["photographic likeness", "endorsement implication"],
      requiredTransformations: ["stylized / cartoon depiction"],
      publicityNote:
        "Use as a transformed, creative depiction only; avoid implying endorsement.",
    },
  },
  {
    slug: "nikola-tesla",
    label: "Nikola Tesla (historical)",
    kind: "historical_figure",
    thumbnailUrl: "https://assets.pdforge.dev/seed/tesla.png",
    publicDomainIn: ["US", "EU"],
    styleGuide: {
      label: "Nikola Tesla (historical)",
      provenanceNotice: "A creative depiction based on the historical figure Nikola Tesla.",
      prohibitions: ["photographic likeness", "endorsement implication"],
      requiredTransformations: ["stylized / cartoon depiction"],
      publicityNote: "Use as a transformed, creative depiction only.",
    },
  },
  {
    slug: "leonardo-da-vinci",
    label: "Leonardo da Vinci (historical)",
    kind: "historical_figure",
    thumbnailUrl: "https://assets.pdforge.dev/seed/da-vinci.png",
    publicDomainIn: ["US", "EU"],
    styleGuide: {
      label: "Leonardo da Vinci (historical)",
      provenanceNotice: "A creative depiction based on the historical figure Leonardo da Vinci.",
      prohibitions: ["endorsement implication"],
      requiredTransformations: ["stylized / cartoon depiction"],
    },
  },
  {
    slug: "hokusai-great-wave",
    label: "Hokusai — The Great Wave",
    kind: "artwork",
    thumbnailUrl: "https://assets.pdforge.dev/seed/great-wave.png",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Hokusai — The Great Wave (public domain)",
      provenanceNotice: "Based on Katsushika Hokusai's public-domain woodblock print.",
      prohibitions: [],
      requiredTransformations: [],
    },
  },
];

async function main() {
  for (const a of ASSETS) {
    await prisma.pdAsset.upsert({
      where: { slug: a.slug },
      update: {
        label: a.label,
        thumbnailUrl: a.thumbnailUrl,
        provenanceNotice: a.styleGuide.provenanceNotice,
        publicDomainIn: a.publicDomainIn,
        styleGuide: a.styleGuide as unknown as object,
      },
      create: {
        slug: a.slug,
        label: a.label,
        kind: a.kind,
        thumbnailUrl: a.thumbnailUrl,
        provenanceNotice: a.styleGuide.provenanceNotice,
        publicDomainIn: a.publicDomainIn,
        styleGuide: a.styleGuide as unknown as object,
      },
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${ASSETS.length} public-domain assets.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
