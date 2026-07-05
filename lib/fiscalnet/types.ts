/**
 * FiscalNet – shared type definitions (v2 — HTTP API mode)
 *
 * Active only when: country_code==="RO" && fiscalnet_enabled===true
 * See lib/fiscalnet/eligibility.ts
 */

export { isFiscalNetActive, isFiscalNetClientActive } from "@/lib/fiscalnet/eligibility";

// ── VAT group (one row per fiscal VAT code) ──────────────────────────────
export interface VatGroup {
  code:  number;   // FiscalNet group code: 1=A, 2=B, 3=C, 4=D, etc.
  rate:  number;   // Percentage, e.g. 21 or 11
  label: string;   // Human label, e.g. "TVA standard 21% (A)"
}

export const DEFAULT_VAT_GROUPS: VatGroup[] = [
  { code: 1, rate: 21, label: "TVA standard 21% (A)" },
  { code: 2, rate: 11, label: "TVA redus 11% (B)" },
  { code: 3, rate:  5, label: "TVA super-redus 5% (C)" },
  { code: 4, rate:  0, label: "Scutit TVA 0% (D)" },
];

// Resolve a product VAT rate (e.g. 9.0) to a FiscalNet VAT group code (e.g. 2)
export function resolveVatGroup(rate: number, groups: VatGroup[]): number {
  const pct = Math.round(rate);
  const match = groups.find((g) => Math.round(g.rate) === pct);
  return match ? match.code : 1; // default to group 1 (standard rate)
}

// ── Payment type map ──────────────────────────────────────────────────────
// FiscalNet payment codes: 1=cash, 2=card, 3=credit, 4=meal ticket, 6=voucher, 8=other
export type FiscalPaymentCode = 1 | 2 | 3 | 4 | 6 | 8;

export const DEFAULT_PAYMENT_TYPE_MAP: Record<string, FiscalPaymentCode> = {
  cash:   1,
  card:   2,
  online: 2,
  other:  8,
};

// ── Organisation config ───────────────────────────────────────────────────
export interface FiscalNetConfig {
  enabled:          boolean;
  /** "api" = HTTP POST to apiHost/api/Receipt  |  "file" = write to bonuriPath */
  connectionMode:   "api" | "file";
  apiHost:          string;            // e.g. "http://localhost:65400"
  mockMode:         boolean;           // true = simulate, never call real device
  bonuriPath:       string | null;     // file mode only
  raspunsPath:      string | null;     // file mode only
  autoPrint:        boolean;
  askBeforePrint:   boolean;
  manualOnly:       boolean;
  timeoutMs:        number;
  retryCount:       number;
  cif:              string | null;     // company CIF printed on receipt header
  operatorCode:     string | null;     // cashier code, embedded in each S^ line
  vatGroups:        VatGroup[];        // modifiable VAT group mapping
  paymentTypeMap:   Record<string, FiscalPaymentCode>;  // frenchisetech type → FN code
}

// ── Sale line item ────────────────────────────────────────────────────────
export interface FiscalLineItem {
  productName:     string;   // max 36 chars
  quantity:        number;   // will be encoded as integer x1000
  unitPrice:       number;   // per-unit gross price, encoded x100
  vatRate:         number;   // e.g. 19 for 19% — mapped to vatGroup code
  unit?:           string;   // unit of measure (default "buc")
  discountPercent?: number;
}

// ── Command types ─────────────────────────────────────────────────────────
export type FiscalCommandType =
  | "sale"       // S^ lines + P^ payment
  | "void"       // VB^ — void last receipt
  | "cash_in"    // I^  — cash into drawer
  | "cash_out"   // O^  — cash out of drawer
  | "x_report"   // X^  — daily total (non-resetting)
  | "z_report"   // Z^  — close fiscal day
  | "status"     // ST^ — printer status
  | "drawer";    // DS^ — open cash drawer

export interface FiscalSaleCommand {
  type:              "sale";
  operatorCode:      string;
  cif?:              string;
  items:             FiscalLineItem[];
  paymentCode:       FiscalPaymentCode;
  paymentAmount:     number;
  receiptReference?: string;
  vatGroups:         VatGroup[];
}

export interface FiscalUtilityCommand {
  type:        Exclude<FiscalCommandType, "sale">;
  operatorCode: string;
  amount?:     number;   // used for cash_in / cash_out
}

export type FiscalCommand = FiscalSaleCommand | FiscalUtilityCommand;

// ── Response ──────────────────────────────────────────────────────────────
export type FiscalReceiptStatus =
  | "not_required" | "pending" | "printing" | "success"
  | "failed" | "skipped" | "ambiguous" | "timeout" | "api_pending"
  | "downloaded" | "download_required" | "pending_manual_confirmation";

export interface FiscalNetResponse {
  bonok:          1 | 0 | -1 | null;
  receiptNumber?: string;
  errorCode?:     string;
  errorInfo?:     string;
  raw:            string;
}

export interface FiscalReceiptAttempt {
  id:              string;
  organisationId:  string;
  transactionId:   string | null;
  attemptNumber:   number;
  status:          "pending"|"success"|"failed"|"timeout"|"ambiguous"|"mock_success";
  mockMode:        boolean;
  commandFile:     string | null;
  commandContent:  string | null;
  responseContent: string | null;
  receiptNumber:   string | null;
  errorCode:       string | null;
  errorInfo:       string | null;
  performedBy:     string | null;
  attemptedAt:     string;
  resolvedAt:      string | null;
}

export interface FiscalPrintResult {
  success:        boolean;
  receiptNumber?: string;
  errorCode?:     string;
  errorInfo?:     string;
  status:         FiscalReceiptStatus;
  attemptId?:     string;
  mock:           boolean;
}
