/**
 * FiscalNet module barrel export (v3)
 */

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  FiscalNetConfig, VatGroup, FiscalPaymentCode,
  FiscalCommand, FiscalSaleCommand, FiscalUtilityCommand,
  FiscalLineItem, FiscalNetResponse, FiscalReceiptAttempt,
  FiscalPrintResult, FiscalReceiptStatus,
} from "./types";

export {
  DEFAULT_VAT_GROUPS, DEFAULT_PAYMENT_TYPE_MAP, resolveVatGroup,
} from "./types";

// Backward-compat alias
export { DEFAULT_PAYMENT_TYPE_MAP as PAYMENT_TYPE_MAP } from "./types";

// ── Command builder (v3) ─────────────────────────────────────────────────────
export {
  // Custom error
  FiscalError,

  // Formatting helpers
  formatMoney, formatQuantity,
  encodeMoney, encodeQuantity,   // v2 aliases

  // String / path helpers
  sanitiseProductName, safePath, linesToFileContent,

  // Filename builders
  generateOperationId, buildCommandFilename,
  buildNonFiscalFilename, buildDisplayFilename,

  // Individual line builders (v3 — new)
  saleItem, stornoItem,
  discountPercent, discountValue,
  markupPercent, markupValue,
  subtotal, textLine,
  payment, customerFiscalCode,
  xReport, zReport,
  cancelReceipt, openDrawer,
  cashIn, cashOut,
  barcode, customerDisplay, posPayment,

  // Fluent builder (v3 — new)
  ReceiptBuilder,

  // Batch builders (v2 — backward-compat)
  buildSaleLines, buildSaleCommand,
  buildXReportLines, buildXReportCommand,
  buildZReportLines, buildZReportCommand,
  buildStatusLines, buildStatusCommand,
  buildDrawerLines, buildDrawerCommand,
  buildCashInLines, buildCashOutLines,
  buildVoidLines, buildReprintLines,
} from "./command-builder";

// ── Response parser ───────────────────────────────────────────────────────────
export { parseResponse, describeResponse, responseFilename } from "./parser";

// ── File-mode transport (v3 — new) ────────────────────────────────────────────
export type { FiscalFileResult, FiscalOperationLog, FilenamePrefix, WriteCommandOptions } from "./file-service";
export { writeCommandAndWait, generateOpId } from "./file-service";

// ── Receipt examples (v3 — new) ───────────────────────────────────────────────
export type { ReceiptExample } from "./receipt-examples";
export { RECEIPT_EXAMPLES, getExamplesList } from "./receipt-examples";

// ── Server-side service (v2) ──────────────────────────────────────────────────
export {
  printFiscalReceipt, shouldPrintFiscalReceipt,
  fiscalXReport, fiscalZReport, fiscalStatus,
  fiscalOpenDrawer, fiscalCashIn, fiscalCashOut, fiscalVoidLast,
} from "./service";
export type { PrintFiscalReceiptOptions } from "./service";

// ── Config builder ────────────────────────────────────────────────────────────
export { buildFiscalNetConfig } from "./config";
