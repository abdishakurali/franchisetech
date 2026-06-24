import { getAppText, type AppLocale, type AppT } from "@/lib/app-i18n";
import { resolveAppLocale, type AppLocaleSource } from "@/lib/app-locale";

export function getAppLocale(source: AppLocaleSource = {}): AppLocale {
  return resolveAppLocale(source);
}

export function getAppLocaleAndText(
  orgCountryCode?: string | null,
  profileLocale?: string | null,
): { locale: AppLocale; t: AppT } {
  const locale = resolveAppLocale({ orgCountryCode, profileLocale });
  return { locale, t: getAppText(locale) };
}

export function getAppLocaleAndTextFromContext(ctx: {
  countryCode?: string | null;
  profileLocale?: string | null;
}): { locale: AppLocale; t: AppT } {
  return getAppLocaleAndText(ctx.countryCode, ctx.profileLocale);
}
