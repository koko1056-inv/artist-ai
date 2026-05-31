/**
 * Small server-side helpers for API route handlers: typed JSON responses and a
 * consistent way to turn errors into the shared `ApiError` envelope.
 */
import type { ApiError } from "@pd/contracts";

/** Build a typed `ApiError` JSON response. */
export function apiError(
  code: string,
  message: string,
  status = 400,
): Response {
  const body: ApiError = { error: { code, message } };
  return Response.json(body, { status });
}

/** Build a typed success JSON response. */
export function apiOk<T>(body: T, status = 200): Response {
  return Response.json(body, { status });
}

/** Resolve the public app URL (used for absolute links in placeholder flows). */
export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
