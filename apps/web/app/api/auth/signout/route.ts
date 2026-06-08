import { signOut } from "../../../../lib/session";

export const dynamic = "force-dynamic";

/** POST /api/auth/signout — clear the session, back to home. */
export async function POST(req: Request): Promise<Response> {
  await signOut();
  return Response.redirect(new URL("/", req.url), 303);
}
