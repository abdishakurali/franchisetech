import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
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

  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("status,pos_transaction_items(vat_rate,net_amount,vat_amount,gross_amount,line_total)")
    .eq("organisation_id", orgId)
    .gte("sold_at", `${from}T00:00:00Z`)
    .lte("sold_at", `${to}T23:59:59Z`);

  const byRate = new Map<number, { net: number; vat: number; gross: number; count: number }>();
  for (const tx of (transactions ?? []) as Array<{
    status: string;
    pos_transaction_items: Array<{ vat_rate: number | null; net_amount: number | null; vat_amount: number | null; gross_amount: number | null; line_total: number | null }>;
  }>) {
    if (tx.status === "voided") continue;
    for (const item of tx.pos_transaction_items ?? []) {
      const rate = Number(item.vat_rate ?? 0);
      const gross = Number(item.gross_amount ?? item.line_total ?? 0);
      const vat = Number(item.vat_amount ?? 0);
      const net = Number(item.net_amount ?? gross - vat);
      const entry = byRate.get(rate) ?? { net: 0, vat: 0, gross: 0, count: 0 };
      entry.net += net;
      entry.vat += vat;
      entry.gross += gross;
      entry.count++;
      byRate.set(rate, entry);
    }
  }

  const money = (v: number) => formatMoney(v, currency);
  const rows = Array.from(byRate.entries()).sort(([a], [b]) => a - b);
  const totNet = rows.reduce((s, [, v]) => s + v.net, 0);
  const totVat = rows.reduce((s, [, v]) => s + v.vat, 0);
  const totGross = rows.reduce((s, [, v]) => s + v.gross, 0);
  const totCount = rows.reduce((s, [, v]) => s + v.count, 0);

  const pdfRows: PdfRow[] = rows.map(([rate, v]) => ({
    rate: `${rate}%`,
    net: money(v.net),
    vat: money(v.vat),
    gross: money(v.gross),
    count: v.count,
  }));
  pdfRows.push({ rate: "TOTAL", net: money(totNet), vat: money(totVat), gross: money(totGross), count: totCount, _rowStyle: "total" });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Raport TVA",
    subtitle: "Defalcare TVA pe cote",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Vânzări nete", value: money(totNet) },
      { label: "TVA colectat", value: money(totVat) },
      { label: "Vânzări brute", value: money(totGross) },
    ],
    columns: [
      { key: "rate", label: "Cotă TVA", width: "20%" },
      { key: "net", label: "Net", align: "right", width: "22%" },
      { key: "vat", label: "TVA", align: "right", width: "22%" },
      { key: "gross", label: "Brut", align: "right", width: "22%" },
      { key: "count", label: "Tranzacții", align: "right", width: "14%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură contabil"],
  });

  return renderReportPdfResponse(doc, `raport-tva-${from}-${to}.pdf`);
}
