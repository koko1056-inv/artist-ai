import type { PdAsset } from "@pd/contracts";
import { Badge, Card, SectionTitle } from "../../components/ui";
import { loadAssets } from "../../lib/data";

export const dynamic = "force-dynamic";

interface PartnerSummary {
  name: string;
  logoUrl?: string;
  royaltyRate: number;
  allowedPlans: string[];
  territories: string[];
  expiresAt?: string;
  assetCount: number;
}

/** Derive the active partner roster from licensed assets, deduped by partner name. */
function derivePartners(assets: PdAsset[]): PartnerSummary[] {
  const byName = new Map<string, PartnerSummary>();
  for (const asset of assets) {
    if (asset.license.type !== "licensed") continue;
    const name = asset.license.partnerName ?? "Licensed partner";
    const existing = byName.get(name);
    if (existing) {
      existing.assetCount += 1;
      continue;
    }
    byName.set(name, {
      name,
      logoUrl: asset.license.partnerLogoUrl,
      royaltyRate: asset.license.royaltyRate,
      allowedPlans: asset.license.allowedPlans,
      territories: asset.license.territories,
      expiresAt: asset.license.expiresAt,
      assetCount: 1,
    });
  }
  return [...byName.values()];
}

const STEPS: Array<{ title: string; body: string }> = [
  {
    title: "1 · Bring your official IP",
    body: "Submit your characters, artwork, or worlds. You keep ownership — we license it on the platform under your terms.",
  },
  {
    title: "2 · Set your terms",
    body: "Choose your royalty rate, whether each app needs your approval, which subscription plans may use the IP, and the territories where it's available.",
  },
  {
    title: "3 · We handle creation & review",
    body: "Creators build daily-use apps with your IP in the Studio. Every app passes automated review, and approval-required IP waits for your sign-off before going live.",
  },
  {
    title: "4 · Payout & provenance",
    body: "We split each sale automatically: platform fee, your IP royalty, and the creator's payout. Every listing carries a credit line and provenance notice.",
  },
];

export default async function PartnersPage() {
  const assets = await loadAssets();
  const partners = derivePartners(assets);

  return (
    <div className="space-y-10">
      <SectionTitle
        eyebrow="Partners"
        title="Bring your IP to PD Forge"
        subtitle="Open your official characters to a community of creators building lightweight, daily-use apps — on your terms, with royalties and provenance handled for you."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {STEPS.map((step) => (
          <Card key={step.title}>
            <h3 className="font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{step.body}</p>
          </Card>
        ))}
      </div>

      <section>
        <h3 className="text-lg font-bold text-ink">Current partners</h3>
        {partners.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            No IP partners yet — you could be the first.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <Card key={partner.name} className="flex flex-col">
                <div className="flex items-center gap-3">
                  {partner.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.logoUrl}
                      alt={`${partner.name} logo`}
                      className="h-10 w-10 rounded object-contain"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-paper-2 text-xs text-ink-soft">
                      IP
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-ink">{partner.name}</p>
                    <p className="text-xs text-ink-soft">
                      {partner.assetCount} licensed asset
                      {partner.assetCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                  <li>
                    Royalty: {Math.round(partner.royaltyRate * 100)}% of gross
                  </li>
                  <li>
                    Eligible plans:{" "}
                    <span className="capitalize">
                      {partner.allowedPlans.join(", ") || "—"}
                    </span>
                  </li>
                  <li>Territories: {partner.territories.join(", ") || "—"}</li>
                  {partner.expiresAt ? (
                    <li>
                      Licensed through{" "}
                      {new Date(partner.expiresAt).toLocaleDateString("en-US")}
                    </li>
                  ) : null}
                </ul>

                <div className="mt-4">
                  <Badge tone="warn">Licensed IP</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-ink">
            Apply to partner with us
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Tell us about your IP and the terms you'd like. We'll set up your
            partner workspace and onboarding.
          </p>
        </div>
        <a
          href="mailto:partners@pdforge.example?subject=IP%20partner%20application"
          className="whitespace-nowrap rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Apply to partner with us
        </a>
      </Card>
    </div>
  );
}
