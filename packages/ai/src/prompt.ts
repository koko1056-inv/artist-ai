/**
 * Assembles the codegen prompt from three inputs: the creator's intent, the chosen PD
 * asset's style guide (so trademark-avoidance rules are baked in), and the app template
 * (structure + capabilities). Keeping assembly here means the rules travel with every
 * generation rather than depending on the creator remembering them.
 */
import type { AppTemplate, StyleGuide } from "@pd/core";

export interface PromptInput {
  intent: string;
  template: AppTemplate;
  styleGuide: StyleGuide;
  /** Locale for generated UI copy. Default English. */
  locale?: string;
}

export function buildSystemPrompt(styleGuide: StyleGuide): string {
  const prohibitions = styleGuide.prohibitions.length
    ? `You MUST NOT include: ${styleGuide.prohibitions.join("; ")}.`
    : "";
  const transforms = styleGuide.requiredTransformations.length
    ? `You MUST apply: ${styleGuide.requiredTransformations.join("; ")}.`
    : "";
  return [
    "You generate small, production-quality, mobile-first apps that run inside a sandboxed host runtime.",
    "Apps must be lightweight and useful for daily life (no games).",
    `The app features the public-domain asset: ${styleGuide.label}.`,
    prohibitions,
    transforms,
    `Always surface this provenance notice in the app's About screen: "${styleGuide.provenanceNotice}".`,
    "Only use the public-domain version of the asset; never drift toward modern, trademarked styling.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUserPrompt(input: PromptInput): string {
  return [
    `Template: ${input.template.id} (${input.template.capabilities.join(", ")}).`,
    `Locale for UI copy: ${input.locale ?? "en"}.`,
    `Creator intent: ${input.intent}`,
  ].join("\n");
}
