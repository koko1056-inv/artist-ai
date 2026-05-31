/**
 * Payment provider abstraction. Subscriptions are sold via web checkout (Stripe) to
 * avoid the 15–30% app-store cut. Real Stripe is wired in later; until then a mock
 * provider returns a placeholder checkout URL so the flow is exercisable end-to-end.
 */
import type { PlanId } from "@pd/core";

export interface CheckoutSession {
  checkoutUrl: string;
}

export interface BillingProvider {
  readonly name: string;
  createCheckoutSession(input: { planId: PlanId }): Promise<CheckoutSession>;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/** Deterministic mock — no Stripe keys, no network. */
export class MockBillingProvider implements BillingProvider {
  readonly name = "mock";

  async createCheckoutSession(input: {
    planId: PlanId;
  }): Promise<CheckoutSession> {
    return {
      checkoutUrl: `${appUrl()}/checkout/mock?plan=${encodeURIComponent(input.planId)}`,
    };
  }
}

/**
 * Selects a provider from configuration. Falls back to the mock provider when Stripe is
 * not configured, mirroring `getCodegenProvider` in `@pd/ai`.
 */
export function getBillingProvider(
  providerName = process.env.BILLING_PROVIDER ?? "mock",
): BillingProvider {
  switch (providerName) {
    // case "stripe": return new StripeBillingProvider(); // wired in later
    case "mock":
    default:
      return new MockBillingProvider();
  }
}
