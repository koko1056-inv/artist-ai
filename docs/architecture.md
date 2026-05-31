# Architecture — PD Forge (working title)

A scalable, mobile-first, global (English) platform where creators use **AI-assisted
coding** to build practical lightweight apps (task manager, habit tracker, calendar,
notes) on top of **public-domain (PD) IP**, publish them to a marketplace, and earn —
while the platform earns from subscriptions + take rate.

This document describes the **technical design**. Product requirements live in
[`requirements.md`](./requirements.md).

---

## 1. Guiding principles

1. **Mobile-first, container delivery.** A single host app ships to the stores; creator
   apps run inside a sandbox and update over-the-air (OTA). PWA is a parallel,
   store-fee-free distribution channel. We do **not** publish each UGC app natively.
2. **Cost follows end-user usage, not just creators.** Every design choice favors cheap
   per-request serving (edge/serverless, static where possible) and bounded AI spend
   (per-plan generation limits, prompt caching, diff-based edits).
3. **English-first, i18n-ready.** All copy flows through an i18n layer (default `en`).
4. **Provider-abstracted.** AI models, payments, storage, and POD sit behind interfaces
   so we can swap vendors and route by plan/cost.
5. **Typed contracts everywhere.** Shared domain types in one package; both web and
   mobile consume them. Nothing guesses field names.

---

## 2. Monorepo layout

```
.
├─ apps/
│  ├─ web/          # Next.js (App Router) — creator studio, marketplace, landing, API
│  └─ mobile/       # Expo / React Native — host (super) app that runs creator apps via OTA
├─ packages/
│  ├─ core/         # domain model + business rules (plans, take-rate, asset licensing)
│  ├─ db/           # Prisma schema + client + seed (PD asset library)
│  ├─ ai/           # AI codegen provider abstraction + prompt assembly + cost guardrails
│  ├─ contracts/    # shared API request/response types + zod schemas (web <-> mobile)
│  └─ ui/           # shared design tokens + primitive components
├─ docs/
└─ (workspace config: pnpm-workspace.yaml, turbo.json, tsconfig.base.json)
```

Why a monorepo: web and mobile must share the same domain types, API contracts, and
licensing rules. Splitting them would drift the contracts and the asset-usage audit.

---

## 3. System components

### 3.1 Host app (mobile, `apps/mobile`)
- Single native binary in App Store / Google Play.
- Loads creator apps as **JS bundles / configs** into a sandboxed runtime; updates OTA so
  new/updated apps appear without store review.
- Exposes native capabilities to sandboxed apps via a controlled bridge API:
  notifications, local storage/sync, calendar, widgets.
- Subscriptions are sold via **web checkout** (Stripe) to avoid the 15–30% store cut,
  consistent with the cost model.

### 3.2 Creator studio (web, `apps/web`)
- Where creators pick PD assets, prompt the AI, edit generated code, preview on a device,
  and publish.
- Hosts the **marketplace** (browse / search / install) and the **landing** site.
- Hosts the **API** (Next.js route handlers) for generation, assets, apps, billing.

### 3.3 AI codegen service (`packages/ai`)
- `CodegenProvider` interface; concrete adapters (Anthropic / OpenAI / etc.).
- Assembles prompts from: user intent + chosen PD asset (with its style guide /
  trademark-avoidance rules) + target template.
- **Cost guardrails**: per-plan model routing, generation quotas, prompt caching, and
  diff-based edits rather than full regeneration.

### 3.4 Data layer (`packages/db`)
- Postgres via Prisma. Entities: User, Subscription, Plan, PdAsset, App, AppVersion,
  Listing, Purchase, AssetUsage (audit trail for legal provenance), Review.
- Seeded with the initial PD asset library (Steamboat Willie Mickey 1928/1930, Betty Boop
  early, Nancy Drew early, Einstein/Tesla/da Vinci, …) each carrying a style guide.

### 3.5 Contracts (`packages/contracts`)
- zod schemas + inferred TS types for every API endpoint, shared by web API, web client,
  and mobile.

---

## 4. Key flows

### 4.1 Create → publish
```
Creator subscribes (Stripe, web)
  → picks PD asset (style guide attached)
  → prompt → CodegenProvider generates app bundle  (quota + cost guardrail checked)
  → preview on device (QR → host app, OTA)
  → submit → automated review (trademark/late-design/banned-content) → human exception queue
  → published: AppVersion + Listing created, AssetUsage recorded for audit
```

### 4.2 Install → daily use (end user)
```
Browse marketplace → install into host app (or add PWA to home screen)
  → app runs in sandbox, uses bridge APIs (notifications, storage)
  → usage metered for cost attribution
```

### 4.3 Monetization
- Subscription (web Stripe) — primary, store-fee-free.
- Marketplace take rate (20–25%) on paid app sales.
- POD take rate (Phase 2).

---

## 5. Scalability & cost controls

- **Edge/serverless** request serving; static assets on CDN. Heavy work pushed client-side.
- **Per-plan AI quotas + model routing** keep generation cost under a fixed fraction of
  the subscription (target ≤ 30%).
- **Usage metering** (`AssetUsage` / request metering) attributes hosting cost to apps so
  a free, heavily-used app cannot silently run at a loss — rate limits + caps apply.
- **Stateless API** behind a load balancer; Postgres with read replicas as we grow.

---

## 6. Internationalization

- `en` is the source locale. All user-facing strings go through `packages/core` i18n
  catalogs (`apps/web` uses the same catalog). No hard-coded copy in components.
- Currency/date formatting via `Intl`. Marketplace prices stored in minor units + currency.

---

## 7. Security & compliance hooks

- Asset usage is recorded per published app (legal provenance / DMCA defense).
- Every published app surfaces a provenance badge ("Based on the 1928 public-domain
  version of …") and an AI-assistance label.
- PII handling (GDPR/CCPA) isolated in the data layer; deletion requests cascade.

---

## 8. Status

This repository currently contains the **foundation**: monorepo wiring, shared domain
model and contracts, the data schema + PD asset seed, the AI codegen abstraction with cost
guardrails, the web studio/marketplace/landing scaffolding (English UI), and the mobile
host-app skeleton. See each package's README for module-level detail and `docs/roadmap`
items in `requirements.md` for what is intentionally deferred.
