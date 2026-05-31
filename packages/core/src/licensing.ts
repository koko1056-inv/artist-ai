/**
 * Licensing and provenance rules for public-domain (PD) assets.
 *
 * The legal posture of the platform depends on: (1) only the PD *version* of a work
 * being used, (2) clear provenance labels, and (3) trademark / right-of-publicity
 * avoidance. These rules are attached to every asset and enforced at review time.
 */

export type AssetKind = "character" | "historical-figure" | "artwork";

export interface StyleGuide {
  /** Short human label, e.g. "Steamboat Willie Mickey (1928)". */
  label: string;
  /** Required provenance string surfaced on every published app. */
  provenanceNotice: string;
  /** Things creators MUST NOT do (late-design traits, trademark confusion, etc.). */
  prohibitions: string[];
  /** Required transformations (e.g. cartoonize a historical figure). */
  requiredTransformations: string[];
  /** For historical figures: publicity-right caveat. */
  publicityNote?: string;
}

export interface AssetLicense {
  kind: AssetKind;
  /** Jurisdictions where the source work is confirmed public domain (ISO codes). */
  publicDomainIn: string[];
  styleGuide: StyleGuide;
}

/**
 * How an asset may be used. Public-domain assets are open to everyone with no royalty.
 * Licensed assets come from an IP partner and carry royalty, eligibility, approval, and
 * territory/expiry terms — the mechanism that lets us onboard official IP when we partner
 * with a rights holder, without changing the rest of the create→publish flow.
 */
export type LicenseType = "public-domain" | "licensed";

export interface IpPartner {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface LicenseTerms {
  type: LicenseType;
  /** Present only for licensed assets. */
  partner?: IpPartner;
  /** Fraction of gross paid to the rights holder. 0 for public domain. */
  royaltyRate: number;
  /** Licensed assets usually require manual approval before publishing. */
  requiresApproval: boolean;
  /** Plan ids allowed to use this asset. Public domain = all plans. */
  allowedPlans: string[];
  /** ISO market codes where use is permitted. */
  territories: string[];
  /** ISO date string after which the license is no longer valid. */
  expiresAt?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: "plan-not-allowed" | "expired" | "territory-not-allowed";
}

/** Whether a creator on `planId` may use an asset with the given terms, in `market`. */
export function checkEligibility(
  terms: LicenseTerms,
  opts: { planId: string; market: string; now?: Date },
): EligibilityResult {
  if (terms.type === "licensed") {
    if (!terms.allowedPlans.includes(opts.planId)) {
      return { eligible: false, reason: "plan-not-allowed" };
    }
    if (terms.expiresAt && new Date(terms.expiresAt) < (opts.now ?? new Date())) {
      return { eligible: false, reason: "expired" };
    }
  }
  if (terms.territories.length > 0 && !terms.territories.includes(opts.market)) {
    return { eligible: false, reason: "territory-not-allowed" };
  }
  return { eligible: true };
}

/** Convenience: public-domain terms (open to everyone, no royalty/approval). */
export function publicDomainTerms(publicDomainIn: string[]): LicenseTerms {
  return {
    type: "public-domain",
    royaltyRate: 0,
    requiresApproval: false,
    allowedPlans: ["free", "basic", "pro", "enterprise"],
    territories: publicDomainIn,
  };
}

/**
 * Result of validating a candidate publication against an asset's license rules.
 * The automated review (see `@pd/ai`) feeds findings here; a human queue handles
 * anything flagged.
 */
export interface LicenseCheck {
  ok: boolean;
  /** Required notice that must appear on the listing/app. */
  requiredNotice: string;
  violations: string[];
}

/**
 * Build the provenance notice + a checklist of violations for a publication.
 * `detectedTerms` are signals surfaced by upstream automated analysis (banned
 * traits, trademarked phrasing, etc.).
 */
export function checkLicense(
  license: AssetLicense,
  opts: { detectedProhibitedTerms?: string[]; localeMarket: string },
): LicenseCheck {
  const violations: string[] = [];

  if (!license.publicDomainIn.includes(opts.localeMarket)) {
    violations.push(
      `Source work is not confirmed public domain in market "${opts.localeMarket}".`,
    );
  }

  for (const term of opts.detectedProhibitedTerms ?? []) {
    violations.push(`Prohibited element detected: ${term}`);
  }

  return {
    ok: violations.length === 0,
    requiredNotice: license.styleGuide.provenanceNotice,
    violations,
  };
}
