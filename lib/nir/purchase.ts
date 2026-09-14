import type { AppLocale, AppT } from "@/lib/app-i18n";

/** Official Romanian finance-accounting document title (Cod 14-3-1A). */
export const NIR_RO_TITLE = "NOTĂ DE RECEPȚIE ȘI CONSTATARE DE DIFERENȚE";
export const NIR_RO_CODE = "14-3-1A";

// The document header splits the same legal name into a title/subtitle pair
// rather than one line — same document, different typographic treatment.
export const NIR_DOC_TITLE = "NOTĂ DE INTRARE-RECEPȚIE";
export const NIR_DOC_SUBTITLE = "și constatare de diferențe";

export const NIR_LABELS = {
  furnizor: "Furnizor",
  cuiFurnizor: "CUI furnizor",
  factura: "Factură",
  aviz: "Aviz însoțire",
  comisie: "Comisie de recepție",
  regimTva: "Regim TVA cumpărător",
  neplatitor: "Neplătitor — TVA în cost",
  platitor: "Plătitor de TVA",
  gestiune: "Gestiune",
  nr: "Nr.",
  rowNo: "#",
  denumire: "Denumire",
  um: "u.m.",
  cantFacturata: "Cant. facturată",
  cantReceptionata: "Cant. recepționată",
  pretUnitar: "Preț unitar",
  valoare: "Valoare",
  total: "TOTAL",
  diferentaTag: "DIFERENȚĂ",
  predat: "Predat",
  delegatFurnizor: "delegat furnizor",
  primit: "Primit",
  gestionar: "gestionar",
  comisiaReceptie: "Comisia de recepție",
  semnatura: "Semnătură",
} as const;

/**
 * The NIR document's costing rule, as one place instead of three inline
 * copies: a VAT-registered buyer reclaims VAT, so their acquisition cost —
 * and what the document values a line at — is net. An unregistered buyer
 * cannot reclaim it, so VAT is just part of what they paid: gross IS the
 * acquisition cost. Getting this backwards is a real, live-tested mistake,
 * not a hypothetical — caught once already while writing the page that
 * uses this.
 */
export function nirLineValue(input: {
  buyerVatRegistered: boolean;
  netAmount: number;
  taxAmount: number;
}): number {
  return input.buyerVatRegistered ? input.netAmount : input.netAmount + input.taxAmount;
}

export function nirUnitCostForDisplay(input: {
  buyerVatRegistered: boolean;
  netUnitCost: number;
  taxRatePct: number;
}): number {
  if (input.buyerVatRegistered) return input.netUnitCost;
  return input.taxRatePct > 0 ? input.netUnitCost * (1 + input.taxRatePct / 100) : input.netUnitCost;
}

/** Formats a number the way the NIR document requires everywhere: comma
 * decimal separator, fixed places, no currency symbol (the document's own
 * metadata/labels carry that context). */
export function formatNirNumber3dp(v: number): string {
  return v.toLocaleString("ro-RO", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
export function formatNirMoney(v: number): string {
  return v.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateDisplay(value: string | null | undefined, locale: AppLocale): string {
  if (!value) return "—";
  const s = String(value).slice(0, 10);
  if (locale !== "ro") return s;
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}.${m}.${y}`;
}

export type PurchaseLineInput = {
  product_id: string;
  quantity: number;
  /** Actually received, when recorded separately from the invoiced quantity. Null = not separately recorded. */
  received_quantity: number | null;
  unit_cost: number;
  total_cost: number;
  tax_rate: number;
  tax_amount: number;
  unit_of_measure: string;
};

export type PurchaseStatus = "draft" | "posted" | "received" | "partial" | "cancelled" | string | null;

export function parsePurchaseLinesFromForm(formData: FormData): PurchaseLineInput[] {
  const productIds = formData.getAll("product_id").map((v) => String(v));
  const quantities = formData.getAll("quantity").map((v) => Number(v));
  // Blank means "not separately recorded" — must stay null, not fall back to
  // 0 or to the invoiced quantity, or every future row would silently lose
  // the distinction this field exists to make (see the migration comment).
  const receivedQuantities = formData.getAll("received_quantity").map((v) => {
    const s = String(v).trim();
    return s === "" ? null : Number(s);
  });
  const unitCosts = formData.getAll("unit_cost").map((v) => Number(v));
  const taxRates = formData.getAll("tax_rate").map((v) => Number(v) || 0);
  const unitMeasures = formData.getAll("unit_of_measure").map((v) => String(v) || "each");

  return productIds
    .map((pid, i) => {
      const qty = quantities[i] || 0;
      const cost = unitCosts[i] || 0;
      const rate = taxRates[i] || 0;
      const subtotal = qty * cost;
      const taxAmount = (subtotal * rate) / 100;
      const receivedRaw = receivedQuantities[i] ?? null;
      return {
        product_id: pid || "",
        quantity: qty,
        received_quantity: receivedRaw != null && !Number.isNaN(receivedRaw) ? receivedRaw : null,
        unit_cost: cost,
        total_cost: subtotal,
        tax_rate: rate,
        tax_amount: taxAmount,
        unit_of_measure: unitMeasures[i] || "each",
      };
    })
    .filter((item) => item.product_id && item.quantity > 0);
}

export function purchaseLineTotals(items: PurchaseLineInput[]) {
  const subtotalAmount = items.reduce((s, i) => s + i.total_cost, 0);
  const taxTotal = items.reduce((s, i) => s + i.tax_amount, 0);
  return {
    subtotalAmount,
    taxTotal,
    totalAmount: subtotalAmount + taxTotal,
  };
}

export function formatNirNumber(year: number, seq: number): string {
  return `NIR-${year}-${String(seq).padStart(6, "0")}`;
}

export function canCancelPurchase(status: PurchaseStatus): boolean {
  return status === "draft";
}

export function isPurchaseLocked(status: PurchaseStatus, postedAt?: string | null): boolean {
  if (status === "cancelled") return true;
  if (status === "posted" || status === "received") return true;
  if (postedAt) return true;
  return false;
}

export function isAlreadyPosted(status: PurchaseStatus, postedAt?: string | null, nirNumber?: string | null): boolean {
  if (postedAt) return true;
  if (status === "posted") return true;
  if (status === "received") return true;
  if (nirNumber) return true;
  return false;
}

export function countsTowardPurchaseSpend(status: PurchaseStatus): boolean {
  return status === "posted" || status === "received";
}

/** Postgres RPC post_nir_purchase error codes surfaced to the UI */
export function nirPostErrorRedirect(
  purchaseId: string | null,
  code: string | undefined
): string {
  const base = purchaseId ? `/app/purchases/${purchaseId}` : "/app/purchases/new";
  switch (code) {
    case "ALREADY_POSTED":
      return `${base}?error=already_posted`;
    case "PURCHASE_CANCELLED":
      return `${base}?error=cancelled`;
    case "INVALID_STATUS":
    case "PURCHASE_NOT_FOUND":
      return `${base}?error=invalid_status`;
    case "NO_ITEMS":
      return `${base}?error=no_items`;
    default:
      return `${base}?error=post_failed`;
  }
}

export function mapNirPostRpcError(message: string | undefined): string | undefined {
  if (!message) return undefined;
  for (const code of [
    "ALREADY_POSTED",
    "PURCHASE_CANCELLED",
    "INVALID_STATUS",
    "PURCHASE_NOT_FOUND",
    "NO_ITEMS",
  ]) {
    if (message.includes(code)) return code;
  }
  return undefined;
}

export function purchaseStatusBadge(
  t: AppT,
  status: PurchaseStatus,
  nirNumber: string | null | undefined,
): { label: string; className: string } {
  const s = t.purchases.status;
  if (status === "cancelled") {
    return {
      label: s.cancelled,
      className: "text-red-600 bg-red-50 border-red-200",
    };
  }
  if (status === "draft") {
    return {
      label: s.draft,
      className: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }
  if (status === "posted" && nirNumber) {
    return {
      label: s.nirPosted,
      className: "text-green-700 bg-green-50 border-green-200",
    };
  }
  if (status === "posted" || status === "received") {
    return {
      label: s.legacy,
      className: "text-slate-600 bg-slate-100 border-slate-200",
    };
  }
  return {
    label: s.recorded,
    className: "text-green-700 bg-green-50 border-green-200",
  };
}
