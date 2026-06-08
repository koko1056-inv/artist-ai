# Future Ideas (backlog — not in scope now)

Parked ideas to revisit after the core loop (see `prfaq.md`) is proven. Capturing so they
aren't lost; deliberately NOT building these yet.

---

## 1. "IP-skin your real tools" — embed IP into apps people already use daily

**Idea.** Instead of (only) generating brand-new apps, let creators take an app they already
use every day and produce an IP-infused version of it. Two flavors:

- **Skin/extension on existing tools** — e.g. a Trello-style task board reskinned and themed
  with a licensed IP (the example given: a **FRUITS ZIPPER** edition of a Trello-like
  tool): themed columns, cards, mascots, sounds, reward animations, seasonal events.
- **GitHub-branch integration** — point us at an open-source app's repo/branch; we apply an
  "IP layer" (theme, assets, character moments, copy) as a branch/PR or an overlay package,
  so the IP can be woven into real codebases rather than only into generated-from-scratch apps.

**Why it's compelling.**
- Rides existing daily-use behavior (retention is already there) instead of fighting for it.
- Much stronger pull for IP holders: "your fans use your characters inside the tools they
  already live in" — high-frequency, high-affinity surface area.
- Fits the open-source/"vibe-coder" wedge: branches, PRs, overlay packages are native to them.

**Why it's parked (for now).**
- Reskinning *third-party products* (Trello, Notion, etc.) raises trademark/ToS issues with
  those platforms — different and harder than the PD/IP rights we already model.
- "Apply IP to an arbitrary GitHub branch" is a large, open-ended integration surface
  (every codebase differs); hard to make safe, reviewable, and on-brand at scale.
- It widens scope away from the proven core loop. Sequence after PD/licensed loop works.

**How it could fit our existing architecture later.**
- Our **licensed-IP rights system** (royalty, eligibility, approval, territories) already
  generalizes to this — the IP layer is just another licensed asset bundle.
- Could ship as: (a) an **"IP theme pack"** format (assets + tokens + character moments)
  that overlays a known open-source app template, and (b) a **GitHub App** that opens a PR
  adding the theme pack to a supported repo. Start with a handful of *blessed* open-source
  app templates we control end-to-end (not arbitrary repos), to keep review/safety tractable.
- Distribution stays our container/PWA + marketplace; royalties flow through the existing
  3-way split.

**Open questions to resolve before building.**
- Which surface first: our own open-source app templates (safe) vs. real third-party tools
  (legally fraught)? Almost certainly the former.
- Is the unit a *theme pack* (data) or *generated code* (a branch/PR)? Packs are safer/cheaper.
- How do IP holders approve a "skin" of a productivity tool (brand-safety review at the
  pack level)?

---

## Other parked ideas

- **More templates** beyond habit tracker (to-do, calendar, notes) — after the first
  template retains users.
- **3D / rich media** in published apps — foundation exists; gated off for launch.
- **Native host app + app-store presence** — PWA first.
- **Print-on-demand merch** from app themes — separate business.
- **Creator collaboration / teams**, multi-language — post-PMF.
