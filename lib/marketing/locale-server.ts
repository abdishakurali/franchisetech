import { cookies } from "next/headers";
import {
  isMarketingLocale,
  MARKETING_LOCALE_COOKIE,
  type MarketingLocale,
} from "@/lib/marketing/locale";

export async function getMarketingLocale(): Promise<MarketingLocale> {
  const locale = (await cookies()).get(MARKETING_LOCALE_COOKIE)?.value;
  return isMarketingLocale(locale) ? locale : "ro";
}
