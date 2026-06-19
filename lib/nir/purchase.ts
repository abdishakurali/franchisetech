/** Official Romanian finance-accounting document title (Cod 14-3-1A). */
export const NIR_RO_TITLE = "NOTĂ DE RECEPȚIE ȘI CONSTATARE DE DIFERENȚE";
export const NIR_RO_CODE = "14-3-1A";

export function formatDateDisplay(value: string | null | undefined, isRO: boolean): string {
  if (!value) return "—";
  const s = String(value).slice(0, 10);
  if (!isRO) return s;
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return s;
  return `${d}.${m}.${y}`;
}

export type PurchaseLineInput = {
  product_id: string;
  quantity: number;
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
      return {
        product_id: pid || "",
        quantity: qty,
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
  status: PurchaseStatus,
  nirNumber: string | null | undefined,
  isRO: boolean
): { label: string; className: string } {
  if (status === "cancelled") {
    return {
      label: isRO ? "Anulat" : "Cancelled",
      className: "text-red-600 bg-red-50 border-red-200",
    };
  }
  if (status === "draft") {
    return {
      label: isRO ? "Ciornă" : "Draft",
      className: "text-amber-700 bg-amber-50 border-amber-200",
    };
  }
  if (status === "posted" && nirNumber) {
    return {
      label: isRO ? "NIR emis" : "NIR posted",
      className: "text-green-700 bg-green-50 border-green-200",
    };
  }
  if (status === "posted" || status === "received") {
    return {
      label: isRO ? "Cumpărare veche / fără NIR" : "Legacy purchase / no NIR",
      className: "text-slate-600 bg-slate-100 border-slate-200",
    };
  }
  return {
    label: isRO ? "Înregistrat" : "Recorded",
    className: "text-green-700 bg-green-50 border-green-200",
  };
}
