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
    thumbnailUrl: "/assets/steamboat-willie-mickey.svg",
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
    thumbnailUrl: "/assets/betty-boop-early.svg",
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
    thumbnailUrl: "/assets/nancy-drew-early.svg",
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
    thumbnailUrl: "/assets/albert-einstein.svg",
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
    thumbnailUrl: "/assets/nikola-tesla.svg",
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
    thumbnailUrl: "/assets/leonardo-da-vinci.svg",
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
    thumbnailUrl: "/assets/hokusai-great-wave.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Hokusai — The Great Wave (public domain)",
      provenanceNotice: "Based on Katsushika Hokusai's public-domain woodblock print.",
      prohibitions: [],
      requiredTransformations: [],
    },
  },
  {
    slug: "sherlock-holmes",
    label: "Sherlock Holmes (early stories)",
    kind: "character",
    thumbnailUrl: "/assets/sherlock-holmes.svg",
    publicDomainIn: ["US", "EU"],
    styleGuide: {
      label: "Sherlock Holmes (early stories)",
      provenanceNotice:
        "Based on the public-domain early Sherlock Holmes stories by Arthur Conan Doyle.",
      prohibitions: [
        "modern film/TV likenesses (e.g. BBC/Warner adaptations)",
        "trademarked modern adaptations",
      ],
      requiredTransformations: [],
    },
  },
  {
    slug: "alice-in-wonderland",
    label: "Alice in Wonderland (Tenniel)",
    kind: "character",
    thumbnailUrl: "/assets/alice-in-wonderland.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Alice in Wonderland (Tenniel)",
      provenanceNotice:
        "Based on Lewis Carroll's public-domain Alice's Adventures in Wonderland and John Tenniel's illustrations.",
      prohibitions: ["Disney 1951 film styling"],
      requiredTransformations: [],
    },
  },
  {
    slug: "dracula",
    label: "Dracula (Bram Stoker, 1897)",
    kind: "character",
    thumbnailUrl: "/assets/dracula.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Dracula (Bram Stoker, 1897)",
      provenanceNotice: "Based on Bram Stoker's public-domain novel Dracula (1897).",
      prohibitions: ["Bela Lugosi / Universal film likeness", "modern film adaptations"],
      requiredTransformations: [],
    },
  },
  {
    slug: "frankenstein",
    label: "Frankenstein's Creature (1818 novel)",
    kind: "character",
    thumbnailUrl: "/assets/frankenstein.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Frankenstein's Creature (1818 novel)",
      provenanceNotice:
        "Based on Mary Shelley's public-domain novel Frankenstein (1818).",
      prohibitions: [
        "Universal film monster look (flat head, neck bolts, green skin)",
        "Boris Karloff likeness",
      ],
      requiredTransformations: [],
    },
  },
  {
    slug: "wizard-of-oz",
    label: "The Wizard of Oz (1900 book)",
    kind: "character",
    thumbnailUrl: "/assets/wizard-of-oz.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "The Wizard of Oz (1900 book)",
      provenanceNotice:
        "Based on L. Frank Baum's public-domain novel and W. W. Denslow's illustrations (1900).",
      prohibitions: ["1939 MGM film elements (ruby slippers, specific film likenesses)"],
      requiredTransformations: [],
    },
  },
  {
    slug: "robin-hood",
    label: "Robin Hood (folklore)",
    kind: "character",
    thumbnailUrl: "/assets/robin-hood.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Robin Hood (folklore)",
      provenanceNotice:
        "Based on the public-domain Robin Hood folklore and early literary versions.",
      prohibitions: ["Disney 1973 film styling"],
      requiredTransformations: [],
    },
  },
  {
    slug: "pinocchio",
    label: "Pinocchio (Collodi, 1883)",
    kind: "character",
    thumbnailUrl: "/assets/pinocchio.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Pinocchio (Collodi, 1883)",
      provenanceNotice:
        "Based on Carlo Collodi's public-domain novel The Adventures of Pinocchio (1883).",
      prohibitions: ["Disney 1940 film styling"],
      requiredTransformations: [],
    },
  },
  {
    slug: "van-gogh-starry-night",
    label: "Van Gogh — The Starry Night",
    kind: "artwork",
    thumbnailUrl: "/assets/van-gogh-starry-night.svg",
    publicDomainIn: ["US", "EU", "JP"],
    styleGuide: {
      label: "Van Gogh — The Starry Night",
      provenanceNotice:
        "Based on Vincent van Gogh's public-domain painting The Starry Night (1889).",
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
