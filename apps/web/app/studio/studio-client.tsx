"use client";

import { useMemo, useState } from "react";
import {
  checkEligibility,
  formatMoney,
  getPlan,
  mediaGroupOf,
  money,
  type MediaGroup,
  type PlanId,
  type TemplateId,
} from "@pd/core";
import type {
  ApiError,
  AssetMedia,
  GenerateResponse,
  PdAsset,
  PublishResponse,
} from "@pd/contracts";
import { Badge, Card } from "../../components/ui";
import { AssetThumb } from "../../components/asset-thumb";
import { ModelViewer } from "../../components/model-viewer";

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

/** Demo market for eligibility checks (in production: the seller's market). */
const DEMO_MARKET = "US";

const MEDIA_TABS: Array<{ id: "all" | MediaGroup; label: string }> = [
  { id: "all", label: "All" },
  { id: "images", label: "Images" },
  { id: "threeD", label: "3D" },
  { id: "audio", label: "Audio" },
];

/** A license badge for an asset tile / panel. */
function LicenseBadge({ asset }: { asset: PdAsset }) {
  if (asset.license.type === "licensed") {
    return (
      <Badge tone="warn">
        Licensed{asset.license.partnerName ? ` · ${asset.license.partnerName}` : ""}
      </Badge>
    );
  }
  return <Badge tone="success">Public domain</Badge>;
}

function percent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export default function StudioClient({
  templates,
  assets,
  promptPlaceholder,
  generateLabel,
  publishLabel,
}: Props) {
  const [planId, setPlanId] = useState<PlanId>("basic");
  const [templateId, setTemplateId] = useState<TemplateId>(
    templates[0]?.id ?? "task-manager",
  );
  const [assetId, setAssetId] = useState<string>(assets[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [mediaTab, setMediaTab] = useState<"all" | MediaGroup>("all");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priceMajor, setPriceMajor] = useState("0");
  const [publishing, setPublishing] = useState(false);
  const [pubError, setPubError] = useState<string | null>(null);
  const [published, setPublished] = useState<PublishResponse | null>(null);

  const asset = useMemo(
    () => assets.find((a) => a.id === assetId),
    [assets, assetId],
  );

  const eligibility = useMemo(() => {
    if (!asset) return { eligible: true as const };
    const l = asset.license;
    return checkEligibility(
      {
        type: l.type,
        royaltyRate: l.royaltyRate,
        requiresApproval: l.requiresApproval,
        allowedPlans: l.allowedPlans,
        territories: l.territories,
        expiresAt: l.expiresAt,
      },
      { planId, market: DEMO_MARKET },
    );
  }, [asset, planId]);

  const visibleMedia = useMemo(() => {
    const media = asset?.media ?? [];
    if (mediaTab === "all") return media;
    return media.filter((m) => mediaGroupOf(m.kind) === mediaTab);
  }, [asset, mediaTab]);

  function selectAsset(id: string) {
    setAssetId(id);
    setMediaTab("all");
    setSelectedMediaIds([]);
  }

  function toggleMedia(id: string) {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  const eligibilityReason =
    eligibility.reason === "plan-not-allowed"
      ? "This licensed IP is not available on your current plan."
      : eligibility.reason === "expired"
        ? "This license has expired."
        : eligibility.reason === "territory-not-allowed"
          ? "This license is not available in your market."
          : null;

  async function onGenerate() {
    if (!asset) return;
    setGenerating(true);
    setGenError(null);
    setResult(null);
    setPublished(null);
    try {
      // Default to all of the asset's media when nothing was explicitly chosen.
      const mediaIds =
        selectedMediaIds.length > 0
          ? selectedMediaIds
          : asset.media.map((m) => m.id);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, templateId, assetId, mediaIds }),
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
  const canGenerate =
    !generating && promptValid && !!assetId && eligibility.eligible;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Step 1: configure + generate */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-ink">1 · Build your app</h3>
          {/* Demo plan switcher: flip to Pro to unlock licensed IP. */}
          <div
            className="inline-flex rounded-full border border-line bg-paper-2 p-0.5 text-xs font-semibold"
            role="group"
            aria-label="Demo plan"
          >
            {(["basic", "pro"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlanId(p)}
                aria-pressed={planId === p}
                className={`rounded-full px-3 py-1 capitalize transition-colors ${
                  planId === p
                    ? "bg-brand text-white"
                    : "text-ink-soft hover:text-brand"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Demo plan: <span className="font-semibold capitalize">{planId}</span>.
          Licensed IP requires Pro or above.
        </p>

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

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-ink">Choose an asset</legend>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {assets.map((a) => {
              const selected = a.id === assetId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => selectAsset(a.id)}
                  aria-pressed={selected}
                  title={a.provenanceNotice}
                  className={`group overflow-hidden rounded-xl border text-left transition-all ${
                    selected
                      ? "border-brand ring-2 ring-brand"
                      : "border-line hover:border-brand/60"
                  }`}
                >
                  <AssetThumb
                    slug={a.id}
                    fallbackSrc={a.thumbnailUrl}
                    alt={`${a.label} image`}
                    className="h-20 w-full object-cover"
                  />
                  <span className="block px-2 pt-1.5 text-xs font-medium text-ink">
                    {a.label}
                  </span>
                  <span className="block px-2 pb-1.5 pt-1">
                    <LicenseBadge asset={a} />
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* License panel for the selected asset. */}
        {asset ? (
          <div className="mt-4 rounded-lg border border-line bg-paper-2 p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">{asset.label}</span>
              <LicenseBadge asset={asset} />
            </div>
            {asset.license.type === "public-domain" ? (
              <div className="mt-2 space-y-1 text-ink-soft">
                <p>{asset.provenanceNotice}</p>
                <p className="font-medium text-[color:var(--color-success)]">
                  Free to use — no royalty, no approval needed.
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-2 text-ink-soft">
                <div className="flex items-center gap-2">
                  {asset.license.partnerLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.license.partnerLogoUrl}
                      alt={`${asset.license.partnerName ?? "Partner"} logo`}
                      className="h-6 w-6 rounded object-contain"
                    />
                  ) : null}
                  <span className="font-medium text-ink">
                    {asset.license.partnerName ?? "Licensed partner"}
                  </span>
                </div>
                <ul className="ml-4 list-disc space-y-0.5">
                  <li>Royalty rate: {percent(asset.license.royaltyRate)} of gross</li>
                  {asset.license.requiresApproval ? (
                    <li>Requires approval before publishing</li>
                  ) : null}
                  <li>
                    Allowed plans:{" "}
                    <span className="capitalize">
                      {asset.license.allowedPlans.join(", ") || "—"}
                    </span>
                  </li>
                  <li>Territories: {asset.license.territories.join(", ") || "—"}</li>
                  {asset.license.expiresAt ? (
                    <li>
                      Expires:{" "}
                      {new Date(asset.license.expiresAt).toLocaleDateString("en-US")}
                    </li>
                  ) : null}
                </ul>
                {!eligibility.eligible && eligibilityReason ? (
                  <div className="rounded-md bg-[color:var(--color-warn)]/10 px-3 py-2 text-[color:var(--color-warn)]">
                    <p className="font-medium">{eligibilityReason}</p>
                    {eligibility.reason === "plan-not-allowed" ? (
                      <button
                        type="button"
                        onClick={() => setPlanId("pro")}
                        className="mt-1 font-semibold underline hover:no-underline"
                      >
                        Switch to Pro to use licensed IP
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {/* Media browser. */}
        {asset ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Media</span>
              <span className="text-xs text-ink-soft">
                {selectedMediaIds.length > 0
                  ? `${selectedMediaIds.length} selected`
                  : "Defaults to all media"}
              </span>
            </div>
            <div className="mt-2 inline-flex flex-wrap gap-1" role="tablist">
              {MEDIA_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mediaTab === tab.id}
                  onClick={() => setMediaTab(tab.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    mediaTab === tab.id
                      ? "bg-brand text-white"
                      : "bg-paper-2 text-ink-soft hover:text-brand"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {visibleMedia.length === 0 ? (
              <p className="mt-3 text-xs text-ink-soft">
                No media in this category.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {visibleMedia.map((m) => (
                  <MediaTile
                    key={m.id}
                    media={m}
                    selected={selectedMediaIds.includes(m.id)}
                    onToggle={() => toggleMedia(m.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

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
          disabled={!canGenerate}
          className="mt-4 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "Generating…" : generateLabel}
        </button>

        {!eligibility.eligible && eligibilityReason ? (
          <p className="mt-2 text-center text-xs text-[color:var(--color-warn)]">
            Generation is disabled for this licensed asset on your current plan.
          </p>
        ) : null}

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

            {/* The real, runnable app — open it or copy the shareable link. */}
            {result.appUrl ? (
              <div className="rounded-lg border border-brand/30 bg-brand-soft/40 p-3">
                <p className="font-semibold text-ink">Your app is live 🎉</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  A real, installable habit tracker that saves progress on the device.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={result.appUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-strong"
                  >
                    Open your app ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (result.appUrl) void navigator.clipboard?.writeText(result.appUrl);
                    }}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand"
                  >
                    Copy share link
                  </button>
                </div>
              </div>
            ) : null}

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
            <div className="flex flex-wrap items-center gap-2">
              {published.status === "published" ? (
                <Badge tone="success">Published</Badge>
              ) : published.status === "in-review" ? (
                <Badge tone="warn">In review</Badge>
              ) : (
                <Badge tone="warn">Rejected</Badge>
              )}
              {published.licenseType === "licensed" ? (
                <Badge tone="warn">Licensed IP</Badge>
              ) : null}
            </div>
            <p className="text-ink-soft">
              <span className="font-semibold text-ink">Required notice:</span>{" "}
              {published.requiredNotice}
            </p>
            {published.licenseType === "licensed" ? (
              <div className="rounded-md bg-[color:var(--color-warn)]/10 px-3 py-2 text-[color:var(--color-warn)]">
                {published.creditLine ? (
                  <p className="font-medium">{published.creditLine}</p>
                ) : null}
                <p>
                  Royalty rate: {percent(published.royaltyRate)} of gross to the
                  rights holder.
                </p>
                <p>
                  Licensed IP requires partner approval — this app is in review
                  before it goes live.
                </p>
              </div>
            ) : null}
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

/** A single selectable media tile (image / 3D / audio). */
function MediaTile({
  media,
  selected,
  onToggle,
}: {
  media: AssetMedia;
  selected: boolean;
  onToggle: () => void;
}) {
  const group = mediaGroupOf(media.kind);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-all ${
        selected
          ? "border-brand ring-2 ring-brand"
          : "border-line hover:border-brand/60"
      }`}
    >
      <div className="h-24 w-full bg-paper-2">
        {group === "threeD" ? (
          <ModelViewer
            src={media.url}
            poster={media.posterUrl}
            alt={media.label}
            className="h-full w-full"
          />
        ) : group === "audio" ? (
          <div className="flex h-full w-full items-center justify-center px-2">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls src={media.url} className="w-full">
              Audio preview unavailable.
            </audio>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.label}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <span className="flex items-center justify-between gap-1 px-2 py-1.5 text-xs font-medium text-ink">
        <span className="truncate">{media.label}</span>
        {group === "threeD" ? (
          <span className="rounded bg-accent-soft px-1 text-[10px] font-semibold text-accent">
            3D
          </span>
        ) : null}
      </span>
    </button>
  );
}
