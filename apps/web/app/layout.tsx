import type { Metadata } from "next";
import Link from "next/link";
import { translate } from "@pd/core";
import "./globals.css";

export const metadata: Metadata = {
  title: `${translate("app.name")} — ${translate("app.tagline")}`,
  description: translate("app.tagline"),
};

const NAV: Array<{ href: string; key: Parameters<typeof translate>[0] }> = [
  { href: "/studio", key: "nav.studio" },
  { href: "/marketplace", key: "nav.marketplace" },
  { href: "/library", key: "nav.library" },
  { href: "/pricing", key: "nav.pricing" },
  { href: "/dashboard", key: "nav.dashboard" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
            <Link href="/" className="mr-2 text-lg font-extrabold tracking-tight">
              <span className="text-brand">{translate("app.name")}</span>
            </Link>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-ink-soft">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-1 py-0.5 transition-colors hover:text-brand"
                >
                  {translate(item.key)}
                </Link>
              ))}
            </div>
            <Link
              href="/pricing"
              className="ml-auto rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Get started
            </Link>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft">
            <p className="font-semibold text-ink">{translate("app.name")}</p>
            <p className="mt-1 max-w-prose">
              Build lightweight, daily-use apps on public-domain characters with
              AI-assisted coding. Provenance-labeled, store-fee-free web checkout.
            </p>
            <p className="mt-3 text-xs">
              Every published app carries a provenance notice and an AI-assistance
              label. Only public-domain versions of works are used.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
