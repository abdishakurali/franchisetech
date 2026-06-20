import {
  isMarketingLocale,
  MARKETING_LOCALE_COOKIE,
  type MarketingLocale,
} from "@/lib/marketing/locale";
import {
  MARKETING_LOCALE_CHANGE_EVENT,
  MARKETING_LOCALE_STORAGE_KEY,
} from "@/lib/marketing/locale-client";
import {
  APP_LOCALE_CHANGE_EVENT,
  defaultPosLocale,
  POS_LOCALE_STORAGE_KEY,
  type PosLocale,
} from "@/lib/pos-i18n";

/** App UI + POS use en/ro only; Italian is marketing-site only. */
export function appLocaleFromMarketing(locale: MarketingLocale): PosLocale {
  return locale === "ro" ? "ro" : "en";
}

export function readMarketingLocaleUnified(): MarketingLocale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(MARKETING_LOCALE_STORAGE_KEY);
    if (isMarketingLocale(stored)) return stored;
    const match = document.cookie.match(
      new RegExp(`${MARKETING_LOCALE_COOKIE}=(en|ro|it)`),
    );
    if (match && isMarketingLocale(match[1])) return match[1];
  } catch {
    /* ignore */
  }
  return "en";
}

/** Preferred app/POS locale — marketing cookie wins, then POS storage, then org default. */
export function readAppLocaleUnified(orgIsRO = false): PosLocale {
  const marketing = readMarketingLocaleUnified();
  if (marketing === "ro") return "ro";
  if (marketing === "en") return "en";
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(POS_LOCALE_STORAGE_KEY);
      if (raw === "en" || raw === "ro") return raw;
    } catch {
      /* ignore */
    }
  }
  return defaultPosLocale(orgIsRO);
}

/** Write marketing locale and sync app/POS preference (ro → ro, en/it → en). */
export function writePlatformLocale(locale: MarketingLocale): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MARKETING_LOCALE_STORAGE_KEY, locale);
    document.cookie = `${MARKETING_LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
    const appLocale = appLocaleFromMarketing(locale);
    localStorage.setItem(POS_LOCALE_STORAGE_KEY, appLocale);
    window.dispatchEvent(new Event(MARKETING_LOCALE_CHANGE_EVENT));
    window.dispatchEvent(new Event(APP_LOCALE_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

/** App switcher: en/ro only — also updates marketing locale (drops IT → en). */
export function writeAppLocale(locale: PosLocale): void {
  const marketing: MarketingLocale = locale === "ro" ? "ro" : "en";
  writePlatformLocale(marketing);
}
