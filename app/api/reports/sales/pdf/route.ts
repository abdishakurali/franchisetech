import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { computeSalesReport } from "@/lib/reports/sales-data";
import { listAccessibleSites } from "@/lib/site-context";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? monthStart;
  const to = searchParams.get("to") ?? today;
  const periodStart = `${from}T00:00:00.000Z`;
  const periodEnd = `${to}T23:59:59.999Z`;

  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, userId, orgId, org, currency, generatedBy } = ctx;

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("id,role")
    .eq("user_id", userId)
    .eq("organisation_id", orgId)
    .single();
  const accessibleSites = await listAccessibleSites(supabase, orgId, membership?.id ?? "", membership?.role ?? "staff");
  const siteIds = accessibleSites.map((s) => s.id);

  const { productRows, byPayment, vatByRate, totalGross, totalNet, totalVat, totalDiscounts, grossExTips, transactionCount, voidedCount } =
    await computeSalesReport(supabase, orgId, siteIds, periodStart, periodEnd, "—");

  const money = (v: number) => formatMoney(v, currency);
  const pdfRows: PdfRow[] = [];
  for (const [rate, v] of Array.from(vatByRate.entries()).sort(([a], [b]) => a - b)) {
    pdfRows.push({ section: "TVA", label: `${rate}%`, value: `${money(v.net)} net / ${money(v.vat)} TVA / ${money(v.gross)} brut` });
  }
  for (const [name, total] of byPayment.entries()) {
    pdfRows.push({ section: "Plăți", label: name, value: money(total) });
  }
  pdfRows.push({ section: "Rezumat", label: "Vânzări brute", value: money(totalGross), _rowStyle: "total" });
  pdfRows.push({ section: "Rezumat", label: "Discounturi acordate", value: money(totalDiscounts) });
  pdfRows.push({ section: "Rezumat", label: "Tranzacții anulate", value: String(voidedCount) });
  for (const r of productRows.slice(0, 10)) {
    pdfRows.push({ section: "Top produse", label: r.name, value: `${r.qty} buc — ${money(r.total)}` });
  }

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Raport Vânzări",
    subtitle: "Rezumat vânzări, TVA, plăți și top produse",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Vânzări nete", value: money(totalNet || grossExTips - totalVat) },
      { label: "TVA colectat", value: money(totalVat) },
      { label: "Vânzări brute", value: money(grossExTips) },
      { label: "Tranzacții", value: String(transactionCount) },
    ],
    columns: [
      { key: "section", label: "Secțiune", width: "20%" },
      { key: "label", label: "Detaliu", width: "35%" },
      { key: "value", label: "Valoare", align: "right", width: "45%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură"],
  });

  return renderReportPdfResponse(doc, `raport-vanzari-${from}-${to}.pdf`);
}
