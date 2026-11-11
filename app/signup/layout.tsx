import type { Metadata } from "next";
import { Suspense } from "react";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { MarketingLocaleProvider } from "@/lib/marketing/marketing-locale-context";
import { appLocaleFromMarketing } from "@/lib/platform-locale";

// Own title, description and canonical; it used to inherit the homepage's.
export const metadata: Metadata = {
  title: "Creați un cont: 15 zile de probă gratuită",
  description: "Creați contul franchisetech în câteva minute. 15 zile de probă gratuită, fără card și fără contract.",
  alternates: { canonical: "/signup" },
};

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
