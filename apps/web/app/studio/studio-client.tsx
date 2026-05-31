"use client";

import { useState } from "react";
import { formatMoney, money, type TemplateId } from "@pd/core";
import type {
  ApiError,
  GenerateResponse,
  PdAsset,
  PublishResponse,
} from "@pd/contracts";
import { Badge, Card } from "../../components/ui";

interface TemplateOption {
  id: TemplateId;
  name: string;
  description: string;
}

interface Props {
  templates: TemplateOption[];
  assets: PdAsset[];
  promptPlaceholder: string;
  generateLabel: string;
  publishLabel: string;
}

function isApiError(x: unknown): x is ApiError {
  return (
    typeof x === "object" &&
    x !== null &&
    "error" in x &&
    typeof (x as { error?: unknown }).error === "object"
  );
}

export default function StudioClient({
  templates,
  assets,
  promptPlaceholder,
  generateLabel,
  publishLabel,
}: Props) {
  const [templateId, setTemplateId] = useState<TemplateId>(
    templates[0]?.id ?? "task-manager",
  );
  const [assetId, setAssetId] = useState<string>(assets[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priceMajor, setPriceMajor] = useState("0");
  const [publishing, setPublishing] = useState(false);
  const [pubError, setPubError] = useState<string | null>(null);
  const [published, setPublished] = useState<PublishResponse | null>(null);

  async function onGenerate() {
    setGenerating(true);
    setGenError(null);
    setResult(null);
    setPublished(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, templateId, assetId }),
      });
      const data: unknown = await res.json();
      if (!res.ok || isApiError(data)) {
        setGenError(
          isApiError(data) ? data.error.message : "Generation failed.",
        );
        return;
      }
      setResult(data as GenerateResponse);
    } catch {
      setGenError("Network error while generating.");
    } finally {
      setGenerating(false);
    }
  }

  async function onPublish() {
    if (!result) return;
    setPublishing(true);
    setPubError(null);
    setPublished(null);
    try {
      const priceMinor = Math.max(0, Math.round(Number(priceMajor) * 100) || 0);
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          appVersionId: result.appVersionId,
          title,
          summary,
          priceMinor,
          currency: "USD",
        }),
      });
      const data: unknown = await res.json();
      if (!res.ok || isApiError(data)) {
        setPubError(isApiError(data) ? data.error.message : "Publish failed.");
        return;
      }
      setPublished(data as PublishResponse);
    } catch {
      setPubError("Network error while publishing.");
    } finally {
      setPublishing(false);
    }
  }

  const promptValid = prompt.trim().length >= 10 && prompt.trim().length <= 2000;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Step 1: configure + generate */}
      <Card>
        <h3 className="text-lg font-bold text-ink">1 · Build your app</h3>

        <label className="mt-4 block text-sm font-medium text-ink">
          Template
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as TemplateId)}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          {templates.find((t) => t.id === templateId)?.description}
        </p>

        <label className="mt-4 block text-sm font-medium text-ink">
          Public-domain asset
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Prompt
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={promptPlaceholder}
            rows={4}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          />
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          {prompt.trim().length}/2000 characters (minimum 10).
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || !promptValid || !assetId}
          className="mt-4 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "Generating…" : generateLabel}
        </button>

        {genError ? (
          <p className="mt-3 rounded-lg bg-[color:var(--color-danger)]/10 px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {genError}
          </p>
        ) : null}

        {result ? (
          <div className="mt-4 space-y-2 rounded-lg bg-paper-2 p-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge tone="accent">Tier: {result.modelTier}</Badge>
              <Badge tone="neutral">
                Est. cost{" "}
                {formatMoney(money(result.estimatedCostMinor, "USD"))}
              </Badge>
              <Badge tone="success">
                {result.remainingGenerations} generations left
              </Badge>
            </div>
            <p className="break-all text-ink-soft">
              <span className="font-semibold text-ink">Bundle:</span>{" "}
              {result.bundleUrl}
            </p>
            <p className="text-ink-soft">
              <span className="font-semibold text-ink">Version:</span>{" "}
              {result.appVersionId}
            </p>
          </div>
        ) : null}
      </Card>

      {/* Step 2: publish */}
      <Card>
        <h3 className="text-lg font-bold text-ink">2 · Publish</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {result
            ? "Submit your generated app for automated review and listing."
            : "Generate an app first, then publish it here."}
        </p>

        <label className="mt-4 block text-sm font-medium text-ink">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Steamboat To-Do"
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Summary
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A cheerful task manager that celebrates each finished task."
            rows={3}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink">
          Price (USD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={onPublish}
          disabled={
            publishing ||
            !result ||
            title.trim().length < 3 ||
            summary.trim().length < 10
          }
          className="mt-4 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? "Publishing…" : publishLabel}
        </button>

        {pubError ? (
          <p className="mt-3 rounded-lg bg-[color:var(--color-danger)]/10 px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {pubError}
          </p>
        ) : null}

        {published ? (
          <div className="mt-4 space-y-2 rounded-lg bg-paper-2 p-4 text-sm">
            <div>
              {published.status === "published" ? (
                <Badge tone="success">Published</Badge>
              ) : published.status === "in-review" ? (
                <Badge tone="warn">In review</Badge>
              ) : (
                <Badge tone="warn">Rejected</Badge>
              )}
            </div>
            <p className="text-ink-soft">
              <span className="font-semibold text-ink">Required notice:</span>{" "}
              {published.requiredNotice}
            </p>
            {published.listingId ? (
              <p className="text-ink-soft">
                <span className="font-semibold text-ink">Listing:</span>{" "}
                {published.listingId}
              </p>
            ) : null}
            {published.violations.length > 0 ? (
              <div>
                <p className="font-semibold text-[color:var(--color-danger)]">
                  Violations to resolve:
                </p>
                <ul className="ml-4 list-disc text-ink-soft">
                  {published.violations.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
