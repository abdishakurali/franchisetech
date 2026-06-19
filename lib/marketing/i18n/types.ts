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
>;

export type SeoRoOverrides = Partial<SeoLocaleFields>;
