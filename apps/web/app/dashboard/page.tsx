import {
  AI_COST_CEILING_FRACTION,
  canGenerate,
  formatMoney,
  getPlan,
  isPayingPlan,
  MARKETPLACE_TAKE_RATE,
  money,
  splitSale,
  splitSaleWithRoyalty,
  translate,
  type Money,
  type UsageWindow,
} from "@pd/core";
import { Badge, Card, SectionTitle } from "../../components/ui";
import { SAMPLE_PURCHASES } from "../../lib/sample-data";
import { getSession } from "../../lib/session";
import { activeAppCount, totalWau } from "../../lib/usage-store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const planId = session?.plan ?? "free";
  const paying = isPayingPlan(planId);

  // Usage window: demo figures (replace with the subscription's metered window).
  const plan = getPlan(planId);
  const usage: UsageWindow = paying
    ? { generationsUsed: 137, aiSpendMinor: 820 }
    : { generationsUsed: 2, aiSpendMinor: 0 };
  const decision = canGenerate(plan, usage);

  // Audience (north-star): weekly active end users across published apps. Dev-grade,
  // in-memory and ephemeral — production swaps for a durable analytics pipeline.
  const wau = totalWau();
  const liveApps = activeAppCount();

  const quota = plan.limits.generationsPerMonth;
  const quotaPct = Math.min(100, Math.round((usage.generationsUsed / quota) * 100));
  const ceilingMinor = Math.round(plan.priceMinor * AI_COST_CEILING_FRACTION);
  const spendPct =
    ceilingMinor > 0
      ? Math.min(100, Math.round((usage.aiSpendMinor / ceilingMinor) * 100))
      : 0;

  // Revenue summary from sample purchases. Public-domain sales use the plain
  // marketplace take rate; licensed sales (royaltyRate > 0) also split off an IP
  // royalty to the rights holder via splitSaleWithRoyalty.
  let grossTotal = 0;
  let feeTotal = 0;
  let royaltyTotal = 0;
  let payoutTotal = 0;
  const rows = SAMPLE_PURCHASES.map((p) => {
    const gross = money(p.grossMinor * p.count, p.currency);
    let platformFee: Money;
    let royalty: Money = money(0, p.currency);
    let creatorPayout: Money;
    if (p.royaltyRate > 0) {
      const split = splitSaleWithRoyalty(
        gross,
        MARKETPLACE_TAKE_RATE,
        p.royaltyRate,
      );
      platformFee = split.platformFee;
      royalty = split.royalty;
      creatorPayout = split.creatorPayout;
    } else {
      const split = splitSale(gross, MARKETPLACE_TAKE_RATE);
      platformFee = split.platformFee;
      creatorPayout = split.creatorPayout;
    }
    grossTotal += gross.amountMinor;
    feeTotal += platformFee.amountMinor;
    royaltyTotal += royalty.amountMinor;
    payoutTotal += creatorPayout.amountMinor;
    return {
      title: p.listingTitle,
      sales: p.count,
      licensed: p.royaltyRate > 0,
      royaltyRate: p.royaltyRate,
      gross: formatMoney(gross),
      fee: formatMoney(platformFee),
      royalty: p.royaltyRate > 0 ? formatMoney(royalty) : "—",
      payout: formatMoney(creatorPayout),
    };
  });

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="マイページ ✨"
        title="クリエイターの ホーム"
        subtitle="プラン・オーディエンス・受け取り・AI予算と上限・売上を ひと目でチェック 💖"
      />

      {/* Account / subscription state */}
      {!session ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-grad-hero text-white">
          <p className="text-sm font-semibold">
            👋 いまは ゲストとして 見ています。サインインして、プランの登録・公開・売上の受け取りを はじめよう！
          </p>
          <a
            href="/signin"
            className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-brand shadow-sm hover:opacity-90"
          >
            サインイン →
          </a>
        </Card>
      ) : !paying ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-grad-brand text-white">
          <p className="text-sm font-semibold">
            🌱 <span className="font-extrabold">{session.email}</span> として Freeプランで サインイン中。
            プランに登録すると、アプリの公開と販売ができます。
          </p>
          <a
            href="/pricing"
            className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-brand shadow-sm hover:opacity-90"
          >
            プランを選ぶ 🎉
          </a>
        </Card>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            ✅ <span className="font-bold">{session.email}</span> として ·{" "}
            <span className="capitalize font-bold text-brand">{session.plan}</span> プランで サインイン中 ·
            公開が 有効です。
          </p>
          <form action="/api/auth/signout" method="post">
            <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand">
              サインアウト
            </button>
          </form>
        </Card>
      )}

      {/* Audience (north-star) + payouts */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="bg-[color:var(--color-sky-soft)]">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[color:var(--color-sky)]">
            📈 オーディエンス · 週間アクティブユーザー
          </p>
          <p className="mt-1 text-4xl font-black text-ink">
            {wau.toLocaleString("ja-JP")}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            公開中の {liveApps.toLocaleString("ja-JP")} 個のアプリ全体。
            いちばん大事なのは、公開したアプリが毎日ちゃんと使われているか です。
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            開発向けのメモリ内カウンターです。公開アプリを開くと数字が動きます。本番では 永続的な分析パイプラインを使います。
          </p>
        </Card>

        <Card className="bg-[color:var(--color-mint-soft)]">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[color:var(--color-mint)]">
            💰 受け取り
          </p>
          {session?.payoutConnected ? (
            <>
              <p className="mt-1 text-4xl font-black text-ink">接続済み 🎉</p>
              <p className="mt-1 text-sm text-ink-soft">
                売上は 受け取りスケジュールに沿って、接続済みの口座へ お支払いされます。
              </p>
              <div className="mt-2">
                <Badge tone="success">受け取りOK ✓</Badge>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-4xl font-black text-ink">未接続</p>
              <p className="mt-1 text-sm text-ink-soft">
                受け取り口座を接続すると、マーケットプレイス売上の あなたの取り分を 受け取れます。
              </p>
              <a
                href={session ? "/api/payouts/connect" : "/signin"}
                className="btn-grad mt-3 inline-block rounded-full px-5 py-2 text-sm font-extrabold"
              >
                受け取り口座を接続 →
              </a>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand">
            🏆 現在のプラン
          </p>
          <p className="mt-1 text-3xl font-black text-ink">
            {translate(plan.nameKey as Parameters<typeof translate>[0])}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {plan.priceMinor > 0
              ? `${formatMoney(money(plan.priceMinor, plan.currency))}/月`
              : "無料"}{" "}
            · {paying ? "マーケットプレイスで販売中" : "公開はロック中"}
          </p>
          <div className="mt-3">
            {decision.allowed ? (
              <Badge tone="success">生成できます ✨</Badge>
            ) : (
              <Badge tone="warn">
                ストップ:{" "}
                {decision.reason === "quota-exhausted"
                  ? "生成回数の上限に到達"
                  : "AI予算の上限に到達"}
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[color:var(--color-sun)]">
            🎯 生成回数
          </p>
          <p className="mt-1 text-3xl font-black text-ink">
            {usage.generationsUsed.toLocaleString("ja-JP")}
            <span className="text-base font-medium text-ink-soft">
              {" "}
              / {quota.toLocaleString("ja-JP")}
            </span>
          </p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full rounded-full bg-grad-sun"
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            今期は あと {decision.remainingGenerations.toLocaleString("ja-JP")} 回 生成できます。
          </p>
        </Card>

        <Card>
          <p className="text-xs font-extrabold uppercase tracking-wide text-accent">
            🤖 AI予算と上限
          </p>
          <p className="mt-1 text-3xl font-black text-ink">
            {formatMoney(money(usage.aiSpendMinor, plan.currency))}
            <span className="text-base font-medium text-ink-soft">
              {" "}
              / {formatMoney(money(ceilingMinor, plan.currency))}
            </span>
          </p>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full rounded-full bg-grad-mint"
              style={{ width: `${spendPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            上限は プラン料金の {Math.round(AI_COST_CEILING_FRACTION * 100)}% です。
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-black text-ink">💸 売上サマリー</h3>
        <p className="mt-1 text-sm text-ink-soft">
          1件の販売ごとに マーケットプレイス手数料 {Math.round(MARKETPLACE_TAKE_RATE * 100)}% が かかります。
          ライセンスIPの場合は、権利者へ IPロイヤリティも お支払いします。
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="py-2 pr-4 font-bold">アプリ</th>
                <th className="py-2 pr-4 font-bold">販売数</th>
                <th className="py-2 pr-4 font-bold">総額</th>
                <th className="py-2 pr-4 font-bold">プラットフォーム手数料</th>
                <th className="py-2 pr-4 font-bold">IPロイヤリティ</th>
                <th className="py-2 font-bold">あなたの取り分</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.title} className="border-b border-line/70">
                  <td className="py-2 pr-4 font-medium text-ink">
                    {r.title}
                    {r.licensed ? (
                      <span className="ml-2 align-middle">
                        <Badge tone="warn">ライセンス</Badge>
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4 text-ink-soft">{r.sales}</td>
                  <td className="py-2 pr-4 text-ink-soft">{r.gross}</td>
                  <td className="py-2 pr-4 text-ink-soft">{r.fee}</td>
                  <td className="py-2 pr-4 text-ink-soft">
                    {r.royalty}
                    {r.licensed ? (
                      <span className="ml-1 text-xs">
                        ({Math.round(r.royaltyRate * 100)}%)
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 font-bold text-brand">{r.payout}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-black text-ink">
                <td className="py-2 pr-4">合計</td>
                <td className="py-2 pr-4" />
                <td className="py-2 pr-4">
                  {formatMoney(money(grossTotal, "USD"))}
                </td>
                <td className="py-2 pr-4">{formatMoney(money(feeTotal, "USD"))}</td>
                <td className="py-2 pr-4">
                  {formatMoney(money(royaltyTotal, "USD"))}
                </td>
                <td className="py-2 text-brand">{formatMoney(money(payoutTotal, "USD"))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
