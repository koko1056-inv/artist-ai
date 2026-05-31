/**
 * Cost guardrails. The platform's unit economics hold only if (a) AI generation cost
 * stays under a bounded fraction of the subscription, and (b) heavily-used free apps
 * cannot silently run at a loss. These helpers express those invariants.
 */

import type { Plan } from "./plans.js";

/** Target ceiling: AI spend per creator should not exceed this fraction of their plan price. */
export const AI_COST_CEILING_FRACTION = 0.3;

export interface UsageWindow {
  generationsUsed: number;
  /** Estimated AI spend so far this period, in USD minor units. */
  aiSpendMinor: number;
}

export interface QuotaDecision {
  allowed: boolean;
  reason?: "quota-exhausted" | "cost-ceiling";
  remainingGenerations: number;
}

/** Decide whether another generation is allowed under the plan's quota and cost ceiling. */
export function canGenerate(plan: Plan, usage: UsageWindow): QuotaDecision {
  const remaining = plan.limits.generationsPerMonth - usage.generationsUsed;
  if (remaining <= 0) {
    return { allowed: false, reason: "quota-exhausted", remainingGenerations: 0 };
  }
  // Free plans have no price to bound against; rely on the hard quota above.
  if (plan.priceMinor > 0) {
    const ceiling = plan.priceMinor * AI_COST_CEILING_FRACTION;
    if (usage.aiSpendMinor >= ceiling) {
      return { allowed: false, reason: "cost-ceiling", remainingGenerations: remaining };
    }
  }
  return { allowed: true, remainingGenerations: remaining };
}

/**
 * Attribute hosting cost to an app based on metered end-user requests, so a free app
 * that gets heavily used is visible (and rate-limitable) rather than a silent loss.
 */
export function estimateHostingCostMinor(
  monthlyRequests: number,
  costPerThousandRequestsMinor: number,
): number {
  return Math.round((monthlyRequests / 1000) * costPerThousandRequestsMinor);
}
