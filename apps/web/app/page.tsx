import Link from "next/link";
import { translate } from "@pd/core";
import { Card } from "../components/ui";

const STEPS: Array<{ n: string; title: string; body: string }> = [
  {
    n: "1",
    title: "Pick a public-domain asset",
    body: "Choose from a curated library — 1928 Steamboat Willie Mickey, early Betty Boop, Hokusai's Great Wave, and more. Each carries a style guide that keeps you legally safe.",
  },
  {
    n: "2",
    title: "Prompt the AI",
    body: "Describe the daily-use app you want. The studio assembles a prompt that bakes in trademark-avoidance rules and generates a sandboxed app bundle.",
  },
  {
    n: "3",
    title: "Publish to the marketplace",
    body: "Automated review checks provenance and prohibited elements, then publishes your app with a provenance badge and an AI-assistance label.",
  },
  {
    n: "4",
    title: "Earn",
    body: "Sell via store-fee-free web checkout. You keep the majority; the platform takes a small marketplace fee.",
  },
];

const VALUES: Array<{ title: string; body: string }> = [
  {
    title: "Mobile-first, daily-use",
    body: "Task managers, habit trackers, calendars, and notes — practical apps people open every day, not throwaway games.",
  },
  {
    title: "Store-fee-free",
    body: "Subscriptions and sales run through web checkout, so you avoid the 15–30% app-store cut.",
  },
  {
    title: "Provenance & legal safety",
    body: "Only public-domain versions are used, every app shows its provenance, and an audit trail backs your work.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-8 pt-6 md:grid-cols-2">
        <div>
          <p className="mb-3 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
            AI-assisted apps on public-domain IP
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-ink md:text-5xl">
            {translate("app.name")}
          </h1>
          <p className="mt-4 max-w-prose text-lg text-ink-soft">
            {translate("app.tagline")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Open the Studio
            </Link>
            <Link
              href="/marketplace"
              className="rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink transition-colors hover:border-brand"
            >
              Browse the Marketplace
            </Link>
          </div>
        </div>
        <Card className="bg-paper-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            How it flows
          </p>
          <p className="mt-2 text-xl font-bold text-ink">
            PD asset → AI prompt → publish → earn
          </p>
          <p className="mt-3 text-ink-soft">
            A single host app ships to the stores; your creations run in a sandbox and
            update over the air. The web is a parallel, store-fee-free channel.
          </p>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-ink">How it works</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-ink">Why PD Forge</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <h3 className="font-semibold text-ink">{v.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] bg-ink px-6 py-12 text-center text-paper">
        <h2 className="text-2xl font-bold">Ready to build?</h2>
        <p className="mx-auto mt-2 max-w-prose text-paper-2">
          Start in the Studio, pick an asset, and ship your first daily-use app today.
        </p>
        <Link
          href="/studio"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Open the Studio
        </Link>
      </section>
    </div>
  );
}
