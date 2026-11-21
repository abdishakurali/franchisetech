/**
 * "Send the fiscal receipt again" — rules shared by the server action, the
 * till panel and the tests.
 *
 * FiscalNet has no idempotency key: a second POST /api/Receipt prints a second
 * receipt (driverfiscal.ro API docs, 2026-10: X-FiscalNet-External-Id is
 * "correlation, not idempotency"; "do not resend automatically, check the job,
 * the journal and the device first"). So a resend is only offered for a sale
 * whose receipt is NOT confirmed, only after a person confirms they checked the
 * printer, and the database allows one resend in flight per sale
 * (begin_fiscal_receipt_resend: row lock, `printing` state, `pending` attempt
 * row written before the browser calls the printer).
 */

/** api_pending this long after the sale means the browser never got an answer. */
export const RESEND_STUCK_PENDING_MS = 5 * 60_000;

/** The scheduled sweep moves api_pending older than this to `unconfirmed`. */
export const UNCONFIRMED_AFTER_MINUTES = 30;

/** Statuses that can be sent again straight away. */
export const RESEND_READY_STATUSES = ["failed", "timeout", "unconfirmed"] as const;

export type ResendCandidate = {
  status?: string | null;
  fiscal_receipt_status?: string | null;
  sold_at?: string | null;
  session_id?: string | null;
};

/** Is this sale's receipt unconfirmed in a way that allows "send again"? */
export function isResendEligible(tx: ResendCandidate, now: Date = new Date()): boolean {
  if ((tx.status ?? "completed") !== "completed") return false;
  const s = tx.fiscal_receipt_status ?? "";
  if ((RESEND_READY_STATUSES as readonly string[]).includes(s)) return true;
  if (s !== "api_pending" || !tx.sold_at) return false;
  const soldAt = new Date(tx.sold_at).getTime();
  return Number.isFinite(soldAt) && now.getTime() - soldAt > RESEND_STUCK_PENDING_MS;
}

/** PostgREST `or` filter for sales that may be sent again (same rule as isResendEligible). */
export function resendEligibleFilter(now: Date = new Date()): string {
  const stuckBefore = new Date(now.getTime() - RESEND_STUCK_PENDING_MS).toISOString();
  return `fiscal_receipt_status.in.(${RESEND_READY_STATUSES.join(",")}),and(fiscal_receipt_status.eq.api_pending,sold_at.lt.${stuckBefore})`;
}

/**
 * Who may send a receipt again (same model as the till: owner/manager manage,
 * staff/cashier transact on the open till). Returns the session the sale must
 * belong to, or null when any sale of the organisation is allowed.
 */
export function resendPermission(
  role: string | null | undefined,
  openSessionId: string | null | undefined,
): { allowed: false } | { allowed: true; requiredSessionId: string | null } {
  if (role === "owner" || role === "manager") return { allowed: true, requiredSessionId: null };
  if ((role === "staff" || role === "cashier") && openSessionId) {
    return { allowed: true, requiredSessionId: openSessionId };
  }
  return { allowed: false };
}

/** Value the confirmation form must send; anything else is refused server-side. */
export const PRINTER_CHECKED_VALUE = "nu-a-iesit";

export const RESEND_TEXT = {
  button: "Trimite bonul din nou",
  title: "Trimiteți bonul fiscal din nou?",
  check: "Am verificat casa de marcat: bonul pentru această vânzare NU a fost tipărit.",
  warn: "Dacă bonul a ieșit deja, nu-l trimiteți din nou: ar rezulta două bonuri fiscale pentru aceeași vânzare.",
  confirm: "Trimite acum",
  cancel: "Renunță",
  sending: "Se trimite la casa de marcat...",
  done: (n: string | null) => `Bon fiscal emis${n ? `. Nr: ${n}` : ""}.`,
  panelTitle: (count: number) =>
    count === 1 ? "1 vânzare fără bon fiscal confirmat" : `${count} vânzări fără bon fiscal confirmat`,
  panelHint: "Verificați pe casa de marcat dacă bonul a ieșit. Trimiteți din nou doar dacă nu a ieșit.",
} as const;

/** Romanian message for an error thrown by begin/finish_fiscal_receipt_resend. */
export function resendErrorMessage(raw: string | null | undefined): string {
  const m = raw ?? "";
  if (m.includes("RESEND_IN_PROGRESS")) return "Bonul pentru această vânzare se trimite deja. Așteptați răspunsul casei.";
  if (m.includes("RESEND_NOT_SAME_SESSION")) return "Doar un manager poate retrimite bonuri din altă tură de casă.";
  if (m.includes("RESEND_NOT_ELIGIBLE")) return "Bonul acestei vânzări nu mai poate fi retrimis (este deja confirmat sau în curs).";
  if (m.includes("RESEND_TRANSACTION_NOT_FOUND")) return "Vânzarea nu a fost găsită.";
  if (m.includes("RESEND_NOT_YOUR_ATTEMPT") || m.includes("RESEND_FORBIDDEN")) return "Nu aveți drept să retrimiteți bonuri fiscale.";
  if (m.includes("RESEND_ATTEMPT_EXPIRED")) return "Retrimiterea a expirat. Verificați casa de marcat și încercați din nou.";
  if (m.includes("Could not find the function") || m.includes("does not exist")) {
    return "Retrimiterea nu este încă activă pe server. Contactați suportul.";
  }
  return "Bonul nu a putut fi pregătit pentru retrimitere. Încercați din nou.";
}

export type ResendItemRow = {
  product_name: string | null;
  quantity: number | string | null;
  unit_price: number | string | null;
  vat_rate: number | string | null;
  discount_pct?: number | string | null;
};

/**
 * Rebuild the receipt lines from the saved sale, the same fields the till sent
 * the first time (completeSaleReturn: productName, quantity, unit_price,
 * vat_rate, fiscal VAT group from vat_rates, line discount %).
 */
export function buildResendItems(rows: ResendItemRow[], vatRateGroupMap: Record<number, number>) {
  return rows.map((r) => {
    const vatRate = Number(r.vat_rate ?? 0);
    const pct = Number(r.discount_pct ?? 0);
    return {
      productName: r.product_name ?? "Produs",
      quantity: Number(r.quantity ?? 0),
      unitPrice: Number(r.unit_price ?? 0),
      vatRate,
      fiscalNetGroup: vatRateGroupMap[vatRate] ?? null,
      ...(pct > 0 ? { discountPercent: pct } : {}),
    };
  });
}

/**
 * Romanian label for pos_transactions.fiscal_receipt_status in exports and
 * reports. `unconfirmed` is kept apart from `failed` on purpose: the receipt
 * may have printed; the printer journal (Z report) is the proof.
 */
export function fiscalStatusLabelRo(status: string | null | undefined): string {
  switch (status ?? "") {
    case "success": return "Confirmat";
    case "not_required":
    case "": return "Nu este cazul";
    case "unconfirmed": return "Neconfirmat (verificați jurnalul casei)";
    case "ambiguous": return "Trimis, fără confirmare";
    case "failed":
    case "timeout": return "Netrimis";
    case "api_pending":
    case "pending":
    case "printing": return "În curs";
    case "skipped": return "Omis";
    default: return status ?? "";
  }
}
