import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { Coffee, Croissant, ShoppingBag, Utensils } from "lucide-react";
import { INDUSTRY_VANITY_REDIRECTS } from "@/lib/marketing/industry-vanity-redirects";
import { OwnerPosProof, OwnerRecipeProof } from "@/components/marketing/OwnerProofScreens";

export { INDUSTRY_VANITY_REDIRECTS };

/**
 * Canonical English slugs for the primary HoReCa verticals (Romania SEO).
 * Scoped to the actual ICP (AGENTS.md: cafés, restaurants, takeaway,
 * patisseries, 1-3 locations) — bar-pub, food-trucks, and multi-site were
 * cut 2026-09-05: zero traffic and outside the stated ICP.
 */
export const PRIMARY_INDUSTRY_SLUGS = [
  "cafes",
  "restaurants",
  "takeaways",
  "patisserie-bakery",
] as const;

export type PrimaryIndustrySlug = (typeof PRIMARY_INDUSTRY_SLUGS)[number];

export type IndustryNavItem = {
  slug: PrimaryIndustrySlug;
  path: string;
  icon: LucideIcon;
  labelRo: string;
  labelEn: string;
};

export const PRIMARY_INDUSTRY_NAV: IndustryNavItem[] = [
  {
    slug: "cafes",
    path: "/industries/cafes",
    icon: Coffee,
    labelRo: "Cafenele",
    labelEn: "Cafés",
  },
  {
    slug: "restaurants",
    path: "/industries/restaurants",
    icon: Utensils,
    labelRo: "Restaurante",
    labelEn: "Restaurants",
  },
  {
    slug: "takeaways",
    path: "/industries/takeaways",
    icon: ShoppingBag,
    labelRo: "Takeaway & fast food",
    labelEn: "Takeaway & fast food",
  },
  {
    slug: "patisserie-bakery",
    path: "/industries/patisserie-bakery",
    icon: Croissant,
    labelRo: "Patiserii & brutării",
    labelEn: "Patisseries & bakeries",
  },
];

export function isPrimaryIndustrySlug(slug: string): slug is PrimaryIndustrySlug {
  return (PRIMARY_INDUSTRY_SLUGS as readonly string[]).includes(slug);
}

/**
 * Default hero showcase per vertical — override per page in seo.ts if needed.
 * `posCart`/`ownerDashboard`/`recipeCosting` in showcase.ts are stale QA-test
 * screenshots (English UI, EUR pricing, wrong VAT rates) — verticals that used
 * them render a drawn `component` instead.
 */
export const INDUSTRY_SHOWCASE_DEFAULTS: Record<
  PrimaryIndustrySlug,
  { src: string; path: string; alt: string } | { component: ComponentType; alt: string }
> = {
  cafes: {
    component: OwnerPosProof,
    alt: "franchisetech POS pentru cafenele",
  },
  restaurants: {
    component: OwnerPosProof,
    alt: "franchisetech POS rapid pentru localuri mici",
  },
  takeaways: {
    component: OwnerPosProof,
    alt: "franchisetech POS takeaway",
  },
  "patisserie-bakery": {
    component: OwnerRecipeProof,
    alt: "franchisetech cost rețete patiserie",
  },
};

/** Default competitor compare slug per vertical. */
export const INDUSTRY_COMPETITOR_SLUGS: Record<PrimaryIndustrySlug, string> = {
  cafes: "ebriza",
  restaurants: "expressoft",
  takeaways: "posnet",
  "patisserie-bakery": "smartbill",
};
