export type MarketingLocale = "en" | "ro" | "it";

export const MARKETING_LOCALE_COOKIE = "franchisetech_locale";

export const MARKETING_LOCALES: MarketingLocale[] = ["en", "ro", "it"];

export function isMarketingLocale(value: string | null | undefined): value is MarketingLocale {
  return value === "en" || value === "ro" || value === "it";
}

export function marketingHtmlLang(locale: MarketingLocale): string {
  if (locale === "ro") return "ro";
  if (locale === "it") return "it";
  return "en";
}

export function marketingOpenGraphLocale(locale: MarketingLocale): string {
  if (locale === "ro") return "ro_RO";
  if (locale === "it") return "it_IT";
  return "en";
}
