import type { MarketingLocale } from "@/lib/marketing/locale";

/** Markets we tailor plan copy and compliance wording for. */
export type BillingMarket = "IE" | "RO" | "UK" | "INTL";

export const BILLING_MARKET_LABELS: Record<BillingMarket, string> = {
  IE: "Ireland",
  RO: "Romania",
  UK: "United Kingdom",
  INTL: "International",
};

export function marketFromMarketingLocale(locale: MarketingLocale): BillingMarket {
  if (locale === "ro") return "RO";
  return "RO";
}

export function marketFromCountryCode(code: string | null | undefined): BillingMarket {
  const normalized = (code ?? "").toUpperCase();
  if (normalized === "RO") return "RO";
  if (normalized === "IE") return "IE";
  if (normalized === "UK" || normalized === "GB") return "UK";
  return "INTL";
}

export function taxLabelForMarket(market: BillingMarket): string {
  if (market === "RO") return "TVA";
  return "VAT";
}

export function tillCloseLabelForMarket(market: BillingMarket): string {
  if (market === "IE" || market === "UK") return "End-of-day till close (Z-read)";
  return "Till close report";
}

export function purchaseReceivingLabelForMarket(market: BillingMarket): string {
  if (market === "RO") return "NIR purchase receiving (14-3-1A)";
  return "Supplier purchase records";
}

export function pricingNotIncludedText(market: BillingMarket): string {
  if (market === "RO") {
    return "You are responsible for purchasing and registering a compatible fiscal printer. franchisetech connects to it via FiscalNet and handles fiscal receipts, Z-reports, and ANAF e-Factura automatically.";
  }
  const fiscalNote =
    market === "IE" || market === "UK"
      ? "Revenue/tax filing and certified fiscal printers are your responsibility — franchisetech records sales and till totals."
      : "Country-specific fiscal certification and tax filing are your responsibility — franchisetech records sales and till totals.";
  return `Hardware setup, accounting integrations, online ordering, loyalty, and table service are not part of the core package. ${fiscalNote}`;
}
