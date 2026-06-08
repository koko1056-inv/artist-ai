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

export const mediaKindSchema = z.enum([
  "character-image",
  "sprite",
  "pose",
  "3d-model",
  "audio",
  "artwork",
  "icon",
]);
export const mediaFormatSchema = z.enum(["png", "jpg", "svg", "glb", "gltf", "mp3", "wav"]);
export const licenseTypeSchema = z.enum(["public-domain", "licensed"]);

/** A selectable piece of media on an asset (image, 3D model, audio…). */
export const assetMediaSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  kind: mediaKindSchema,
  format: mediaFormatSchema,
  label: z.string(),
  url: z.string(),
  posterUrl: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type AssetMedia = z.infer<typeof assetMediaSchema>;

/** Rights/licensing info surfaced to clients (PD vs licensed IP). */
export const licenseInfoSchema = z.object({
  type: licenseTypeSchema,
  partnerName: z.string().optional(),
  partnerLogoUrl: z.string().optional(),
  royaltyRate: z.number().min(0).max(1),
  requiresApproval: z.boolean(),
  allowedPlans: z.array(planIdSchema),
  territories: z.array(z.string()),
  expiresAt: z.string().optional(),
});
export type LicenseInfo = z.infer<typeof licenseInfoSchema>;

/** POST /api/generate — request an AI-generated app bundle. */
export const generateRequestSchema = z.object({
  prompt: z.string().min(10).max(2000),
  templateId: templateIdSchema,
  assetId: z.string().min(1),
  /** Specific media (images / 3D / audio) the creator picked to include. */
  mediaIds: z.array(z.string()).default([]),
  /** Optional: refine an existing app version with a diff-based edit (cheaper). */
  baseVersionId: z.string().optional(),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
  appVersionId: z.string(),
  /** Sandboxed bundle entry the host app / PWA loads. */
  bundleUrl: z.string().url(),
  /** Shareable URL of the real, runnable app (the published PWA). */
  appUrl: z.string().optional(),
  modelTier: modelTierSchema,
  /** Estimated cost of this generation in USD minor units (for metering). */
  estimatedCostMinor: z.number().int().nonnegative(),
  remainingGenerations: z.number().int().nonnegative(),
});
export type GenerateResponse = z.infer<typeof generateResponseSchema>;

/**
 * The configuration that drives a real, runnable app. The MVP ships ONE template — a habit
 * tracker — rendered by the platform runtime and persisted on the user's device. AI (or the
 * deterministic fallback) turns a prompt into this config; the runtime turns the config into
 * a working app. Encoded into the shareable app URL so it works without a database.
 */
export const appConfigSchema = z.object({
  template: z.literal("habit-tracker"),
  title: z.string().min(1).max(80),
  characterId: z.string(),
  characterImageUrl: z.string(),
  /** Accent color (hex) for theming. */
  accent: z.string(),
  /** A short in-character line of encouragement. */
  encouragement: z.string(),
  /** Initial habits to track (kept short and daily-use). */
  habits: z.array(z.string().min(1).max(60)).min(1).max(8),
  provenanceNotice: z.string(),
  aiAssisted: z.boolean(),
});
export type AppConfig = z.infer<typeof appConfigSchema>;

/**
 * An asset as exposed to clients. Carries its selectable media and its license info.
 * Public-domain and licensed-IP assets share this shape; `license.type` distinguishes
 * them. (Name kept as `pdAsset*` for backward compatibility.)
 */
export const pdAssetSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(["character", "historical-figure", "artwork"]),
  thumbnailUrl: z.string(),
  provenanceNotice: z.string(),
  publicDomainIn: z.array(z.string()),
  media: z.array(assetMediaSchema).default([]),
  license: licenseInfoSchema,
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
  /** Thumbnail for the listing card (asset image / illustration). */
  thumbnailUrl: z.string().optional(),
  /** Rights context shown on the listing. */
  licenseType: licenseTypeSchema.default("public-domain"),
  /** Credit line for licensed IP (e.g. "© Demo Studio"). */
  creditLine: z.string().optional(),
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
  /** Rights context for the published app. */
  licenseType: licenseTypeSchema.default("public-domain"),
  /** Royalty rate applied to sales (0 for public domain). */
  royaltyRate: z.number().min(0).max(1).default(0),
  /** Credit line to display when built on licensed IP. */
  creditLine: z.string().optional(),
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
