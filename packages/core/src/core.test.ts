import { describe, expect, it } from "vitest";
import { PLANS, getPlan, isTierAllowed, MARKETPLACE_TAKE_RATE } from "./plans.js";
import { money, formatMoney, splitSale, toMajor } from "./money.js";
import { canGenerate } from "./cost.js";
import { checkLicense, type AssetLicense } from "./licensing.js";
import { translate } from "./i18n/index.js";

describe("plans", () => {
  it("orders model tiers correctly per plan", () => {
    expect(isTierAllowed(getPlan("basic"), "standard")).toBe(true);
    expect(isTierAllowed(getPlan("basic"), "premium")).toBe(false);
    expect(isTierAllowed(getPlan("pro"), "premium")).toBe(true);
  });
});

describe("money", () => {
  it("formats USD minor units", () => {
    expect(toMajor(money(1900))).toBe(19);
    expect(formatMoney(money(1900))).toBe("$19.00");
  });

  it("handles zero-decimal currencies", () => {
    expect(toMajor(money(500, "JPY"))).toBe(500);
  });

  it("splits a sale by take rate", () => {
    const { platformFee, creatorPayout } = splitSale(money(1000), MARKETPLACE_TAKE_RATE);
    expect(platformFee.amountMinor).toBe(250);
    expect(creatorPayout.amountMinor).toBe(750);
  });
});

describe("cost guardrails", () => {
  it("blocks when monthly quota is exhausted", () => {
    const d = canGenerate(PLANS.basic, { generationsUsed: 100, aiSpendMinor: 0 });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("quota-exhausted");
  });

  it("blocks when AI spend exceeds the cost ceiling", () => {
    // basic is $19.00 -> ceiling 30% = $5.70 = 570 minor
    const d = canGenerate(PLANS.basic, { generationsUsed: 1, aiSpendMinor: 600 });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("cost-ceiling");
  });

  it("allows within quota and budget", () => {
    expect(canGenerate(PLANS.pro, { generationsUsed: 1, aiSpendMinor: 100 }).allowed).toBe(true);
  });
});

describe("licensing", () => {
  const license: AssetLicense = {
    kind: "character",
    publicDomainIn: ["US"],
    styleGuide: {
      label: "Steamboat Willie Mickey (1928)",
      provenanceNotice: "Based on the 1928 public-domain version of Mickey Mouse.",
      prohibitions: ["red shorts", "modern Disney styling"],
      requiredTransformations: [],
    },
  };

  it("passes a clean US publication", () => {
    const r = checkLicense(license, { localeMarket: "US" });
    expect(r.ok).toBe(true);
  });

  it("flags a non-PD market and prohibited terms", () => {
    const r = checkLicense(license, {
      localeMarket: "JP",
      detectedProhibitedTerms: ["red shorts"],
    });
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBe(2);
  });
});

describe("i18n", () => {
  it("interpolates variables", () => {
    expect(translate("marketplace.byCreator", { creator: "Ada" })).toBe("by Ada");
  });
  it("falls back to the key when missing", () => {
    // @ts-expect-error intentionally unknown key
    expect(translate("does.not.exist")).toBe("does.not.exist");
  });
});
