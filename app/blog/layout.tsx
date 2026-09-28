import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { MarketingLocaleProvider } from "@/lib/marketing/marketing-locale-context";

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const marketingLocale = await getMarketingLocale();
  return <MarketingLocaleProvider initialLocale={marketingLocale}>{children}</MarketingLocaleProvider>;
}
