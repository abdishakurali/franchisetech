import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";
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

  const aggregated = new Map<string, { name: string; unit: string; quantity: number; unitCost: number; totalCost: number }>();
  for (const m of movements) {
    const prod = stockMovementProduct(m);
    const productName = prod?.name ?? "—";
    const unit = stockMovementUnit(m);
    const qty = Math.abs(stockMovementQty(m));
    const unitCost = stockMovementUnitCost(m);

    const existing = aggregated.get(productName);
    if (existing) {
      existing.quantity += qty;
      existing.totalCost += qty * unitCost;
      if (unitCost > 0) existing.unitCost = unitCost;
    } else {
      aggregated.set(productName, { name: productName, unit, quantity: qty, unitCost, totalCost: qty * unitCost });
    }
  }

  const items = Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));
  const money = (v: number) => formatMoney(v, currency);
  const totalValue = items.reduce((s, i) => s + i.totalCost, 0);

  const { data: bcNum } = await supabase.rpc("assign_bc_number", { p_org_id: orgId, p_from: from, p_to: to });
  const documentNumber = (bcNum as string | null) ?? `BC-${from.replace(/-/g, "")}`;

  const pdfRows: PdfRow[] = items.map((item, idx) => ({
    nr: idx + 1,
    product: item.name,
    unit: item.unit,
    quantity: item.quantity.toFixed(2),
    unitCost: money(item.unitCost),
    totalCost: money(item.totalCost),
  }));
  pdfRows.push({ nr: "", product: "TOTAL", unit: "", quantity: "", unitCost: "", totalCost: money(totalValue), _rowStyle: "total" });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Bon de Consum",
    subtitle: `Document nr. ${documentNumber}`,
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Articole", value: String(items.length) },
      { label: "Valoare totală", value: money(totalValue) },
    ],
    columns: [
      { key: "nr", label: "Nr.", align: "right", width: "6%" },
      { key: "product", label: "Produs", width: "36%" },
      { key: "unit", label: "UM", width: "10%" },
      { key: "quantity", label: "Cantitate", align: "right", width: "16%" },
      { key: "unitCost", label: "Cost unitar", align: "right", width: "16%" },
      { key: "totalCost", label: "Cost total", align: "right", width: "16%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Predător (bucătărie)", "Primitor"],
  });

  return renderReportPdfResponse(doc, `bon-consum-${from}-${to}.pdf`);
}
