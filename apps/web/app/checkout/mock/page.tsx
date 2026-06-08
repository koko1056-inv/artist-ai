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
        <span className="inline-block rounded-full bg-grad-brand px-3 py-1 text-xs font-extrabold text-white shadow-sm">
          🧾 お支払い（デモ）
        </span>
        <h1 className="mt-3 text-2xl font-black text-ink">
          {translate(plan.nameKey as Parameters<typeof translate>[0])} プラン ✨
        </h1>
        <p className="mt-2 text-ink-soft">
          これは Stripe ウェブ決済フローの仮の画面です（ストア手数料なし）。
          本物の Stripe は、後から課金プロバイダーの抽象レイヤー経由で つながります。
        </p>
        <p className="mt-4 text-4xl font-black text-grad">
          {plan.id === "enterprise"
            ? "個別見積もり"
            : plan.priceMinor === 0
              ? "無料"
              : `${formatMoney(money(plan.priceMinor, plan.currency))}/月`}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="btn-grad flex-1 rounded-full px-4 py-2.5 text-sm font-extrabold disabled:opacity-60"
            disabled
          >
            お支払い（デモ）💳
          </button>
          <Link
            href="/pricing"
            className="flex-1 rounded-full border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink hover:border-brand"
          >
            もどる
          </Link>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-soft">
        選べるプラン: {Object.values(PLANS).map((p) => p.id).join(", ")}
      </p>
    </div>
  );
}
