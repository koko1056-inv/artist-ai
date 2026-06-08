import type { Metadata } from "next";
import { decodeAppConfig } from "../../../lib/app-config";
import { HabitApp } from "./habit-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "習慣トラッカー — PD Forge",
  robots: { index: false },
};

/**
 * Runtime for a published habit-tracker app. The config is carried in the `c` query param
 * (base64url), so the app runs on any device with no database. Data persists on-device.
 */
export default async function HabitRuntimePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const config = c ? decodeAppConfig(c) : null;

  if (!config) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <div className="text-5xl">😢</div>
        <h1 className="mt-4 text-xl font-black text-ink">
          このアプリのリンクが無効です
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          アプリを読み込めませんでした。作った人に新しいリンクをもらうか、スタジオで自分だけのアプリをつくってみよう！
        </p>
        <a
          href="/studio"
          className="btn-grad mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-extrabold"
        >
          スタジオを開く ✨
        </a>
      </main>
    );
  }

  return <HabitApp config={config} />;
}
