import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";
import { buildConsumPdfCopy } from "@/lib/reports/consum-copy";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementProduct,
  stockMovementUnitCost,
  stockMovementUnit,
} from "@/lib/ro-accounting/stock-movements";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? monthStart;
  const to = searchParams.get("to") ?? today;
  const dayStart = `${from}T00:00:00.000Z`;
  const dayEnd = `${to}T23:59:59.999Z`;

  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, orgId, org, currency, generatedBy } = ctx;

  const movements = await fetchStockMovements(supabase, orgId, {
    movementType: "sale_used",
    from: dayStart,
    to: dayEnd,
  });

  // unitCost/totalCost only ever reflect the KNOWN-cost portion of a
  // product's movements — a missing historical cost is never filled in
  // from today's price. hasGap marks a product with at least one
  // contributing movement that had no recorded cost, so its totalCost is a
  // floor, not the complete figure; see footnote below.
  const aggregated = new Map<
    string,
    { name: string; unit: string; quantity: number; unitCost: number | null; totalCost: number; hasGap: boolean }
  >();
  for (const m of movements) {
    const prod = stockMovementProduct(m);
    const productName = prod?.name ?? "—";
    const unit = stockMovementUnit(m);
    const qty = Math.abs(stockMovementQty(m));
    const unitCost = stockMovementUnitCost(m);

    const existing = aggregated.get(productName) ?? {
      name: productName,
      unit,
      quantity: 0,
      unitCost: null,
      totalCost: 0,
      hasGap: false,
    };
    existing.quantity += qty;
    if (unitCost != null) {
      existing.totalCost += qty * unitCost;
      existing.unitCost = unitCost;
    } else {
      existing.hasGap = true;
    }
    aggregated.set(productName, existing);
  }

  const items = Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
  const copy = buildConsumPdfCopy();
  const money = (v: number) => formatMoney(v, currency);
  const totalValue = items.reduce((s, i) => s + i.totalCost, 0);
  const hasAnyGap = items.some((i) => i.hasGap);

  const { data: bcNum } = await supabase.rpc("assign_bc_number", { p_org_id: orgId, p_from: from, p_to: to });
  const documentNumber = (bcNum as string | null) ?? `BC-${from.replace(/-/g, "")}`;

  const pdfRows: PdfRow[] = items.map((item, idx) => ({
    nr: idx + 1,
    product: item.name,
    unit: item.unit,
    quantity: item.quantity.toFixed(2),
    unitCost: item.unitCost != null ? money(item.unitCost) : "—",
    totalCost: item.unitCost != null ? `${money(item.totalCost)}${item.hasGap ? ` (${copy.partialMarker})` : ""}` : "—",
  }));
  pdfRows.push({
    nr: "",
    product: copy.total,
    unit: "",
    quantity: "",
    unitCost: "",
    totalCost: `${money(totalValue)}${hasAnyGap ? ` (${copy.partialMarker})` : ""}`,
    _rowStyle: "total",
  });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: copy.title,
    subtitle: `Document nr. ${documentNumber}`,
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: copy.itemCount, value: String(items.length) },
      { label: copy.totalValue, value: money(totalValue) },
    ],
    footnote: hasAnyGap
      ? copy.costGapNote
      : undefined,
    columns: [
      { key: "nr", label: copy.columns.rowNo, align: "right", width: "6%" },
      { key: "product", label: copy.columns.product, width: "36%" },
      { key: "unit", label: copy.columns.unit, width: "10%" },
      { key: "quantity", label: copy.columns.quantity, align: "right", width: "16%" },
      { key: "unitCost", label: copy.columns.unitCost, align: "right", width: "16%" },
      { key: "totalCost", label: copy.columns.totalCost, align: "right", width: "16%" },
    ],
    rows: pdfRows,
    signatureLabels: [...copy.signatureLabels],
  });

  return renderReportPdfResponse(doc, `bon-consum-${from}-${to}.pdf`);
}
