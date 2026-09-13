export type DemoProductSeed = {
  name: string;
  sale_price: number;
  sort_order: number;
};

type BusinessCategory = "cafenea" | "restaurant" | "takeaway" | "patiserie" | "magazin" | "altele";

function categorizeBusinessType(businessType: string | undefined | null): BusinessCategory {
  const t = (businessType ?? "").toLowerCase();
  if (t.includes("cafe") || t.includes("café") || t.includes("cafenea")) return "cafenea";
  // Checked before "takeaway": Romanian "restaurant" and English "restaurant" never
  // collide with any other branch here, but keep this order if takeaway-style
  // matching ever loosens (e.g. to match "restaurant & takeaway" combos).
  if (t.includes("restaurant")) return "restaurant";
  if (t.includes("takeaway")) return "takeaway";
  if (t.includes("patiserie") || t.includes("brutărie") || t.includes("brutarie") || t.includes("bakery")) return "patiserie";
  if (t.includes("magazin") || t.includes("shop")) return "magazin";
  return "altele";
}

const CATALOG_RO: Record<BusinessCategory, DemoProductSeed[]> = {
  cafenea: [
    { name: "Espresso", sale_price: 12, sort_order: 1 },
    { name: "Croissant", sale_price: 15, sort_order: 2 },
    { name: "Latte", sale_price: 18, sort_order: 3 },
    { name: "Sandwich", sale_price: 32, sort_order: 4 },
  ],
  restaurant: [
    { name: "Ciorbă de legume", sale_price: 15, sort_order: 1 },
    { name: "Piept de pui la grătar", sale_price: 32, sort_order: 2 },
    { name: "Salată Caesar", sale_price: 22, sort_order: 3 },
    { name: "Limonadă", sale_price: 10, sort_order: 4 },
  ],
  takeaway: [
    { name: "Shaorma", sale_price: 22, sort_order: 1 },
    { name: "Cartofi prăjiți", sale_price: 12, sort_order: 2 },
    { name: "Burger", sale_price: 28, sort_order: 3 },
    { name: "Suc", sale_price: 8, sort_order: 4 },
  ],
  patiserie: [
    { name: "Croissant", sale_price: 15, sort_order: 1 },
    { name: "Covrigi", sale_price: 6, sort_order: 2 },
    { name: "Plăcintă", sale_price: 10, sort_order: 3 },
    { name: "Pâine", sale_price: 8, sort_order: 4 },
  ],
  magazin: [
    { name: "Apă minerală", sale_price: 5, sort_order: 1 },
    { name: "Cafea la pahar", sale_price: 10, sort_order: 2 },
    { name: "Sandwich", sale_price: 18, sort_order: 3 },
    { name: "Baton cereale", sale_price: 6, sort_order: 4 },
  ],
  altele: [
    { name: "Espresso", sale_price: 12, sort_order: 1 },
    { name: "Croissant", sale_price: 15, sort_order: 2 },
    { name: "Latte", sale_price: 18, sort_order: 3 },
    { name: "Sandwich", sale_price: 32, sort_order: 4 },
  ],
};

const CATALOG_INTL: Record<BusinessCategory, DemoProductSeed[]> = {
  cafenea: [
    { name: "Espresso", sale_price: 2.5, sort_order: 1 },
    { name: "Croissant", sale_price: 3.2, sort_order: 2 },
    { name: "Latte", sale_price: 3.8, sort_order: 3 },
    { name: "Sandwich", sale_price: 6.5, sort_order: 4 },
  ],
  restaurant: [
    { name: "Vegetable soup", sale_price: 3.5, sort_order: 1 },
    { name: "Grilled chicken breast", sale_price: 8.5, sort_order: 2 },
    { name: "Caesar salad", sale_price: 6, sort_order: 3 },
    { name: "Lemonade", sale_price: 2.5, sort_order: 4 },
  ],
  takeaway: [
    { name: "Shawarma", sale_price: 4.5, sort_order: 1 },
    { name: "Fries", sale_price: 2.5, sort_order: 2 },
    { name: "Burger", sale_price: 6, sort_order: 3 },
    { name: "Soft drink", sale_price: 1.8, sort_order: 4 },
  ],
  patiserie: [
    { name: "Croissant", sale_price: 3.2, sort_order: 1 },
    { name: "Pretzel", sale_price: 1.3, sort_order: 2 },
    { name: "Pie slice", sale_price: 2.2, sort_order: 3 },
    { name: "Bread loaf", sale_price: 1.8, sort_order: 4 },
  ],
  magazin: [
    { name: "Water", sale_price: 1.1, sort_order: 1 },
    { name: "Coffee to go", sale_price: 2.2, sort_order: 2 },
    { name: "Sandwich", sale_price: 3.8, sort_order: 3 },
    { name: "Snack bar", sale_price: 1.3, sort_order: 4 },
  ],
  altele: [
    { name: "Espresso", sale_price: 2.5, sort_order: 1 },
    { name: "Croissant", sale_price: 3.2, sort_order: 2 },
    { name: "Latte", sale_price: 3.8, sort_order: 3 },
    { name: "Sandwich", sale_price: 6.5, sort_order: 4 },
  ],
};

/**
 * Demo catalog varies by business type (café/takeaway/bakery/shop) as
 * onboarding copy claims, with a currency-appropriate price tier by
 * country. Unrecognized or missing business types fall back to the
 * original café-shaped catalog rather than failing.
 */
export function demoProductsForCountry(countryCode: string, businessType?: string | null): DemoProductSeed[] {
  const isRO = countryCode.toUpperCase() === "RO";
  const category = categorizeBusinessType(businessType);
  return (isRO ? CATALOG_RO : CATALOG_INTL)[category];
}

export const FIRST_SALE_DONE_KEY = "fp_first_sale_done";
