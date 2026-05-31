/**
 * Tiny presentational primitives shared across pages. Server-component safe (no state).
 * Styling uses the Tailwind v4 design tokens declared in `app/globals.css`.
 */
import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "accent" | "success" | "warn";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper-2 text-ink-soft",
    brand: "bg-brand-soft text-brand-strong",
    accent: "bg-accent-soft text-accent",
    success: "bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
    warn: "bg-[color:var(--color-warn)]/10 text-[color:var(--color-warn)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
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
      className={`rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm ${className}`}
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
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      {subtitle ? <p className="mt-1 text-ink-soft">{subtitle}</p> : null}
    </div>
  );
}
