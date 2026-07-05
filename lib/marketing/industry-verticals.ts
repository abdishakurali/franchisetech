import type { LucideIcon } from "lucide-react";
import {
  Beer,
  Building2,
  Coffee,
  Croissant,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react";
import { showcaseAssets } from "@/lib/marketing/showcase";
import { INDUSTRY_VANITY_REDIRECTS } from "@/lib/marketing/industry-vanity-redirects";

export { INDUSTRY_VANITY_REDIRECTS };

/** Canonical English slugs for the 7 primary HoReCa verticals (Romania SEO). */
export const PRIMARY_INDUSTRY_SLUGS = [
  "cafes",
  "restaurants",
  "takeaways",
  "bar-pub",
  "patisserie-bakery",
  "food-trucks",
  "multi-site",
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
    slug: "bar-pub",
    path: "/industries/bar-pub",
    icon: Beer,
    labelRo: "Baruri & puburi",
    labelEn: "Bars & pubs",
  },
  {
    slug: "patisserie-bakery",
    path: "/industries/patisserie-bakery",
    icon: Croissant,
    labelRo: "Patiserii & brutării",
    labelEn: "Patisseries & bakeries",
  },
  {
    slug: "food-trucks",
    path: "/industries/food-trucks",
    icon: Truck,
    labelRo: "Food truck",
    labelEn: "Food trucks",
  },
  {
    slug: "multi-site",
    path: "/industries/multi-site",
    icon: Building2,
    labelRo: "Multi-locație",
    labelEn: "Multi-location",
  },
];

export function isPrimaryIndustrySlug(slug: string): slug is PrimaryIndustrySlug {
  return (PRIMARY_INDUSTRY_SLUGS as readonly string[]).includes(slug);
}

/** Default hero showcase per vertical — override per page in seo.ts if needed. */
export const INDUSTRY_SHOWCASE_DEFAULTS: Record<
  PrimaryIndustrySlug,
  { src: string; path: string; alt: string }
> = {
  cafes: {
    src: showcaseAssets.posCart.src,
    path: showcaseAssets.posCart.path,
    alt: "franchisetech POS pentru cafenele",
  },
  restaurants: {
    src: showcaseAssets.tableFloor.src,
    path: showcaseAssets.tableFloor.path,
    alt: "franchisetech plan sală pentru restaurante",
  },
  takeaways: {
    src: showcaseAssets.posCart.src,
    path: showcaseAssets.posCart.path,
    alt: "franchisetech POS takeaway",
  },
  "bar-pub": {
    src: showcaseAssets.posCart.src,
    path: showcaseAssets.posCart.path,
    alt: "franchisetech POS pentru baruri",
  },
  "patisserie-bakery": {
    src: showcaseAssets.recipeCosting.src,
    path: showcaseAssets.recipeCosting.path,
    alt: "franchisetech cost rețete patiserie",
  },
  "food-trucks": {
    src: showcaseAssets.posCart.src,
    path: showcaseAssets.posCart.path,
    alt: "franchisetech POS food truck",
  },
  "multi-site": {
    src: showcaseAssets.ownerDashboard.src,
    path: showcaseAssets.ownerDashboard.path,
    alt: "franchisetech panou multi-locație",
  },
};

/** Default competitor compare slug per vertical. */
export const INDUSTRY_COMPETITOR_SLUGS: Record<PrimaryIndustrySlug, string> = {
  cafes: "ebriza",
  restaurants: "expressoft",
  takeaways: "posnet",
  "bar-pub": "ebriza",
  "patisserie-bakery": "smartbill",
  "food-trucks": "square",
  "multi-site": "nexuserp",
};
