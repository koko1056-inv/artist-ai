# @pd/mobile — PD Forge host (super) app

The single mobile app that PD Forge ships to the App Store and Google Play. It is a
**host (super) app**: instead of publishing each creator app natively, this one app loads
lightweight creator apps at runtime and runs them inside an isolated sandbox, updated
over-the-air (OTA).

Built with Expo (React Native + TypeScript). The UI is English-only. This package is
currently a **typed skeleton**: it is structured to compile and `tsc --noEmit`-pass, and
models the native surfaces with thin interfaces rather than pulling heavy native deps.

## Host-app / container model

```
App.tsx  ── tab nav (Marketplace · My Apps · Account)
  │
  ├─ MarketplaceScreen  fetch listings from web API, validate with @pd/contracts
  │                     listingSchema, Install → adds to My Apps
  ├─ MyAppsScreen       installed creator apps; Open → mounts Sandbox
  └─ AccountScreen      plan info; Manage subscription → web billing (Linking)

runtime/Sandbox.tsx     isolated container that loads a creator BUNDLE by bundleUrl
runtime/bridge.ts        the ONLY native capability surface exposed to creator apps
```

Creator apps are untrusted code. They are never published natively and never get raw
device access. The host owns the sandbox and the bridge; the creator bundle only ever
sees the bridge.

## Sandbox runtime

`src/runtime/Sandbox.tsx` defines `SandboxRuntime` and renders a placeholder container.
Two real backends are modeled:

- **WebView bundle (MVP default):** creator HTML/JS served from `bundleUrl`, rendered in a
  locked-down WebView. The only path to native is a `postMessage` channel proxied to the
  `HostBridge`. Strongest isolation, trivially OTA-able.
- **Hermes JS bundle:** precompiled bundle evaluated in a fresh JS context with the
  `HostBridge` injected as the sole privileged global. Lighter UI; isolation enforced in
  JS, so gated behind review.

## OTA flow

The host asks the web API for the current, content-addressed `bundleUrl` (plus a version /
hash) for each installed app. Bundles are immutable and cached on device. On launch the
host checks for a newer version, downloads it in the background, and swaps it in on next
open — no store review cycle. Expo Updates handles OTA for the host shell itself; creator
bundles ride the same idea one layer down.

## Bridge security boundary

`src/runtime/bridge.ts` is the security boundary. `HostBridge` enumerates the *only*
capabilities a creator app can use:

- **notifications** — schedule / cancel local notifications
- **storage** — get / set / remove, **namespaced per app** (`app:{appId}:{key}`) so apps
  can never read or clobber each other's data
- **calendar** — add events (after host-mediated consent)
- **widgets** — register home-screen widgets

`createHostBridge(appId, granted)` builds a frozen bridge; any call to a capability the app
was not granted throws `CapabilityDeniedError`. Grants are scoped to what the app's
template declares (`APP_TEMPLATES[...].capabilities` in `@pd/core`). If a capability is not
in this interface, a creator app cannot do it.

## Subscriptions are web-checkout (store-fee-free)

The mobile app never collects payment in-app. Subscriptions are sold via **web checkout
(Stripe)** to avoid the 15–30% store cut. `AccountScreen`'s "Manage subscription" opens the
web billing portal in the system browser via `Linking`.

## Licensed IP

Listings carry a `licenseType` of `public-domain` or `licensed`. The Marketplace shows a
license badge on every card, the listing `thumbnailUrl`, and — for licensed apps — the
partner `creditLine` (e.g. `© Nova Pixel Studio`).

When a licensed app is installed and opened, the host (not the untrusted creator bundle)
renders that credit line in the sandbox header/about area and notes that the app is built
on licensed IP. The creator bundle cannot suppress or forge the credit because it never
has the surface to draw chrome outside its sandbox — this is enforced at the bridge
boundary (`src/runtime/bridge.ts`).

Royalties to the rights holder and the user's subscription are **reconciled server-side**;
the mobile app never collects payment in-app and the bridge exposes no payment or licensing
capability to creator code.

## Shared packages

- `@pd/contracts` — `Listing`, `PdAsset`, `GenerateResponse` + zod schemas. Used to validate
  API responses at the boundary.
- `@pd/core` — `translate` / `makeT` (English copy), `APP_TEMPLATES` / `TemplateId`,
  `formatMoney` / `money`, `PLANS` / `Plan` / `PlanId`.

Server-only packages (`@pd/db`, `@pd/ai`) are intentionally **not** consumed here.

## Scripts

- `pnpm --filter @pd/mobile typecheck` — `tsc --noEmit`
- `pnpm --filter @pd/mobile start` — `expo start`

## Skeleton notes

`src/types/react-native.d.ts` is a local type shim declaring just the RN exports this app
uses (`View`, `Text`, `ScrollView`, `Pressable`, `StyleSheet`, `SafeAreaView`, `FlatList`,
`ActivityIndicator`, `Linking`) plus `expo`'s `registerRootComponent`, so typecheck passes
without the full `react-native` types installed. When real RN types are present, they win.
