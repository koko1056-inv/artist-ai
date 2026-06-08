/**
 * In-memory usage store for the north-star metric: weekly active end users (WAU) per app.
 *
 * DEV-GRADE: this lives in process memory, so it is per-instance and ephemeral. It exists to
 * make the "are published apps actually used?" loop observable end-to-end. Production swaps
 * this for a durable event store / analytics pipeline (the call sites stay the same).
 *
 * No PII: events carry only a random per-device id and a day. We keep a bounded window.
 */
interface Event {
  appId: string;
  anonId: string;
  day: string; // YYYY-MM-DD
}

const MAX_EVENTS = 50_000;
const events: Event[] = [];
// Dedup within (appId, anonId, day) so a device counts once per day.
const seen = new Set<string>();

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function recordActive(appId: string, anonId: string, day: string): void {
  const key = `${appId}|${anonId}|${day}`;
  if (seen.has(key)) return;
  seen.add(key);
  events.push({ appId, anonId, day });
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
}

/** Distinct devices active on an app within the last 7 days (incl. today). */
export function wau(appId: string): number {
  const cutoff = daysAgoIso(6);
  const ids = new Set<string>();
  for (const e of events) {
    if (e.appId === appId && e.day >= cutoff) ids.add(e.anonId);
  }
  return ids.size;
}

/** Total distinct devices ever active on an app (a proxy for installs/opens). */
export function reach(appId: string): number {
  const ids = new Set<string>();
  for (const e of events) if (e.appId === appId) ids.add(e.anonId);
  return ids.size;
}

/** Platform-wide WAU across all apps (distinct device·app pairs in the last 7 days). */
export function totalWau(): number {
  const cutoff = daysAgoIso(6);
  const pairs = new Set<string>();
  for (const e of events) if (e.day >= cutoff) pairs.add(`${e.appId}|${e.anonId}`);
  return pairs.size;
}

export function activeAppCount(): number {
  return new Set(events.map((e) => e.appId)).size;
}
