import Link from "next/link";
import { translate } from "@pd/core";
import { Card } from "../components/ui";

const STEPS: Array<{
  n: string;
  emoji: string;
  title: string;
  body: string;
  bg: string;
  chip: string;
}> = [
  {
    n: "1",
    emoji: "🧩",
    title: "キャラを選ぶ",
    body: "1928年スチームボート・ウィリーのミッキー、初期ベティ・ブープ、北斎の大波…。キュレーション済みのキャラ図鑑から、好きな一体を選ぼう。各キャラには合法的に安全に使えるスタイルガイドつき。",
    bg: "bg-brand-soft",
    chip: "bg-grad-brand",
  },
  {
    n: "2",
    emoji: "🪄",
    title: "AIに伝える",
    body: "つくりたい「毎日使えるアプリ」を言葉で説明するだけ。スタジオが商標回避のルールを織り込んだプロンプトを自動で組み立て、サンドボックスで動くアプリを生成します。",
    bg: "bg-accent-soft",
    chip: "bg-grad-mint",
  },
  {
    n: "3",
    emoji: "🚀",
    title: "公開して稼ぐ",
    body: "自動レビューが出所と禁止要素をチェックして、出所バッジとAI制作ラベルつきで公開。ストア手数料なしのウェブ決済で販売でき、売上の大部分はあなたのもの。",
    bg: "bg-[color:var(--color-sun-soft)]",
    chip: "bg-grad-sun",
  },
];

const VALUES: Array<{
  emoji: string;
  title: string;
  body: string;
  bg: string;
}> = [
  {
    emoji: "🛡️",
    title: "合法的に安全",
    body: "使うのはパブリックドメイン版だけ。すべてのアプリに出所が表示され、監査ログがあなたの制作を裏付けます。",
    bg: "bg-[color:var(--color-mint-soft)]",
  },
  {
    emoji: "📱",
    title: "毎日使える実用アプリ",
    body: "タスク管理、習慣トラッカー、カレンダー、メモ。使い捨てゲームじゃない、毎日ひらく実用アプリがつくれます。",
    bg: "bg-[color:var(--color-sky-soft)]",
  },
  {
    emoji: "💰",
    title: "その場で公開＆収益化",
    body: "サブスクも販売もウェブ決済だから、アプリストアの15〜30%の手数料を回避。すぐに収益化できます。",
    bg: "bg-brand-soft",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="relative grid items-center gap-8 pt-6 md:grid-cols-2">
        <span
          aria-hidden
          className="animate-floaty pointer-events-none absolute -top-2 right-2 text-4xl md:right-1/3"
        >
          ✨
        </span>
        <div>
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-grad-brand px-3 py-1 text-xs font-extrabold text-white shadow-sm">
            🎨 推しキャラ × AIアプリ開発
          </p>
          <h1 className="text-4xl font-black leading-[1.15] tracking-tight md:text-5xl">
            <span className="text-grad">推しキャラ</span>で、
            <br />
            毎日使えるアプリを
            <br />
            数分でつくろう。
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink-soft">
            {translate("app.tagline")}
            <br />
            キャラを選んで、AIに伝えるだけ。コード不要で、その場で公開＆収益化。🚀
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="btn-grad rounded-full px-7 py-3.5 text-base font-extrabold"
            >
              つくってみる ✨
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border-2 border-line bg-card px-7 py-3.5 text-base font-extrabold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              料金を見る 💎
            </Link>
          </div>
        </div>
        <Card className="bg-grad-hero text-white">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold backdrop-blur">
            🪄 つくる流れ
          </p>
          <p className="mt-3 text-2xl font-black leading-snug">
            キャラを選ぶ → AIに伝える → 公開 → 稼ぐ
          </p>
          <p className="mt-3 text-white/90">
            ひとつのホストアプリがストアに配信され、あなたの作品はサンドボックス内で動いてオンライン更新。ウェブは手数料なしのもうひとつの販売チャネルです。
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/25 px-3 py-1 backdrop-blur">
              🧩 コード不要
            </span>
            <span className="rounded-full bg-white/25 px-3 py-1 backdrop-blur">
              🛡️ 合法的に安全
            </span>
            <span className="rounded-full bg-white/25 px-3 py-1 backdrop-blur">
              💰 ストア手数料ゼロ
            </span>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          かんたん3ステップ 🎉
        </h2>
        <p className="mt-1.5 text-ink-soft">
          むずかしい知識はいりません。3ステップで公開までいけます。
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n} className={s.bg}>
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${s.chip} text-lg font-black text-white shadow-sm`}
              >
                {s.n}
              </div>
              <h3 className="text-lg font-black text-ink">
                <span aria-hidden className="mr-1">
                  {s.emoji}
                </span>
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          PD Forgeが選ばれる理由 💖
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} className={v.bg}>
              <div className="text-3xl" aria-hidden>
                {v.emoji}
              </div>
              <h3 className="mt-2 text-lg font-black text-ink">{v.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{v.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-grad-hero relative overflow-hidden rounded-[var(--radius-card)] px-6 py-14 text-center text-white shadow-lg">
        <span
          aria-hidden
          className="animate-floaty pointer-events-none absolute left-6 top-6 text-3xl"
        >
          🔥
        </span>
        <span
          aria-hidden
          className="animate-floaty pointer-events-none absolute bottom-6 right-6 text-3xl"
        >
          🪄
        </span>
        <h2 className="text-2xl font-black sm:text-3xl">さっそくつくってみる？</h2>
        <p className="mx-auto mt-2 max-w-prose text-white/90">
          スタジオを開いて、好きなキャラを選んで、今日あなたの最初の「毎日使えるアプリ」を公開しよう。📦
        </p>
        <Link
          href="/studio"
          className="mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-base font-extrabold text-brand-strong shadow-md transition-transform hover:-translate-y-0.5"
        >
          スタジオを開く 🚀
        </Link>
      </section>
    </div>
  );
}
