import { mediaGroupOf } from "@pd/core";
import type { PdAsset } from "@pd/contracts";
import { Badge, Card, SectionTitle } from "../../components/ui";
import { AssetThumb } from "../../components/asset-thumb";
import { loadAssets } from "../../lib/data";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  character: "Character",
  "historical-figure": "Historical figure",
  artwork: "Artwork",
};

/** A short "3 images · 1 3D · 2 audio" summary derived from an asset's media. */
function mediaSummary(asset: PdAsset): string {
  let images = 0;
  let threeD = 0;
  let audio = 0;
  for (const m of asset.media) {
    const group = mediaGroupOf(m.kind);
    if (group === "images") images += 1;
    else if (group === "threeD") threeD += 1;
    else audio += 1;
  }
  const parts: string[] = [];
  if (images > 0) parts.push(`${images} image${images === 1 ? "" : "s"}`);
  if (threeD > 0) parts.push(`${threeD} 3D`);
  if (audio > 0) parts.push(`${audio} audio`);
  return parts.length > 0 ? parts.join(" · ") : "No media";
}

function has3d(asset: PdAsset): boolean {
  return asset.media.some((m) => mediaGroupOf(m.kind) === "threeD");
}

function LicenseBadge({ asset }: { asset: PdAsset }) {
  if (asset.license.type === "licensed") {
    return (
      <Badge tone="warn">
        Licensed{asset.license.partnerName ? ` · ${asset.license.partnerName}` : ""}
      </Badge>
    );
  }
  return <Badge tone="success">Public domain</Badge>;
}

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

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <LicenseBadge asset={asset} />
              {has3d(asset) ? <Badge tone="brand">3D</Badge> : null}
            </div>

            <p className="mt-2 text-xs text-ink-soft">{mediaSummary(asset)}</p>

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
