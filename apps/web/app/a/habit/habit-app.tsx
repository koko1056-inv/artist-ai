"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppConfig } from "@pd/contracts";

/** Stable storage key for an app's local data, derived from its identity. */
function storageKey(config: AppConfig): string {
  let h = 0;
  const s = `${config.characterId}|${config.title}|${config.habits.join(",")}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `pdforge:habit:${Math.abs(h).toString(36)}`;
}

/** ISO date (YYYY-MM-DD) for a given Date in local time. */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** The 7 dates of the current week (Mon–Sun) containing `today`. */
function currentWeek(today: Date): Date[] {
  const day = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type Checks = Record<string, Record<string, boolean>>; // date -> habitIndex -> done

export function HabitApp({ config }: { config: AppConfig }) {
  const key = useMemo(() => storageKey(config), [config]);
  const today = useMemo(() => new Date(), []);
  const week = useMemo(() => currentWeek(today), [today]);
  const todayIso = isoDate(today);

  const [checks, setChecks] = useState<Checks>({});
  const [loaded, setLoaded] = useState(false);

  // Load persisted data on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setChecks(JSON.parse(raw) as Checks);
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, [key]);

  // Persist on change (after initial load).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(checks));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [checks, key, loaded]);

  function toggle(dateIso: string, habitIndex: number) {
    setChecks((prev) => {
      const day = { ...(prev[dateIso] ?? {}) };
      day[habitIndex] = !day[habitIndex];
      return { ...prev, [dateIso]: day };
    });
  }

  function doneCount(dateIso: string): number {
    const day = checks[dateIso] ?? {};
    return config.habits.reduce((n, _h, i) => (day[i] ? n + 1 : n), 0);
  }

  // Current streak: consecutive days up to today with at least one habit done.
  const streak = useMemo(() => {
    let s = 0;
    const d = new Date(today);
    for (;;) {
      if (doneCount(isoDate(d)) > 0) {
        s += 1;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checks, today]);

  const todayDone = doneCount(todayIso);
  const todayPct = Math.round((todayDone / config.habits.length) * 100);

  const accent = config.accent;

  return (
    <main
      className="mx-auto min-h-screen max-w-md px-5 py-8"
      style={{ ["--accent" as string]: accent }}
    >
      <header className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.characterImageUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-2xl border object-cover"
          style={{ borderColor: accent }}
        />
        <div>
          <h1 className="text-xl font-extrabold leading-tight" style={{ color: accent }}>
            {config.title}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-600">{config.encouragement}</p>
        </div>
      </header>

      {/* Today's progress */}
      <section className="mt-6 rounded-2xl p-4 text-white" style={{ backgroundColor: accent }}>
        <div className="flex items-baseline justify-between">
          <span className="text-sm/none opacity-90">Today</span>
          <span className="text-sm font-semibold">🔥 {streak}-day streak</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-3xl font-black">{todayPct}%</span>
          <span className="text-sm opacity-90">
            {todayDone}/{config.habits.length} habits
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${todayPct}%` }} />
        </div>
      </section>

      {/* Weekly grid */}
      <section className="mt-6">
        <div className="grid grid-cols-[1fr_repeat(7,1.6rem)] items-center gap-y-3 text-xs text-neutral-500">
          <span />
          {week.map((d, i) => {
            const isToday = isoDate(d) === todayIso;
            return (
              <span
                key={i}
                className="text-center font-semibold"
                style={isToday ? { color: accent } : undefined}
              >
                {DAY_LABELS[i]}
              </span>
            );
          })}

          {config.habits.map((habit, hi) => (
            <FragmentRow
              key={hi}
              habit={habit}
              week={week}
              todayIso={todayIso}
              accent={accent}
              checks={checks}
              habitIndex={hi}
              onToggle={toggle}
            />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t pt-4 text-[11px] leading-relaxed text-neutral-400">
        <p>{config.provenanceNotice}</p>
        <p className="mt-1">
          {config.aiAssisted ? "AI-assisted · " : ""}Made with PD Forge · Add to your home
          screen to use it daily.
        </p>
      </footer>
    </main>
  );
}

function FragmentRow({
  habit,
  week,
  todayIso,
  accent,
  checks,
  habitIndex,
  onToggle,
}: {
  habit: string;
  week: Date[];
  todayIso: string;
  accent: string;
  checks: Checks;
  habitIndex: number;
  onToggle: (dateIso: string, habitIndex: number) => void;
}) {
  return (
    <>
      <span className="truncate pr-2 text-sm font-medium text-neutral-800">{habit}</span>
      {week.map((d, i) => {
        const di = isoDate(d);
        const done = checks[di]?.[habitIndex] ?? false;
        const isToday = di === todayIso;
        return (
          <button
            key={i}
            type="button"
            aria-label={`${habit} on ${di}`}
            aria-pressed={done}
            onClick={() => onToggle(di, habitIndex)}
            className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-colors"
            style={{
              backgroundColor: done ? accent : "transparent",
              borderColor: done ? accent : isToday ? accent : "#d4d4d4",
              color: done ? "#fff" : "transparent",
            }}
          >
            ✓
          </button>
        );
      })}
    </>
  );
}
