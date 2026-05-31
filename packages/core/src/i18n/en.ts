/**
 * English source catalog. `en` is the source locale; other locales are added as
 * sibling catalogs with the same keys. No user-facing string should be hard-coded in
 * components — everything resolves through here.
 */
export const en = {
  "app.name": "PD Forge",
  "app.tagline": "Build apps your fans actually use — on public-domain characters.",

  "nav.studio": "Studio",
  "nav.marketplace": "Marketplace",
  "nav.library": "Library",
  "nav.pricing": "Pricing",
  "nav.dashboard": "Dashboard",

  "plan.free.name": "Free",
  "plan.basic.name": "Basic",
  "plan.pro.name": "Pro",
  "plan.enterprise.name": "Enterprise",

  "template.taskManager.name": "Task Manager",
  "template.taskManager.desc": "A to-do list your favorite character keeps you on top of.",
  "template.habitTracker.name": "Habit Tracker",
  "template.habitTracker.desc": "Daily streaks, gently encouraged by a public-domain icon.",
  "template.calendar.name": "Calendar",
  "template.calendar.desc": "A monthly view decorated with classic characters.",
  "template.notes.name": "Notes",
  "template.notes.desc": "Quick notes with a character sticky-note twist.",

  "studio.prompt.placeholder":
    "Describe your app, e.g. \"A cute task manager where 1928 Steamboat Willie Mickey cheers when I finish.\"",
  "studio.generate": "Generate",
  "studio.preview": "Preview on device",
  "studio.publish": "Publish",

  "marketplace.install": "Install",
  "marketplace.byCreator": "by {creator}",

  "provenance.aiAssisted": "AI-assisted",
  "provenance.label": "Based on the public-domain version",
} as const;

export type MessageKey = keyof typeof en;
