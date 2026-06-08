import { planIdSchema } from "@pd/contracts";
import { getSession, setPlan } from "../../../../lib/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/activate?plan=pro — DEV stand-in for "Stripe checkout completed".
 * Requires a signed-in user, sets the subscribed plan, and returns to the dashboard.
 * In production this is the Stripe checkout-session success webhook/return handler.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = planIdSchema.safeParse(url.searchParams.get("plan"));
  if (!parsed.success) {
    return Response.redirect(new URL("/pricing", req.url), 303);
  }
  const session = await getSession();
  if (!session) {
    return Response.redirect(new URL("/signin?next=pricing", req.url), 303);
  }
  await setPlan(parsed.data);
  return Response.redirect(new URL("/dashboard?subscribed=1", req.url), 303);
}
