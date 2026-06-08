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

const STEPS: Array<{
  emoji: string;
  title: string;
  body: string;
  bg: string;
}> = [
  {
    emoji: "🎁",
    title: "1 · IPを預ける",
    body: "あなたのキャラクター・アートワーク・世界観を登録。権利はあなたのまま。あなたの条件にもとづいて、プラットフォーム上でライセンスします。",
    bg: "bg-brand-soft",
  },
  {
    emoji: "⚙️",
    title: "2 · 条件を決める",
    body: "ロイヤリティ率、アプリごとの承認の要否、利用できるサブスクプラン、提供地域を、あなたが自由に設定できます。",
    bg: "bg-accent-soft",
  },
  {
    emoji: "🪄",
    title: "3 · 制作とレビューはおまかせ",
    body: "クリエイターがスタジオであなたのIPを使い、毎日使えるアプリを制作。すべて自動レビューを通過し、承認が必要なIPはあなたのサインオフを待ってから公開されます。",
    bg: "bg-[color:var(--color-mint-soft)]",
  },
  {
    emoji: "💰",
    title: "4 · 報酬と出所表示",
    body: "売上は自動で分配。プラットフォーム手数料、あなたのIPロイヤリティ、クリエイターの取り分にきちんと分けます。すべての公開アプリに出所表示とクレジットがつきます。",
    bg: "bg-[color:var(--color-sun-soft)]",
  },
];

export default async function PartnersPage() {
  const assets = await loadAssets();
  const partners = derivePartners(assets);

  return (
    <div className="space-y-10">
      <SectionTitle
        eyebrow="パートナー募集"
        title="あなたのIPを、PD Forgeへ 🤝"
        subtitle="あなたの公式キャラクターを、毎日使える軽量アプリをつくるクリエイターたちに開放しませんか。条件はすべてあなた次第。ロイヤリティと出所表示はこちらでまるごと管理します。"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {STEPS.map((step) => (
          <Card key={step.title} className={step.bg}>
            <h3 className="flex items-center gap-2 text-lg font-black text-ink">
              <span aria-hidden className="text-2xl">
                {step.emoji}
              </span>
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{step.body}</p>
          </Card>
        ))}
      </div>

      <section>
        <h3 className="text-xl font-black text-ink">現在のパートナー ✨</h3>
        {partners.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            まだIPパートナーはいません。あなたが第一号になりませんか？
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
                    <p className="font-black text-ink">{partner.name}</p>
                    <p className="text-xs text-ink-soft">
                      ライセンス素材 {partner.assetCount} 点
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                  <li>
                    ロイヤリティ：総売上の{Math.round(partner.royaltyRate * 100)}%
                  </li>
                  <li>
                    対象プラン：{" "}
                    <span className="capitalize">
                      {partner.allowedPlans.join("・") || "—"}
                    </span>
                  </li>
                  <li>提供地域：{partner.territories.join("・") || "—"}</li>
                  {partner.expiresAt ? (
                    <li>
                      ライセンス期限：{" "}
                      {new Date(partner.expiresAt).toLocaleDateString("ja-JP")}
                    </li>
                  ) : null}
                </ul>

                <div className="mt-4">
                  <Badge tone="warn">ライセンスIP</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="bg-grad-hero flex flex-col items-start gap-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-black">
            パートナー申請はこちら 💌
          </h3>
          <p className="mt-1 text-sm text-white/90">
            あなたのIPと希望する条件を教えてください。パートナー用ワークスペースの準備とオンボーディングをこちらで進めます。
          </p>
        </div>
        <a
          href="mailto:partners@pdforge.example?subject=IP%20partner%20application"
          className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-extrabold text-brand-strong shadow-md transition-transform hover:-translate-y-0.5"
        >
          パートナー申請 🚀
        </a>
      </Card>
    </div>
  );
}
