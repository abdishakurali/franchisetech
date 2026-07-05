import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { jsonLd, SITE_URL } from "@/lib/marketing/seo";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooterClient } from "@/components/marketing/MarketingFooter";
import { MarketingAnnouncementBar } from "@/components/marketing/MarketingAnnouncementBar";
import { MarketingBodyClasses } from "@/components/marketing/MarketingBodyClasses";
import { MobileStickyCta } from "@/components/marketing/MobileStickyCta";
import { MarketingChatwoot } from "@/components/marketing/MarketingChatwoot";
import { BrowserFrame } from "@/components/marketing/DeviceFrames";
import { marketingSectionY } from "@/lib/marketing/tokens";
import { socialLinks } from "@/components/marketing/social";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { MarketingLocaleProvider } from "@/lib/marketing/marketing-locale-context";
import { showcaseAssets } from "@/lib/marketing/showcase";

export { Section, SectionLabel, Faq, CardGrid } from "@/components/marketing/MarketingShell.primitives";
export { CtaRow, FinalCta, CTASection } from "@/components/marketing/MarketingCta";

export async function MarketingNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <MarketingHeader user={null} />;
  }
  const displayName = user.user_metadata?.full_name || user.email || "User";
  const initials = displayName
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return <MarketingHeader user={{ displayName, initials }} />;
}

export function Hero({ eyebrow, title, description, image = true }: { eyebrow?: string; title: string; description: string; image?: boolean }) {
  return (
    <section className={`overflow-hidden bg-gradient-to-b from-slate-50/80 to-white px-4 pb-16 pt-20 sm:px-6 lg:px-8 ${marketingSectionY}`}>
      <div className={`mx-auto grid max-w-6xl items-center gap-12 ${image ? "lg:grid-cols-2" : ""}`}>
        <div>
          {eyebrow && <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>}
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-500">{description}</p>
        </div>
        {image && <HeroScreenshots />}
      </div>
    </section>
  );
}

export function HeroScreenshots() {
  return (
    <BrowserFrame
      src={showcaseAssets.posCart.src}
      alt="franchisetech POS register with product grid and checkout"
      path={showcaseAssets.posCart.path}
      priority
      className="shadow-2xl"
    />
  );
}

export async function PageShell({ children, schema }: { children: ReactNode; schema?: Record<string, unknown>[] }) {
  const locale = await getMarketingLocale();
  return (
    <MarketingLocaleProvider key={locale} initialLocale={locale}>
      <div className="min-h-screen bg-white">
        {schema?.map((item, index) => <div key={index}>{jsonLd(item)}</div>)}
        <MarketingAnnouncementBar />
        <MarketingNav />
        <MarketingBodyClasses />
        <div className="pb-24 md:pb-0">{children}</div>
        <MarketingFooterClient />
        <Suspense fallback={null}>
          <MobileStickyCta />
        </Suspense>
        <MarketingChatwoot />
      </div>
    </MarketingLocaleProvider>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return <PageShell schema={[organizationSchema]}>{children}</PageShell>;
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "franchisetech",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  sameAs: socialLinks.map(([href]) => href),
};

// Legacy export for pages that still import featureLinks
export const featureLinks = [
  ["/features/pos", "POS register"],
  ["/features/kitchen-display", "Kitchen display"],
  ["/features/stock-management", "Stock management"],
  ["/features/recipe-costing", "Recipe costing"],
  ["/features/z-report", "Z-report"],
  ["/features/purchases-suppliers", "Purchases & suppliers"],
] as const;

export const industryLinks = [
  ["/industries/cafes", "Cafes"],
  ["/industries/restaurants", "Restaurants"],
  ["/industries/multi-site", "Multi-location"],
  ["/industries/takeaways", "Takeaways"],
  ["/industries/food-trucks", "Food trucks"],
  ["/industries/health-bars", "Health bars"],
] as const;

export { socialLinks };
