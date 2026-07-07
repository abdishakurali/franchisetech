import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";
import { formatMoney } from "@/lib/kitchenops/metrics";
import { computeGestiuneReport } from "@/lib/ro-accounting/gestiune-data";
import { ReportPdfDocument, type PdfRow } from "@/lib/pdf/ReportPdfDocument";
import { renderReportPdfResponse } from "@/lib/pdf/renderReportPdf";

const DOC_TYPE_LABELS: Record<string, string> = {
  stoc_initial: "Stoc inițial",
  nir: "NIR",
  consum: "Bon de consum",
  vanzare: "Vânzare (Z)",
  stoc_final: "Stoc final",
  ajustare: "Ajustare",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? monthStart;
  const to = searchParams.get("to") ?? today;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return new NextResponse("No org", { status: 403 });
  const orgId = membership.organisation_id;

  try {
    await assertEntitlement(orgId, "reports.gestiune", { write: false });
  } catch (error) {
    const response = entitlementDeniedResponse(error);
    if (response) return response;
    throw error;
  }

  const { data: orgRow } = await supabase
    .from("organisations")
    .select("currency_code")
    .eq("id", orgId)
    .single();
  const currency = orgRow?.currency_code ?? "EUR";

  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();
  const generatedBy = profile?.full_name || profile?.email || user.email || "—";

  const { org, movements, totals, openingStock, closingStock } = await computeGestiuneReport(
    supabase,
    orgId,
    from,
    to,
    {
      openingBalance: "Sold la începutul perioadei",
      unknownSupplier: "Furnizor necunoscut",
      rawConsumption: "Consum materii prime",
      zReportItems: (count) => `Raport Z (${count} articole)`,
    },
  );

  const money = (v: number) => formatMoney(v, currency);

  const pdfRows: PdfRow[] = movements.map((m, idx) => ({
    nr: idx + 1,
    date: new Date(m.date).toLocaleDateString("ro-RO"),
    docType: DOC_TYPE_LABELS[m.documentType] ?? m.documentType,
    docNo: m.documentNumber ?? "—",
    description: m.description,
    tva19: money(m.tva19),
    tva9: money(m.tva9),
    tva5: money(m.tva5),
    tva0: money(m.tva0),
    total: money(m.total),
    ...(m.documentType === "stoc_initial" ? { _rowStyle: "section" as const } : {}),
  }));

  pdfRows.push({
    nr: "", date: "", docType: "", docNo: "", description: "TOTAL INTRĂRI",
    tva19: money(totals.intrari19), tva9: money(totals.intrari9), tva5: money(totals.intrari5), tva0: money(totals.intrari0), total: money(totals.intrariTotal),
    _rowStyle: "total",
  });
  pdfRows.push({
    nr: "", date: "", docType: "", docNo: "", description: "TOTAL IEȘIRI",
    tva19: money(totals.iesiri19), tva9: money(totals.iesiri9), tva5: money(totals.iesiri5), tva0: money(totals.iesiri0), total: money(totals.iesiriTotal),
    _rowStyle: "total",
  });
  pdfRows.push({
    nr: "", date: "", docType: "", docNo: "", description: "STOC FINAL",
    tva19: money(closingStock.tva19), tva9: money(closingStock.tva9), tva5: money(closingStock.tva5), tva0: money(closingStock.tva0), total: money(closingStock.total),
    _rowStyle: "section",
  });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Raport de Gestiune",
    subtitle: "Raport complet mișcări stoc cu defalcare TVA",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    orientation: "landscape",
    summary: [
      { label: "Stoc inițial", value: money(openingStock.total) },
      { label: "Total intrări", value: money(totals.intrariTotal) },
      { label: "Total ieșiri", value: money(totals.iesiriTotal) },
      { label: "Stoc final", value: money(closingStock.total) },
    ],
    columns: [
      { key: "nr", label: "Nr.", align: "right", width: "4%" },
      { key: "date", label: "Data", width: "8%" },
      { key: "docType", label: "Tip document", width: "10%" },
      { key: "docNo", label: "Nr. doc.", width: "8%" },
      { key: "description", label: "Descriere", width: "22%" },
      { key: "tva19", label: "TVA 21%", align: "right", width: "9%" },
      { key: "tva9", label: "TVA 11%", align: "right", width: "9%" },
      { key: "tva5", label: "TVA 5%", align: "right", width: "9%" },
      { key: "tva0", label: "TVA 0%", align: "right", width: "9%" },
      { key: "total", label: "TOTAL", align: "right", width: "12%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură contabil"],
  });

  return renderReportPdfResponse(doc, `gestiune-${from}-${to}.pdf`);
}
