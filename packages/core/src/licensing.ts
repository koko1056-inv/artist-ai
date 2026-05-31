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
