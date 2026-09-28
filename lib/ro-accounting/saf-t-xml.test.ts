import { describe, expect, it } from "vitest";
import { generateSaftXml, movementTypeCodeFor, MOVEMENT_TYPE_TABLE } from "./saf-t-xml";

describe("movementTypeCodeFor", () => {
  it("maps all 6 real stock_movements.movement_type values", () => {
    expect(movementTypeCodeFor("purchase_received")).toBe("AR");
    expect(movementTypeCodeFor("sale_used")).toBe("VZ");
    expect(movementTypeCodeFor("wastage")).toBe("SC");
    expect(movementTypeCodeFor("manual_adjustment")).toBe("AJ");
    expect(movementTypeCodeFor("return")).toBe("RT");
    expect(movementTypeCodeFor("opening")).toBe("SI");
  });

  it("falls back to AJ for an unrecognized type rather than throwing", () => {
    expect(movementTypeCodeFor("something_new")).toBe("AJ");
  });

  it("MOVEMENT_TYPE_TABLE has exactly one entry per code, no duplicates", () => {
    const codes = MOVEMENT_TYPE_TABLE.map((m) => m.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("generateSaftXml", () => {
  const baseInput = {
    header: {
      cif: "RO12345678",
      companyName: "Test SRL",
      selectionStartDate: "2026-09-01",
      selectionEndDate: "2026-09-30",
    },
    suppliers: [{ supplierId: "sup-1", name: "Furnizor Test" }],
    products: [{ productCode: "prod-1", description: "Cafea boabe", unitOfMeasure: "kg" }],
    taxRates: [{ name: "TVA Standard 21%", rate: 21 }],
    movements: [
      {
        productCode: "prod-1",
        quantity: 10,
        unitOfMeasure: "kg",
        dbMovementType: "purchase_received",
        movementDate: "2026-09-05T10:00:00.000Z",
        bookValue: 500,
        supplierId: "sup-1",
      },
      {
        productCode: "prod-1",
        quantity: -2,
        unitOfMeasure: "kg",
        dbMovementType: "sale_used",
        movementDate: "2026-09-06T12:00:00.000Z",
        bookValue: 100,
      },
    ],
  };

  it("produces well-formed XML with the real AuditFile root and namespace", () => {
    const xml = generateSaftXml(baseInput);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<AuditFile xmlns="mfp:anaf:dgti:d406:declaratie:v1">');
    expect(xml).toContain("</AuditFile>");
  });

  it("nests StockMovement under SourceDocuments > MovementOfGoods, not a flat GoodsTransactions element", () => {
    const xml = generateSaftXml(baseInput);
    expect(xml).toContain("<SourceDocuments>");
    expect(xml).toContain("<MovementOfGoods>");
    expect(xml).toContain("<StockMovement>");
    expect(xml).not.toContain("GoodsTransactions");
  });

  it("declares all 6 movement types in MasterFiles > MovementTypeTable", () => {
    const xml = generateSaftXml(baseInput);
    expect(xml).toContain("<MovementTypeTable>");
    for (const { code } of MOVEMENT_TYPE_TABLE) {
      expect(xml).toContain(`<MovementType>${code}</MovementType>`);
    }
  });

  it("escapes XML-unsafe characters in free text fields", () => {
    const xml = generateSaftXml({
      ...baseInput,
      header: { ...baseInput.header, companyName: 'Cafe "Test" & Co <SRL>' },
    });
    expect(xml).toContain("Cafe &quot;Test&quot; &amp; Co &lt;SRL&gt;");
    expect(xml).not.toContain("<SRL>");
  });

  it("uses a positive quantity even for outbound (negative) movements", () => {
    const xml = generateSaftXml(baseInput);
    expect(xml).not.toContain("<Quantity>-2.000</Quantity>");
    expect(xml).toContain("<Quantity>2.000</Quantity>");
  });

  it("groups lines from the same day and movement type under one StockMovement", () => {
    const xml = generateSaftXml({
      ...baseInput,
      movements: [
        { productCode: "prod-1", quantity: 5, unitOfMeasure: "kg", dbMovementType: "purchase_received", movementDate: "2026-09-05T09:00:00.000Z", supplierId: "sup-1" },
        { productCode: "prod-1", quantity: 3, unitOfMeasure: "kg", dbMovementType: "purchase_received", movementDate: "2026-09-05T15:00:00.000Z", supplierId: "sup-1" },
      ],
    });
    const movementCount = (xml.match(/<StockMovement>/g) ?? []).length;
    expect(movementCount).toBe(1);
    const lineCount = (xml.match(/<StockMovementLine>/g) ?? []).length;
    expect(lineCount).toBe(2);
  });
});
