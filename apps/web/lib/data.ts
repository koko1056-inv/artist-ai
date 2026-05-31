/**
 * Server-side data access. Every read tries Prisma first and, if the database is
 * unavailable (common in dev — see README), falls back to the in-memory sample data
 * that mirrors `packages/db/src/seed.ts`. This keeps the whole UI demoable without a
 * live Postgres while remaining correct once a DB is connected.
 *
 * Server-only: imports `@pd/db` (Prisma) and must never be pulled into a client bundle.
 */
import type {
  AssetMedia,
  LicenseInfo,
  Listing,
  PdAsset,
} from "@pd/contracts";
import type { AssetKind, PlanId, StyleGuide } from "@pd/core";
import {
  SAMPLE_ASSETS,
  SAMPLE_LISTINGS,
  SAMPLE_STYLE_GUIDES,
} from "./sample-data";

/** The DB enum uses snake_case for kinds; the client contract uses kebab-case. */
function dbKindToContract(kind: string): AssetKind {
  return (kind === "historical_figure" ? "historical-figure" : kind) as AssetKind;
}

function dbMediaKindToContract(kind: string): AssetMedia["kind"] {
  return (kind === "three_d_model"
    ? "3d-model"
    : kind === "character_image"
      ? "character-image"
      : kind) as AssetMedia["kind"];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMedia(rows: any[]): AssetMedia[] {
  return rows.map((m) => ({
    id: m.id,
    assetId: m.assetId,
    kind: dbMediaKindToContract(m.kind),
    format: m.format as AssetMedia["format"],
    label: m.label,
    url: m.url,
    posterUrl: m.posterUrl ?? undefined,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  }));
}

function mapLicense(row: any): LicenseInfo {
  return {
    type: row.licenseType === "licensed" ? "licensed" : "public-domain",
    partnerName: row.ipPartner?.name ?? undefined,
    partnerLogoUrl: row.ipPartner?.logoUrl ?? undefined,
    royaltyRate: row.royaltyRate ?? 0,
    requiresApproval: row.requiresApproval ?? false,
    allowedPlans: (row.allowedPlans ?? []) as PlanId[],
    territories: row.territories ?? [],
    expiresAt: row.expiresAt ? new Date(row.expiresAt).toISOString() : undefined,
  };
}

function mapAsset(r: any): PdAsset {
  return {
    id: r.slug,
    label: r.label,
    kind: dbKindToContract(r.kind),
    thumbnailUrl: r.thumbnailUrl,
    provenanceNotice: r.provenanceNotice,
    publicDomainIn: r.publicDomainIn,
    media: mapMedia(r.media ?? []),
    license: mapLicense(r),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const ASSET_INCLUDE = { media: true, ipPartner: true } as const;

/** Load the full asset catalog (Prisma, falling back to sample seed). */
export async function loadAssets(): Promise<PdAsset[]> {
  try {
    const { prisma } = await import("@pd/db");
    const rows = await prisma.pdAsset.findMany({
      include: ASSET_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) return SAMPLE_ASSETS;
    return rows.map(mapAsset);
  } catch {
    return SAMPLE_ASSETS;
  }
}

/** Load a single asset by its slug id (Prisma, falling back to sample seed). */
export async function loadAsset(id: string): Promise<PdAsset | undefined> {
  try {
    const { prisma } = await import("@pd/db");
    const r = await prisma.pdAsset.findUnique({
      where: { slug: id },
      include: ASSET_INCLUDE,
    });
    if (!r) return SAMPLE_ASSETS.find((a) => a.id === id);
    return mapAsset(r);
  } catch {
    return SAMPLE_ASSETS.find((a) => a.id === id);
  }
}

/**
 * Load the server-enforced style guide for an asset. Tries Prisma (stored as JSON),
 * falls back to the sample style guides that mirror the seed.
 */
export async function loadStyleGuide(id: string): Promise<StyleGuide | undefined> {
  try {
    const { prisma } = await import("@pd/db");
    const r = await prisma.pdAsset.findUnique({ where: { slug: id } });
    if (r?.styleGuide) return r.styleGuide as unknown as StyleGuide;
    return SAMPLE_STYLE_GUIDES[id];
  } catch {
    return SAMPLE_STYLE_GUIDES[id];
  }
}

/** Load published marketplace listings (Prisma, falling back to sample data). */
export async function loadListings(): Promise<Listing[]> {
  try {
    const { prisma } = await import("@pd/db");
    const rows = await prisma.listing.findMany({
      where: { status: "published" },
      include: { app: true },
      orderBy: { createdAt: "desc" },
    });
    if (rows.length === 0) return SAMPLE_LISTINGS;
    return rows.map((r) => ({
      id: r.id,
      appId: r.appId,
      title: r.title,
      summary: r.summary,
      // App.templateId is a snake_case enum; map to the kebab contract value.
      templateId: r.app.templateId.replace("_", "-") as Listing["templateId"],
      creatorName: "PD Forge Creator",
      priceMinor: r.priceMinor,
      currency: r.currency,
      aiAssisted: true,
      provenanceNotice: r.provenanceNotice,
      installCount: r.installCount,
      rating: r.ratingCount > 0 ? r.ratingSum / r.ratingCount : 0,
      licenseType: "public-domain",
    }));
  } catch {
    return SAMPLE_LISTINGS;
  }
}
