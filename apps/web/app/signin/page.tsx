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
        eyebrow="Account"
        title="Sign in"
        subtitle="Dev sign-in (email only) so you can subscribe, publish, and get paid. Real auth is wired behind this later."
      />

      {session ? (
        <Card>
          <p className="text-sm text-ink">
            Signed in as <span className="font-semibold">{session.email}</span> ·{" "}
            <span className="capitalize">{session.plan}</span> plan.
          </p>
          <form action="/api/auth/signout" method="post" className="mt-4">
            <button className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand">
              Sign out
            </button>
          </form>
        </Card>
      ) : (
        <Card>
          <form action="/api/auth/signin" method="post" className="space-y-3">
            <label className="block text-sm font-medium text-ink">
              Email
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm"
              />
            </label>
            {error ? (
              <p className="text-sm text-[color:var(--color-danger)]">
                Please enter a valid email.
              </p>
            ) : null}
            <button className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">
              Continue
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
