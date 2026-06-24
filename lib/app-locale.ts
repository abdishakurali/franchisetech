import type { AppLocale } from "@/lib/app-i18n";
import { defaultPosLocale } from "@/lib/pos-i18n";

export type AppLocaleSource = {
  profileLocale?: string | null;
  orgCountryCode?: string | null;
};

/** BCP 47 tag for Intl formatters. */
export function intlLocaleForApp(locale: AppLocale): string {
  return locale === "ro" ? "ro-RO" : "en-IE";
}

export function formatAppDate(
  value: string | null | undefined,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" },
): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat(intlLocaleForApp(locale), options).format(d);
}

/** Romanian businesses always use Romanian UI (reports are legally significant). */
export function resolveAppLocale(source: AppLocaleSource = {}): AppLocale {
  if (source.orgCountryCode === "RO") return "ro";
  const profile = source.profileLocale;
  if (profile === "en" || profile === "ro") return profile;
  return defaultPosLocale(false);
}
