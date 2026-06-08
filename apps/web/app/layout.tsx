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
    <html lang="ja">
      <body className="min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <Link
              href="/"
              className="mr-1 flex items-center gap-1.5 text-lg font-black tracking-tight"
            >
              <span aria-hidden className="text-xl">🎨</span>
              <span className="text-grad">{translate("app.name")}</span>
            </Link>
            <div className="flex flex-wrap items-center gap-1 text-sm font-bold text-ink-soft">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 transition-colors hover:bg-brand-soft hover:text-brand-strong"
                >
                  {translate(item.key)}
                </Link>
              ))}
              <Link
                href="/partners"
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-accent-soft hover:text-accent"
              >
                パートナー
              </Link>
              <Link
                href="/signin"
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-[color:var(--color-sky-soft)] hover:text-[color:var(--color-sky)]"
              >
                アカウント
              </Link>
            </div>
            <Link
              href="/pricing"
              className="btn-grad ml-auto rounded-full px-5 py-2 text-sm font-extrabold"
            >
              はじめる ✨
            </Link>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft">
            <p className="flex items-center gap-1.5 text-base font-black text-ink">
              <span aria-hidden>🎨</span>
              <span className="text-grad">{translate("app.name")}</span>
            </p>
            <p className="mt-2 max-w-prose">
              パブリックドメインの名作キャラと一緒に、毎日使える軽量アプリをAIでサクッと開発。
              出所表示つき、ストア手数料なしのウェブ決済で公開できます。💖
            </p>
            <p className="mt-3 text-xs">
              公開されるすべてのアプリには「出所表示」と「AI制作」ラベルがつきます。作品はパブリックドメイン版のみを使用しています。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
