import {
  formatMoney,
  MARKETPLACE_TAKE_RATE,
  money,
  PLANS,
  translate,
  type Plan,
  type PlanId,
} from "@pd/core";
import { Badge, Card, SectionTitle } from "../../components/ui";

const PLAN_ORDER: PlanId[] = ["free", "basic", "pro", "enterprise"];

function priceLabel(plan: Plan): string {
  if (plan.id === "enterprise") return "Custom";
  if (plan.priceMinor === 0) return "Free";
  return `${formatMoney(money(plan.priceMinor, plan.currency))}/mo`;
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
        eyebrow="Pricing"
        title="Plans that keep AI cost bounded"
        subtitle="Subscriptions are sold via web checkout to avoid the 15–30% app-store cut. Higher plans unlock larger generation quotas and better models."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          return (
            <Card key={plan.id} className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">
                  {translate(plan.nameKey as Parameters<typeof translate>[0])}
                </h3>
                {plan.id === "pro" ? <Badge tone="brand">Popular</Badge> : null}
              </div>
              <p className="mt-2 text-2xl font-extrabold text-ink">
                {priceLabel(plan)}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                <li>
                  <span className="font-semibold text-ink">
                    {plan.limits.generationsPerMonth.toLocaleString("en-US")}
                  </span>{" "}
                  AI generations / month
                </li>
                <li>
                  <span className="font-semibold text-ink">
                    {plan.limits.maxPublishedApps.toLocaleString("en-US")}
                  </span>{" "}
                  published apps
                </li>
                <li>
                  Model tier:{" "}
                  <span className="font-semibold text-ink">{tierLabel(plan)}</span>
                </li>
                <li>
                  Marketplace selling:{" "}
                  <span className="font-semibold text-ink">
                    {plan.limits.canSell ? "Yes" : "No"}
                  </span>
                </li>
              </ul>

              {plan.limits.canSell ? (
                <p className="mt-4 text-xs text-ink-soft">
                  Marketplace take rate:{" "}
                  <span className="font-semibold">
                    {Math.round(MARKETPLACE_TAKE_RATE * 100)}%
                  </span>{" "}
                  of gross sales.
                </p>
              ) : null}

              <div className="mt-auto pt-5">
                <a
                  href={
                    plan.id === "enterprise"
                      ? "mailto:sales@pdforge.dev"
                      : `/checkout/mock?plan=${plan.id}`
                  }
                  className="block rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                >
                  {plan.id === "enterprise" ? "Contact sales" : "Choose plan"}
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        All prices in USD. The platform also earns a{" "}
        {Math.round(MARKETPLACE_TAKE_RATE * 100)}% take rate on paid marketplace
        sales; creators keep the remaining {Math.round((1 - MARKETPLACE_TAKE_RATE) * 100)}
        %.
      </p>
    </div>
  );
}
