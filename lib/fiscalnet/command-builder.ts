/**
 * FiscalNet command builder (v3)
 *
 * Three API layers — all backward-compatible:
 *
 *  1. Individual line builders (v3 — new)
 *       saleItem(), stornoItem(), discountPercent(), discountValue(),
 *       markupPercent(), markupValue(), subtotal(), textLine(), payment(),
 *       customerFiscalCode(), xReport(), zReport(), cancelReceipt(),
 *       openDrawer(), cashIn(), cashOut(), barcode(), customerDisplay(),
 *       posPayment()
 *
 *  2. ReceiptBuilder (v3 — new)
 *       Fluent builder for complex multi-item receipts.
 *
 *  3. Batch builders (v2 — backward-compatible)
 *       buildSaleLines(), buildXReportLines(), buildZReportLines(), …
 *
 * Encoding rules (FiscalNet spec):
 *   Price   : RON × 100  — no decimal separator  (10.00 RON → 1000)
 *   Quantity: units × 1000 — no decimal separator (1 unit   → 1000, 2.5 → 2500)
 *
 * Command reference:
 *   S^NAME^PRICE^QTY^UM^GRTVA^GRDEP  — sale item
 *   VS^...                            — storno / return item
 *   DP^VALUE                          — discount by percent (value = percent × 100)
 *   DV^VALUE                          — discount by amount (bani)
 *   MP^VALUE                          — markup by percent
 *   MV^VALUE                          — markup by amount (bani)
 *   ST^                               — subtotal (before subtotal-level discount)
 *   TL^TEXT                           — free text line
 *   P^TYPE^AMOUNT                     — payment (type 1-9, amount bani)
 *   CF^CIF                            — client fiscal code
 *   X^                                — X report (daily totals, non-resetting)
 *   Z^                                — Z report (close fiscal day — IRREVERSIBLE)
 *   VB^                               — cancel/void current receipt
 *   DS^                               — open cash drawer
 *   I^AMOUNT                          — cash in (bani)
 *   O^AMOUNT                          — cash out (bani)
 *   CB^CODE^TYPE                      — barcode / QR (type 1=EAN8 2=EAN13 3=Code128 4=QR)
 *   MD^LINE1^LINE2                    — customer display (file: display_*.txt)
 *   POS^AMOUNT                        — POS terminal payment (Plus version only)
 *   COPIEBON^                         — reprint last receipt
 */

import path from "path";
import type { FiscalSaleCommand, FiscalLineItem, VatGroup } from "./types";
import { resolveVatGroup } from "./types";

// ── Custom error ──────────────────────────────────────────────────────────────

/** Thrown when a command argument fails validation. */
export class FiscalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FiscalError";
  }
}

// ── Validation sets ───────────────────────────────────────────────────────────

const VALID_VAT_GROUPS     = new Set([1, 2, 3, 4, 5]);
const VALID_PAYMENT_TYPES  = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const VALID_BARCODE_TYPES  = new Set([1, 2, 3, 4]);

// ── Encoding helpers ──────────────────────────────────────────────────────────

/**
 * Format a monetary value to FiscalNet integer bani format.
 * 1 RON = 100 bani.  10.00 RON → 1000.
 */
export function formatMoney(value: number): number {
  if (typeof value !== "number" || isNaN(value))
    throw new FiscalError(`formatMoney: expected a number, got ${value}`);
  if (value < 0)
    throw new FiscalError(`formatMoney: value must be ≥ 0, got ${value}`);
  return Math.round(value * 100);
}

/**
 * Format a quantity to FiscalNet integer millis format.
 * 1 unit = 1000 millis.  1 unit → 1000,  2.5 units → 2500.
 */
export function formatQuantity(value: number): number {
  if (typeof value !== "number" || isNaN(value))
    throw new FiscalError(`formatQuantity: expected a number, got ${value}`);
  if (value <= 0)
    throw new FiscalError(`formatQuantity: value must be > 0, got ${value}`);
  return Math.round(value * 1000);
}

/** @deprecated Use formatMoney */
export const encodeMoney    = formatMoney;
/** @deprecated Use formatQuantity */
export const encodeQuantity = formatQuantity;

// ── String sanitisation ───────────────────────────────────────────────────────

/**
 * Sanitise a product name for use in S^ / VS^ commands.
 * Strips ^ separators, collapses whitespace, truncates to 36 chars.
 */
export function sanitiseProductName(name: string): string {
  if (!name || name.trim().length === 0)
    throw new FiscalError("Product name must not be empty");
  return name.replace(/\^/g, "").replace(/[\r\n\t]+/g, " ").trim().slice(0, 36);
}

/** Sanitise any text field: strip ^, newlines, truncate to maxLen. */
function sanitiseText(text: string, maxLen = 100): string {
  return (text ?? "").replace(/\^/g, "").replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLen);
}

// ── Path safety ───────────────────────────────────────────────────────────────

/** Resolve and validate a file path.  Throws FiscalError on path traversal. */
export function safePath(rawPath: string): string {
  const resolved = path.resolve(rawPath);
  if (resolved.includes(".."))
    throw new FiscalError(`Unsafe path (traversal detected): ${rawPath}`);
  return resolved;
}

// ── Filename builders ─────────────────────────────────────────────────────────

/** Unique sequential counter for operation IDs within a process lifetime. */
let _opSeq = 0;

/**
 * Generate a collision-resistant operation ID safe for use as a filename base.
 * Format:  {prefix}_{base36-timestamp}_{4-hex}
 *
 * Using both timestamp and random suffix guarantees uniqueness even when
 * multiple computers write to the same shared Bonuri folder simultaneously.
 */
export function generateOperationId(prefix = "FN"): string {
  const ts   = (Date.now() + (_opSeq++ % 1000)).toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0").toUpperCase();
  return `${prefix}_${ts}_${rand}`;
}

/** Regular command file:       `{operationId}.txt` */
export function buildCommandFilename(reference: string): string {
  const safe = reference.replace(/[^A-Z0-9_-]/gi, "_").slice(0, 24);
  return `${safe}_${Date.now()}.txt`;
}

/** Non-fiscal receipt file:    `nf_{operationId}.txt` */
export function buildNonFiscalFilename(operationId: string): string {
  const safe = operationId.replace(/[^A-Z0-9_-]/gi, "_").slice(0, 30);
  return `nf_${safe}.txt`;
}

/** Customer display file:      `display_{operationId}.txt` */
export function buildDisplayFilename(operationId: string): string {
  const safe = operationId.replace(/[^A-Z0-9_-]/gi, "_").slice(0, 30);
  return `display_${safe}.txt`;
}

/** Join lines with CRLF — the FiscalNet file format. */
export function linesToFileContent(lines: string[]): string {
  return lines.join("\r\n") + "\r\n";
}

// ═════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL LINE BUILDERS  (v3)
// Each function returns a single command line string.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Sale item line.
 * S^NAME^PRICE^QTY^UM^GRTVA^GRDEP
 *
 * @param name       Product name (max 36 chars after sanitisation)
 * @param price      Unit price in RON, e.g. 10.00
 * @param quantity   Quantity, e.g. 1 or 2.5
 * @param unit       Unit of measure, default "buc"
 * @param vatGroup   FiscalNet VAT group code 1–5
 * @param deptGroup  Department/product group, default 1
 *
 * @example saleItem("Coffee", 10.00, 1, "buc", 1, 1)  →  "S^Coffee^1000^1000^buc^1^1"
 */
export function saleItem(
  name:      string,
  price:     number,
  quantity:  number,
  unit      = "buc",
  vatGroup  = 1,
  deptGroup = 1,
): string {
  if (!VALID_VAT_GROUPS.has(vatGroup))
    throw new FiscalError(`saleItem: invalid VAT group ${vatGroup} — must be 1–5`);
  if (price < 0)   throw new FiscalError(`saleItem: price must be ≥ 0`);
  const safeName = sanitiseProductName(name);
  const safeUnit = sanitiseText(unit || "buc", 8) || "buc";
  return `S^${safeName}^${formatMoney(price)}^${formatQuantity(quantity)}^${safeUnit}^${vatGroup}^${deptGroup}`;
}

/**
 * Storno (void/return) item — VS^ prefix, same structure as saleItem.
 * @example stornoItem("Coffee", 10.00, 1)  →  "VS^Coffee^1000^1000^buc^1^1"
 */
export function stornoItem(
  name:      string,
  price:     number,
  quantity:  number,
  unit      = "buc",
  vatGroup  = 1,
  deptGroup = 1,
): string {
  if (!VALID_VAT_GROUPS.has(vatGroup))
    throw new FiscalError(`stornoItem: invalid VAT group ${vatGroup} — must be 1–5`);
  if (price < 0) throw new FiscalError(`stornoItem: price must be ≥ 0`);
  const safeName = sanitiseProductName(name);
  const safeUnit = sanitiseText(unit || "buc", 8) || "buc";
  return `VS^${safeName}^${formatMoney(price)}^${formatQuantity(quantity)}^${safeUnit}^${vatGroup}^${deptGroup}`;
}

/**
 * Percentage discount on the preceding item.
 * Must be placed immediately below the S^ line it applies to.
 * @param percent  e.g. 10 for 10% discount
 * @example discountPercent(10)  →  "DP^1000"
 */
export function discountPercent(percent: number): string {
  if (percent <= 0 || percent > 100)
    throw new FiscalError(`discountPercent: percent must be 0 < x ≤ 100, got ${percent}`);
  return `DP^${formatMoney(percent)}`;
}

/**
 * Value discount on the preceding item.
 * @param amount  Amount in RON, e.g. 5.00
 * @example discountValue(5.00)  →  "DV^500"
 */
export function discountValue(amount: number): string {
  if (amount <= 0) throw new FiscalError(`discountValue: amount must be > 0, got ${amount}`);
  return `DV^${formatMoney(amount)}`;
}

/**
 * Percentage markup on the preceding item.
 * @example markupPercent(5)  →  "MP^500"
 */
export function markupPercent(percent: number): string {
  if (percent <= 0) throw new FiscalError(`markupPercent: percent must be > 0, got ${percent}`);
  return `MP^${formatMoney(percent)}`;
}

/**
 * Value markup on the preceding item.
 * @example markupValue(0.50)  →  "MV^50"
 */
export function markupValue(amount: number): string {
  if (amount <= 0) throw new FiscalError(`markupValue: amount must be > 0, got ${amount}`);
  return `MV^${formatMoney(amount)}`;
}

/**
 * Print subtotal line.
 * Use before a subtotal-level discount or before the first P^ payment line.
 * @example subtotal()  →  "ST^"
 */
export function subtotal(): string {
  return "ST^";
}

/**
 * Free text line on the receipt.
 * Must appear before any P^ payment lines.
 * @example textLine("Order #12345")  →  "TL^Order #12345"
 */
export function textLine(text: string): string {
  if (!text || text.trim().length === 0)
    throw new FiscalError("textLine: text must not be empty");
  return `TL^${sanitiseText(text, 48)}`;
}

/**
 * Payment line.
 * @param type    1=Cash  2=Card  3=Credit  4=Meal ticket  5=Value ticket
 *                6=Voucher  7=Modern payment  8=Other  9=Other
 * @param amount  Amount in RON.  Pass 0 to pay the full remaining receipt total.
 * @example payment(2, 10.00)  →  "P^2^1000"
 * @example payment(1, 0)      →  "P^1^0"   (auto full total)
 */
export function payment(type: number, amount: number): string {
  if (!VALID_PAYMENT_TYPES.has(type))
    throw new FiscalError(`payment: invalid type ${type} — must be 1–9`);
  if (amount < 0) throw new FiscalError(`payment: amount must be ≥ 0, got ${amount}`);
  return `P^${type}^${formatMoney(amount)}`;
}

/**
 * Customer fiscal code (CIF).  Must appear before the first S^ line.
 * @example customerFiscalCode("RO123456")  →  "CF^RO123456"
 */
export function customerFiscalCode(code: string): string {
  if (!code || code.trim().length === 0)
    throw new FiscalError("customerFiscalCode: code must not be empty");
  return `CF^${sanitiseText(code, 20)}`;
}

/** X report — daily totals, non-resetting. */
export function xReport(): string { return "X^"; }

/** Z report — close fiscal day.  ⚠️ IRREVERSIBLE — always require UI confirmation. */
export function zReport(): string { return "Z^"; }

/** Cancel/void current open receipt. */
export function cancelReceipt(): string { return "VB^"; }

/** Open cash drawer. */
export function openDrawer(): string { return "DS^"; }

/**
 * Cash in (introducere numerar).
 * @example cashIn(100.00)  →  "I^10000"
 */
export function cashIn(amount: number): string {
  if (amount <= 0) throw new FiscalError(`cashIn: amount must be > 0, got ${amount}`);
  return `I^${formatMoney(amount)}`;
}

/**
 * Cash out (scoatere numerar).
 * @example cashOut(50.00)  →  "O^5000"
 */
export function cashOut(amount: number): string {
  if (amount <= 0) throw new FiscalError(`cashOut: amount must be > 0, got ${amount}`);
  return `O^${formatMoney(amount)}`;
}

/**
 * Print barcode or QR code on the receipt.
 * @param code  Barcode value
 * @param type  1=EAN8  2=EAN13  3=Code128  4=QR Code
 * @example barcode("5940000000820", 2)  →  "CB^5940000000820^2"
 */
export function barcode(code: string, type: number): string {
  if (!code || code.trim().length === 0)
    throw new FiscalError("barcode: code must not be empty");
  if (!VALID_BARCODE_TYPES.has(type))
    throw new FiscalError(`barcode: invalid type ${type} — must be 1–4`);
  return `CB^${sanitiseText(code, 40)}^${type}`;
}

/**
 * Send two text lines to the customer-facing display.
 * The command file MUST be named `display_*.txt` in the Bonuri folder.
 * @example customerDisplay("Hello", "Welcome")  →  "MD^Hello^Welcome"
 */
export function customerDisplay(line1: string, line2: string): string {
  return `MD^${sanitiseText(line1 || "", 20)}^${sanitiseText(line2 || "", 20)}`;
}

/**
 * POS terminal payment command.  Available in FiscalNet Plus only.
 * @example posPayment(10.00)  →  "POS^1000"
 */
export function posPayment(amount: number): string {
  if (amount <= 0) throw new FiscalError(`posPayment: amount must be > 0, got ${amount}`);
  return `POS^${formatMoney(amount)}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// RECEIPT BUILDER  (v3 — fluent API)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fluent receipt builder.  Chain methods to add lines, then call build() or toFileContent().
 *
 * @example
 *   const lines = new ReceiptBuilder()
 *     .customerFiscalCode("RO123456")
 *     .addItem("Coffee", 5.00, 2, "buc", 1, 1)
 *     .addDiscount("percent", 10)
 *     .addText("Order #123")
 *     .pay(1, 9.00)
 *     .build();
 *
 *   // API mode:  POST JSON.stringify(lines) to /api/Receipt
 *   // File mode: linesToFileContent(lines) → write to Bonuri folder
 */
export class ReceiptBuilder {
  private _lines: string[] = [];

  /** Attach customer fiscal code (CIF). Must be called before the first addItem. */
  customerFiscalCode(code: string): this {
    this._lines.push(customerFiscalCode(code));
    return this;
  }

  /** Add a fiscal sale item. */
  addItem(
    name:      string,
    price:     number,
    quantity  = 1,
    unit      = "buc",
    vatGroup  = 1,
    deptGroup = 1,
  ): this {
    this._lines.push(saleItem(name, price, quantity, unit, vatGroup, deptGroup));
    return this;
  }

  /** Add a storno (return/void) item. */
  addStornoItem(
    name:      string,
    price:     number,
    quantity  = 1,
    unit      = "buc",
    vatGroup  = 1,
    deptGroup = 1,
  ): this {
    this._lines.push(stornoItem(name, price, quantity, unit, vatGroup, deptGroup));
    return this;
  }

  /** Add a discount on the last item.  type: "percent" | "value" */
  addDiscount(type: "percent" | "value", amount: number): this {
    this._lines.push(type === "percent" ? discountPercent(amount) : discountValue(amount));
    return this;
  }

  /** Add a markup on the last item.  type: "percent" | "value" */
  addMarkup(type: "percent" | "value", amount: number): this {
    this._lines.push(type === "percent" ? markupPercent(amount) : markupValue(amount));
    return this;
  }

  /** Add a free text line (must come before pay()). */
  addText(text: string): this {
    this._lines.push(textLine(text));
    return this;
  }

  /** Print a barcode on the receipt. */
  addBarcode(code: string, type: number): this {
    this._lines.push(barcode(code, type));
    return this;
  }

  /** Insert a subtotal line (before subtotal-level discounts or payment). */
  addSubtotal(): this {
    this._lines.push(subtotal());
    return this;
  }

  /**
   * Add a payment line.  Calling pay() closes the receipt.
   * @param type    Payment type 1–9
   * @param amount  Amount in RON; 0 = pay full remaining total automatically
   */
  pay(type: number, amount = 0): this {
    this._lines.push(payment(type, amount));
    return this;
  }

  /** Returns a copy of the accumulated command lines. */
  build(): string[] {
    return [...this._lines];
  }

  /** Returns CRLF-joined file content, ready to write to the Bonuri folder. */
  toFileContent(): string {
    return linesToFileContent(this._lines);
  }

  /** Resets all lines so the builder can be reused. */
  reset(): this {
    this._lines = [];
    return this;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// BATCH BUILDERS  (v2 — backward-compatible)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Build command lines for a complete sale receipt.
 * v2 interface — takes a FiscalSaleCommand object.
 */
export function buildSaleLines(cmd: FiscalSaleCommand): string[] {
  const lines: string[] = [];
  const op = (cmd.operatorCode || "1").replace(/\^/g, "").trim() || "1";

  if (cmd.cif) lines.push(`CF^${sanitiseText(cmd.cif, 20)}`);
  if (cmd.receiptReference) lines.push(`TL^Bon ${sanitiseText(cmd.receiptReference, 28)}`);

  for (const item of cmd.items) {
    const name     = sanitiseProductName(item.productName);
    const price    = formatMoney(item.unitPrice);
    const qty      = formatQuantity(item.quantity);
    const unit     = sanitiseText(item.unit || "buc", 8) || "buc";
    const vatCode  = resolveVatGroup(item.vatRate, cmd.vatGroups);
    lines.push(`S^${name}^${price}^${qty}^${unit}^${vatCode}^${op}`);
    if (item.discountPercent && item.discountPercent > 0)
      lines.push(`DP^${Math.round(item.discountPercent * 100)}`);
  }

  lines.push(`P^${cmd.paymentCode}^${formatMoney(cmd.paymentAmount)}`);
  return lines;
}

export function buildXReportLines(): string[] { return ["X^"]; }
export function buildZReportLines(): string[] { return ["Z^"]; }
/** ST^ doubles as printer-status query (standalone) and subtotal marker (in-receipt). */
export function buildStatusLines(): string[]  { return ["ST^"]; }
export function buildDrawerLines(): string[]  { return ["DS^"]; }
export function buildCashInLines(amountRON: number): string[]  { return [`I^${formatMoney(amountRON)}`]; }
export function buildCashOutLines(amountRON: number): string[] { return [`O^${formatMoney(amountRON)}`]; }
export function buildVoidLines(): string[]    { return ["VB^"]; }
export function buildReprintLines(): string[] { return ["COPIEBON^"]; }

// Legacy string-returning aliases
export function buildSaleCommand(cmd: FiscalSaleCommand): string { return linesToFileContent(buildSaleLines(cmd)); }
export function buildStatusCommand(_op?: string): string  { return linesToFileContent(buildStatusLines()); }
export function buildXReportCommand(_op?: string): string { return linesToFileContent(buildXReportLines()); }
export function buildZReportCommand(_op?: string): string { return linesToFileContent(buildZReportLines()); }
export function buildDrawerCommand(_op?: string): string  { return linesToFileContent(buildDrawerLines()); }
