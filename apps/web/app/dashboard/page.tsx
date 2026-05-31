import {
  AI_COST_CEILING_FRACTION,
  canGenerate,
  formatMoney,
  getPlan,
  MARKETPLACE_TAKE_RATE,
  money,
  splitSale,
  translate,
  type UsageWindow,
} from "@pd/core";
import { Badge, Card, SectionTitle } from "../../components/ui";
import { SAMPLE_PURCHASES } from "../../lib/sample-data";

export default function DashboardPage() {
  // Demo creator: a Pro subscriber with a partially-used quota window.
  const plan = getPlan("pro");
  const usage: UsageWindow = { generationsUsed: 137, aiSpendMinor: 820 };
  const decision = canGenerate(plan, usage);

  const quota = plan.limits.generationsPerMonth;
  const quotaPct = Math.min(100, Math.round((usage.generationsUsed / quota) * 100));
  const ceilingMinor = Math.round(plan.priceMinor * AI_COST_CEILING_FRACTION);
  const spendPct =
    ceilingMinor > 0
      ? Math.min(100, Math.round((usage.aiSpendMinor / ceilingMinor) * 100))
      : 0;

  // Revenue summary from sample purchases, split via the marketplace take rate.
  let grossTotal = 0;
  let feeTotal = 0;
  let payoutTotal = 0;
  const rows = SAMPLE_PURCHASES.map((p) => {
    const gross = money(p.grossMinor * p.count, p.currency);
    const { platformFee, creatorPayout } = splitSale(gross, MARKETPLACE_TAKE_RATE);
    grossTotal += gross.amountMinor;
    feeTotal += platformFee.amountMinor;
    payoutTotal += creatorPayout.amountMinor;
    return {
      title: p.listingTitle,
      sales: p.count,
      gross: formatMoney(gross),
      fee: formatMoney(platformFee),
      payout: formatMoney(creatorPayout),
    };
  });

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Dashboard"
        title="Your creator overview"
        subtitle="Plan, usage against your cost guardrails, and marketplace revenue."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Current plan
          </p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {translate(plan.nameKey as Parameters<typeof translate>[0])}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {formatMoney(money(plan.priceMinor, plan.currency))}/mo · sells on
            marketplace
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
          per sale.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="py-2 pr-4 font-semibold">App</th>
                <th className="py-2 pr-4 font-semibold">Sales</th>
                <th className="py-2 pr-4 font-semibold">Gross</th>
                <th className="py-2 pr-4 font-semibold">Platform fee</th>
                <th className="py-2 font-semibold">Your payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.title} className="border-b border-line/70">
                  <td className="py-2 pr-4 font-medium text-ink">{r.title}</td>
                  <td className="py-2 pr-4 text-ink-soft">{r.sales}</td>
                  <td className="py-2 pr-4 text-ink-soft">{r.gross}</td>
                  <td className="py-2 pr-4 text-ink-soft">{r.fee}</td>
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
                <td className="py-2">{formatMoney(money(payoutTotal, "USD"))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
