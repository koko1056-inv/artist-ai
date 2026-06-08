import {
  formatMoney,
  MARKETPLACE_TAKE_RATE,
  money,
  PLANS,
  translate,
  type Plan,
  type PlanId,
} from "@pd/core";
import { Card, SectionTitle } from "../../components/ui";

const PLAN_ORDER: PlanId[] = ["free", "basic", "pro", "enterprise"];

function priceLabel(plan: Plan): string {
  if (plan.id === "enterprise") return "応相談";
  if (plan.priceMinor === 0) return "無料";
  return `${formatMoney(money(plan.priceMinor, plan.currency))}/月`;
}

function tierLabel(plan: Plan): string {
  return (
    plan.limits.maxModelTier.charAt(0).toUpperCase() +
    plan.limits.maxModelTier.slice(1)
  );
}

export default function PricingPage() {
  return (
    <div>
      <SectionTitle
        eyebrow="料金プラン"
        title="AIコストを抑えた、わかりやすいプラン 💎"
        subtitle="サブスクはウェブ決済で販売するから、アプリストアの15〜30%手数料を回避。上位プランほど生成回数の上限が増え、より賢いモデルが使えます。"
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isPro = plan.id === "pro";
          return (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                isPro
                  ? "bg-grad-hero text-white ring-2 ring-brand/40"
                  : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-black ${
                    isPro ? "text-white" : "text-ink"
                  }`}
                >
                  {translate(plan.nameKey as Parameters<typeof translate>[0])}
                </h3>
                {isPro ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-extrabold text-white backdrop-blur">
                    🔥 人気
                  </span>
                ) : null}
              </div>
              <p
                className={`mt-2 text-3xl font-black ${
                  isPro ? "text-white" : "text-ink"
                }`}
              >
                {priceLabel(plan)}
              </p>

              <ul
                className={`mt-4 space-y-2 text-sm ${
                  isPro ? "text-white/90" : "text-ink-soft"
                }`}
              >
                <li>
                  AI生成：
                  <span
                    className={`font-black ${isPro ? "text-white" : "text-ink"}`}
                  >
                    {plan.limits.generationsPerMonth.toLocaleString("ja-JP")}
                  </span>
                  回 / 月
                </li>
                <li>
                  公開できるアプリ：
                  <span
                    className={`font-black ${isPro ? "text-white" : "text-ink"}`}
                  >
                    {plan.limits.maxPublishedApps.toLocaleString("ja-JP")}
                  </span>
                  個
                </li>
                <li>
                  モデル：
                  <span
                    className={`font-black ${isPro ? "text-white" : "text-ink"}`}
                  >
                    {tierLabel(plan)}
                  </span>
                </li>
                <li>
                  マーケットで販売：
                  <span
                    className={`font-black ${isPro ? "text-white" : "text-ink"}`}
                  >
                    {plan.limits.canSell ? "できる" : "できない"}
                  </span>
                </li>
              </ul>

              {plan.limits.canSell ? (
                <p
                  className={`mt-4 text-xs ${
                    isPro ? "text-white/80" : "text-ink-soft"
                  }`}
                >
                  マーケット手数料：
                  <span className="font-bold">
                    総売上の{Math.round(MARKETPLACE_TAKE_RATE * 100)}%
                  </span>
                </p>
              ) : null}

              <div className="mt-auto pt-5">
                <a
                  href={
                    plan.id === "enterprise"
                      ? "mailto:sales@pdforge.dev"
                      : plan.id === "free"
                        ? "/signin"
                        : `/api/billing/activate?plan=${plan.id}`
                  }
                  className={
                    isPro
                      ? "block rounded-full bg-white px-4 py-2.5 text-center text-sm font-extrabold text-brand-strong shadow-md transition-transform hover:-translate-y-0.5"
                      : "btn-grad block rounded-full px-4 py-2.5 text-center text-sm font-extrabold"
                  }
                >
                  {plan.id === "enterprise"
                    ? "お問い合わせ"
                    : plan.id === "free"
                      ? "サインイン"
                      : "プランを選ぶ"}
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        価格はすべて米ドル表示です。マーケットでの有料販売にはプラットフォーム手数料{Math.round(MARKETPLACE_TAKE_RATE * 100)}%がかかり、クリエイターは残りの{Math.round((1 - MARKETPLACE_TAKE_RATE) * 100)}%を受け取ります。
      </p>
    </div>
  );
}
