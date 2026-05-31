/**
 * Subscription plans and the cost guardrails attached to each.
 *
 * The platform's primary revenue is the monthly subscription, sold via web checkout
 * (Stripe) to avoid the 15–30% app-store cut. Plans differ mainly by AI generation
 * quota, number of publishable apps, and which models a creator may route to — the
 * levers that keep AI cost under a bounded fraction of the subscription price.
 */

export type PlanId = "free" | "basic" | "pro" | "enterprise";

/** Which AI model tier a plan may use. Concrete model IDs are resolved in `@pd/ai`. */
export type ModelTier = "small" | "standard" | "premium";

export interface PlanLimits {
  /** AI generations granted per billing period (full generations; edits are cheaper). */
  generationsPerMonth: number;
  /** Max number of apps a creator may have published at once. */
  maxPublishedApps: number;
  /** Highest model tier this plan may route to. */
  maxModelTier: ModelTier;
  /** Whether the creator may sell apps on the marketplace. */
  canSell: boolean;
}

export interface Plan {
  id: PlanId;
  /** i18n key for the display name; resolve via `@pd/core/i18n`. */
  nameKey: string;
  /** Price in minor units (USD cents). 0 for free. */
  priceMinor: number;
  currency: "USD";
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    nameKey: "plan.free.name",
    priceMinor: 0,
    currency: "USD",
    limits: {
      generationsPerMonth: 5,
      maxPublishedApps: 1,
      maxModelTier: "small",
      canSell: false,
    },
  },
  basic: {
    id: "basic",
    nameKey: "plan.basic.name",
    priceMinor: 1900,
    currency: "USD",
    limits: {
      generationsPerMonth: 100,
      maxPublishedApps: 10,
      maxModelTier: "standard",
      canSell: true,
    },
  },
  pro: {
    id: "pro",
    nameKey: "plan.pro.name",
    priceMinor: 3900,
    currency: "USD",
    limits: {
      generationsPerMonth: 400,
      maxPublishedApps: 100,
      maxModelTier: "premium",
      canSell: true,
    },
  },
  enterprise: {
    id: "enterprise",
    nameKey: "plan.enterprise.name",
    // Custom pricing; represented as 0 here and negotiated per contract.
    priceMinor: 0,
    currency: "USD",
    limits: {
      generationsPerMonth: 5000,
      maxPublishedApps: 1000,
      maxModelTier: "premium",
      canSell: true,
    },
  },
};

/** The platform's take rate on marketplace sales (fraction of gross). */
export const MARKETPLACE_TAKE_RATE = 0.25;

/** The platform's take rate on print-on-demand sales (Phase 2). */
export const POD_TAKE_RATE = 0.2;

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}

/** Whether a model tier is allowed under a plan. */
export function isTierAllowed(plan: Plan, tier: ModelTier): boolean {
  const order: ModelTier[] = ["small", "standard", "premium"];
  return order.indexOf(tier) <= order.indexOf(plan.limits.maxModelTier);
}
