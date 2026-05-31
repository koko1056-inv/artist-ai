/**
 * Provider abstraction for AI codegen. Concrete adapters (Anthropic, OpenAI, …) implement
 * `CodegenProvider`; callers depend only on this interface, so vendors can be swapped or
 * routed per plan/cost without touching call sites.
 */
import type { ModelChoice } from "./model-routing.js";
import type { PromptInput } from "./prompt.js";

export interface CodegenResult {
  /** URL of the sandboxed bundle the host app / PWA loads. */
  bundleUrl: string;
  /** Generated UI copy / asset description, used by the automated review. */
  generatedText: string;
  /** Actual (or estimated) cost of this generation, USD minor units. */
  costMinor: number;
}

export interface CodegenProvider {
  readonly name: string;
  generate(input: PromptInput, model: ModelChoice): Promise<CodegenResult>;
  /** Cheaper, diff-based refinement of an existing bundle. */
  edit(
    input: PromptInput,
    model: ModelChoice,
    baseBundleUrl: string,
  ): Promise<CodegenResult>;
}

/**
 * Deterministic mock provider for local dev and tests — no API key, no network. It
 * produces a stable fake bundle URL and echoes the intent so the review path can run.
 */
export class MockCodegenProvider implements CodegenProvider {
  readonly name = "mock";

  async generate(input: PromptInput, model: ModelChoice): Promise<CodegenResult> {
    const id = Math.abs(hash(input.intent + input.template.id)).toString(36);
    return {
      bundleUrl: `https://bundles.local/mock/${input.template.id}-${id}.js`,
      generatedText: `${input.template.id} app featuring ${input.styleGuide.label}. ${input.intent}`,
      costMinor: model.approxCostMinorPerGeneration,
    };
  }

  async edit(
    input: PromptInput,
    model: ModelChoice,
    baseBundleUrl: string,
  ): Promise<CodegenResult> {
    const base = await this.generate(input, model);
    return {
      ...base,
      bundleUrl: baseBundleUrl,
      costMinor: Math.round(model.approxCostMinorPerGeneration * 0.35),
    };
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
