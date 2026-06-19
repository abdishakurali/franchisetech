import { cookies } from "next/headers";
import { isMarketingLocale, type MarketingLocale } from "@/lib/marketing/locale";

export async function getMarketingLocale(): Promise<MarketingLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("franchisetech_locale")?.value;
  return isMarketingLocale(value) ? value : "en";
}
