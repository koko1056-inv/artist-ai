import {
  checkoutRequestSchema,
  type CheckoutResponse,
} from "@pd/contracts";
import { apiError, apiOk } from "../../../../lib/api";
import { getBillingProvider } from "../../../../lib/billing";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout — start a subscription via web checkout.
 * Provider-abstracted (see lib/billing.ts); the mock provider returns a placeholder
 * URL until real Stripe is wired in.
 */
export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiError("invalid_json", "Request body must be valid JSON.");
  }

  const parsed = checkoutRequestSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("invalid_request", parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  try {
    const provider = getBillingProvider();
    const session = await provider.createCheckoutSession({
      planId: parsed.data.planId,
    });
    const response: CheckoutResponse = { checkoutUrl: session.checkoutUrl };
    return apiOk(response);
  } catch {
    return apiError("checkout_failed", "Could not start checkout.", 500);
  }
}
