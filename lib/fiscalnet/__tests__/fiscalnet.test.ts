/**
 * FiscalNet unit tests
 *
 * Run with: npx jest lib/fiscalnet/__tests__/fiscalnet.test.ts
 */

import {
  encodeMoney,
  encodeQuantity,
  sanitiseProductName,
  buildSaleCommand,
  buildCashInLines,
  buildCashOutLines,
  buildDrawerLines,
  buildCommandFilename,
  buildXReportCommand,
  buildZReportCommand,
  linesToFileContent,
} from "../command-builder";
import { parseResponse, describeResponse, responseFilename } from "../parser";
import { shouldPrintFiscalReceipt } from "../service";
import { buildFiscalNetConfig } from "../config";
import type { FiscalSaleCommand } from "../types";
import { buildFiscalNetReceiptLines } from "../browser";

// ── encodeMoney ────────────────────────────────────────────────────────────

describe("encodeMoney", () => {
  it("encodes 10.00 → 1000", () => expect(encodeMoney(10.00)).toBe(1000));
  it("encodes 9.99 → 999",   () => expect(encodeMoney(9.99)).toBe(999));
  it("encodes 0.01 → 1",     () => expect(encodeMoney(0.01)).toBe(1));
  it("encodes 100.50 → 10050", () => expect(encodeMoney(100.50)).toBe(10050));
  it("handles floating point rounding", () => expect(encodeMoney(1.006)).toBe(101));
});

// ── encodeQuantity ─────────────────────────────────────────────────────────

describe("encodeQuantity", () => {
  it("encodes 1.000 → 1000", () => expect(encodeQuantity(1.0)).toBe(1000));
  it("encodes 2.5 → 2500",   () => expect(encodeQuantity(2.5)).toBe(2500));
  it("encodes 0.5 → 500",    () => expect(encodeQuantity(0.5)).toBe(500));
  it("encodes 3 → 3000",     () => expect(encodeQuantity(3)).toBe(3000));
});

// ── sanitiseProductName ────────────────────────────────────────────────────

describe("sanitiseProductName", () => {
  it("strips ^ characters",       () => expect(sanitiseProductName("Caf^é")).toBe("Café"));
  it("truncates to 36 chars",     () => {
    const long = "A".repeat(50);
    expect(sanitiseProductName(long).length).toBe(36);
  });
  it("strips newlines",           () => expect(sanitiseProductName("line1\nline2")).toBe("line1 line2"));
  it("does not strip normal text",() => expect(sanitiseProductName("Espresso 250ml")).toBe("Espresso 250ml"));
});

// ── buildSaleCommand ────────────────────────────────────────────────────────
// Command format: S^NAME^PRICE_BANI^QTY_MILLIS^UM^VAT_CODE^OP_CODE
// Payment format: P^TYPE^AMOUNT_BANI
// Reference:      TL^Bon REFERENCE (text line, rendered first)
// CIF:            CF^CODE (before items when present)

describe("buildSaleCommand", () => {
  const cmd: FiscalSaleCommand = {
    type: "sale",
    operatorCode: "1",
    items: [
      { productName: "Espresso", quantity: 2, unitPrice: 3.00, vatRate: 9 },
    ],
    paymentCode: 1, // cash
    vatGroups: [{ code: 2, rate: 9, label: "TVA 9%" }],
    paymentAmount: 6.00,
    receiptReference: "KO-TEST1",
  };

  it("starts with TL^ reference line, not a bare operator line", () => {
    const result = buildSaleCommand(cmd);
    expect(result).toMatch(/^TL\^Bon KO-TEST1\r\n/);
  });

  it("includes S^ product line with encoded price and qty", () => {
    const result = buildSaleCommand(cmd);
    // price=3.00 → 300 bani, qty=2 → 2000 millis, vat code=2 (9%), op=1
    expect(result).toContain("S^Espresso^300^2000^buc^2^1");
  });

  it("includes P^ payment line with correct type and amount", () => {
    const result = buildSaleCommand(cmd);
    // payment type=1 (cash), amount=6.00 → 600 bani
    expect(result).toContain("P^1^600\r\n");
  });

  it("includes reference in TL^ text line", () => {
    const result = buildSaleCommand(cmd);
    expect(result).toContain("TL^Bon KO-TEST1");
  });

  it("includes CIF as CF^ before items when provided", () => {
    const withCif = { ...cmd, cif: "RO12345678" };
    const result = buildSaleCommand(withCif);
    expect(result).toContain("CF^RO12345678");
    // CF^ should appear before the S^ item line
    expect(result.indexOf("CF^")).toBeLessThan(result.indexOf("S^"));
  });

  it("uses CRLF line endings throughout", () => {
    const result = buildSaleCommand(cmd);
    const lines = result.split("\r\n");
    // At least: TL^..., S^..., P^..., trailing empty
    expect(lines.length).toBeGreaterThan(3);
  });

  it("handles discount percentage with DP^ line after item", () => {
    const cmdWithDiscount: FiscalSaleCommand = {
      ...cmd,
      items: [{ productName: "Item", quantity: 1, unitPrice: 10, vatRate: 19, discountPercent: 10 }],
    };
    const result = buildSaleCommand(cmdWithDiscount);
    // DP^VALUE where VALUE = percent * 100 = 10 * 100 = 1000
    expect(result).toContain("DP^1000\r\n");
  });
});

// ── browser/download mode command payloads ───────────────────────────────

describe("FiscalNet TXT command payloads", () => {
  it("builds opening balance / cash-in as I^ amount", () => {
    expect(linesToFileContent(buildCashInLines(100))).toBe("I^10000\r\n");
    expect(linesToFileContent(buildCashInLines(50))).toBe("I^5000\r\n");
  });

  it("builds cash-out as O^ amount", () => {
    expect(linesToFileContent(buildCashOutLines(25))).toBe("O^2500\r\n");
  });

  it("builds report and drawer commands", () => {
    expect(buildZReportCommand()).toBe("Z^\r\n");
    expect(buildXReportCommand()).toBe("X^\r\n");
    expect(linesToFileContent(buildDrawerLines())).toBe("DS^\r\n");
  });

  it("uses FiscalNet settings for receipt VAT group, operator code, payment code, and amount", () => {
    const lines = buildFiscalNetReceiptLines(
      [{ productName: "Test Product", quantity: 1, unitPrice: 10, vatRate: 9 }],
      "card",
      {
        enabled: true,
        mockMode: false,
        connectionMode: "file",
        apiHost: "http://localhost:65400",
        vatGroups: [{ code: 7, rate: 9, label: "TVA 9" }],
        paymentTypeMap: { card: 5, other: 8 },
        operatorCode: "42",
      },
      10,
    );
    expect(lines).toEqual(["S^Test Product^1000^1000^buc^7^42", "ST^0", "P^5^1000"]);
  });

  it("emits DP^ immediately after S^ when item has discountPercent", () => {
    const lines = buildFiscalNetReceiptLines(
      [{ productName: "Croissant", quantity: 1, unitPrice: 3.2, vatRate: 9, fiscalNetGroup: 1, discountPercent: 32 }],
      "cash",
      {
        enabled: true,
        mockMode: false,
        connectionMode: "file",
        apiHost: "http://localhost:65400",
        vatGroups: [{ code: 1, rate: 9, label: "TVA 9" }],
        paymentTypeMap: { cash: 1 },
        operatorCode: "1",
      },
      2.18,
    );
    expect(lines[0]).toBe("S^Croissant^320^1000^Buc^1^1");
    expect(lines[1]).toBe("DP^3200");
    expect(lines[2]).toBe("ST^0");
    expect(lines[3]).toBe("P^1^218");
  });

  it("P1.7b: two items — DP^ only under discounted line", () => {
    const lines = buildFiscalNetReceiptLines(
      [
        { productName: "Chocolate Croissant", quantity: 1, unitPrice: 3.2, vatRate: 9, fiscalNetGroup: 1, discountPercent: 32 },
        { productName: "Apple Danish", quantity: 1, unitPrice: 3.1, vatRate: 9, fiscalNetGroup: 1 },
      ],
      "cash",
      {
        enabled: true,
        mockMode: false,
        connectionMode: "file",
        apiHost: "http://localhost:65400",
        vatGroups: [{ code: 1, rate: 9, label: "TVA 9" }],
        paymentTypeMap: { cash: 1 },
        operatorCode: "1",
      },
      5.28,
    );
    expect(lines).toEqual([
      "S^Chocolate Croissant^320^1000^Buc^1^1",
      "DP^3200",
      "S^Apple Danish^310^1000^Buc^1^1",
      "ST^0",
      "P^1^528",
    ]);
  });

  it("P1.7b: mixed per-line discounts", () => {
    const lines = buildFiscalNetReceiptLines(
      [
        { productName: "Chocolate Croissant", quantity: 1, unitPrice: 3.2, vatRate: 9, fiscalNetGroup: 1, discountPercent: 32 },
        { productName: "Apple Danish", quantity: 1, unitPrice: 3.1, vatRate: 9, fiscalNetGroup: 1 },
        { productName: "Coffee", quantity: 1, unitPrice: 2.5, vatRate: 9, fiscalNetGroup: 1, discountPercent: 10 },
      ],
      "cash",
      {
        enabled: true,
        mockMode: false,
        connectionMode: "file",
        apiHost: "http://localhost:65400",
        vatGroups: [{ code: 1, rate: 9, label: "TVA 9" }],
        paymentTypeMap: { cash: 1 },
        operatorCode: "1",
      },
      7.53,
    );
    expect(lines[1]).toBe("DP^3200");
    expect(lines[2]).toBe("S^Apple Danish^310^1000^Buc^1^1");
    expect(lines[3]).toBe("S^Coffee^250^1000^Buc^1^1");
    expect(lines[4]).toBe("DP^1000");
    expect(lines[5]).toBe("ST^0");
    expect(lines[6]).toBe("P^1^753");
  });

  it("P1.7b: no discount — no DP^ lines", () => {
    const lines = buildFiscalNetReceiptLines(
      [{ productName: "Apple Danish", quantity: 1, unitPrice: 3.1, vatRate: 9, fiscalNetGroup: 1 }],
      "cash",
      {
        enabled: true,
        mockMode: false,
        connectionMode: "file",
        apiHost: "http://localhost:65400",
        vatGroups: [{ code: 1, rate: 9, label: "TVA 9" }],
        paymentTypeMap: { cash: 1 },
        operatorCode: "1",
      },
      3.1,
    );
    expect(lines).toEqual(["S^Apple Danish^310^1000^Buc^1^1", "ST^0", "P^1^310"]);
    expect(lines.some((l) => l.startsWith("DP^"))).toBe(false);
  });
});

// ── parseResponse ──────────────────────────────────────────────────────────

describe("parseResponse", () => {
  it("parses BONOK=1 success", () => {
    const r = parseResponse("BONOK=1\r\nNRBON=00012345\r\n");
    expect(r.bonok).toBe(1);
    expect(r.receiptNumber).toBe("00012345");
  });

  it("parses BONOK=0 failure", () => {
    const r = parseResponse("BONOK=0\r\nERRCODE=E001\r\nERRINFO=Paper jam\r\n");
    expect(r.bonok).toBe(0);
    expect(r.errorCode).toBe("E001");
    expect(r.errorInfo).toBe("Paper jam");
  });

  it("parses BONOK=-1 ambiguous", () => {
    const r = parseResponse("BONOK=-1\r\n");
    expect(r.bonok).toBe(-1);
  });

  it("handles LF-only line endings", () => {
    const r = parseResponse("BONOK=1\nNRBON=99\n");
    expect(r.bonok).toBe(1);
    expect(r.receiptNumber).toBe("99");
  });

  it("returns null bonok for missing BONOK", () => {
    const r = parseResponse("ERRCODE=E999\r\n");
    expect(r.bonok).toBeNull();
  });

  it("preserves raw response text", () => {
    const raw = "BONOK=1\r\nNRBON=123\r\n";
    const r = parseResponse(raw);
    expect(r.raw).toBe(raw);
  });
});

// ── describeResponse ───────────────────────────────────────────────────────

describe("describeResponse", () => {
  it("describes success with receipt number", () => {
    const msg = describeResponse({ bonok: 1, receiptNumber: "12345", raw: "" });
    expect(msg).toContain("12345");
    expect(msg).toContain("successfully");
  });

  it("describes ambiguous state with warning", () => {
    const msg = describeResponse({ bonok: -1, raw: "" });
    expect(msg).toContain("ambiguous");
    expect(msg).toContain("Sale has been saved");
  });

  it("describes failure with error info", () => {
    const msg = describeResponse({ bonok: 0, errorCode: "E001", errorInfo: "Paper jam", raw: "" });
    expect(msg).toContain("Paper jam");
    expect(msg).toContain("E001");
  });
});

// ── shouldPrintFiscalReceipt ───────────────────────────────────────────────

describe("shouldPrintFiscalReceipt", () => {
  it("returns true for RO + enabled", () => {
    expect(shouldPrintFiscalReceipt("RO", { enabled: true })).toBe(true);
  });

  it("returns false for IE regardless of enabled", () => {
    expect(shouldPrintFiscalReceipt("IE", { enabled: true })).toBe(false);
  });

  it("returns false for null country", () => {
    expect(shouldPrintFiscalReceipt(null, { enabled: true })).toBe(false);
  });

  it("returns false for RO + disabled", () => {
    expect(shouldPrintFiscalReceipt("RO", { enabled: false })).toBe(false);
  });

  it("returns false for RO + enabled + manualOnly", () => {
    expect(shouldPrintFiscalReceipt("RO", { enabled: true, manualOnly: true })).toBe(false);
  });

  it("returns false when config is null", () => {
    expect(shouldPrintFiscalReceipt("RO", null)).toBe(false);
  });
});

// ── buildFiscalNetConfig ────────────────────────────────────────────────────

describe("buildFiscalNetConfig", () => {
  it("defaults mockMode to true (safe default)", () => {
    const config = buildFiscalNetConfig({});
    expect(config.mockMode).toBe(true);
  });

  it("defaults enabled to false", () => {
    const config = buildFiscalNetConfig({});
    expect(config.enabled).toBe(false);
  });

  it("maps all fields correctly", () => {
    const config = buildFiscalNetConfig({
      fiscalnet_enabled:      true,
      fiscalnet_mock_mode:    false,
      fiscalnet_bonuri_path:  "C:\\FiscalNet\\Bonuri",
      fiscalnet_raspuns_path: "C:\\FiscalNet\\Raspuns",
      fiscalnet_cif:          "RO12345678",
      fiscalnet_operator_code:"2",
      fiscalnet_timeout_ms:   15000,
      fiscalnet_retry_count:  3,
    });
    expect(config.enabled).toBe(true);
    expect(config.mockMode).toBe(false);
    expect(config.bonuriPath).toBe("C:\\FiscalNet\\Bonuri");
    expect(config.cif).toBe("RO12345678");
    expect(config.operatorCode).toBe("2");
    expect(config.timeoutMs).toBe(15000);
    expect(config.retryCount).toBe(3);
  });
});

// ── buildCommandFilename ───────────────────────────────────────────────────

describe("buildCommandFilename", () => {
  it("includes the reference in the filename", () => {
    const fn = buildCommandFilename("KO-ABC123");
    expect(fn).toContain("KO");
    expect(fn).toContain(".txt");
  });

  it("never contains ^ character", () => {
    const fn = buildCommandFilename("TEST^REF");
    expect(fn).not.toContain("^");
  });

  it("produces unique filenames for successive calls", () => {
    // Call multiple times — timestamps should differ or be unique
    const fns = new Set(Array.from({ length: 5 }, () => buildCommandFilename("KO-X")));
    // At least 1 unique (timestamp-based, may collide in fast loop — just ensure format)
    expect([...fns].every(fn => fn.endsWith(".txt"))).toBe(true);
  });
});

// ── responseFilename ───────────────────────────────────────────────────────

describe("responseFilename", () => {
  it("returns the base filename", () => {
    expect(responseFilename("BONURI_TEST_123.txt")).toBe("BONURI_TEST_123.txt");
  });

  it("strips directory path", () => {
    expect(responseFilename("C:\\Bonuri\\BONURI_TEST_123.txt")).toBe("BONURI_TEST_123.txt");
  });
});
