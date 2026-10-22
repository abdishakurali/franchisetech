import { describe, expect, it } from "vitest";
import { toStockQuantity } from "@/lib/invoice-stock-units";

describe("toStockQuantity", () => {
  it("converts grams on the invoice to a product stocked in kg (50 g matcha → 0.05 kg)", () => {
    expect(toStockQuantity(50, "GRM", "kg")).toEqual({ ok: true, stockQty: 0.05 });
  });

  it("converts kg to g and ml to litre", () => {
    expect(toStockQuantity(1.5, "KGM", "g")).toEqual({ ok: true, stockQty: 1500 });
    expect(toStockQuantity(250, "MLT", "litre")).toEqual({ ok: true, stockQty: 0.25 });
  });

  it("keeps same-unit quantities unchanged", () => {
    expect(toStockQuantity(3, "kg", "kg")).toEqual({ ok: true, stockQty: 3 });
    expect(toStockQuantity(36, "C62", "each")).toEqual({ ok: true, stockQty: 36 });
  });

  it("treats a piece as one of a product's discrete unit (pack, bottle)", () => {
    expect(toStockQuantity(3, "C62", "pack")).toEqual({ ok: true, stockQty: 3 });
    expect(toStockQuantity(2, "SET", "box")).toEqual({ ok: true, stockQty: 2 });
  });

  it("refuses to convert pieces into mass or volume", () => {
    const r = toStockQuantity(1, "C62", "kg");
    expect(r.ok).toBe(false);
    expect(toStockQuantity(1, "KGM", "litre").ok).toBe(false);
  });

  it("rejects zero or negative quantities", () => {
    expect(toStockQuantity(0, "KGM", "kg").ok).toBe(false);
    expect(toStockQuantity(-1, "KGM", "kg").ok).toBe(false);
  });
});
