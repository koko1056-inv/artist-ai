import { Card, SectionTitle } from "../../components/ui";
import { getSession } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();

  return (
    <div className="mx-auto max-w-md">
      <SectionTitle
        eyebrow="アカウント"
        title="サインイン 💖"
        subtitle="開発用サインイン（メールアドレスのみ）です。サブスク登録・公開・収益受け取りに使えます。本格的な認証は後ほどこの裏側に組み込まれます。"
      />

      {session ? (
        <Card className="bg-[color:var(--color-mint-soft)]">
          <p className="text-sm text-ink">
            <span aria-hidden className="mr-1">✨</span>
            <span className="font-bold">{session.email}</span> でサインイン中 ·{" "}
            <span className="font-bold capitalize">{session.plan}</span> プラン
          </p>
          <form action="/api/auth/signout" method="post" className="mt-4">
            <button className="rounded-full border-2 border-line bg-card px-5 py-2 text-sm font-extrabold text-ink transition-colors hover:border-brand hover:text-brand">
              サインアウト
            </button>
          </form>
        </Card>
      ) : (
        <Card>
          <form action="/api/auth/signin" method="post" className="space-y-4">
            <label className="block text-sm font-bold text-ink">
              メールアドレス
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-2xl border-2 border-line bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand"
              />
            </label>
            {error ? (
              <p className="text-sm font-bold text-[color:var(--color-danger)]">
                有効なメールアドレスを入力してください。
              </p>
            ) : null}
            <button className="btn-grad w-full rounded-full px-4 py-3 text-sm font-extrabold">
              続ける ✨
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
