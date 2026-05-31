/**
 * Money is always stored and passed around in minor units (e.g. USD cents) plus an
 * ISO-4217 currency code. Formatting is delegated to `Intl` so the platform is
 * locale-correct from day one (global, English-first but not English-only).
 */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY";

/** Currencies without minor units (e.g. JPY) use 0 decimal places. */
const ZERO_DECIMAL: ReadonlySet<CurrencyCode> = new Set(["JPY"]);

export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export function money(amountMinor: number, currency: CurrencyCode = "USD"): Money {
  return { amountMinor: Math.round(amountMinor), currency };
}

function fractionDigits(currency: CurrencyCode): number {
  return ZERO_DECIMAL.has(currency) ? 0 : 2;
}

/** Convert minor units to a major-unit number (e.g. 1900 -> 19.00). */
export function toMajor(m: Money): number {
  return m.amountMinor / 10 ** fractionDigits(m.currency);
}

/** Format money for display in the given locale (defaults to en-US). */
export function formatMoney(m: Money, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
  }).format(toMajor(m));
}

/** Split a gross sale into platform fee and creator payout given a take rate. */
export function splitSale(
  gross: Money,
  takeRate: number,
): { platformFee: Money; creatorPayout: Money } {
  const fee = Math.round(gross.amountMinor * takeRate);
  return {
    platformFee: money(fee, gross.currency),
    creatorPayout: money(gross.amountMinor - fee, gross.currency),
  };
}

/**
 * Three-way split for sales of apps built on licensed IP: the platform takes its rate,
 * the rights holder takes a royalty, and the creator keeps the remainder. For public
 * domain assets `royaltyRate` is 0 and this reduces to {@link splitSale}.
 */
export function splitSaleWithRoyalty(
  gross: Money,
  platformRate: number,
  royaltyRate: number,
): { platformFee: Money; royalty: Money; creatorPayout: Money } {
  const platformFee = Math.round(gross.amountMinor * platformRate);
  const royalty = Math.round(gross.amountMinor * royaltyRate);
  return {
    platformFee: money(platformFee, gross.currency),
    royalty: money(royalty, gross.currency),
    creatorPayout: money(gross.amountMinor - platformFee - royalty, gross.currency),
  };
}
