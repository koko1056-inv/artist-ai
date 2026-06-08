# PR/FAQ — PD Forge (Working Backwards)

> Amazon-style "Working Backwards" PR/FAQ. The press release is written as if the product
> already launched, for the customer. The FAQ answers the hard questions. The point is to
> force clarity on the **single core value** and ruthlessly cut everything else.

---

## PRESS RELEASE

### PD Forge lets anyone turn a character they love into a real app they can sell — in minutes, legally.

**Today PD Forge opened to creators worldwide.** With a sentence and a public-domain
character, anyone can build a genuinely useful daily app — a habit tracker, a to-do list —
publish it to a shareable link, and start earning. No coding. No lawyers. No app-store
gauntlet.

**The problem.** Millions of people love classic characters and have app ideas, but three
walls stop them: they can't code, they can't tell what's legal to use, and even if they
build something they can't distribute or get paid for it. Fan creativity dies in a Discord
screenshot.

**The solution.** PD Forge removes all three walls at once. You pick a character from a
library of works that are confirmed public domain. You describe the app you want. Our AI
writes and hosts a real, working app — one your friends actually open every day — with the
character woven in. You publish it to a link in one click and set a price. We handle the
rights, the hosting, the payments, and the payout.

> "We kept meeting people with a great app idea and a favorite character, who were blocked
> on the same three things: building it, the legal fear, and getting paid. PD Forge collapses
> all three into one sentence and one button," said the founder of PD Forge.

> "I made a Sherlock Holmes habit tracker on my lunch break. Forty people use it daily and
> I've made my subscription back twice over. I have never written a line of code," said an
> early creator.

**Getting started.** Go to the studio, pick a character, describe your app, hit Generate,
and Publish. Free to try; a monthly subscription unlocks publishing and selling.

---

## CUSTOMER FAQ

**What exactly do I get?** A real, working web app (installable to your phone home screen)
that uses a public-domain character, hosted by us at a shareable link. Not a mockup.

**Do I need to know how to code?** No. You describe it in plain language; the AI writes and
hosts it. You can refine it by asking for changes.

**Is it actually legal?** Yes — the library only contains works confirmed to be in the
public domain, and every app is checked at publish time and labelled with its source. You
use the public-domain *version* only (e.g. the 1928 Steamboat Willie Mickey, not the modern
trademarked one); the app enforces that.

**What kinds of apps can I make?** Lightweight daily-use tools — habit trackers and to-do
lists at launch. Not games (yet).

**How do I make money?** Set a price; buyers pay; we take a cut and pay you the rest.

**What does it cost me?** A monthly subscription to publish and sell. You can try building
for free.

---

## INTERNAL FAQ (the hard questions)

**What is the single core value — the one thing we cannot cut?**
> *Turn a beloved public-domain character into a real, monetizable daily app in minutes —
> without being a developer or a lawyer.*
Three walls, removed together: **build it (AI)**, **legal safety (PD + automated rights)**,
**distribute + get paid (hosted link + payments)**. If any one is missing, the magic dies.
Everything else is negotiable.

**So what is the irreducible MVP loop?**
`pick character → describe app → get a REAL, hosted, working app → publish to a link → earn`
A creator must be able to walk that loop end-to-end on day one. That is the whole product.

**What are we deliberately NOT building for launch (and why)?**

| Cut / defer | Why it's not core to the launch value |
|---|---|
| **3D models & rich media browser** | Impressive, but daily-use apps don't need 3D; it adds cost and complexity without changing the core promise. Images only at launch. |
| **Licensed-IP partner program (non-PD)** | Powerful expansion and we built the foundation, but the launch wedge *is* "legally safe with PD." Sequence it after the PD loop is proven. Keep it dark in the UI for v1. |
| **Native host app + app-store presence** | The container super-app is heavy. PWA (installable web app) delivers "daily use" for far less. Ship PWA; revisit native later. |
| **Four templates** | Start with ONE great template (habit tracker). Breadth dilutes quality and the demo. |
| **Print-on-demand merch** | A different business. Later. |
| **Rich marketplace discovery/ranking** | A shareable app page + a simple list is enough until there's supply to rank. |
| **Teams/Enterprise, multi-language** | No. Focus on the single-creator, English loop first. |

**What's genuinely MISSING that we must build to deliver the core value?**
(Today most of this is mocked — that's the gap between demo and product.)
1. **Real AI code generation** (today it's a mock provider). This is the heart.
2. **Apps that actually run and persist data** — a real runtime + per-app storage, because
   "daily use" requires the app to remember the user's tasks/habits. Today `bundleUrl` is fake.
3. **A real published artifact**: a hosted PWA at a shareable URL.
4. **Accounts + subscription billing** (Stripe) — to actually charge creators.
5. **Creator payouts** (Stripe Connect) — to actually pay creators their cut.
6. **Trust & safety in production**: automated review + a human queue, since the legal
   posture is the moat.
7. **Creator analytics** (installs, weekly active users) — proves the app is *used*, which
   is what keeps creators subscribing.

**Build order (working backwards from the loop):**
real generation → runnable+persistent app → hosted PWA link → auth+subscription →
payout → review/safety → analytics. Nothing else until this loop retains creators.

**Why will this work now?** AI code-gen crossed the "good enough to build a small real app"
line; a wave of public-domain characters just entered the commons; and PWAs make hosted,
installable apps cheap. The three walls fell at the same time.

**What's the biggest risk?** Not legal and not AI quality — it's **demand**: will end users
actually use these apps daily? The north-star metric is weekly active end users across
published apps, not creator signups. If apps aren't used, creators churn and the loop dies.

**How do the unit economics hold?** Subscription is the floor; per-creator AI + hosting cost
is bounded by plan quotas and usage metering (already designed). We sell the subscription via
web checkout to avoid the 15–30% store cut. Licensed IP (later) adds a third-party royalty
split we already model.

**What would make us kill or pivot this?** If, after the loop is real, creators can build but
their apps get little daily use (low end-user retention) and we can't move it — the value
prop is wrong and we rethink the customer, not add features.
