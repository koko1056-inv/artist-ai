import { en, type MessageKey } from "./en.js";
import { ja } from "./ja.js";

export type Locale = "en" | "ja";
export type { MessageKey };

const CATALOGS: Record<Locale, Record<string, string>> = { en, ja };

/** Japanese-first product. Switch per-request later if we add a locale selector. */
export const DEFAULT_LOCALE: Locale = "ja";

/**
 * Translate a key for a locale, interpolating `{name}` placeholders. Falls back to the
 * default locale, then to the key itself, so missing translations never crash the UI.
 */
export function translate(
  key: MessageKey,
  vars?: Record<string, string | number>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const catalog = CATALOGS[locale] ?? CATALOGS[DEFAULT_LOCALE];
  let str = catalog[key] ?? CATALOGS[DEFAULT_LOCALE][key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

/** Bind a locale once and reuse, e.g. `const t = makeT("ja"); t("nav.studio")`. */
export function makeT(locale: Locale = DEFAULT_LOCALE) {
  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(key, vars, locale);
}
