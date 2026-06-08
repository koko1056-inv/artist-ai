/**
 * Builds and (de)serializes the AppConfig that drives a real, runnable habit-tracker app.
 *
 * The config is encoded into the shareable app URL (base64url), so a published app runs on
 * any device with no database. `buildHabitConfig` is the deterministic generator that turns
 * a creator's inputs into a config today; a real LLM slots in behind the same shape later.
 */
import { appConfigSchema, type AppConfig, type PdAsset } from "@pd/contracts";

/** Per-character accent + in-character encouragement; falls back to a neutral default. */
const CHARACTER_FLAVOR: Record<string, { accent: string; line: string }> = {
  "steamboat-willie-mickey": { accent: "#27496d", line: "Toot toot! Let's get it done today." },
  "betty-boop-early": { accent: "#7a1f3d", line: "You've got this, darling — one step at a time." },
  "nancy-drew-early": { accent: "#1f5c54", line: "Every clue counts. Solve today's case!" },
  "albert-einstein": { accent: "#3b3470", line: "Small consistent steps compound. Keep going." },
  "nikola-tesla": { accent: "#1b3a6b", line: "Charge up your streak — energy builds." },
  "leonardo-da-vinci": { accent: "#8a6a3a", line: "Discipline is the bridge to mastery." },
  "hokusai-great-wave": { accent: "#1c3a63", line: "Ride today's wave. Momentum carries you." },
  "sherlock-holmes": { accent: "#5d4632", line: "Elementary — consistency reveals results." },
  "alice-in-wonderland": { accent: "#1f6b5a", line: "Curiouser and curiouser — keep exploring!" },
  dracula: { accent: "#3a1430", line: "Rise and conquer the night's tasks." },
  frankenstein: { accent: "#234034", line: "It's alive — and so is your streak!" },
  "wizard-of-oz": { accent: "#1d6b4f", line: "Follow your own yellow brick road." },
  "robin-hood": { accent: "#2f5a2a", line: "Aim true — hit today's mark." },
  pinocchio: { accent: "#9a5a2b", line: "No fibs — show up for yourself today." },
  "van-gogh-starry-night": { accent: "#1b3a73", line: "Paint your day with small bright stars." },
  "nova-the-explorer": { accent: "#5b3bd6", line: "Explore a new planet — one habit at a time!" },
};

const DEFAULT_HABITS = ["Drink water", "Move for 20 min", "Read", "Sleep on time"];

/** Extract up to 6 habits from a free-text prompt, else fall back to sensible defaults. */
function parseHabits(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  // Take the text after a cue word if present, otherwise the whole prompt.
  const cue = lower.search(/\b(track|habits?|like|such as|:)\b/);
  const tail = cue >= 0 ? prompt.slice(cue) : prompt;
  const candidates = tail
    .replace(/^[^:]*:/, "")
    .split(/,|\band\b|·|\n|;/i)
    .map((s) => s.replace(/[^a-zA-Z0-9 +&'-]/g, "").trim())
    .filter((s) => s.length >= 3 && s.length <= 40)
    // Drop obvious non-habit filler words.
    .filter((s) => !/^(track|habits?|app|tracker|please|make|build|that|with)$/i.test(s));
  const unique = Array.from(new Set(candidates)).slice(0, 6);
  return unique.length > 0 ? unique : DEFAULT_HABITS;
}

function deriveTitle(prompt: string, assetLabel: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (cleaned.length >= 3 && cleaned.length <= 48) return cleaned;
  const short = assetLabel.split(" (")[0] ?? assetLabel;
  return `${short} Habits`;
}

export interface BuildHabitInput {
  asset: Pick<PdAsset, "id" | "label" | "thumbnailUrl" | "provenanceNotice">;
  prompt: string;
}

/** Deterministically turn creator inputs into a runnable habit-tracker config. */
export function buildHabitConfig(input: BuildHabitInput): AppConfig {
  const flavor = CHARACTER_FLAVOR[input.asset.id] ?? {
    accent: "#3f7a5f",
    line: "One small step today. You've got this.",
  };
  return {
    template: "habit-tracker",
    title: deriveTitle(input.prompt, input.asset.label),
    characterId: input.asset.id,
    characterImageUrl: input.asset.thumbnailUrl,
    accent: flavor.accent,
    encouragement: flavor.line,
    habits: parseHabits(input.prompt),
    provenanceNotice: input.asset.provenanceNotice,
    aiAssisted: true,
  };
}

/* ---- URL-safe base64 codec (isomorphic: server + browser) ---- */

const g = globalThis as unknown as {
  btoa?: (s: string) => string;
  atob?: (s: string) => string;
  Buffer?: { from(s: string, enc: string): { toString(enc: string): string } };
};

function toB64Url(json: string): string {
  const b64 = g.btoa
    ? g.btoa(unescape(encodeURIComponent(json)))
    : g.Buffer!.from(json, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  if (g.atob) return decodeURIComponent(escape(g.atob(b64)));
  return g.Buffer!.from(b64, "base64").toString("utf-8");
}

export function encodeAppConfig(config: AppConfig): string {
  return toB64Url(JSON.stringify(config));
}

/** Decode + validate an encoded config; returns null if malformed. */
export function decodeAppConfig(encoded: string): AppConfig | null {
  try {
    const parsed = appConfigSchema.safeParse(JSON.parse(fromB64Url(encoded)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
