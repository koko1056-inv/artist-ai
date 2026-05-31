# PD Forge

> Working title. A mobile-first, global platform where creators use **AI-assisted coding**
> to build lightweight, daily-use apps (task manager, habit tracker, calendar, notes) on
> **public-domain (PD) IP**, publish them to a marketplace, and earn — while the platform
> earns from subscriptions + a marketplace take rate.

- **Product requirements:** [`docs/requirements.md`](./docs/requirements.md)
- **Technical architecture:** [`docs/architecture.md`](./docs/architecture.md)

## Why this shape

- **Mobile-first, container delivery.** One host app ships to the stores; creator apps run
  in a sandbox and update over-the-air. PWA is a parallel, store-fee-free channel. We don't
  publish each UGC app natively.
- **Cost follows end-user usage.** Per-plan AI quotas, model routing, and usage metering
  keep generation spend bounded and make heavily-used free apps visible, not silent losses.
- **English-first, i18n-ready.** All copy flows through an i18n layer (`en` source locale).
- **Provider-abstracted & typed.** AI, payments, storage, and POD sit behind interfaces;
  shared domain types and zod API contracts are consumed by both web and mobile.

## Monorepo layout

```
apps/
  web/         Next.js — creator studio, marketplace, landing, API (English UI)
  mobile/      Expo / React Native — host (super) app that runs creator apps via OTA
packages/
  core/        domain model + rules (plans, take-rate, licensing, cost guardrails, i18n)
  contracts/   zod API request/response schemas shared by web <-> mobile
  db/          Prisma schema + client + PD asset seed
  ai/          AI codegen provider abstraction + prompt assembly + automated review
docs/          requirements + architecture
```

## Getting started

```bash
pnpm install
pnpm db:generate          # generate the Prisma client
cp .env.example .env      # fill in DATABASE_URL / AI / Stripe as needed
pnpm dev                  # run apps in dev (turbo)
```

The web app falls back to in-memory sample data when no database is configured, and the AI
codegen falls back to a deterministic mock provider when no API key is set — so the
create → review → publish flow is fully exercisable in dev without external services.

## Useful commands

```bash
pnpm typecheck            # type-check all packages
pnpm test                 # run unit tests (vitest)
pnpm db:seed              # seed the public-domain asset library
```

## Status

This repository contains the **foundation**: monorepo wiring, the shared domain model and
API contracts (tested), the data schema + PD asset seed, the AI codegen abstraction with
cost guardrails (tested), the web studio/marketplace/landing (English UI), and the mobile
host-app skeleton. Deferred items are tracked in `docs/requirements.md`.
