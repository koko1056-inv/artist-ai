/**
 * Maps a plan's allowed model tier to a concrete model and its approximate cost. Routing
 * by plan is a core cost lever: cheaper tiers for lower plans keep AI spend bounded.
 */
import type { ModelTier, Plan } from "@pd/core";

export interface ModelChoice {
  tier: ModelTier;
  model: string;
  /** Approximate USD minor units per full generation, for metering/guardrails. */
  approxCostMinorPerGeneration: number;
}

const MODELS: Record<ModelTier, ModelChoice> = {
  small: { tier: "small", model: "claude-haiku-4-5", approxCostMinorPerGeneration: 20 },
  standard: { tier: "standard", model: "claude-sonnet-4-6", approxCostMinorPerGeneration: 60 },
  premium: { tier: "premium", model: "claude-opus-4-8", approxCostMinorPerGeneration: 150 },
};

/** Pick the best model the plan is allowed to use (its max tier). */
export function routeModel(plan: Plan): ModelChoice {
  return MODELS[plan.limits.maxModelTier];
}

/** A diff-based edit is materially cheaper than a full generation. */
export function editCostMinor(choice: ModelChoice): number {
  return Math.round(choice.approxCostMinorPerGeneration * 0.35);
}
