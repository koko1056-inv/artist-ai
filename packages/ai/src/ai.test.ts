import { describe, expect, it } from "vitest";
import { getPlan, APP_TEMPLATES, type StyleGuide } from "@pd/core";
import { routeModel, editCostMinor } from "./model-routing.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";
import { reviewGeneratedContent } from "./review.js";
import { getCodegenProvider } from "./index.js";

const styleGuide: StyleGuide = {
  label: "Steamboat Willie Mickey (1928)",
  provenanceNotice: "Based on the 1928 public-domain version of Mickey Mouse.",
  prohibitions: ["red shorts", "modern Disney styling"],
  requiredTransformations: [],
};

describe("model routing", () => {
  it("routes plans to their max allowed tier", () => {
    expect(routeModel(getPlan("free")).tier).toBe("small");
    expect(routeModel(getPlan("basic")).tier).toBe("standard");
    expect(routeModel(getPlan("pro")).tier).toBe("premium");
  });

  it("makes edits cheaper than full generations", () => {
    const m = routeModel(getPlan("pro"));
    expect(editCostMinor(m)).toBeLessThan(m.approxCostMinorPerGeneration);
  });
});

describe("prompt assembly", () => {
  it("bakes prohibitions and provenance into the system prompt", () => {
    const sys = buildSystemPrompt(styleGuide);
    expect(sys).toContain("red shorts");
    expect(sys).toContain("public-domain version");
  });

  it("includes template and locale in the user prompt", () => {
    const user = buildUserPrompt({
      intent: "a cute task app",
      template: APP_TEMPLATES["task-manager"],
      styleGuide,
      locale: "en",
    });
    expect(user).toContain("task-manager");
    expect(user).toContain("en");
  });
});

describe("automated review", () => {
  it("detects prohibited terms in generated text", () => {
    const r = reviewGeneratedContent({ text: "Mickey wearing red shorts", styleGuide });
    expect(r.clean).toBe(false);
    expect(r.detectedProhibitedTerms).toContain("red shorts");
  });

  it("passes clean content", () => {
    expect(reviewGeneratedContent({ text: "A friendly black-and-white sketch", styleGuide }).clean).toBe(true);
  });
});

describe("mock provider", () => {
  it("generates a deterministic bundle and echoes intent", async () => {
    const p = getCodegenProvider("mock");
    const model = routeModel(getPlan("basic"));
    const out = await p.generate(
      { intent: "task app", template: APP_TEMPLATES["task-manager"], styleGuide },
      model,
    );
    expect(out.bundleUrl).toMatch(/^https:\/\//);
    expect(out.costMinor).toBe(model.approxCostMinorPerGeneration);
  });
});
