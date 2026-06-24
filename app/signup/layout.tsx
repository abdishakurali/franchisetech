import { Suspense } from "react";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { MarketingLocaleProvider } from "@/lib/marketing/marketing-locale-context";
import { appLocaleFromMarketing } from "@/lib/platform-locale";

export default async function SignupLayout({ children }: { children: React.ReactNode }) {
  const marketingLocale = await getMarketingLocale();
  const appLocale = appLocaleFromMarketing(marketingLocale);

  return (
    <MarketingLocaleProvider initialLocale={marketingLocale}>
      <AppI18nProvider initialLocale={appLocale}>
        <Suspense fallback={null}>{children}</Suspense>
      </AppI18nProvider>
    </MarketingLocaleProvider>
  );
}
