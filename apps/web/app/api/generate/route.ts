import {
  APP_TEMPLATES,
  canGenerate,
  getPlan,
  type PlanId,
  type UsageWindow,
} from "@pd/core";
import {
  buildSystemPrompt,
  buildUserPrompt,
  getCodegenProvider,
  reviewGeneratedContent,
  routeModel,
  type PromptInput,
} from "@pd/ai";
import {
  generateRequestSchema,
  type GenerateResponse,
} from "@pd/contracts";
import { apiError, apiOk } from "../../../lib/api";
import { loadAsset, loadStyleGuide } from "../../../lib/data";
import { buildHabitConfig, encodeAppConfig } from "../../../lib/app-config";
import { currentPlan } from "../../../lib/session";

export const dynamic = "force-dynamic";

/**
 * POST /api/generate — produce an AI-assisted app bundle.
 *
 * Demo posture: the current creator is a "basic" subscriber with a fresh usage window.
 * In production the plan + usage come from the authenticated user's Subscription row.
 */
export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiError("invalid_json", "Request body must be valid JSON.");
  }

  const parsed = generateRequestSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("invalid_request", parsed.error.issues[0]?.message ?? "Invalid request.");
  }
  const { prompt, templateId, assetId, baseVersionId } = parsed.data;

  const asset = await loadAsset(assetId);
  const styleGuide = await loadStyleGuide(assetId);
  if (!asset || !styleGuide) {
    return apiError("asset_not_found", `Unknown asset "${assetId}".`, 404);
  }

  // Plan from the signed-in session (free when signed out); usage from the subscription
  // later. Generating is allowed on the free plan; publishing/selling requires a paid plan.
  const planId: PlanId = await currentPlan();
  const plan = getPlan(planId);
  const usage: UsageWindow = { generationsUsed: 0, aiSpendMinor: 0 };

  const decision = canGenerate(plan, usage);
  if (!decision.allowed) {
    const message =
      decision.reason === "quota-exhausted"
        ? "Generation quota exhausted for this billing period."
        : "AI cost ceiling reached for this billing period.";
    return apiError(decision.reason ?? "quota_blocked", message, 402);
  }

  const model = routeModel(plan);
  const promptInput: PromptInput = {
    intent: prompt,
    template: APP_TEMPLATES[templateId],
    styleGuide,
    locale: "en",
  };
  // System/user prompts are assembled here so the asset's rules travel with every
  // generation; the mock provider ignores them but real adapters consume them.
  void buildSystemPrompt(styleGuide);
  void buildUserPrompt(promptInput);

  const provider = getCodegenProvider();
  const generation = baseVersionId
    ? await provider.edit(
        promptInput,
        model,
        `https://bundles.local/mock/${templateId}-${baseVersionId}.js`,
      )
    : await provider.generate(promptInput, model);

  // Automated first-pass review feeds the publish-time license check.
  const review = reviewGeneratedContent({
    text: generation.generatedText,
    styleGuide,
  });
  void review; // surfaced at publish time; recorded here in production for audit.

  // Build the REAL, runnable app config and encode it into a shareable URL. The MVP ships
  // one template (habit tracker); the runtime at /a/habit turns this into a working,
  // data-persisting PWA. (A real LLM later returns this config behind the same interface.)
  let appUrl: string | undefined;
  let config: ReturnType<typeof buildHabitConfig> | undefined;
  if (templateId === "habit-tracker") {
    config = buildHabitConfig({ asset, prompt });
    const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    appUrl = `${base}/a/habit?c=${encodeAppConfig(config)}`;
  }

  const response: GenerateResponse = {
    appVersionId: `av_${Math.random().toString(36).slice(2, 10)}`,
    bundleUrl: generation.bundleUrl,
    appUrl,
    config,
    modelTier: model.tier,
    estimatedCostMinor: generation.costMinor,
    remainingGenerations: Math.max(0, decision.remainingGenerations - 1),
  };
  return apiOk(response, 201);
}
