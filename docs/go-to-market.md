# Go-To-Market & Marketing Plan — PD Forge (working title)

How we acquire creators and end users for a two-sided platform where creators use
AI-assisted coding to build lightweight daily-use apps on public-domain (PD) IP, publish
them to a marketplace, and earn. Global, English-first. Companion to
[`requirements.md`](./requirements.md) and [`architecture.md`](./architecture.md).

---

## 1. The core strategic problem

This is a **two-sided marketplace** with an asymmetric payer:

- **Creators** pay the subscription ($19/$39/mo) and supply the apps.
- **End users** create demand by installing/using/buying apps.

So creator acquisition is the primary funnel, but creators only stay if there's demand.
Three principles resolve the cold start:

1. **Seed supply first, manufacture demand.** Thicken the creator side early; bootstrap
   demand with first-party demo apps, contests, and creators' own audiences.
2. **PD is a free PR engine.** "Legally build & sell an app starring Steamboat Willie
   Mickey" is inherently newsworthy. Anchor an annual moment on **Public Domain Day
   (Jan 1)**, when new characters enter the PD.
3. **Build growth loops into the product**, not just campaigns (see §6).

---

## 2. Positioning & messaging

- **One-liner:** *Build apps your fans actually use — on public-domain characters.*
- **Promise to creators:** Turn AI-built apps into income — legally, with characters
  people already love.
- **Differentiators:**
  - **Legal safety** — only the PD version, with automated trademark/late-design review
    and provenance labels baked in. (Most "fan app" ideas die on legal fear; we remove it.)
  - **Monetization built in** — subscription + marketplace payout, no separate store setup.
  - **Daily-use, not throwaway** — task/habit/calendar/notes are sticky; better retention
    and word-of-mouth than one-off games.
  - **AI-coding, real code** — not no-code lock-in; creators get a real, publishable app.
- **Anti-positioning to avoid:** never imply rights beyond the PD version; never market
  as "make any fan app of anything." Precision here *is* the brand.

---

## 3. The wedge (who we win first)

Don't launch to "everyone." Win one sharp segment, then expand.

**Primary wedge — the "vibe-coder / indie hacker" + template-seller crowd.**
They already use AI coding tools (Cursor, v0, Replit, Bolt), already understand
"build → ship → sell," and already live on X, Product Hunt, Reddit, and Discord. They are
the fastest creators to activate and the cheapest to reach.

**Secondary wedge — aesthetic/"cozy productivity" creators** (Notion-template sellers,
studygram/booktok, character-art fans). They bring taste, audience, and the demand side.

Expansion order: indie/AI creators → cozy-productivity creators → general end users →
(later) official small-IP holders (the original long-term vision).

---

## 4. Channels & tactics

### 4.1 Founder-led / build-in-public (pre-launch → always-on)
- Daily short demos on **X/Twitter, LinkedIn, TikTok/Reels/Shorts**: the satisfying
  *prompt → app → publish → first sale* loop in 15–30s clips. This loop is the single most
  shareable asset we have — make a lot of it.
- Waitlist landing page led by one killer demo GIF + the legal-safety promise.

### 4.2 Launch platforms (beta moment)
- **Product Hunt** (indie/AI audience), **Show HN** on Hacker News (the AI-coding + PD
  legal angle plays well), niche newsletters (AI tooling, indie hackers).

### 4.3 Community-led
- A **creator Discord**: templates, weekly build challenges, a **revenue leaderboard**,
  and a visible "featured creator" slot. Community is the retention moat for the payer side.
- **Creator program**: early access, lower take rate for first cohort, co-marketing of
  their best apps.

### 4.4 Contests as the cold-start engine
- Themed build contests tied to characters ("Betty Boop Productivity Pack," "Einstein
  focus-timer challenge"): prizes + featured placement + social proof. Each contest
  manufactures supply, demand, and content simultaneously.
- **Public Domain Day (Jan 1)** flagship campaign every year: new characters drop into the
  library, press outreach, a launch contest. Free, recurring, ownable moment.

### 4.5 Content & SEO (compounding)
- Programmatic + editorial: "how to legally use the 1928 Steamboat Willie Mickey,"
  "make money building apps with AI," "best {character} habit tracker," template galleries.
- YouTube long-form: "I built and sold an app in a weekend with AI + public domain."

### 4.6 Influencer / partnerships
- AI-coding influencers (Cursor/v0/Replit ecosystem), productivity YouTubers, cozy-aesthetic
  creators. Pay in cash + revenue share + featured placement.
- Authentic niche partners: PD/archive communities, "public domain review"-style outlets.

### 4.7 Paid (only after PMF signals)
- Retarget the waitlist; run the build-loop clips as TikTok/IG ads; search ads on
  "AI app builder" and Notion-template-adjacent intent. Keep paid as an amplifier of proven
  organic creatives, not a crutch.

### 4.8 Demand side (end users of the apps)
- Every published app is a distribution surface: **provenance / "Made with PD Forge" badge**
  on each app = free impressions and a referral path back to the platform.
- **ASO** for the host app ("cute habit tracker," "character to-do") + per-app PWA pages
  that are SEO-indexable and shareable.
- Creators market their own apps → we ride their distribution (Etsy/Gumroad model).

---

## 5. Funnel & metrics

```
Reach (clips, PH/HN, SEO, contests)
  → Waitlist / signup
    → Activation: first app generated
      → Publish: first app listed (passes review)
        → First sale / first active end user
          → Creator retention (subscription renews) + GMV growth
```

- **North-star metric:** weekly active end users across published apps (proves the
  apps are *used*, which is what keeps creators paying).
- Supporting: signup→activation rate, activation→publish rate, time-to-first-sale,
  creator monthly retention/churn, GMV, MRR, AI-cost per creator vs. plan ceiling.

---

## 6. Growth loops (own these, not just campaigns)

1. **Creator loop:** creator builds → shares app to get sales → brings new end users →
   some convert to creators.
2. **Product virality loop:** "Made with PD Forge" badge on every app → impressions →
   signups.
3. **Content loop:** contests + build-in-public → social clips & UGC → new creators.
4. **PD-event loop:** annual Public Domain Day → press + new-character creation surge.

---

## 7. Phasing

| Phase | Focus | Key moves |
|---|---|---|
| 0 — Pre-launch | Narrative + supply seed | Build-in-public, waitlist, 10–20 design-partner creators, first-party demo apps |
| 1 — Beta launch | Activation + proof | Product Hunt / Show HN, first contest, Discord, tie to a PD moment |
| 2 — Growth | Compounding loops | SEO content engine, influencers, paid retargeting, more characters/templates |
| 3 — Scale | Distribution + demand | Host-app store push (ASO), localize top markets, official small-IP partnerships |

---

## 8. Risks & guardrails

- **Legal messaging:** market only the PD version; educate creators in-product. Mis-marketing
  is an existential brand/legal risk — accuracy is non-negotiable.
- **Marketplace quality:** automated + human review and a curated "featured" tier prevent a
  low-quality flood that would kill end-user trust.
- **AI-content backlash:** lean into "AI-assisted, human-published, legally safe," surface
  the human-contribution/AI-assistance labels, and reward original, high-effort apps.
- **Over-reliance on a single character's hype:** diversify the library and the contest
  calendar so the brand isn't "the Mickey app."
```
