# @pd/web — PD Forge web app

The Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 surface of PD
Forge: the marketing landing page, the creator **Studio**, the **Marketplace**, the PD
asset **Library**, **Pricing**, the creator **Dashboard**, and the JSON **API** route
handlers consumed by both this client and the mobile host app.

## Running

From the monorepo root (after `pnpm install` at the root):

```bash
pnpm --filter @pd/web dev      # http://localhost:3000
pnpm --filter @pd/web build
pnpm --filter @pd/web start
pnpm --filter @pd/web typecheck
```

## Works without a database

The API routes try Prisma (`@pd/db`) first and **fall back to in-memory sample data**
(`lib/sample-data.ts`, mirroring `packages/db/src/seed.ts`) when Postgres is
unavailable. This means the whole UI — Library, Marketplace, and the
generate → review → publish flow in the Studio — is fully demoable with **no DB and no
API keys**:

- AI codegen uses the deterministic `MockCodegenProvider` from `@pd/ai` (no
  `ANTHROPIC_API_KEY` needed).
- Billing uses `MockBillingProvider` (`lib/billing.ts`), returning a placeholder
  `/checkout/mock` URL instead of a real Stripe session.

Connect a real Postgres by setting `DATABASE_URL` and running
`pnpm --filter @pd/db generate && pnpm --filter @pd/db seed`; the same routes then read
live data automatically.

## Environment

- `NEXT_PUBLIC_APP_URL` — public base URL (default `http://localhost:3000`), used for
  the placeholder checkout link.
- `AI_PROVIDER` — `mock` (default) until a real adapter is configured.
- `BILLING_PROVIDER` — `mock` (default) until Stripe is wired in.

## Layout

```
app/
  layout.tsx            Root layout + top nav (i18n via @pd/core translate)
  page.tsx              Landing / marketing
  pricing/page.tsx      Plans from @pd/core PLANS (formatMoney, take rate)
  library/page.tsx      PD asset grid
  marketplace/page.tsx  Listing grid
  studio/               Server page + "use client" studio (generate + publish)
  dashboard/page.tsx    Plan, usage (canGenerate), revenue (splitSale)
  checkout/mock/        Placeholder checkout landing
  api/
    assets/             GET PdAsset[]
    listings/           GET Listing[]
    generate/           POST GenerateRequest -> GenerateResponse
    publish/            POST PublishRequest -> PublishResponse
    billing/checkout/   POST CheckoutRequest -> CheckoutResponse
components/ui.tsx       Presentational primitives (Badge, Card, SectionTitle)
lib/
  api.ts                Typed JSON / ApiError response helpers
  data.ts               Prisma-with-sample-fallback data access (server-only)
  sample-data.ts        Seed-mirroring fallback assets, listings, purchases
  billing.ts            BillingProvider abstraction + MockBillingProvider
```

All user-facing copy is English; primary nav and key labels resolve through the
`@pd/core` i18n catalog (`translate` / `makeT`).
