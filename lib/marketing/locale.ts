export type MarketingLocale = "en" | "ro";

export const MARKETING_LOCALE_COOKIE = "franchisetech_locale";

export const MARKETING_LOCALES: MarketingLocale[] = ["en", "ro"];

export function isMarketingLocale(value: string | null | undefined): value is MarketingLocale {
  return value === "en" || value === "ro";
}

export function marketingHtmlLang(locale: MarketingLocale): string {
  if (locale === "ro") return "ro";
  return "en";
}

export function marketingOpenGraphLocale(locale: MarketingLocale): string {
  if (locale === "ro") return "ro_RO";
  return "en";
}

/** Primary Romanian marketing domain — default locale RO when no cookie is set. */
export function isRomanianMarketingHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return hostname === "franchisetech.ro" || hostname === "www.franchisetech.ro";
}
