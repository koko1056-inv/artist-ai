import { Badge, Card, SectionTitle } from "../../components/ui";
import { AssetThumb } from "../../components/asset-thumb";
import { loadAssets } from "../../lib/data";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  character: "Character",
  "historical-figure": "Historical figure",
  artwork: "Artwork",
};

export default async function LibraryPage() {
  // Server component: read directly via the data layer (the same data the
  // GET /api/assets route serves to mobile / client callers). Falls back to the
  // sample seed when no database is connected.
  const assets = await loadAssets();

  return (
    <div>
      <SectionTitle
        eyebrow="Library"
        title="Public-domain asset library"
        subtitle="Every asset is confirmed public domain in the listed markets and carries a provenance notice that travels with anything you publish."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.id} className="flex flex-col">
            {/* Real public-domain image when available (the work itself is PD),
                falling back to the bundled illustration so a tile never breaks. */}
            <AssetThumb
              slug={asset.id}
              fallbackSrc={asset.thumbnailUrl}
              alt={`${asset.label} image`}
              className="mb-4 h-36 w-full rounded-[var(--radius-card)] border border-line object-cover"
            />

            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink">{asset.label}</h3>
              <Badge tone="accent">{KIND_LABEL[asset.kind] ?? asset.kind}</Badge>
            </div>

            <p className="mt-3 text-sm text-ink-soft">{asset.provenanceNotice}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {asset.publicDomainIn.map((market) => (
                <Badge key={market} tone="success">
                  PD in {market}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
