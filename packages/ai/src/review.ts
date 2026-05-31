/**
 * Automated first-pass review. It scans generated output for prohibited elements declared
 * in the asset's style guide and returns findings that feed `checkLicense` in @pd/core.
 * Anything flagged routes to the human exception queue rather than auto-publishing.
 *
 * This is intentionally a transparent heuristic, not a black box: the platform's legal
 * posture benefits from auditable, explainable checks.
 */
import type { StyleGuide } from "@pd/core";

export interface ReviewInput {
  /** Generated UI copy + asset description to scan. */
  text: string;
  styleGuide: StyleGuide;
}

export interface ReviewResult {
  detectedProhibitedTerms: string[];
  /** True when nothing prohibited was detected (still subject to license/market checks). */
  clean: boolean;
}

export function reviewGeneratedContent(input: ReviewInput): ReviewResult {
  const haystack = input.text.toLowerCase();
  const detected = input.styleGuide.prohibitions.filter((term) =>
    haystack.includes(term.toLowerCase()),
  );
  return { detectedProhibitedTerms: detected, clean: detected.length === 0 };
}
