import type { LucideIcon } from "lucide-react";
import {
  Beer,
  Box,
  Coffee,
  CookingPot,
  Croissant,
  Milk,
  Monitor,
  Package,
  Snowflake,
  Sparkles,
  Wine,
} from "lucide-react";

/**
 * Fixed 11-category taxonomy for the public HoReCa vendor directory.
 * Mirrors the `vendor_category` Postgres enum in
 * supabase/migrations/20260704120000_horeca_vendor_directory.sql —
 * keep both in sync if a category is ever added or renamed.
 */
export const VENDOR_CATEGORY_SLUGS = [
  "coffee_equipment",
  "dairy",
  "meat_frozen",
  "fresh_produce",
  "alcoholic_beverages",
  "non_alcoholic_beverages",
  "packaging_disposables",
  "bakery_pastry_ingredients",
  "kitchen_bar_equipment",
  "cleaning_hygiene",
  "pos_fiscal_hardware",
] as const;

export type VendorCategorySlug = (typeof VENDOR_CATEGORY_SLUGS)[number];

export type VendorCategoryInfo = {
  slug: VendorCategorySlug;
  path: string;
  icon: LucideIcon;
  labelRo: string;
  labelEn: string;
  descriptionRo: string;
  descriptionEn: string;
};

export const VENDOR_CATEGORIES: VendorCategoryInfo[] = [
  {
    slug: "coffee_equipment",
    path: "/resources/suppliers/coffee_equipment",
    icon: Coffee,
    labelRo: "Cafea și echipamente",
    labelEn: "Coffee & equipment",
    descriptionRo: "Furnizori de cafea boabe/măcinată și echipamente de espresso pentru cafenele și restaurante.",
    descriptionEn: "Coffee bean/ground suppliers and espresso equipment for cafés and restaurants.",
  },
  {
    slug: "dairy",
    path: "/resources/suppliers/dairy",
    icon: Milk,
    labelRo: "Lactate",
    labelEn: "Dairy",
    descriptionRo: "Distribuitori de lapte, brânzeturi și alte produse lactate pentru HoReCa.",
    descriptionEn: "Milk, cheese, and other dairy product distributors for HoReCa.",
  },
  {
    slug: "meat_frozen",
    path: "/resources/suppliers/meat_frozen",
    icon: Snowflake,
    labelRo: "Carne și congelate",
    labelEn: "Meat & frozen",
    descriptionRo: "Distribuitori de carne, mezeluri și produse congelate pentru bucătării profesionale.",
    descriptionEn: "Meat, cold cuts, and frozen product distributors for professional kitchens.",
  },
  {
    slug: "fresh_produce",
    path: "/resources/suppliers/fresh_produce",
    icon: Box,
    labelRo: "Legume și fructe proaspete",
    labelEn: "Fresh produce",
    descriptionRo: "Furnizori de legume și fructe proaspete pentru restaurante și cafenele.",
    descriptionEn: "Fresh fruit and vegetable suppliers for restaurants and cafés.",
  },
  {
    slug: "alcoholic_beverages",
    path: "/resources/suppliers/alcoholic_beverages",
    icon: Wine,
    labelRo: "Băuturi alcoolice",
    labelEn: "Alcoholic beverages",
    descriptionRo: "Distribuitori de bere, vin și băuturi spirtoase pentru HoReCa.",
    descriptionEn: "Beer, wine, and spirits distributors for HoReCa.",
  },
  {
    slug: "non_alcoholic_beverages",
    path: "/resources/suppliers/non_alcoholic_beverages",
    icon: Beer,
    labelRo: "Băuturi nealcoolice",
    labelEn: "Non-alcoholic beverages",
    descriptionRo: "Distribuitori de sucuri, ape minerale și alte băuturi nealcoolice.",
    descriptionEn: "Juice, mineral water, and other non-alcoholic beverage distributors.",
  },
  {
    slug: "packaging_disposables",
    path: "/resources/suppliers/packaging_disposables",
    icon: Package,
    labelRo: "Ambalaje și consumabile",
    labelEn: "Packaging & disposables",
    descriptionRo: "Furnizori de ambalaje take-away, pahare, șervețele și alte consumabile.",
    descriptionEn: "Takeaway packaging, cups, napkins, and other disposable suppliers.",
  },
  {
    slug: "bakery_pastry_ingredients",
    path: "/resources/suppliers/bakery_pastry_ingredients",
    icon: Croissant,
    labelRo: "Ingrediente patiserie și panificație",
    labelEn: "Bakery & pastry ingredients",
    descriptionRo: "Furnizori de făină, unt, ciocolată și alte ingrediente pentru patiserii și brutării.",
    descriptionEn: "Flour, butter, chocolate, and other ingredient suppliers for patisseries and bakeries.",
  },
  {
    slug: "kitchen_bar_equipment",
    path: "/resources/suppliers/kitchen_bar_equipment",
    icon: CookingPot,
    labelRo: "Echipamente bucătărie și bar",
    labelEn: "Kitchen & bar equipment",
    descriptionRo: "Furnizori de echipamente profesionale pentru bucătărie și bar.",
    descriptionEn: "Professional kitchen and bar equipment suppliers.",
  },
  {
    slug: "cleaning_hygiene",
    path: "/resources/suppliers/cleaning_hygiene",
    icon: Sparkles,
    labelRo: "Curățenie și igienă",
    labelEn: "Cleaning & hygiene",
    descriptionRo: "Furnizori de produse de curățenie și igienă pentru spații HoReCa.",
    descriptionEn: "Cleaning and hygiene product suppliers for HoReCa spaces.",
  },
  {
    slug: "pos_fiscal_hardware",
    path: "/resources/suppliers/pos_fiscal_hardware",
    icon: Monitor,
    labelRo: "Hardware POS și fiscal",
    labelEn: "POS & fiscal hardware",
    descriptionRo: "Furnizori de case de marcat, imprimante fiscale și hardware POS.",
    descriptionEn: "Fiscal printer, cash register, and POS hardware suppliers.",
  },
];

export function isVendorCategorySlug(slug: string): slug is VendorCategorySlug {
  return (VENDOR_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function findVendorCategory(slug: string): VendorCategoryInfo | undefined {
  return VENDOR_CATEGORIES.find((c) => c.slug === slug);
}
