import { signIn } from "../../../../lib/session";

export const dynamic = "force-dynamic";

/** POST /api/auth/signin — dev sign-in by email (form post), then back to the dashboard. */
export async function POST(req: Request): Promise<Response> {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  if (!email || !email.includes("@")) {
    return Response.redirect(new URL("/signin?error=1", req.url), 303);
  }
  await signIn(email);
  return Response.redirect(new URL("/dashboard", req.url), 303);
}
