/**
 * Minimal cookie session — a DEV-GRADE stand-in for real auth/billing so the operational
 * loop (sign in → subscribe → publish → get paid) runs end-to-end without external services
 * or a database. The session is an HMAC-signed cookie carrying the user's email, plan, and
 * payout status. Swap `signIn`/`setPlan`/`setPayoutConnected` for a real auth provider
 * (NextAuth/Clerk) + Stripe later — call sites won't change.
 *
 * Server-only (uses node:crypto + next/headers cookies()).
 */
import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { PlanId } from "@pd/core";

const COOKIE = "pdf_session";
const SECRET = process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface Session {
  email: string;
  plan: PlanId;
  payoutConnected: boolean;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", SECRET).update(payload).digest());
}

function serialize(session: Session): string {
  const payload = b64url(Buffer.from(JSON.stringify(session), "utf-8"));
  return `${payload}.${sign(payload)}`;
}

function deserialize(value: string): Session | null {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  // Constant-time compare to validate the signature.
  const expected = sign(payload);
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
      "utf-8",
    );
    const obj = JSON.parse(json) as Session;
    if (typeof obj.email !== "string") return null;
    return obj;
  } catch {
    return null;
  }
}

/** Read the current session (or null). Safe in server components and route handlers. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  return raw ? deserialize(raw) : null;
}

/** The current creator's plan, defaulting to "free" when signed out. */
export async function currentPlan(): Promise<PlanId> {
  return (await getSession())?.plan ?? "free";
}

async function write(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, serialize(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Sign in (dev: email only). Starts on the free plan. Call from a route handler. */
export async function signIn(email: string): Promise<Session> {
  const session: Session = { email, plan: "free", payoutConnected: false };
  await write(session);
  return session;
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Update the subscribed plan (called by the billing activation handler). */
export async function setPlan(plan: PlanId): Promise<void> {
  const current = (await getSession()) ?? { email: "demo@pdforge.dev", payoutConnected: false, plan: "free" as PlanId };
  await write({ ...current, plan });
}

/** Mark payouts as connected (called by the payout-connect handler). */
export async function setPayoutConnected(connected: boolean): Promise<void> {
  const current = await getSession();
  if (!current) return;
  await write({ ...current, payoutConnected: connected });
}
