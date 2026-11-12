import { describe, expect, it } from "vitest";
import { detectCsvDelimiter, parseCsvRecords, parseCsvRows } from "./csv";
import { parseLocaleNumber } from "./ro-number";

describe("detectCsvDelimiter", () => {
  it("detects comma, semicolon and tab from the header", () => {
    expect(detectCsvDelimiter("name,category,sale_price_gross\nA,B,1")).toBe(",");
    expect(detectCsvDelimiter("name;category;sale_price_gross\nA;B;14,50")).toBe(";");
    expect(detectCsvDelimiter("name\tcategory\nA\tB")).toBe("\t");
  });

  it("ignores separators inside quotes and handles a BOM", () => {
    expect(detectCsvDelimiter('"a,b";c;d\n1;2;3')).toBe(";");
    expect(detectCsvDelimiter("﻿name;price\nx;1")).toBe(";");
  });

  it("defaults to comma for a single column", () => {
    expect(detectCsvDelimiter("name\nA")).toBe(",");
  });
});

describe("parseCsvRecords", () => {
  it("reads a Romanian Excel CSV (semicolon + decimal comma)", () => {
    const text = "﻿name;category;sale_price_gross;vat_rate\r\nCappuccino;Cafea;14,50;11\r\nCeai verde;Ceai;1.234,50;11\r\n";
    const rows = parseCsvRecords(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "Cappuccino", category: "Cafea", sale_price_gross: "14,50", vat_rate: "11" });
    expect(parseLocaleNumber(rows[0].sale_price_gross)).toBe(14.5);
    expect(parseLocaleNumber(rows[1].sale_price_gross)).toBe(1234.5);
  });

  it("still reads a comma CSV with quoted cells", () => {
    const rows = parseCsvRecords('name,category,sale_price_gross\n"Latte, mare",Cafea,16.00\n');
    expect(rows).toEqual([{ name: "Latte, mare", category: "Cafea", sale_price_gross: "16.00" }]);
  });

  it("can keep header case", () => {
    expect(parseCsvRecords("Name;SKU\nA;1", { lowercaseHeaders: false })).toEqual([{ Name: "A", SKU: "1" }]);
  });

  it("drops empty lines", () => {
    expect(parseCsvRows("a;b\n\n1;2\n;\n")).toEqual([["a", "b"], ["1", "2"]]);
  });
});
