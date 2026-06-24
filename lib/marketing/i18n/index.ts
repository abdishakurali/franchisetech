import type { MarketingLocale } from "@/lib/marketing/locale";
import type { SeoPage } from "@/lib/marketing/seo";
import { en, type MarketingMessages } from "./en";
import { ro } from "./ro";
import { seoRoOverrides } from "./seo-ro";

export function getMarketingMessages(locale: MarketingLocale): MarketingMessages {
  return (locale === "ro" ? ro : en) as MarketingMessages;
}

export function localizeSeoPage(page: SeoPage, locale: MarketingLocale): SeoPage {
  const overrides =
    locale === "ro" ? seoRoOverrides : null;
  if (!overrides) return page;
  const override = overrides[page.slug];
  if (!override) return page;
  return {
    ...page,
    ...override,
    bullets: override.bullets ?? page.bullets,
    sections: override.sections ?? page.sections,
    faqs: override.faqs ?? page.faqs,
    related: override.related ?? page.related,
  };
}

export { en, ro };
