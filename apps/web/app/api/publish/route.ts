import { checkLicense, type AssetLicense, type StyleGuide } from "@pd/core";
import { reviewGeneratedContent } from "@pd/ai";
import {
  publishRequestSchema,
  type PublishResponse,
} from "@pd/contracts";
import { isPayingPlan } from "@pd/core";
import { apiError, apiOk } from "../../../lib/api";
import { SAMPLE_STYLE_GUIDES } from "../../../lib/sample-data";
import { currentPlan } from "../../../lib/session";

export const dynamic = "force-dynamic";

interface ResolvedTerms {
  licenseType: "public-domain" | "licensed";
  royaltyRate: number;
  requiresApproval: boolean;
  partnerName?: string;
}

/** Resolve the style guide + license (incl. rights terms) for the version being published. */
async function resolveLicense(appVersionId: string): Promise<{
  styleGuide: StyleGuide;
  license: AssetLicense;
  terms: ResolvedTerms;
}> {
  try {
    const { prisma } = await import("@pd/db");
    const usage = await prisma.assetUsage.findFirst({
      where: { appVersionId },
      include: { asset: { include: { ipPartner: true } } },
    });
    if (usage?.asset) {
      const a = usage.asset;
      const sg = a.styleGuide as unknown as StyleGuide;
      return {
        styleGuide: sg,
        license: {
          kind:
            a.kind === "historical_figure"
              ? "historical-figure"
              : (a.kind as AssetLicense["kind"]),
          publicDomainIn: a.publicDomainIn,
          styleGuide: sg,
        },
        terms: {
          licenseType: a.licenseType === "licensed" ? "licensed" : "public-domain",
          royaltyRate: a.royaltyRate ?? 0,
          requiresApproval: a.requiresApproval ?? false,
          partnerName: a.ipPartner?.name ?? undefined,
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
    terms: { licenseType: "public-domain", royaltyRate: 0, requiresApproval: false },
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

  // Publishing & selling require an active paid subscription.
  if (!isPayingPlan(await currentPlan())) {
    return apiError(
      "subscription_required",
      "Publishing requires an active subscription. Choose a plan to publish and sell.",
      402,
    );
  }

  const { styleGuide, license, terms } = await resolveLicense(appVersionId);

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

  // Licensed IP that requires partner approval cannot auto-publish even when clean.
  const clean = result.ok;
  const status: PublishResponse["status"] =
    clean && !terms.requiresApproval ? "published" : "in-review";

  const response: PublishResponse = {
    listingId:
      status === "published" ? `lst_${Math.random().toString(36).slice(2, 10)}` : null,
    status,
    requiredNotice: result.requiredNotice,
    violations: result.violations,
    licenseType: terms.licenseType,
    royaltyRate: terms.royaltyRate,
    creditLine: terms.partnerName ? `© ${terms.partnerName}` : undefined,
  };
  return apiOk(response, status === "published" ? 201 : 200);
}
