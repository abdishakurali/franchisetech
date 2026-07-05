import type { SeoPage } from "@/lib/marketing/seo";

export type SeoLocaleFields = Pick<
  SeoPage,
  | "title"
  | "metaTitle"
  | "description"
  | "eyebrow"
  | "h1"
  | "intro"
  | "bullets"
  | "sections"
  | "faqs"
  | "related"
  | "heroBefore"
  | "heroHighlight"
  | "heroAfter"
  | "heroSubheadline"
  | "painPoints"
  | "featureRows"
  | "competitorSlug"
  | "competitorRows"
  | "testimonial"
  | "showcase"
  | "ctaTitle"
  | "ctaSubtitle"
>;

export type SeoRoOverrides = Partial<SeoLocaleFields>;
