/**
 * Runtime configuration for the host app.
 *
 * The mobile host talks to the PD Forge web API for marketplace data, app bundles,
 * and (web) billing. The base URL is overridable via the Expo config `extra.apiBaseUrl`
 * so that dev / staging / prod can point at different backends without code changes.
 */

// In a fully wired build this would read from `expo-constants`
// (`Constants.expoConfig?.extra?.apiBaseUrl`). We keep the skeleton dependency-light
// and fall back to localhost for development.
const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const API_BASE_URL: string = DEFAULT_API_BASE_URL;

/** Build an absolute API endpoint from a path (with or without a leading slash). */
export function endpoint(path: string): string {
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}/${trimmed}`;
}

/** Known API routes, centralized so screens never hand-roll URLs. */
export const ROUTES = {
  listings: () => endpoint("/api/listings"),
  generate: () => endpoint("/api/generate"),
  checkout: () => endpoint("/api/billing/checkout"),
  /** Web billing portal opened in the browser (store-fee-free subscriptions). */
  billingPortal: () => endpoint("/account/billing"),
} as const;
