import type { Metadata } from "next";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { MarketingLocaleProvider } from "@/lib/marketing/marketing-locale-context";
import { appLocaleFromMarketing } from "@/lib/platform-locale";

// Own title and canonical (it used to inherit the homepage's), and kept out of
// the index: a sign-in form answers no search query.
export const metadata: Metadata = {
  title: "Autentificare",
  description: "Intrați în contul franchisetech.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const marketingLocale = await getMarketingLocale();
  const appLocale = appLocaleFromMarketing(marketingLocale);

  return (
    <MarketingLocaleProvider initialLocale={marketingLocale}>
      <AppI18nProvider initialLocale={appLocale}>{children}</AppI18nProvider>
    </MarketingLocaleProvider>
  );
}
