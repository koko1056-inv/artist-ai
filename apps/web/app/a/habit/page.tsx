import type { Metadata } from "next";
import { decodeAppConfig } from "../../../lib/app-config";
import { HabitApp } from "./habit-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Habit Tracker — PD Forge",
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
        <h1 className="text-lg font-bold text-neutral-800">This app link looks invalid</h1>
        <p className="mt-2 text-sm text-neutral-500">
          The app couldn&apos;t be loaded. Ask the creator for a fresh link, or build your own
          in the studio.
        </p>
        <a href="/studio" className="mt-6 inline-block rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white">
          Open the studio
        </a>
      </main>
    );
  }

  return <HabitApp config={config} />;
}
