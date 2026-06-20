import type { Metadata } from "next";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { SITE_URL } from "@/lib/marketing/seo";

export const MARKETING_LANG = "en" as const;

function localizedUrl(path: string, lang: MarketingLocale | "x-default"): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const base = normalized === "" ? SITE_URL : `${SITE_URL}${normalized}`;
  if (lang === "en" || lang === "x-default") return base;
  if (normalized === "") return `${SITE_URL}/?lang=${lang}`;
  return `${base}?lang=${lang}`;
}

export function localeAlternates(
  path: string,
  activeLocale: MarketingLocale = "en",
): Metadata["alternates"] {
  const normalized = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const canonical =
    activeLocale === "en"
      ? normalized
      : `${normalized}${normalized === "/" ? "?" : "?"}lang=${activeLocale}`;

  return {
    canonical,
    languages: {
      en: localizedUrl(path, "en"),
      ro: localizedUrl(path, "ro"),
      it: localizedUrl(path, "it"),
      "x-default": localizedUrl(path, "x-default"),
    },
  };
}

export const MARKETING_KEYWORDS_EN = [
  "cafe POS",
  "restaurant POS",
  "food business software",
  "cloud POS",
  "kitchen display system",
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
] as const;

export const MARKETING_KEYWORDS = MARKETING_KEYWORDS_EN;

export function marketingKeywords(locale: MarketingLocale): string[] {
  if (locale === "ro") return [...MARKETING_KEYWORDS_RO, ...MARKETING_KEYWORDS_EN.slice(0, 4)];
  return [...MARKETING_KEYWORDS_EN, ...MARKETING_KEYWORDS_RO.slice(0, 3)];
}
