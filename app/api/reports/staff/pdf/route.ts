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
    .select("sold_by,total,tip_amount,discount_total,status")
    .eq("organisation_id", orgId)
    .gte("sold_at", from)
    .lte("sold_at", `${to}T23:59:59.999`);

  const tx = transactions ?? [];
  const userIds = [...new Set(tx.map((t) => t.sold_by).filter(Boolean))] as string[];
  const profileMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id,full_name,email").in("id", userIds);
    for (const p of profiles ?? []) profileMap.set(p.id, p.full_name || p.email || p.id.slice(0, 8));
  }

  type CashierRow = { name: string; count: number; totalRevenue: number; totalDiscounts: number; totalTips: number; voids: number };
  const byUser = new Map<string, CashierRow>();
  for (const row of tx) {
    const userId = row.sold_by ?? "unknown";
    const name = profileMap.get(userId) ?? "—";
    const entry = byUser.get(userId) ?? { name, count: 0, totalRevenue: 0, totalDiscounts: 0, totalTips: 0, voids: 0 };
    if (row.status === "voided") {
      entry.voids++;
    } else {
      entry.count++;
      entry.totalRevenue += Number(row.total ?? 0);
      entry.totalDiscounts += Number(row.discount_total ?? 0);
      entry.totalTips += Number(row.tip_amount ?? 0);
    }
    byUser.set(userId, entry);
  }
  const rows = [...byUser.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const money = (v: number) => formatMoney(v, currency);

  const pdfRows: PdfRow[] = rows.map((r) => ({
    cashier: r.name,
    total: money(r.totalRevenue),
    count: r.count,
    avgTicket: money(r.count > 0 ? r.totalRevenue / r.count : 0),
    discounts: r.totalDiscounts > 0 ? money(r.totalDiscounts) : "—",
    tips: r.totalTips > 0 ? money(r.totalTips) : "—",
    voids: r.voids > 0 ? r.voids : "—",
  }));

  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalDiscounts = rows.reduce((s, r) => s + r.totalDiscounts, 0);
  const totalTips = rows.reduce((s, r) => s + r.totalTips, 0);
  pdfRows.push({
    cashier: "TOTAL", total: money(totalRevenue), count: rows.reduce((s, r) => s + r.count, 0),
    avgTicket: "", discounts: money(totalDiscounts), tips: money(totalTips), voids: rows.reduce((s, r) => s + r.voids, 0),
    _rowStyle: "total",
  });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Performanță personal",
    subtitle: "Tranzacții, discounturi și bacșiș pe casier",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Vânzări totale", value: money(totalRevenue) },
      { label: "Discounturi", value: money(totalDiscounts) },
      { label: "Bacșiș", value: money(totalTips) },
    ],
    columns: [
      { key: "cashier", label: "Casier", width: "24%" },
      { key: "total", label: "Total", align: "right", width: "16%" },
      { key: "count", label: "Tranz.", align: "right", width: "12%" },
      { key: "avgTicket", label: "Bon mediu", align: "right", width: "16%" },
      { key: "discounts", label: "Discounturi", align: "right", width: "12%" },
      { key: "tips", label: "Bacșiș", align: "right", width: "10%" },
      { key: "voids", label: "Anulări", align: "right", width: "10%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură manager"],
  });

  return renderReportPdfResponse(doc, `performanta-personal-${from}-${to}.pdf`);
}
