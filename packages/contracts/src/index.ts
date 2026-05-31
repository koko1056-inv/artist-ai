/**
 * API contracts shared by the web API, the web client, and the mobile host app.
 * Every request/response is a zod schema with an inferred TS type, so the wire format
 * is validated at the boundary and the types never drift between platforms.
 */
import { z } from "zod";

export const planIdSchema = z.enum(["free", "basic", "pro", "enterprise"]);
export const templateIdSchema = z.enum([
  "task-manager",
  "habit-tracker",
  "calendar",
  "notes",
]);
export const modelTierSchema = z.enum(["small", "standard", "premium"]);

/** POST /api/generate — request an AI-generated app bundle. */
export const generateRequestSchema = z.object({
  prompt: z.string().min(10).max(2000),
  templateId: templateIdSchema,
  assetId: z.string().min(1),
  /** Optional: refine an existing app version with a diff-based edit (cheaper). */
  baseVersionId: z.string().optional(),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  appVersionId: z.string(),
  /** Sandboxed bundle entry the host app / PWA loads. */
  bundleUrl: z.string().url(),
  modelTier: modelTierSchema,
  /** Estimated cost of this generation in USD minor units (for metering). */
  estimatedCostMinor: z.number().int().nonnegative(),
  remainingGenerations: z.number().int().nonnegative(),
});
export type GenerateResponse = z.infer<typeof generateResponseSchema>;

/** Public-domain asset as exposed to clients (style guide is server-enforced). */
export const pdAssetSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["character", "historical-figure", "artwork"]),
  thumbnailUrl: z.string().url(),
  provenanceNotice: z.string(),
  publicDomainIn: z.array(z.string()),
});
export type PdAsset = z.infer<typeof pdAssetSchema>;

/** Marketplace listing as shown to end users. */
export const listingSchema = z.object({
  id: z.string(),
  appId: z.string(),
  title: z.string(),
  summary: z.string(),
  templateId: templateIdSchema,
  creatorName: z.string(),
  priceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  aiAssisted: z.boolean(),
  provenanceNotice: z.string(),
  installCount: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
});
export type Listing = z.infer<typeof listingSchema>;

/** POST /api/publish — submit an app version for review + listing. */
export const publishRequestSchema = z.object({
  appVersionId: z.string(),
  title: z.string().min(3).max(80),
  summary: z.string().min(10).max(280),
  priceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3).default("USD"),
});
export type PublishRequest = z.infer<typeof publishRequestSchema>;

export const publishResponseSchema = z.object({
  listingId: z.string().nullable(),
  status: z.enum(["published", "in-review", "rejected"]),
  requiredNotice: z.string(),
  violations: z.array(z.string()),
});
export type PublishResponse = z.infer<typeof publishResponseSchema>;

/** POST /api/billing/checkout — start a subscription via web Stripe checkout. */
export const checkoutRequestSchema = z.object({
  planId: planIdSchema,
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const checkoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

/** Generic typed error envelope. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
