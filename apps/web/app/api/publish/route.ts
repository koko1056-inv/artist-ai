import { checkLicense, type AssetLicense, type StyleGuide } from "@pd/core";
import { reviewGeneratedContent } from "@pd/ai";
import {
  publishRequestSchema,
  type PublishResponse,
} from "@pd/contracts";
import { apiError, apiOk } from "../../../lib/api";
import { SAMPLE_STYLE_GUIDES } from "../../../lib/sample-data";

export const dynamic = "force-dynamic";

/** Resolve the style guide + license for the app version being published. */
async function resolveLicense(appVersionId: string): Promise<{
  styleGuide: StyleGuide;
  license: AssetLicense;
}> {
  // Try the DB: find the asset recorded against this version's usage, with its
  // style guide and PD markets, so the license check is exact.
  try {
    const { prisma } = await import("@pd/db");
    const usage = await prisma.assetUsage.findFirst({
      where: { appVersionId },
      include: { asset: true },
    });
    if (usage?.asset) {
      const sg = usage.asset.styleGuide as unknown as StyleGuide;
      return {
        styleGuide: sg,
        license: {
          kind:
            usage.asset.kind === "historical_figure"
              ? "historical-figure"
              : (usage.asset.kind as AssetLicense["kind"]),
          publicDomainIn: usage.asset.publicDomainIn,
          styleGuide: sg,
        },
      };
    }
  } catch {
    // Fall through to the demo default below.
  }

  // Demo fallback: the publish contract carries only appVersionId (the asset binding
  // lives server-side), so without a DB we use a representative PD asset so the
  // create -> review -> publish flow stays fully exercisable.
  const sg = SAMPLE_STYLE_GUIDES["steamboat-willie-mickey"];
  if (!sg) {
    throw new Error("Missing fallback style guide.");
  }
  return {
    styleGuide: sg,
    license: { kind: "character", publicDomainIn: ["US"], styleGuide: sg },
  };
}

/** POST /api/publish — run license/provenance checks and create a listing if clean. */
export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiError("invalid_json", "Request body must be valid JSON.");
  }

  const parsed = publishRequestSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("invalid_request", parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  const { appVersionId, title, summary } = parsed.data;

  const { styleGuide, license } = await resolveLicense(appVersionId);

  // Scan the listing copy for prohibited elements; these findings feed checkLicense.
  const review = reviewGeneratedContent({
    text: `${title}\n${summary}`,
    styleGuide,
  });

  // localeMarket "US" for the demo; in production this comes from the seller's market.
  const result = checkLicense(license, {
    detectedProhibitedTerms: review.detectedProhibitedTerms,
    localeMarket: "US",
  });

  const status: PublishResponse["status"] = result.ok ? "published" : "in-review";
  const response: PublishResponse = {
    listingId: result.ok ? `lst_${Math.random().toString(36).slice(2, 10)}` : null,
    status,
    requiredNotice: result.requiredNotice,
    violations: result.violations,
  };
  return apiOk(response, result.ok ? 201 : 200);
}
