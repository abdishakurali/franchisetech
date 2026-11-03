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

// Feature rows are translated as text only; the illustration (image or
// component) stays with the base page and is merged back by position.
export type SeoFeatureRowText = { title: string; body: string };

export type SeoRoOverrides = Partial<Omit<SeoLocaleFields, "featureRows">> & {
  featureRows?: SeoFeatureRowText[];
};
