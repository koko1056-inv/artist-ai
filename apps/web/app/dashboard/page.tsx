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
        eyebrow="Dashboard"
        title="Your creator overview"
        subtitle="Plan, audience, payouts, usage against your cost guardrails, and revenue."
      />

      {/* Account / subscription state */}
      {!session ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            You&apos;re browsing as a guest. Sign in to subscribe, publish, and get paid.
          </p>
          <a
            href="/signin"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Sign in
          </a>
        </Card>
      ) : !paying ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            Signed in as <span className="font-semibold">{session.email}</span> on the Free
            plan. Subscribe to publish and sell your apps.
          </p>
          <a
            href="/pricing"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Choose a plan
          </a>
        </Card>
      ) : (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            Signed in as <span className="font-semibold">{session.email}</span> ·{" "}
            <span className="capitalize font-semibold">{session.plan}</span> plan ·
            publishing enabled.
          </p>
          <form action="/api/auth/signout" method="post">
            <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand">
              Sign out
            </button>
          </form>
        </Card>
      )}

      {/* Audience (north-star) + payouts */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Audience · weekly active users
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {wau.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Across {liveApps.toLocaleString("en-US")} live app
            {liveApps === 1 ? "" : "s"}. This is the metric that matters: are published apps
            actually used daily?
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Dev-grade, in-memory counter — open a published app to see it move; production
            uses a durable analytics pipeline.
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Payouts
          </p>
          {session?.payoutConnected ? (
            <>
              <p className="mt-1 text-2xl font-extrabold text-ink">Connected</p>
              <p className="mt-1 text-sm text-ink-soft">
                Earnings are released to your connected account on the payout schedule.
              </p>
              <Badge tone="success">Ready to receive payouts</Badge>
            </>
          ) : (
            <>
              <p className="mt-1 text-2xl font-extrabold text-ink">Not connected</p>
              <p className="mt-1 text-sm text-ink-soft">
                Connect a payout account to receive your share of marketplace sales.
              </p>
              <a
                href={session ? "/api/payouts/connect" : "/signin"}
                className="mt-3 inline-block rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Connect payouts
              </a>
            </>
          )}
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Current plan
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {translate(plan.nameKey as Parameters<typeof translate>[0])}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {plan.priceMinor > 0
              ? `${formatMoney(money(plan.priceMinor, plan.currency))}/mo`
              : "Free"}{" "}
            · {paying ? "sells on marketplace" : "publishing locked"}
          </p>
          <div className="mt-3">
            {decision.allowed ? (
              <Badge tone="success">Generations available</Badge>
            ) : (
              <Badge tone="warn">
                Blocked:{" "}
                {decision.reason === "quota-exhausted"
                  ? "quota exhausted"
                  : "cost ceiling reached"}
              </Badge>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Generation quota
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {usage.generationsUsed.toLocaleString("en-US")}
            <span className="text-base font-medium text-ink-soft">
              {" "}
              / {quota.toLocaleString("en-US")}
            </span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full bg-brand"
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            {decision.remainingGenerations.toLocaleString("en-US")} generations
            remaining this period.
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            AI spend vs ceiling
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {formatMoney(money(usage.aiSpendMinor, plan.currency))}
            <span className="text-base font-medium text-ink-soft">
              {" "}
              / {formatMoney(money(ceilingMinor, plan.currency))}
            </span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full bg-accent"
              style={{ width: `${spendPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Ceiling is {Math.round(AI_COST_CEILING_FRACTION * 100)}% of your plan
            price.
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-ink">Revenue summary</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Marketplace take rate of {Math.round(MARKETPLACE_TAKE_RATE * 100)}% applied
          per sale. Licensed IP also pays a royalty to the rights holder.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="py-2 pr-4 font-semibold">App</th>
                <th className="py-2 pr-4 font-semibold">Sales</th>
                <th className="py-2 pr-4 font-semibold">Gross</th>
                <th className="py-2 pr-4 font-semibold">Platform fee</th>
                <th className="py-2 pr-4 font-semibold">IP royalty</th>
                <th className="py-2 font-semibold">Your payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.title} className="border-b border-line/70">
                  <td className="py-2 pr-4 font-medium text-ink">
                    {r.title}
                    {r.licensed ? (
                      <span className="ml-2 align-middle">
                        <Badge tone="warn">Licensed</Badge>
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
                  <td className="py-2 font-semibold text-ink">{r.payout}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold text-ink">
                <td className="py-2 pr-4">Total</td>
                <td className="py-2 pr-4" />
                <td className="py-2 pr-4">
                  {formatMoney(money(grossTotal, "USD"))}
                </td>
                <td className="py-2 pr-4">{formatMoney(money(feeTotal, "USD"))}</td>
                <td className="py-2 pr-4">
                  {formatMoney(money(royaltyTotal, "USD"))}
                </td>
                <td className="py-2">{formatMoney(money(payoutTotal, "USD"))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
