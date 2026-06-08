/**
 * Tiny presentational primitives shared across pages — playful, colorful, rounded.
 * Server-component safe (no state). Styling uses the Tailwind v4 tokens in `globals.css`.
 */
import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "brand"
  | "accent"
  | "mint"
  | "sun"
  | "sky"
  | "success"
  | "warn";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const tones: Record<Tone, string> = {
    neutral: "bg-paper-2 text-ink-soft",
    brand: "bg-brand-soft text-brand-strong",
    accent: "bg-accent-soft text-accent",
    mint: "bg-[color:var(--color-mint-soft)] text-[color:var(--color-mint)]",
    sun: "bg-[color:var(--color-sun-soft)] text-[color:var(--color-warn)]",
    sky: "bg-[color:var(--color-sky-soft)] text-[color:var(--color-sky)]",
    success: "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)]",
    warn: "bg-[color:var(--color-warn)]/12 text-[color:var(--color-warn)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card-pop rounded-[var(--radius-card)] border border-line bg-card p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <span className="mb-2 inline-block rounded-full bg-grad-brand px-3 py-1 text-xs font-extrabold text-white shadow-sm">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-1.5 text-ink-soft">{subtitle}</p> : null}
    </div>
  );
}
