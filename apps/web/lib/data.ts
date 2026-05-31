/**
 * Server-side data access. Every read tries Prisma first and, if the database is
 * unavailable (common in dev — see README), falls back to the in-memory sample data
 * that mirrors `packages/db/src/seed.ts`. This keeps the whole UI demoable without a
 * live Postgres while remaining correct once a DB is connected.
 *
 * Server-only: imports `@pd/db` (Prisma) and must never be pulled into a client bundle.
 */
import type { Listing, PdAsset } from "@pd/contracts";
import type { AssetKind, StyleGuide } from "@pd/core";
import {
  SAMPLE_ASSETS,
  SAMPLE_LISTINGS,
  SAMPLE_STYLE_GUIDES,
} from "./sample-data";

/** The DB enum uses snake_case for kinds; the client contract uses kebab-case. */
function dbKindToContract(kind: string): AssetKind {
  return (kind === "historical_figure" ? "historical-figure" : kind) as AssetKind;
}

/** Load the full PD asset catalog (Prisma, falling back to sample seed). */
export async function loadAssets(): Promise<PdAsset[]> {
  try {
    const { prisma } = await import("@pd/db");
    const rows = await prisma.pdAsset.findMany({ orderBy: { createdAt: "asc" } });
    if (rows.length === 0) return SAMPLE_ASSETS;
    return rows.map((r) => ({
      id: r.slug,
      label: r.label,
      kind: dbKindToContract(r.kind),
      thumbnailUrl: r.thumbnailUrl,
      provenanceNotice: r.provenanceNotice,
      publicDomainIn: r.publicDomainIn,
    }));
  } catch {
    return SAMPLE_ASSETS;
  }
}

/** Load a single PD asset by its slug id (Prisma, falling back to sample seed). */
export async function loadAsset(id: string): Promise<PdAsset | undefined> {
  try {
    const { prisma } = await import("@pd/db");
    const r = await prisma.pdAsset.findUnique({ where: { slug: id } });
    if (!r) return SAMPLE_ASSETS.find((a) => a.id === id);
    return {
      id: r.slug,
      label: r.label,
      kind: dbKindToContract(r.kind),
      thumbnailUrl: r.thumbnailUrl,
      provenanceNotice: r.provenanceNotice,
      publicDomainIn: r.publicDomainIn,
    };
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
    }));
  } catch {
    return SAMPLE_LISTINGS;
  }
}
