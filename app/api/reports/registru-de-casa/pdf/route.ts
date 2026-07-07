import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";
import { formatMoney } from "@/lib/kitchenops/metrics";
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

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif,currency_code")
    .eq("id", orgId)
    .single();
  const currency = org?.currency_code ?? "EUR";

  const { data: profile } = await supabase.from("profiles").select("full_name,email").eq("id", user.id).single();
  const generatedBy = profile?.full_name || profile?.email || user.email || "—";

  const { data: sessions } = await supabase
    .from("pos_sessions")
    .select("opening_cash")
    .eq("organisation_id", orgId)
    .gte("opened_at", periodStart)
    .lte("opened_at", periodEnd)
    .order("opened_at", { ascending: true })
    .limit(1);
  const openingCash = Number(sessions?.[0]?.opening_cash ?? 0);

  const { data: cashMovements } = await supabase
    .from("pos_cash_movements")
    .select("id,movement_type,amount,reason,performed_at")
    .eq("organisation_id", orgId)
    .gte("performed_at", periodStart)
    .lte("performed_at", periodEnd)
    .order("performed_at");

  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select("sold_at,status,total,payment_methods(type)")
    .eq("organisation_id", orgId)
    .gte("sold_at", periodStart)
    .lte("sold_at", periodEnd);

  const cashByDay = new Map<string, number>();
  for (const tx of (transactions ?? []) as Array<{ sold_at: string; status: string; total: number | null; payment_methods: { type?: string } | { type?: string }[] | null }>) {
    if (tx.status === "voided") continue;
    const method = Array.isArray(tx.payment_methods) ? tx.payment_methods[0] : tx.payment_methods;
    if ((method?.type ?? "").toLowerCase() !== "cash") continue;
    const day = tx.sold_at.slice(0, 10);
    cashByDay.set(day, (cashByDay.get(day) ?? 0) + Number(tx.total ?? 0));
  }

  let chiCount = 0;
  let choCount = 0;
  const entries: Array<{ sortKey: string; date: string; docNo: string; description: string; cashIn: number; cashOut: number }> = [];

  for (const m of (cashMovements ?? [])) {
    const amount = Number(m.amount ?? 0);
    if (amount > 0) {
      chiCount++;
      entries.push({
        sortKey: m.performed_at,
        date: new Date(m.performed_at).toLocaleDateString("ro-RO"),
        docNo: `CHI${String(chiCount).padStart(4, "0")}`,
        description: m.reason ?? "Încasare",
        cashIn: amount,
        cashOut: 0,
      });
    } else if (amount < 0) {
      choCount++;
      entries.push({
        sortKey: m.performed_at,
        date: new Date(m.performed_at).toLocaleDateString("ro-RO"),
        docNo: `CHO${String(choCount).padStart(4, "0")}`,
        description: m.reason ?? "Plată",
        cashIn: 0,
        cashOut: Math.abs(amount),
      });
    }
  }

  for (const [day, total] of Array.from(cashByDay.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (total <= 0) continue;
    chiCount++;
    entries.push({
      sortKey: `${day}T23:59:58`,
      date: new Date(day).toLocaleDateString("ro-RO"),
      docNo: `CHI${String(chiCount).padStart(4, "0")}`,
      description: "Vânzări POS (numerar)",
      cashIn: total,
      cashOut: 0,
    });
  }

  entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let runningBalance = openingCash;
  const pdfRows: PdfRow[] = [
    {
      nr: "",
      date: new Date(from).toLocaleDateString("ro-RO"),
      docNo: "SOLD INI",
      description: "Sold la începutul perioadei",
      cashIn: formatMoney(openingCash, currency),
      cashOut: "—",
      balance: formatMoney(openingCash, currency),
      _rowStyle: "section",
    },
  ];

  entries.forEach((e, idx) => {
    runningBalance += e.cashIn - e.cashOut;
    pdfRows.push({
      nr: idx + 1,
      date: e.date,
      docNo: e.docNo,
      description: e.description,
      cashIn: e.cashIn > 0 ? formatMoney(e.cashIn, currency) : "—",
      cashOut: e.cashOut > 0 ? formatMoney(e.cashOut, currency) : "—",
      balance: formatMoney(runningBalance, currency),
    });
  });

  const totalIn = entries.reduce((s, e) => s + e.cashIn, 0);
  const totalOut = entries.reduce((s, e) => s + e.cashOut, 0);
  const closingBalance = openingCash + totalIn - totalOut;

  pdfRows.push({
    nr: "",
    date: "",
    docNo: "",
    description: "TOTAL",
    cashIn: formatMoney(totalIn, currency),
    cashOut: formatMoney(totalOut, currency),
    balance: formatMoney(closingBalance, currency),
    _rowStyle: "total",
  });

  const doc = ReportPdfDocument({
    companyName: org?.name ?? "franchisetech",
    companyCui: org?.fiscalnet_cif ?? undefined,
    title: "Registru de Casă",
    subtitle: "Jurnal de casă cu sold curent",
    periodLabel: `Perioada: ${from} — ${to}`,
    generatedBy,
    generatedAt: new Date().toLocaleString("ro-RO"),
    summary: [
      { label: "Sold inițial", value: formatMoney(openingCash, currency) },
      { label: "Total încasări", value: formatMoney(totalIn, currency) },
      { label: "Total plăți", value: formatMoney(totalOut, currency) },
      { label: "Sold final", value: formatMoney(closingBalance, currency) },
    ],
    columns: [
      { key: "nr", label: "Nr.", align: "right", width: "6%" },
      { key: "date", label: "Data", width: "14%" },
      { key: "docNo", label: "Nr. act.", width: "12%" },
      { key: "description", label: "Explicație", width: "34%" },
      { key: "cashIn", label: "Încasări", align: "right", width: "12%" },
      { key: "cashOut", label: "Plăți", align: "right", width: "10%" },
      { key: "balance", label: "Sold", align: "right", width: "12%" },
    ],
    rows: pdfRows,
    signatureLabels: ["Întocmit de", "Semnătură contabil"],
  });

  return renderReportPdfResponse(doc, `registru-de-casa-${from}-${to}.pdf`);
}
