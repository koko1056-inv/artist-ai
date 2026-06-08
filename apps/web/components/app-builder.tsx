"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppConfig } from "@pd/contracts";
import { encodeAppConfig } from "../lib/app-config";
import { HabitApp } from "../app/a/habit/habit-app";

/** A palette of friendly accent colors the creator can pick from (plus a custom picker). */
const SWATCHES = [
  "#ff4f9a", "#ff8a5b", "#ffc83d", "#16b364",
  "#12c8b6", "#38b6ff", "#7c5cff", "#e6457a",
];

const MAX_HABITS = 8;

/**
 * Free-form app builder: the AI draft is just a starting point — the creator can rename the
 * app, recolor it, rewrite the character's line, and add/edit/remove habits, all with a live
 * preview of the REAL app. The shareable link updates instantly from the edited config.
 */
export function AppBuilder({ initialConfig }: { initialConfig: AppConfig }) {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Re-seed when a new generation arrives.
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // A valid, encodable config: trim habits, drop empties, keep at least one, clamp count.
  const safeConfig: AppConfig = useMemo(() => {
    const habits = config.habits
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .slice(0, MAX_HABITS);
    return {
      ...config,
      title: config.title.trim() || "わたしの習慣アプリ",
      encouragement: config.encouragement.trim() || "今日もコツコツ、いこう！",
      habits: habits.length > 0 ? habits : ["水を飲む"],
    };
  }, [config]);

  const shareUrl = useMemo(
    () => (origin ? `${origin}/a/habit?c=${encodeAppConfig(safeConfig)}` : ""),
    [origin, safeConfig],
  );

  function update(patch: Partial<AppConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
    setCopied(false);
  }

  function setHabit(i: number, value: string) {
    setConfig((c) => {
      const habits = [...c.habits];
      habits[i] = value.slice(0, 60);
      return { ...c, habits };
    });
    setCopied(false);
  }

  function removeHabit(i: number) {
    setConfig((c) => ({ ...c, habits: c.habits.filter((_, j) => j !== i) }));
    setCopied(false);
  }

  function addHabit() {
    setConfig((c) =>
      c.habits.length >= MAX_HABITS ? c : { ...c, habits: [...c.habits, ""] },
    );
    setCopied(false);
  }

  function moveHabit(i: number, dir: -1 | 1) {
    setConfig((c) => {
      const j = i + dir;
      if (j < 0 || j >= c.habits.length) return c;
      const habits = [...c.habits];
      const a = habits[i]!;
      habits[i] = habits[j]!;
      habits[j] = a;
      return { ...c, habits };
    });
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      /* clipboard may be blocked */
    }
  }

  return (
    <div className="mt-4 rounded-[var(--radius-card)] border-2 border-brand/30 bg-brand-soft/30 p-4">
      <p className="text-base font-black text-ink">アプリが完成！自由にカスタムしよう 🎨</p>
      <p className="mt-0.5 text-xs text-ink-soft">
        AIの下書きをベースに、名前・色・メッセージ・習慣を自由に編集できます。右のプレビューにその場で反映されます。
      </p>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {/* ---- Editor ---- */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-ink">
            アプリ名
            <input
              value={config.title}
              maxLength={80}
              onChange={(e) => update({ title: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border-2 border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="block text-sm font-bold text-ink">
            応援メッセージ
            <input
              value={config.encouragement}
              maxLength={80}
              onChange={(e) => update({ encouragement: e.target.value })}
              className="mt-1.5 w-full rounded-2xl border-2 border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <div className="text-sm font-bold text-ink">
            テーマカラー
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`color ${c}`}
                  aria-pressed={config.accent.toLowerCase() === c}
                  onClick={() => update({ accent: c })}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: config.accent.toLowerCase() === c ? "#2a2540" : "transparent",
                  }}
                />
              ))}
              <input
                type="color"
                value={config.accent}
                onChange={(e) => update({ accent: e.target.value })}
                aria-label="カスタムカラー"
                className="h-8 w-10 cursor-pointer rounded-lg border-2 border-line bg-card"
              />
            </div>
          </div>

          <div className="text-sm font-bold text-ink">
            習慣（{safeConfig.habits.length}/{MAX_HABITS}）
            <div className="mt-1.5 space-y-2">
              {config.habits.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    value={h}
                    maxLength={60}
                    placeholder="例：水を飲む"
                    onChange={(e) => setHabit(i, e.target.value)}
                    className="w-full rounded-xl border-2 border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => moveHabit(i, -1)}
                    aria-label="上へ"
                    className="rounded-lg px-1.5 py-1 text-ink-soft hover:text-brand"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveHabit(i, 1)}
                    aria-label="下へ"
                    className="rounded-lg px-1.5 py-1 text-ink-soft hover:text-brand"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHabit(i)}
                    aria-label="削除"
                    disabled={config.habits.length <= 1}
                    className="rounded-lg px-1.5 py-1 text-ink-soft hover:text-[color:var(--color-danger)] disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {config.habits.length < MAX_HABITS ? (
                <button
                  type="button"
                  onClick={addHabit}
                  className="rounded-full border-2 border-dashed border-brand/40 px-4 py-1.5 text-xs font-bold text-brand hover:bg-brand-soft"
                >
                  ＋ 習慣を追加
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {shareUrl ? (
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-grad rounded-full px-5 py-2 text-sm font-extrabold"
              >
                アプリを開く ↗
              </a>
            ) : null}
            <button
              type="button"
              onClick={copyLink}
              className="rounded-full border-2 border-line bg-card px-5 py-2 text-sm font-bold text-ink hover:border-brand"
            >
              {copied ? "コピーしました ✓" : "共有リンクをコピー"}
            </button>
          </div>
        </div>

        {/* ---- Live preview ---- */}
        <div>
          <p className="mb-2 text-xs font-bold text-ink-soft">プレビュー（実際のアプリ）</p>
          <div className="mx-auto max-w-[20rem] overflow-hidden rounded-[2rem] border-[6px] border-ink/80 bg-white shadow-xl">
            <div className="max-h-[34rem] overflow-y-auto">
              <HabitApp config={safeConfig} preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
