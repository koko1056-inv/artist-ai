import { getSession, setPayoutConnected } from "../../../../lib/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/payouts/connect — DEV stand-in for Stripe Connect onboarding completion.
 * Marks the creator's payout account as connected so we can release marketplace earnings.
 */
export async function GET(req: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return Response.redirect(new URL("/signin", req.url), 303);
  }
  await setPayoutConnected(true);
  return Response.redirect(new URL("/dashboard?payouts=1", req.url), 303);
}
