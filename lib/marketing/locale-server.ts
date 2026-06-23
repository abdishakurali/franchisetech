import { cookies, headers } from "next/headers";
import { isMarketingLocale, isRomanianMarketingHost, type MarketingLocale } from "@/lib/marketing/locale";

export async function getMarketingLocale(): Promise<MarketingLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("franchisetech_locale")?.value;
  if (isMarketingLocale(value)) return value;

  const host = (await headers()).get("host") ?? "";
  if (isRomanianMarketingHost(host)) return "ro";

  return "en";
}
