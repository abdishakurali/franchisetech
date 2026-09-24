import JSZip from "jszip";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { monthRange, normalizeMonth } from "@/lib/accountant/period";
import { ACCOUNTANT_PERMISSIONS, normalizeAccountantPermissions, packageSections, type PackageSection } from "@/lib/accountant/permissions";
import { createXlsx } from "@/lib/accountant/xlsx";
import { buildPackageFilePlan } from "@/lib/accountant/package-files";

export const dynamic = "force-dynamic";
const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const csv = (headers: string[], rows: unknown[][]) => `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")}`;
const decimal = (value: unknown) => Number(value ?? 0).toFixed(2).replace(".", ",");
type Dataset = { name: string; headers: string[]; rows: unknown[][] };

export async function GET(request: Request) {
  const url = new URL(request.url); const orgId = url.searchParams.get("org"); const month = normalizeMonth(url.searchParams.get("month"));
  if (!orgId) return new Response("Firma lipsește.", { status: 400 });
  const range = monthRange(month); const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Autentificare necesară.", { status: 401 });
  const { data: membership } = await supabase.from("organisation_members").select("role,accountant_permissions").eq("organisation_id", orgId).eq("user_id", user.id).or("status.is.null,status.eq.active").maybeSingle();
  if (!membership || !["owner", "manager", "accountant"].includes(membership.role)) return new Response("Acces interzis.", { status: 403 });
  const permissions = membership.role === "accountant" ? normalizeAccountantPermissions(membership.accountant_permissions) : [...ACCOUNTANT_PERMISSIONS];
  const sections = new Set(packageSections(permissions));
  const filePlan = new Set(buildPackageFilePlan(permissions));
  if (!sections.size) return new Response("Nu există categorii permise pentru export.", { status: 403 });

  const [orgResult, salesResult, paymentsResult, closesResult, purchasesResult, stockResult] = await Promise.all([
    supabase.from("organisations").select("name,company_legal_name,anaf_cif").eq("id", orgId).single(),
    supabase.from("canonical_sales_lines").select("transaction_number,sold_at,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,direction").eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at"),
    supabase.from("pos_transactions").select("transaction_number,sold_at,total,tip_amount,status,payment_methods(name,type)").eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at"),
    supabase.from("pos_sessions").select("opened_at,closed_at,opening_cash,expected_cash,counted_cash,cash_difference,status").eq("organisation_id", orgId).gte("opened_at", range.start).lte("opened_at", range.end).order("opened_at"),
    supabase.from("purchases").select("purchase_date,invoice_number,supplier,subtotal_amount,tax_total,total_amount,status,nir_number").eq("organisation_id", orgId).gte("purchase_date", range.from).lte("purchase_date", range.to).order("purchase_date"),
    supabase.from("canonical_stock_balances").select("name,unit_of_measure,ledger_quantity,recorded_quantity,variance,cost_price,active").eq("organisation_id", orgId).order("name"),
  ]);
  const resultsBySection: Array<[PackageSection, { error: unknown }]> = [["sales", salesResult], ["payments", paymentsResult], ["cash", closesResult], ["purchases", purchasesResult], ["stock", stockResult]];
  if (resultsBySection.some(([section, result]) => sections.has(section) && result.error)) return new Response("Pachetul nu a putut fi generat în siguranță.", { status: 500 });

  const vat = new Map<number, { net: number; tax: number; gross: number }>();
  for (const row of salesResult.data ?? []) { const rate = Number(row.vat_rate ?? 0); const current = vat.get(rate) ?? { net: 0, tax: 0, gross: 0 }; current.net += Number(row.net_amount ?? 0); current.tax += Number(row.vat_amount ?? 0); current.gross += Number(row.gross_amount ?? 0); vat.set(rate, current); }
  const datasets: Array<[PackageSection, Dataset]> = [
    ["sales", { name: "Vanzari", headers: ["Document", "Data", "Produs", "Cantitate", "TVA", "Net", "TVA valoare", "Brut", "Tip"], rows: (salesResult.data ?? []).map((r) => [r.transaction_number, r.sold_at, r.product_name, Number(r.quantity), `${r.vat_rate}%`, Number(r.net_amount ?? 0), Number(r.vat_amount ?? 0), Number(r.gross_amount ?? 0), Number(r.direction) < 0 ? "Retur" : "Vânzare"]) }],
    ["sales", { name: "Vanzari-pe-cote-TVA", headers: ["Cotă TVA", "Net", "TVA", "Brut"], rows: [...vat.entries()].map(([rate, v]) => [`${rate}%`, v.net, v.tax, v.gross]) }],
    ["payments", { name: "Incasari-pe-metode-plata", headers: ["Document", "Data", "Metodă", "Total", "Bacșiș", "Status"], rows: (paymentsResult.data ?? []).map((r) => { const method = Array.isArray(r.payment_methods) ? r.payment_methods[0] : r.payment_methods; return [r.transaction_number, r.sold_at, method?.name || method?.type || "Necunoscut", Number(r.total ?? 0), Number(r.tip_amount ?? 0), r.status]; }) }],
    ["cash", { name: "Inchideri-casa", headers: ["Deschis", "Închis", "Sold inițial", "Numerar așteptat", "Numerar declarat", "Diferență", "Status"], rows: (closesResult.data ?? []).map((r) => [r.opened_at, r.closed_at, Number(r.opening_cash ?? 0), Number(r.expected_cash ?? 0), Number(r.counted_cash ?? 0), Number(r.cash_difference ?? 0), r.status]) }],
    ["purchases", { name: "Achizitii", headers: ["Data", "Factură", "Furnizor", "Net", "TVA", "Brut", "NIR", "Status"], rows: (purchasesResult.data ?? []).map((r) => [r.purchase_date, r.invoice_number, r.supplier, Number(r.subtotal_amount ?? 0), Number(r.tax_total ?? 0), Number(r.total_amount ?? 0), r.nir_number, r.status]) }],
    ["stock", { name: "Balanta-stoc", headers: ["Produs", "UM", "Cantitate registru", "Cantitate curentă", "Diferență", "CMP", "Activ"], rows: (stockResult.data ?? []).map((r) => [r.name, r.unit_of_measure, Number(r.ledger_quantity ?? 0), Number(r.recorded_quantity ?? 0), Number(r.variance ?? 0), Number(r.cost_price ?? 0), r.active ? "Da" : "Nu"]) }],
  ];
  const zip = new JSZip(); const org = orgResult.data;
  zip.file("README.txt", `Pachet de date POS — ${org?.company_legal_name || org?.name || "Firmă"}\nPerioada: ${month}\nGenerat: ${new Date().toISOString()}\nCategorii incluse: ${permissions.join(", ")}\n\nFișierele sunt exporturi operaționale pentru verificarea contabilului și nu sunt declarate registre contabile oficiale.`);
  for (const [section, dataset] of datasets) {
    if (!sections.has(section)) continue;
    const csvName = `${dataset.name}.csv`; const xlsxName = `${dataset.name}.xlsx`;
    if (filePlan.has(csvName)) zip.file(csvName, csv(dataset.headers, dataset.rows.map((row) => row.map((value) => typeof value === "number" ? decimal(value) : value))));
    if (filePlan.has(xlsxName)) zip.file(xlsxName, await createXlsx(dataset.headers, dataset.rows));
  }
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  await admin.from("team_audit_events").insert({ organisation_id: orgId, actor_user_id: user.id, action: "accounting_package_downloaded", metadata: { month, format: "zip-csv-xlsx", permissions } });
  const body = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const output = new ArrayBuffer(body.byteLength); new Uint8Array(output).set(body);
  return new Response(output, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="Pachet-contabil-${month}.zip"`, "Cache-Control": "no-store" } });
}
