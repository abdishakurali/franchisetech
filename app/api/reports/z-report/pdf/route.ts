import { formatMoney } from "@/lib/kitchenops/metrics";
import { getReportPdfContext } from "@/lib/pdf/pdf-route-context";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const date = searchParams.get("date") ?? today;
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const ctx = await getReportPdfContext();
  if ("error" in ctx) return ctx.error;
  const { supabase, orgId, org, currency, generatedBy } = ctx;

  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("*,payment_methods(name,type)")
    .eq("organisation_id", orgId)
    .gte("sold_at", dayStart)
    .lte("sold_at", dayEnd)
    .order("sold_at");

  const transactionIds = (transactions ?? []).map((tx) => tx.id);
  const { data: items } = transactionIds.length
    ? await supabase
        .from("pos_transaction_items")
        .select("product_name,quantity,line_total,vat_rate,net_amount,vat_amount,gross_amount,transaction_id")
        .eq("organisation_id", orgId)
        .in("transaction_id", transactionIds)
    : { data: [] as Array<{ product_name: string; quantity: number | null; line_total: number | null; vat_rate: number | null; net_amount: number | null; vat_amount: number | null; gross_amount: number | null; transaction_id: string }> };

  const completedTx = (transactions ?? []).filter((tx) => tx.status !== "voided");
  const voidedTx = (transactions ?? []).filter((tx) => tx.status === "voided");

  const totalGross = completedTx.reduce((s, tx) => s + Number(tx.total_gross ?? tx.total ?? 0), 0);
  const totalNet = completedTx.reduce((s, tx) => s + Number(tx.subtotal_net ?? 0), 0);
  const totalVat = completedTx.reduce((s, tx) => s + Number(tx.tax_total ?? 0), 0);
  const totalTips = completedTx.reduce((s, tx) => s + Number(tx.tip_amount ?? 0), 0);
  const grossExTips = totalGross - totalTips;

  const byPaymentType = new Map<string, number>();
  for (const tx of completedTx) {
    const method = firstJoined(tx.payment_methods as { name?: string; type?: string } | { name?: string; type?: string }[]);
    const name = (method as { name?: string | null } | null)?.name ?? "Altele";
    byPaymentType.set(name, (byPaymentType.get(name) ?? 0) + Number(tx.total ?? 0));
  }

  const completedItemTxIds = new Set(completedTx.map((tx) => tx.id));
  const completedItems = (items ?? []).filter((item) => completedItemTxIds.has(item.transaction_id));
  const vatByRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const item of completedItems) {
    const rate = Number(item.vat_rate ?? 0);
    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const net = Number(item.net_amount ?? gross - vat);
    const entry = vatByRate.get(rate) ?? { net: 0, vat: 0, gross: 0 };
    entry.net += net;
    entry.vat += vat;
    entry.gross += gross;
    vatByRate.set(rate, entry);
  }

  const money = (v: number) => formatMoney(v, currency);
  const pdfRows: PdfRow[] = Array.from(byPaymentType.entries()).map(([name, total]) => ({
    section: "Plăți",
    label: name,
    value: money(total),
  }));
  pdfRows.push({ section: "Plăți", label: "TOTAL încasat", value: money(totalGross), _rowStyle: "total" });
  for (const [rate, v] of Array.from(vatByRate.entries()).sort(([a], [b]) => a - b)) {
    pdfRows.push({ section: "TVA", label: `${rate}%`, value: `${money(v.net)} net / ${money(v.vat)} TVA / ${money(v.gross)} brut` });
  }
  pdfRows.push({ section: "Ajustări", label: "Tranzacții anulate", value: String(voidedTx.length) });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Raport Z Zilnic",
    subtitle: "Raport închidere casă de sfârșit de zi",
    periodLabel: `Data: ${date}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Tranzacții", value: String(completedTx.length) },
      { label: "Net", value: money(totalNet || totalGross - totalVat) },
      { label: "TVA colectat", value: money(totalVat) },
      { label: "Brut (fără bacșiș)", value: money(grossExTips) },
    ],
    columns: [
      { key: "section", label: "Secțiune", width: "20%" },
      { key: "label", label: "Detaliu", width: "35%" },
      { key: "value", label: "Valoare", align: "right", width: "45%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Semnătură manager", "Numărat de"],
  });

  return renderReportPdfResponse(doc, `raport-z-${date}.pdf`);
}
