import { formatMoney } from "@/lib/kitchenops/metrics";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { computeBalantaReport } from "@/lib/ro-accounting/balanta-data";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? monthStart;
  const to = searchParams.get("to") ?? today;

  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, orgId, org, currency, generatedBy } = ctx;

  try {
    await assertEntitlement(orgId, "reports.gestiune", { write: false });
  } catch (error) {
    const response = entitlementDeniedResponse(error);
    if (response) return response;
    throw error;
  }

  const { items, totals } = await computeBalantaReport(supabase, orgId, from, to, "—");
  const money = (v: number) => formatMoney(v, currency);

  const pdfRows: PdfRow[] = items.map((item, idx) => ({
    nr: idx + 1,
    product: item.productName,
    unit: item.unit,
    openingQty: item.openingQty.toFixed(2),
    openingValue: money(item.openingValue),
    entryQty: item.entryQty.toFixed(2),
    entryValue: money(item.entryValue),
    exitQty: item.exitQty.toFixed(2),
    exitValue: money(item.exitValue),
    closingQty: item.closingQty.toFixed(2),
    closingValue: money(item.closingValue),
  }));
  pdfRows.push({
    nr: "", product: "TOTAL", unit: "",
    openingQty: "", openingValue: money(totals.openingValue),
    entryQty: "", entryValue: money(totals.entryValue),
    exitQty: "", exitValue: money(totals.exitValue),
    closingQty: "", closingValue: money(totals.closingValue),
    _rowStyle: "total",
  });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Balanță Cantitativ-Valorică",
    subtitle: "Stoc inițial, intrări, ieșiri și stoc final pe produs",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    orientation: "landscape",
    summary: [
      { label: "Stoc inițial", value: money(totals.openingValue) },
      { label: "Total intrări", value: money(totals.entryValue) },
      { label: "Total ieșiri", value: money(totals.exitValue) },
      { label: "Stoc final", value: money(totals.closingValue) },
    ],
    columns: [
      { key: "nr", label: "Nr.", align: "right", width: "4%" },
      { key: "product", label: "Produs", width: "20%" },
      { key: "unit", label: "UM", width: "6%" },
      { key: "openingQty", label: "Cant.", align: "right", width: "8%" },
      { key: "openingValue", label: "Valoare", align: "right", width: "10%" },
      { key: "entryQty", label: "Cant.", align: "right", width: "8%" },
      { key: "entryValue", label: "Valoare", align: "right", width: "10%" },
      { key: "exitQty", label: "Cant.", align: "right", width: "8%" },
      { key: "exitValue", label: "Valoare", align: "right", width: "10%" },
      { key: "closingQty", label: "Cant.", align: "right", width: "8%" },
      { key: "closingValue", label: "Valoare", align: "right", width: "8%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură contabil"],
  });

  return renderReportPdfResponse(doc, `balanta-${from}-${to}.pdf`);
}
