import type { Metadata } from "next";
import type { MarketingLocale } from "@/lib/marketing/locale";

export const MARKETING_LANG = "en" as const;

export function localeAlternates(
  path: string,
  _activeLocale: MarketingLocale = "en",
): Metadata["alternates"] {
  // Canonical always points at the clean URL, regardless of which locale
  // rendered the page — a ?lang=ro canonical on the majority-locale traffic
  // was splitting ranking signal between the bare path and its own query
  // variant.
  //
  // No hreflang: the clean URL renders Romanian for anyone without a locale
  // cookie (getMarketingLocale defaults to "ro", and crawlers send no cookies),
  // but the old hreflang map labelled it "en" and pointed "ro" at the ?lang=ro
  // duplicate, whose canonical is the clean URL again. English only exists as a
  // cookie/?lang=en variant that canonicalises to the Romanian page, so there
  // is no indexable English URL to declare. Re-add hreflang only once English
  // has its own self-canonical URLs (e.g. /en/...).
  const normalized = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return { canonical: normalized };
}

export const MARKETING_KEYWORDS_EN = [
  "cafe POS",
  "restaurant POS",
  "food business software",
  "cloud POS",
  "recipe costing",
  "stock management cafe",
  "till close report",
  "Z-report POS",
  "multi-location restaurant software",
] as const;

export const MARKETING_KEYWORDS_RO = [
  "POS restaurant România",
  "software cafenea",
  "casă de marcat HORECA",
  "gestiune stoc restaurant",
  "cost rețete",
  "închidere casă",
  "raport Z",
  "POS cloud România",
  "software restaurant",
  "afacere alimentară",
  "cod QR bon fiscal",
  "bon fiscal QR ANAF",
  "casa de marcat QR 2026",
  "amenzi cod QR bon fiscal 2027",
] as const;

export const MARKETING_KEYWORDS = MARKETING_KEYWORDS_EN;

export function marketingKeywords(locale: MarketingLocale): string[] {
  if (locale === "ro") return [...MARKETING_KEYWORDS_RO, ...MARKETING_KEYWORDS_EN.slice(0, 4)];
  return [...MARKETING_KEYWORDS_EN, ...MARKETING_KEYWORDS_RO.slice(0, 3)];
}
