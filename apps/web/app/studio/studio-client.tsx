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
import { AppBuilder } from "../../components/app-builder";

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
  { id: "all", label: "🌈 すべて" },
  { id: "images", label: "🖼️ 画像" },
  { id: "threeD", label: "🧩 3D" },
  { id: "audio", label: "🎵 オーディオ" },
];

/** A license badge for an asset tile / panel. */
function LicenseBadge({ asset }: { asset: PdAsset }) {
  if (asset.license.type === "licensed") {
    return (
      <Badge tone="warn">
        🔖 ライセンス{asset.license.partnerName ? ` · ${asset.license.partnerName}` : ""}
      </Badge>
    );
  }
  return <Badge tone="success">🆓 パブリックドメイン</Badge>;
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
      ? "このライセンスIPは現在のプランではご利用いただけません。"
      : eligibility.reason === "expired"
        ? "このライセンスは有効期限が切れています。"
        : eligibility.reason === "territory-not-allowed"
          ? "このライセンスはお住まいの地域ではご利用いただけません。"
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
          isApiError(data) ? data.error.message : "生成に失敗しました。",
        );
        return;
      }
      setResult(data as GenerateResponse);
    } catch {
      setGenError("生成中にネットワークエラーが発生しました。");
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
        setPubError(isApiError(data) ? data.error.message : "公開に失敗しました。");
        return;
      }
      setPublished(data as PublishResponse);
    } catch {
      setPubError("公開中にネットワークエラーが発生しました。");
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
          <h3 className="text-lg font-extrabold text-ink">1 · つくる 🪄</h3>
          {/* Demo plan switcher: flip to Pro to unlock licensed IP. */}
          <div
            className="inline-flex rounded-full border border-line bg-paper-2 p-0.5 text-xs font-bold"
            role="group"
            aria-label="プラン切り替え"
          >
            {(["basic", "pro"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlanId(p)}
                aria-pressed={planId === p}
                className={`rounded-full px-3 py-1 capitalize transition-colors ${
                  planId === p
                    ? "bg-grad-brand text-white shadow-sm"
                    : "text-ink-soft hover:text-brand"
                }`}
              >
                {p === "pro" ? "Pro ⭐" : "Basic"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          現在のプラン:{" "}
          <span className="font-bold capitalize text-brand">{planId}</span>。
          ライセンスIPの利用にはPro以上が必要です。
        </p>

        <label className="mt-4 block text-sm font-bold text-ink">
          🧩 テンプレート
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as TemplateId)}
            className="mt-1 w-full rounded-2xl border border-line bg-card px-3 py-2.5 text-sm"
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
          <legend className="text-sm font-bold text-ink">
            💖 キャラ・素材を選ぶ
          </legend>
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
                  className={`group overflow-hidden rounded-2xl border text-left transition-all ${
                    selected
                      ? "border-brand ring-2 ring-brand shadow-md -translate-y-0.5"
                      : "border-line hover:border-brand/60 hover:-translate-y-0.5"
                  }`}
                >
                  <AssetThumb
                    slug={a.id}
                    fallbackSrc={a.thumbnailUrl}
                    alt={`${a.label} image`}
                    className="h-20 w-full object-cover"
                  />
                  <span className="block px-2 pt-1.5 text-xs font-bold text-ink">
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
          <div className="mt-4 rounded-2xl border border-line bg-paper-2 p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-ink">{asset.label}</span>
              <LicenseBadge asset={asset} />
            </div>
            {asset.license.type === "public-domain" ? (
              <div className="mt-2 space-y-1 text-ink-soft">
                <p>{asset.provenanceNotice}</p>
                <p className="font-bold text-[color:var(--color-success)]">
                  ✅ 自由に使えます — ロイヤリティも承認も不要！
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
                  <span className="font-bold text-ink">
                    {asset.license.partnerName ?? "ライセンスパートナー"}
                  </span>
                </div>
                <ul className="ml-4 list-disc space-y-0.5">
                  <li>ロイヤリティ: 売上の {percent(asset.license.royaltyRate)}</li>
                  {asset.license.requiresApproval ? (
                    <li>公開前に承認が必要です</li>
                  ) : null}
                  <li>
                    利用可能プラン:{" "}
                    <span className="capitalize">
                      {asset.license.allowedPlans.join("、") || "—"}
                    </span>
                  </li>
                  <li>対象地域: {asset.license.territories.join("、") || "—"}</li>
                  {asset.license.expiresAt ? (
                    <li>
                      有効期限:{" "}
                      {new Date(asset.license.expiresAt).toLocaleDateString("ja-JP")}
                    </li>
                  ) : null}
                </ul>
                {!eligibility.eligible && eligibilityReason ? (
                  <div className="rounded-xl bg-[color:var(--color-warn)]/10 px-3 py-2 text-[color:var(--color-warn)]">
                    <p className="font-bold">⚠️ {eligibilityReason}</p>
                    {eligibility.reason === "plan-not-allowed" ? (
                      <button
                        type="button"
                        onClick={() => setPlanId("pro")}
                        className="mt-1 font-bold underline hover:no-underline"
                      >
                        Proに切り替えてライセンスIPを解放 ⭐
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
              <span className="text-sm font-bold text-ink">🎞️ メディア</span>
              <span className="text-xs text-ink-soft">
                {selectedMediaIds.length > 0
                  ? `${selectedMediaIds.length}件 選択中`
                  : "未選択ならすべて使用"}
              </span>
            </div>
            <div className="mt-2 inline-flex flex-wrap gap-1.5" role="tablist">
              {MEDIA_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mediaTab === tab.id}
                  onClick={() => setMediaTab(tab.id)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    mediaTab === tab.id
                      ? "bg-grad-brand text-white shadow-sm"
                      : "bg-paper-2 text-ink-soft hover:text-brand"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {visibleMedia.length === 0 ? (
              <p className="mt-3 text-xs text-ink-soft">
                このカテゴリにはメディアがありません。
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

        <label className="mt-4 block text-sm font-bold text-ink">
          ✍️ プロンプト
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={promptPlaceholder}
            rows={4}
            className="mt-1 w-full rounded-2xl border border-line bg-card px-3 py-2.5 text-sm"
          />
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          {prompt.trim().length}/2000文字（最低10文字）
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="btn-grad mt-4 w-full px-4 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? "つくっています… 🪄" : `✨ ${generateLabel}`}
        </button>

        {!eligibility.eligible && eligibilityReason ? (
          <p className="mt-2 text-center text-xs text-[color:var(--color-warn)]">
            このプランではこのライセンス素材で生成できません。
          </p>
        ) : null}

        {genError ? (
          <p className="mt-3 rounded-lg bg-[color:var(--color-danger)]/10 px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {genError}
          </p>
        ) : null}

        {result ? (
          <div className="mt-4 space-y-2 rounded-2xl bg-paper-2 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">ティア: {result.modelTier}</Badge>
              <Badge tone="neutral">
                目安コスト{" "}
                {formatMoney(money(result.estimatedCostMinor, "USD"))}
              </Badge>
              <Badge tone="success">
                残り{result.remainingGenerations}回 生成OK
              </Badge>
            </div>

            {/* Free-form builder: edit the AI draft (name, color, message, habits) with a
                live preview; the share link updates instantly. Falls back to a simple link. */}
            {result.config ? (
              <AppBuilder initialConfig={result.config} />
            ) : result.appUrl ? (
              <div className="rounded-2xl border border-brand/30 bg-grad-hero p-4">
                <p className="text-lg font-extrabold text-ink">アプリが完成！🎉</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={result.appUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-grad px-4 py-2 text-xs font-extrabold"
                  >
                    アプリを開く ↗
                  </a>
                </div>
              </div>
            ) : null}

            <p className="text-ink-soft">
              <span className="font-bold text-ink">バージョン:</span>{" "}
              {result.appVersionId}
            </p>
          </div>
        ) : null}
      </Card>

      {/* Step 2: publish */}
      <Card>
        <h3 className="text-lg font-extrabold text-ink">2 · 公開する 📦</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {result
            ? "つくったアプリを自動レビューに送って、ストアに掲載しましょう。"
            : "まずはアプリをつくってから、ここで公開できます。"}
        </p>

        <label className="mt-4 block text-sm font-bold text-ink">
          🏷️ タイトル
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="蒸気船ウィリーのToDo"
            className="mt-1 w-full rounded-2xl border border-line bg-card px-3 py-2.5 text-sm"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-ink">
          📝 概要
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="タスクを終えるたびにお祝いしてくれる、楽しいタスク管理アプリ。"
            rows={3}
            className="mt-1 w-full rounded-2xl border border-line bg-card px-3 py-2.5 text-sm"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-ink">
          💰 価格（USD）
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceMajor}
            onChange={(e) => setPriceMajor(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-line bg-card px-3 py-2.5 text-sm"
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
          className="btn-grad mt-4 w-full px-4 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? "公開しています… 📦" : `🚀 ${publishLabel}`}
        </button>

        {pubError ? (
          <p className="mt-3 rounded-lg bg-[color:var(--color-danger)]/10 px-3 py-2 text-sm text-[color:var(--color-danger)]">
            {pubError}
          </p>
        ) : null}

        {published ? (
          <div className="mt-4 space-y-2 rounded-2xl bg-paper-2 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              {published.status === "published" ? (
                <Badge tone="success">🎉 公開済み</Badge>
              ) : published.status === "in-review" ? (
                <Badge tone="warn">⏳ 審査中</Badge>
              ) : (
                <Badge tone="warn">🚫 却下</Badge>
              )}
              {published.licenseType === "licensed" ? (
                <Badge tone="warn">🔖 ライセンスIP</Badge>
              ) : null}
            </div>
            <p className="text-ink-soft">
              <span className="font-bold text-ink">必須の表記:</span>{" "}
              {published.requiredNotice}
            </p>
            {published.licenseType === "licensed" ? (
              <div className="rounded-xl bg-[color:var(--color-warn)]/10 px-3 py-2 text-[color:var(--color-warn)]">
                {published.creditLine ? (
                  <p className="font-bold">{published.creditLine}</p>
                ) : null}
                <p>
                  ロイヤリティ: 売上の {percent(published.royaltyRate)} を権利者へ。
                </p>
                <p>
                  ライセンスIPはパートナーの承認が必要です。公開前にこのアプリは審査されます。
                </p>
              </div>
            ) : null}
            {published.listingId ? (
              <p className="text-ink-soft">
                <span className="font-bold text-ink">掲載ID:</span>{" "}
                {published.listingId}
              </p>
            ) : null}
            {published.violations.length > 0 ? (
              <div>
                <p className="font-bold text-[color:var(--color-danger)]">
                  解決が必要な項目:
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
