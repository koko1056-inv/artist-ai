export * from "./model-routing.js";
export * from "./prompt.js";
export * from "./review.js";
export * from "./provider.js";

import type { CodegenProvider } from "./provider.js";
import { MockCodegenProvider } from "./provider.js";

/**
 * Selects a provider from configuration. Falls back to the mock provider when no real
 * provider is configured, so the platform runs end-to-end in dev without API keys.
 */
export function getCodegenProvider(
  providerName = process.env.AI_PROVIDER ?? "mock",
): CodegenProvider {
  switch (providerName) {
    // Real adapters (anthropic/openai) are wired in once API keys are present; until
    // then the mock keeps the create→review→publish flow fully exercisable.
    case "mock":
    default:
      return new MockCodegenProvider();
  }
}
