export const CONSUM_REPORT_RO_COPY = {
  title: "Bon de Consum",
  totalItems: "Articole consumate",
  totalValue: "Valoare totală",
  rowNo: "Nr.",
  product: "Produs",
  unit: "UM",
  quantity: "Cantitate",
  unitCost: "Preț unitar",
  totalCost: "Valoare",
  total: "TOTAL",
  partialTag: "parțial",
  costGapNote:
    "Unele mișcări din această perioadă nu au cost înregistrat. Valorile marcate \"parțial\" sunt un minim cunoscut, nu cifra completă — un cost lipsă nu este completat niciodată din prețul curent.",
  intocmit: "Întocmit",
  aprobat: "Aprobat",
  primit: "Primit",
} as const;

export function buildConsumPdfCopy() {
  const copy = CONSUM_REPORT_RO_COPY;
  return {
    title: copy.title,
    itemCount: copy.totalItems,
    totalValue: copy.totalValue,
    columns: {
      rowNo: copy.rowNo,
      product: copy.product,
      unit: copy.unit,
      quantity: copy.quantity,
      unitCost: copy.unitCost,
      totalCost: copy.totalCost,
    },
    total: copy.total,
    partialMarker: copy.partialTag,
    costGapNote: copy.costGapNote,
    signatureLabels: [copy.intocmit, copy.primit] as [string, string],
  } as const;
}
