import { describe, expect, it } from "vitest";
import { buildConsumPdfCopy } from "./consum-copy";

describe("buildConsumPdfCopy", () => {
  it("uses the same Romanian accounting vocabulary as the Consum screen", () => {
    expect(buildConsumPdfCopy()).toEqual({
      title: "Bon de Consum",
      itemCount: "Articole consumate",
      totalValue: "Valoare totală",
      columns: {
        rowNo: "Nr.",
        product: "Produs",
        unit: "UM",
        quantity: "Cantitate",
        unitCost: "Preț unitar",
        totalCost: "Valoare",
      },
      total: "TOTAL",
      partialMarker: "parțial",
      costGapNote:
        "Unele mișcări din această perioadă nu au cost înregistrat. Valorile marcate \"parțial\" sunt un minim cunoscut, nu cifra completă — un cost lipsă nu este completat niciodată din prețul curent.",
      signatureLabels: ["Întocmit", "Primit"],
    });
  });
});
