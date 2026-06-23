import { isMarketingLocale, MARKETING_LOCALE_COOKIE, type MarketingLocale } from "@/lib/marketing/locale";
import { writePlatformLocale } from "@/lib/platform-locale";

export const MARKETING_LOCALE_STORAGE_KEY = "franchisetech:marketingLocale";
export const MARKETING_LOCALE_CHANGE_EVENT = "franchisetech:marketingLocaleChange";

export const marketingLocaleOptions = [
  { code: "en" as const, flag: "🇬🇧", label: "English" },
  { code: "ro" as const, flag: "🇷🇴", label: "Română" },
];

export function readMarketingLocaleClient(): MarketingLocale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(MARKETING_LOCALE_STORAGE_KEY);
    if (isMarketingLocale(raw)) return raw;
    const match = document.cookie.match(new RegExp(`${MARKETING_LOCALE_COOKIE}=(en|ro)`));
    if (match && isMarketingLocale(match[1])) return match[1];
  } catch {
    /* ignore */
  }
  return "en";
}

export function writeMarketingLocaleClient(locale: MarketingLocale): void {
  writePlatformLocale(locale);
}
