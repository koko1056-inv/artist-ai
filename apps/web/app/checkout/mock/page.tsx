import Link from "next/link";
import {
  formatMoney,
  getPlan,
  money,
  PLANS,
  translate,
  type PlanId,
} from "@pd/core";
import { Card } from "../../../components/ui";

function isPlanId(x: string | undefined): x is PlanId {
  return x === "free" || x === "basic" || x === "pro" || x === "enterprise";
}

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planParam } = await searchParams;
  const planId: PlanId = isPlanId(planParam) ? planParam : "basic";
  const plan = getPlan(planId);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Mock checkout
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          {translate(plan.nameKey as Parameters<typeof translate>[0])} plan
        </h1>
        <p className="mt-2 text-ink-soft">
          This is a placeholder for the Stripe web-checkout flow (no store fees). Real
          Stripe is wired in later via the billing provider abstraction.
        </p>
        <p className="mt-4 text-3xl font-extrabold text-ink">
          {plan.id === "enterprise"
            ? "Custom"
            : plan.priceMinor === 0
              ? "Free"
              : `${formatMoney(money(plan.priceMinor, plan.currency))}/mo`}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            disabled
          >
            Pay (mock)
          </button>
          <Link
            href="/pricing"
            className="flex-1 rounded-full border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink"
          >
            Back
          </Link>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-soft">
        Available plans: {Object.values(PLANS).map((p) => p.id).join(", ")}
      </p>
    </div>
  );
}
