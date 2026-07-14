import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { computeLoyaltyRoiReport } from "@/lib/reports/loyalty-roi-data";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";

const rewardLabel = (code: string) =>
  code === "discount" ? "Reducere" : code === "free_item" ? "Produs gratuit" : code;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? monthStart;
  const to = searchParams.get("to") ?? today;

  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, orgId, org, currency, generatedBy } = ctx;

  const report = await computeLoyaltyRoiReport(supabase, orgId, from, to);
  const money = (v: number) => formatMoney(v, currency);

  const pdfRows: PdfRow[] = [
    { section: "Rezumat", label: "Cheltuială medie clienți fideli", value: money(report.avgSpendLoyalty) },
    { section: "Rezumat", label: "Cheltuială medie clienți neînregistrați", value: money(report.avgSpendNonLoyalty) },
    { section: "Rezumat", label: "Rată de retenție", value: `${report.retentionRate}%`, _rowStyle: "total" },
  ];
  for (const r of report.topRewards) {
    pdfRows.push({
      section: "Recompense răscumpărate",
      label: rewardLabel(r.reward_label),
      value: `${r.redemption_count} răscumpărări — ${r.stamps_used_total} ștampile`,
    });
  }

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Raport Loialitate — ROI",
    subtitle: "Cheltuială medie, retenție și recompense răscumpărate",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Cheltuială medie (fideli)", value: money(report.avgSpendLoyalty) },
      { label: "Cheltuială medie (non-fideli)", value: money(report.avgSpendNonLoyalty) },
      { label: "Rată de retenție", value: `${report.retentionRate}%` },
      { label: "Clienți cu 1+ vizită", value: String(report.customersVisited) },
    ],
    columns: [
      { key: "section", label: "Secțiune", width: "25%" },
      { key: "label", label: "Detaliu", width: "40%" },
      { key: "value", label: "Valoare", align: "right", width: "35%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură"],
  });

  return renderReportPdfResponse(doc, `raport-loialitate-roi-${from}-${to}.pdf`);
}
