import type { MarketingLocale } from "@/lib/marketing/locale";

/** Markets we tailor plan copy and compliance wording for. */
export type BillingMarket = "IE" | "RO" | "UK" | "IT" | "INTL";

export const BILLING_MARKET_LABELS: Record<BillingMarket, string> = {
  IE: "Ireland",
  RO: "Romania",
  UK: "United Kingdom",
  IT: "Italy",
  INTL: "International",
};

export function marketFromMarketingLocale(locale: MarketingLocale): BillingMarket {
  if (locale === "ro") return "RO";
  if (locale === "it") return "IT";
  return "IE";
}

export function marketFromCountryCode(code: string | null | undefined): BillingMarket {
  const normalized = (code ?? "").toUpperCase();
  if (normalized === "RO") return "RO";
  if (normalized === "IE") return "IE";
  if (normalized === "UK" || normalized === "GB") return "UK";
  if (normalized === "IT") return "IT";
  return "INTL";
}

export function taxLabelForMarket(market: BillingMarket): string {
  if (market === "RO") return "TVA";
  if (market === "IT") return "IVA";
  return "VAT";
}

export function tillCloseLabelForMarket(market: BillingMarket): string {
  if (market === "IE" || market === "UK") return "End-of-day till close (Z-read)";
  return "Till close report";
}

export function purchaseReceivingLabelForMarket(market: BillingMarket): string {
  if (market === "RO") return "NIR purchase receiving (14-3-1A)";
  if (market === "IT") return "Supplier delivery & invoice records";
  return "Supplier purchase records";
}

export function pricingNotIncludedText(market: BillingMarket): string {
  if (market === "RO") {
    return "Achiziția hardware, integrări contabile, comenzi online, loialitate și servire la masă nu fac parte din pachetul de bază. FiscalNet este disponibil pe planul Multi-location.";
  }
  if (market === "IT") {
    return "Acquisto hardware, integrazioni contabili, ordini online, loyalty e servizio al tavolo non sono inclusi nel pacchetto base. Registratore telematico e adempimenti fiscali italiani non sono inclusi.";
  }
  const fiscalNote =
    market === "IE" || market === "UK"
      ? "Revenue/tax filing and certified fiscal printers are your responsibility — franchisetech records sales and till totals."
      : "Country-specific fiscal certification and tax filing are your responsibility — franchisetech records sales and till totals.";
  return `Hardware setup, accounting integrations, online ordering, loyalty, and table service are not part of the core package. ${fiscalNote}`;
}
