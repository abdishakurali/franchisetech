import { cookies } from "next/headers";
import { getAppText, type AppLocale, type AppT } from "@/lib/app-i18n";
import { appLocaleFromMarketing } from "@/lib/platform-locale";
import { isMarketingLocale } from "@/lib/marketing/locale";
import { defaultPosLocale } from "@/lib/pos-i18n";

export async function getAppLocale(orgCountryCode?: string | null): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("franchisetech_locale")?.value;
  if (isMarketingLocale(value)) {
    return appLocaleFromMarketing(value);
  }
  return defaultPosLocale(orgCountryCode === "RO");
}

export async function getAppLocaleAndText(orgCountryCode?: string | null): Promise<{
  locale: AppLocale;
  t: AppT;
}> {
  const locale = await getAppLocale(orgCountryCode);
  return { locale, t: getAppText(locale) };
}
