/**
 * Seeds the public-domain asset library plus a sample licensed-IP partner, so both the
 * PD flow and the "official IP" flow are exercisable. Each asset carries:
 *  - a style guide (enforced at publish time),
 *  - selectable media (images, and a 3D model on some), and
 *  - license terms (public domain, or licensed with royalty / eligibility / approval).
 */
import type { StyleGuide } from "@pd/core";
import { prisma } from "./index.js";

// A neutral, widely-used sample 3D model for the 3D-preview experience. Real assets are
// uploaded per IP; this keeps the viewer demoable. Loaded client-side in the app.
const SAMPLE_GLB = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

type MediaSeed = {
  kind:
    | "character_image"
    | "sprite"
    | "pose"
    | "three_d_model"
    | "audio"
    | "artwork"
    | "icon";
  format: "png" | "jpg" | "svg" | "glb" | "gltf" | "mp3" | "wav";
  label: string;
  url: string;
  posterUrl?: string;
};

type LicenseSeed = {
  type: "public_domain" | "licensed";
  royaltyRate: number;
  requiresApproval: boolean;
  allowedPlans: string[];
  territories: string[];
  expiresAt?: string;
  partnerSlug?: string;
};

interface SeedAsset {
  slug: string;
  label: string;
  kind: "character" | "historical_figure" | "artwork";
  thumbnailUrl: string;
  publicDomainIn: string[];
  styleGuide: StyleGuide;
  media: MediaSeed[];
  license: LicenseSeed;
}

const ALL_PLANS = ["free", "basic", "pro", "enterprise"];

/** Public-domain license terms (open to everyone, no royalty/approval). */
const pd = (territories: string[]): LicenseSeed => ({
  type: "public_domain",
  royaltyRate: 0,
  requiresApproval: false,
  allowedPlans: ALL_PLANS,
  territories,
});

/** A character image whose source is the asset's bundled illustration. */
const img = (slug: string, label: string): MediaSeed => ({
  kind: "character_image",
  format: "svg",
  label,
  url: `/assets/${slug}.svg`,
});

const IP_PARTNERS = [
  {
    slug: "nova-pixel-studio",
    name: "Nova Pixel Studio",
    logoUrl: "/assets/partner-nova-pixel.svg",
  },
];

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
    media: [
      img("steamboat-willie-mickey", "Steamboat Willie (still)"),
      {
        kind: "three_d_model",
        format: "glb",
        label: "Steamboat — 3D scene (sample)",
        url: SAMPLE_GLB,
        posterUrl: "/assets/steamboat-willie-mickey.svg",
      },
    ],
    license: pd(["US"]),
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
    media: [img("betty-boop-early", "Betty Boop (illustration)")],
    license: pd(["US"]),
  },
  {
    slug: "nancy-drew-early",
    label: "Nancy Drew (early novels)",
    kind: "character",
    thumbnailUrl: "/assets/nancy-drew-early.svg",
    publicDomainIn: ["US"],
    styleGuide: {
      label: "Nancy Drew (early novels)",
      provenanceNotice: "Based on the early public-domain Nancy Drew novels.",
      prohibitions: ["later illustrated cover art", "TV/film likenesses"],
      requiredTransformations: [],
    },
    media: [img("nancy-drew-early", "Nancy Drew (illustration)")],
    license: pd(["US"]),
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
    media: [img("albert-einstein", "Einstein (illustration)")],
    license: pd(["US", "EU"]),
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
    media: [img("nikola-tesla", "Tesla (illustration)")],
    license: pd(["US", "EU"]),
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
    media: [img("leonardo-da-vinci", "da Vinci (illustration)")],
    license: pd(["US", "EU"]),
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
    media: [
      {
        kind: "artwork",
        format: "svg",
        label: "The Great Wave (artwork)",
        url: "/assets/hokusai-great-wave.svg",
      },
    ],
    license: pd(["US", "EU", "JP"]),
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
    media: [img("sherlock-holmes", "Sherlock Holmes (illustration)")],
    license: pd(["US", "EU"]),
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
    media: [img("alice-in-wonderland", "Alice (illustration)")],
    license: pd(["US", "EU", "JP"]),
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
    media: [img("dracula", "Dracula (illustration)")],
    license: pd(["US", "EU", "JP"]),
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
    media: [img("frankenstein", "Frankenstein's Creature (illustration)")],
    license: pd(["US", "EU", "JP"]),
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
    media: [img("wizard-of-oz", "Wizard of Oz (illustration)")],
    license: pd(["US", "EU", "JP"]),
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
    media: [img("robin-hood", "Robin Hood (illustration)")],
    license: pd(["US", "EU", "JP"]),
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
    media: [img("pinocchio", "Pinocchio (illustration)")],
    license: pd(["US", "EU", "JP"]),
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
    media: [
      {
        kind: "artwork",
        format: "svg",
        label: "The Starry Night (artwork)",
        url: "/assets/van-gogh-starry-night.svg",
      },
    ],
    license: pd(["US", "EU", "JP"]),
  },

  // --- Sample LICENSED IP (non-public-domain) to demonstrate the partner flow ---
  {
    slug: "nova-the-explorer",
    label: "Nova the Explorer (licensed)",
    kind: "character",
    thumbnailUrl: "/assets/nova-the-explorer.svg",
    publicDomainIn: [],
    styleGuide: {
      label: "Nova the Explorer — © Nova Pixel Studio",
      provenanceNotice:
        "Official licensed character. © Nova Pixel Studio. Used under platform license.",
      prohibitions: ["off-model redesigns", "mature or political themes"],
      requiredTransformations: [],
    },
    media: [
      {
        kind: "character_image",
        format: "svg",
        label: "Nova — hero pose",
        url: "/assets/nova-the-explorer.svg",
      },
      {
        kind: "three_d_model",
        format: "glb",
        label: "Nova — 3D model",
        url: SAMPLE_GLB,
        posterUrl: "/assets/nova-the-explorer.svg",
      },
    ],
    license: {
      type: "licensed",
      royaltyRate: 0.3,
      requiresApproval: true,
      allowedPlans: ["pro", "enterprise"],
      territories: ["US", "JP", "EU"],
      expiresAt: "2030-01-01",
      partnerSlug: "nova-pixel-studio",
    },
  },
];

const KIND_TO_PLATFORM_MEDIA: Record<MediaSeed["kind"], MediaSeed["kind"]> = {
  character_image: "character_image",
  sprite: "sprite",
  pose: "pose",
  three_d_model: "three_d_model",
  audio: "audio",
  artwork: "artwork",
  icon: "icon",
};

async function main() {
  // 1. IP partners.
  const partnerIdBySlug = new Map<string, string>();
  for (const p of IP_PARTNERS) {
    const row = await prisma.ipPartner.upsert({
      where: { slug: p.slug },
      update: { name: p.name, logoUrl: p.logoUrl },
      create: { slug: p.slug, name: p.name, logoUrl: p.logoUrl },
    });
    partnerIdBySlug.set(p.slug, row.id);
  }

  // 2. Assets (+ their media).
  for (const a of ASSETS) {
    const ipPartnerId = a.license.partnerSlug
      ? partnerIdBySlug.get(a.license.partnerSlug)
      : undefined;

    const asset = await prisma.pdAsset.upsert({
      where: { slug: a.slug },
      update: {
        label: a.label,
        thumbnailUrl: a.thumbnailUrl,
        provenanceNotice: a.styleGuide.provenanceNotice,
        publicDomainIn: a.publicDomainIn,
        styleGuide: a.styleGuide as unknown as object,
        licenseType: a.license.type,
        royaltyRate: a.license.royaltyRate,
        requiresApproval: a.license.requiresApproval,
        allowedPlans: a.license.allowedPlans,
        territories: a.license.territories,
        expiresAt: a.license.expiresAt ? new Date(a.license.expiresAt) : null,
        ipPartnerId: ipPartnerId ?? null,
      },
      create: {
        slug: a.slug,
        label: a.label,
        kind: a.kind,
        thumbnailUrl: a.thumbnailUrl,
        provenanceNotice: a.styleGuide.provenanceNotice,
        publicDomainIn: a.publicDomainIn,
        styleGuide: a.styleGuide as unknown as object,
        licenseType: a.license.type,
        royaltyRate: a.license.royaltyRate,
        requiresApproval: a.license.requiresApproval,
        allowedPlans: a.license.allowedPlans,
        territories: a.license.territories,
        expiresAt: a.license.expiresAt ? new Date(a.license.expiresAt) : null,
        ipPartnerId: ipPartnerId ?? null,
      },
    });

    // Refresh media for this asset.
    await prisma.assetMedia.deleteMany({ where: { assetId: asset.id } });
    await prisma.assetMedia.createMany({
      data: a.media.map((m) => ({
        assetId: asset.id,
        kind: KIND_TO_PLATFORM_MEDIA[m.kind],
        format: m.format,
        label: m.label,
        url: m.url,
        posterUrl: m.posterUrl ?? null,
      })),
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${IP_PARTNERS.length} IP partner(s) and ${ASSETS.length} assets (incl. 1 licensed).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
