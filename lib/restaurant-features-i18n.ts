import type { AppLocale } from "@/lib/app-i18n";
import { INDUSTRY_OPTIONS } from "@/lib/restaurant-features";

const INDUSTRY_RO: Record<string, string> = {
  cafe: "Cafenea",
  restaurant: "Restaurant",
  takeaway_qsr: "Takeaway / QSR",
  bakery: "Patiserie",
  food_truck: "Food truck",
  bar_pub: "Bar / pub",
  catering_events: "Catering / evenimente",
  convenience_store: "Magazin mixt",
  retail: "Retail",
  franchise_multi_location: "Franciză / multi-locație",
  other: "Altele",
};

export function industryLabel(value: string | null | undefined, locale: AppLocale): string {
  const key = value ?? "other";
  if (locale === "ro" && INDUSTRY_RO[key]) return INDUSTRY_RO[key];
  return INDUSTRY_OPTIONS.find((o) => o.value === key)?.label ?? key;
}

export function industryOptions(locale: AppLocale) {
  return INDUSTRY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: locale === "ro" ? (INDUSTRY_RO[opt.value] ?? opt.label) : opt.label,
  }));
}
