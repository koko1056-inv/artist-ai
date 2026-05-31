import { formatMoney, money, translate, type CurrencyCode } from "@pd/core";
import { Badge, Card, SectionTitle } from "../../components/ui";
import { loadListings } from "../../lib/data";

export const dynamic = "force-dynamic";

function price(priceMinor: number, currency: string): string {
  if (priceMinor === 0) return "Free";
  return formatMoney(money(priceMinor, currency as CurrencyCode));
}

export default async function MarketplacePage() {
  const listings = await loadListings();

  return (
    <div>
      <SectionTitle
        eyebrow="Marketplace"
        title="Daily-use apps built on public-domain characters"
        subtitle="Install into the host app or add to your home screen. Every app is provenance-labeled and AI-assisted."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Card key={listing.id} className="flex flex-col">
            {/* Plain <img> keyed off the listing thumbnail (not the asset slug),
                with a neutral fallback box if it fails to load. */}
            {listing.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.thumbnailUrl}
                alt={`${listing.title} thumbnail`}
                className="mb-4 h-36 w-full rounded-[var(--radius-card)] border border-line object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const next = el.nextElementSibling as HTMLElement | null;
                  if (next) next.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="mb-4 h-36 w-full items-center justify-center rounded-[var(--radius-card)] border border-line bg-paper-2 text-xs text-ink-soft"
              style={{ display: listing.thumbnailUrl ? "none" : "flex" }}
            >
              No preview
            </div>

            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink">{listing.title}</h3>
              <span className="whitespace-nowrap text-sm font-bold text-brand">
                {price(listing.priceMinor, listing.currency)}
              </span>
            </div>

            <p className="mt-1 text-xs text-ink-soft">
              {translate("marketplace.byCreator", { creator: listing.creatorName })}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {listing.licenseType === "licensed" ? (
                <>
                  <Badge tone="warn">Licensed</Badge>
                  {listing.creditLine ? (
                    <span className="text-xs text-ink-soft">
                      {listing.creditLine}
                    </span>
                  ) : null}
                </>
              ) : (
                <Badge tone="success">Public domain</Badge>
              )}
            </div>

            <p className="mt-3 flex-1 text-sm text-ink-soft">{listing.summary}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {listing.aiAssisted ? (
                <Badge tone="brand">{translate("provenance.aiAssisted")}</Badge>
              ) : null}
              <Badge tone="accent">Provenance labeled</Badge>
            </div>

            <p className="mt-3 text-xs text-ink-soft">{listing.provenanceNotice}</p>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div className="text-xs text-ink-soft">
                <span className="font-semibold text-ink">
                  {listing.installCount.toLocaleString("en-US")}
                </span>{" "}
                installs ·{" "}
                <span className="font-semibold text-ink">
                  {listing.rating.toFixed(1)}
                </span>{" "}
                ★
              </div>
              <button
                type="button"
                className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                {translate("marketplace.install")}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
