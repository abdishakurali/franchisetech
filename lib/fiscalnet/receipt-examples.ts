/**
 * FiscalNet receipt examples (v3)
 *
 * Pre-built command sequences covering every supported operation.
 * Use RECEIPT_EXAMPLES[key].lines for API/file mode, or .content for direct file write.
 *
 * All amounts: RON.  All VAT groups: 1 (19% standard rate) unless noted.
 */

import {
  saleItem, stornoItem, textLine, payment,
  customerFiscalCode, discountPercent, discountValue,
  markupPercent, subtotal, barcode,
  xReport, zReport, cancelReceipt, openDrawer,
  cashIn, cashOut, customerDisplay, posPayment,
  linesToFileContent, buildNonFiscalFilename, buildDisplayFilename,
} from "./command-builder";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReceiptExample {
  /** Short human-readable label */
  name:              string;
  /** One-line description for UI tooltips */
  description:       string;
  /** Array of FiscalNet command lines (no CRLF) */
  lines:             string[];
  /** Filename prefix for the Bonuri folder */
  filenamePrefix:    "" | "nf_" | "display_";
  /** CRLF-joined file content — ready to write to Bonuri */
  content:           string;
  /** Suggested filename (without the path) */
  suggestedFilename: string;
}

// ── Line arrays ───────────────────────────────────────────────────────────────

const simpleCashLines = [
  saleItem("Test Product", 10.00, 1, "buc", 1, 1),
  textLine("Test receipt from platform"),
  payment(1, 10.00),
];

const simpleCardLines = [
  saleItem("Test Product", 10.00, 1, "buc", 1, 1),
  textLine("Card payment test"),
  payment(2, 10.00),
];

const withFiscalCodeLines = [
  customerFiscalCode("RO123456"),
  saleItem("Test Product", 10.00, 1, "buc", 1, 1),
  payment(1, 10.00),
];

const withDiscountPercentLines = [
  saleItem("Test Product", 10.00, 1, "buc", 1, 1),
  discountPercent(10),        // 10% → DP^1000
  payment(1, 9.00),
];

const withDiscountValueLines = [
  saleItem("Test Product", 10.00, 1, "buc", 1, 1),
  discountValue(5.00),        // 5 RON → DV^500
  payment(1, 5.00),
];

const withMarkupLines = [
  saleItem("Test Product", 10.00, 1, "buc", 1, 1),
  markupPercent(5),           // 5% → MP^500
  payment(1, 10.50),
];

const withSubtotalDiscountLines = [
  saleItem("Coffee",    5.00, 1, "buc", 1, 1),
  saleItem("Sandwich", 12.00, 1, "buc", 2, 1),  // VAT group 2 = 9%
  subtotal(),                  // ST^ — then apply discount to whole subtotal
  discountPercent(10),
  payment(1, 15.30),
];

const multiItemLines = [
  textLine("Order #12345"),
  saleItem("Coffee",      5.00,  2, "buc", 1, 1),
  saleItem("Sandwich",   12.00,  1, "buc", 2, 1),
  saleItem("Still Water", 3.00,  1, "buc", 1, 1),
  payment(1, 25.00),
];

const splitPaymentLines = [
  saleItem("Test Product", 20.00, 1, "buc", 1, 1),
  payment(1, 10.00),   // 10 RON cash
  payment(2, 10.00),   // 10 RON card
];

const stornoLines = [
  stornoItem("Returned Product", 10.00, 1, "buc", 1, 1),
  payment(1, 0),       // 0 = return full amount
];

const withBarcodeLines = [
  saleItem("Barcode Product", 5.00, 1, "buc", 1, 1),
  barcode("5940000000820", 2),  // EAN13
  payment(1, 5.00),
];

const withQrLines = [
  saleItem("QR Product", 5.00, 1, "buc", 1, 1),
  textLine("Scan QR for loyalty points"),
  barcode("https://franchisetech.ro/receipt/12345", 4),  // QR Code
  payment(1, 5.00),
];

const xReportLines  = [xReport()];
const zReportLines  = [zReport()];
const cancelLines   = [cancelReceipt()];
const drawerLines   = [openDrawer()];
const cashInLines   = [cashIn(100.00)];
const cashOutLines  = [cashOut(50.00)];

const nonFiscalLines = [
  textLine("Non fiscal test line 1"),
  textLine("Non fiscal test line 2"),
];

const displayLines = [
  customerDisplay("Hello", "Welcome"),
];

const posPaymentLines = [
  saleItem("POS Test Product", 10.00, 1, "buc", 1, 1),
  posPayment(10.00),
];

// ── Exported collection ───────────────────────────────────────────────────────

export const RECEIPT_EXAMPLES: Record<string, ReceiptExample> = {
  simpleCash: {
    name: "Simple Cash Sale",
    description: "Single item · 10.00 RON · cash payment",
    lines: simpleCashLines,
    filenamePrefix: "",
    content: linesToFileContent(simpleCashLines),
    suggestedFilename: "test_cash.txt",
  },
  simpleCard: {
    name: "Simple Card Sale",
    description: "Single item · 10.00 RON · card payment",
    lines: simpleCardLines,
    filenamePrefix: "",
    content: linesToFileContent(simpleCardLines),
    suggestedFilename: "test_card.txt",
  },
  withFiscalCode: {
    name: "Receipt with Client CIF",
    description: "CF^ fiscal code at top · cash payment",
    lines: withFiscalCodeLines,
    filenamePrefix: "",
    content: linesToFileContent(withFiscalCodeLines),
    suggestedFilename: "test_cif.txt",
  },
  withDiscountPercent: {
    name: "10% Discount (DP^)",
    description: "Item with 10% percentage discount",
    lines: withDiscountPercentLines,
    filenamePrefix: "",
    content: linesToFileContent(withDiscountPercentLines),
    suggestedFilename: "test_discount_pct.txt",
  },
  withDiscountValue: {
    name: "5 RON Discount (DV^)",
    description: "Item with 5.00 RON value discount",
    lines: withDiscountValueLines,
    filenamePrefix: "",
    content: linesToFileContent(withDiscountValueLines),
    suggestedFilename: "test_discount_val.txt",
  },
  withMarkup: {
    name: "5% Markup (MP^)",
    description: "Item with 5% percentage markup",
    lines: withMarkupLines,
    filenamePrefix: "",
    content: linesToFileContent(withMarkupLines),
    suggestedFilename: "test_markup.txt",
  },
  withSubtotalDiscount: {
    name: "Subtotal Discount (ST^)",
    description: "Two items · ST^ · then 10% subtotal discount",
    lines: withSubtotalDiscountLines,
    filenamePrefix: "",
    content: linesToFileContent(withSubtotalDiscountLines),
    suggestedFilename: "test_subtotal.txt",
  },
  multiItem: {
    name: "Multi-Item Receipt",
    description: "3 items with mixed VAT groups · text line · cash",
    lines: multiItemLines,
    filenamePrefix: "",
    content: linesToFileContent(multiItemLines),
    suggestedFilename: "test_multi.txt",
  },
  splitPayment: {
    name: "Split Payment",
    description: "20 RON item · 10 RON cash + 10 RON card",
    lines: splitPaymentLines,
    filenamePrefix: "",
    content: linesToFileContent(splitPaymentLines),
    suggestedFilename: "test_split.txt",
  },
  storno: {
    name: "Storno / Return",
    description: "VS^ return item · full refund to cash",
    lines: stornoLines,
    filenamePrefix: "",
    content: linesToFileContent(stornoLines),
    suggestedFilename: "test_storno.txt",
  },
  withBarcode: {
    name: "EAN13 Barcode (CB^)",
    description: "Item with EAN13 barcode printed on receipt",
    lines: withBarcodeLines,
    filenamePrefix: "",
    content: linesToFileContent(withBarcodeLines),
    suggestedFilename: "test_barcode.txt",
  },
  withQr: {
    name: "QR Code (CB^ type 4)",
    description: "Item with QR code and text line",
    lines: withQrLines,
    filenamePrefix: "",
    content: linesToFileContent(withQrLines),
    suggestedFilename: "test_qr.txt",
  },
  xReport: {
    name: "X Report",
    description: "Daily totals · non-resetting",
    lines: xReportLines,
    filenamePrefix: "",
    content: linesToFileContent(xReportLines),
    suggestedFilename: "test_xreport.txt",
  },
  zReport: {
    name: "Z Report  ⚠️",
    description: "Close fiscal day — IRREVERSIBLE — requires double confirmation",
    lines: zReportLines,
    filenamePrefix: "",
    content: linesToFileContent(zReportLines),
    suggestedFilename: "test_zreport.txt",
  },
  cancelReceipt: {
    name: "Cancel Receipt (VB^)",
    description: "Void the current open receipt",
    lines: cancelLines,
    filenamePrefix: "",
    content: linesToFileContent(cancelLines),
    suggestedFilename: "test_cancel.txt",
  },
  openDrawer: {
    name: "Open Drawer (DS^)",
    description: "Open the cash drawer without a sale",
    lines: drawerLines,
    filenamePrefix: "",
    content: linesToFileContent(drawerLines),
    suggestedFilename: "test_drawer.txt",
  },
  cashIn: {
    name: "Cash In 100 RON (I^)",
    description: "Register 100 RON cash into the drawer",
    lines: cashInLines,
    filenamePrefix: "",
    content: linesToFileContent(cashInLines),
    suggestedFilename: "test_cashin.txt",
  },
  cashOut: {
    name: "Cash Out 50 RON (O^)",
    description: "Remove 50 RON cash from the drawer",
    lines: cashOutLines,
    filenamePrefix: "",
    content: linesToFileContent(cashOutLines),
    suggestedFilename: "test_cashout.txt",
  },
  nonFiscal: {
    name: "Non-Fiscal Receipt (nf_)",
    description: "TL^ text lines · file must start with nf_",
    lines: nonFiscalLines,
    filenamePrefix: "nf_",
    content: linesToFileContent(nonFiscalLines),
    suggestedFilename: buildNonFiscalFilename("test"),
  },
  customerDisplay: {
    name: "Customer Display (MD^)",
    description: "MD^ text to display · file must start with display_",
    lines: displayLines,
    filenamePrefix: "display_",
    content: linesToFileContent(displayLines),
    suggestedFilename: buildDisplayFilename("test"),
  },
  posPayment: {
    name: "POS Terminal (POS^)",
    description: "POS^ card terminal payment · Plus version only",
    lines: posPaymentLines,
    filenamePrefix: "",
    content: linesToFileContent(posPaymentLines),
    suggestedFilename: "test_pos.txt",
  },
};

/** Return all examples as an array with their map key included. */
export function getExamplesList(): Array<{ key: string } & ReceiptExample> {
  return Object.entries(RECEIPT_EXAMPLES).map(([key, ex]) => ({ key, ...ex }));
}
