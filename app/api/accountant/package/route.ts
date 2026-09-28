import JSZip from "jszip";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { accountantDateRange } from "@/lib/accountant/period";
import { ACCOUNTANT_PERMISSIONS, normalizeAccountantPermissions, packageSections, type PackageSection } from "@/lib/accountant/permissions";
import { createXlsx } from "@/lib/accountant/xlsx";
import { buildPackageFilePlan } from "@/lib/accountant/package-files";
import { amountPerUnit } from "@/lib/accountant/export-rows";
import { buildCashLedger } from "@/lib/accountant/cash-ledger";

export const dynamic = "force-dynamic";
const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const csv = (headers: string[], rows: unknown[][]) => `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")}`;
const decimal = (value: unknown) => Number(value ?? 0).toFixed(2).replace(".", ",");
type Dataset = { name: string; headers: string[]; rows: unknown[][] };

export async function GET(request: Request) {
  const url = new URL(request.url); const orgId = url.searchParams.get("org");
  if (!orgId) return new Response("Firma lipsește.", { status: 400 });
  const range = accountantDateRange(url.searchParams.get("from"), url.searchParams.get("to")); const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Autentificare necesară.", { status: 401 });
  const { data: membership } = await supabase.from("organisation_members").select("role,accountant_permissions").eq("organisation_id", orgId).eq("user_id", user.id).or("status.is.null,status.eq.active").maybeSingle();
  if (!membership || !["owner", "manager", "accountant"].includes(membership.role)) return new Response("Acces interzis.", { status: 403 });
  const permissions = membership.role === "accountant" ? normalizeAccountantPermissions(membership.accountant_permissions) : [...ACCOUNTANT_PERMISSIONS];
  const allowedSections = packageSections(permissions);
  const requestedSections = url.searchParams.getAll("section").filter((value): value is PackageSection => allowedSections.includes(value as PackageSection));
  const sections = new Set(requestedSections.length ? requestedSections : allowedSections);
  const requestedReport = url.searchParams.get("report");
  const requestedFormat = url.searchParams.get("format");
  const filePlan = new Set(buildPackageFilePlan(permissions));
  if (!sections.size) return new Response("Nu există categorii permise pentru export.", { status: 403 });

  const [orgResult, salesResult, paymentsResult, closesResult, cashMovementsResult, purchasesResult, stockResult, productsResult] = await Promise.all([
    supabase.from("organisations").select("name,company_legal_name,anaf_cif").eq("id", orgId).single(),
    supabase.from("canonical_sales_lines").select("transaction_number,sold_at,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,direction").eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at"),
    supabase.from("pos_transactions").select("transaction_number,sold_at,total,tip_amount,status,payment_methods(name,type)").eq("organisation_id", orgId).eq("status", "completed").gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at"),
    supabase.from("pos_sessions").select("id,opened_at,closed_at,opening_cash,expected_cash,counted_cash,cash_difference,status,fiscal_z_report_done,fiscal_z_report_at").eq("organisation_id", orgId).not("closed_at", "is", null).gte("closed_at", range.start).lte("closed_at", range.end).order("closed_at"),
    supabase.from("pos_cash_movements").select("session_id,movement_type,amount,reason,performed_at").eq("organisation_id", orgId).gte("performed_at", range.start).lte("performed_at", range.end).order("performed_at"),
    supabase.from("purchases").select("id,purchase_date,supplier_invoice_date,invoice_number,supplier,subtotal_amount,tax_total,total_amount,status,nir_number,nir_date,suppliers!purchases_supplier_id_fkey(name,tax_id)").eq("organisation_id", orgId).in("status", ["posted", "received"]).gte("purchase_date", range.from).lte("purchase_date", range.to).order("purchase_date"),
    supabase.from("canonical_stock_balances").select("product_id,name,unit_of_measure,ledger_quantity,recorded_quantity,variance,cost_price,active").eq("organisation_id", orgId).order("name"),
    supabase.from("products").select("id,name,sku,unit_of_measure,sale_price,cost_price,vat_rate,active").eq("organisation_id", orgId).order("name"),
  ]);
  const purchaseIds = (purchasesResult.data ?? []).map((purchase) => purchase.id);
  const purchaseItemsResult = await supabase.from("purchase_items").select("purchase_id,product_name,item_name,quantity,received_quantity,unit_cost,total_cost,tax_rate,tax_amount,unit_of_measure").eq("organisation_id", orgId).in("purchase_id", purchaseIds.length ? purchaseIds : ["00000000-0000-0000-0000-000000000000"]);
  const resultsBySection: Array<[PackageSection, { error: unknown }]> = [["sales", salesResult], ["payments", paymentsResult], ["cash", closesResult], ["cash", cashMovementsResult], ["purchases", purchasesResult], ["purchases", purchaseItemsResult], ["stock", stockResult], ["sales", productsResult]];
  if (resultsBySection.some(([section, result]) => sections.has(section) && result.error)) return new Response("Pachetul nu a putut fi generat în siguranță.", { status: 500 });

  const vat = new Map<number, { net: number; tax: number; gross: number }>();
  for (const row of salesResult.data ?? []) { const rate = Number(row.vat_rate ?? 0); const current = vat.get(rate) ?? { net: 0, tax: 0, gross: 0 }; current.net += Number(row.net_amount ?? 0); current.tax += Number(row.vat_amount ?? 0); current.gross += Number(row.gross_amount ?? 0); vat.set(rate, current); }
  const purchasesById = new Map((purchasesResult.data ?? []).map((purchase) => [purchase.id, purchase]));
  const openingCash = Number(closesResult.data?.[0]?.opening_cash ?? 0);
  const cashLedger = buildCashLedger(openingCash, cashMovementsResult.data ?? [], paymentsResult.data ?? []);
  const datasets: Array<[PackageSection, Dataset]> = [
    ["sales", { name: "Vanzari", headers: ["Document", "Data", "Produs", "Cantitate", "Preț unitar net", "Preț unitar vânzare", "TVA", "Net", "TVA valoare", "Brut", "Tip"], rows: (salesResult.data ?? []).map((r) => [r.transaction_number, r.sold_at, r.product_name, Number(r.quantity), amountPerUnit(r.net_amount, r.quantity), amountPerUnit(r.gross_amount, r.quantity), `${r.vat_rate}%`, Number(r.net_amount ?? 0), Number(r.vat_amount ?? 0), Number(r.gross_amount ?? 0), Number(r.direction) < 0 ? "Retur" : "Vânzare"]) }],
    ["sales", { name: "Vanzari-pe-cote-TVA", headers: ["Cotă TVA", "Net", "TVA", "Brut"], rows: [...vat.entries()].map(([rate, v]) => [`${rate}%`, v.net, v.tax, v.gross]) }],
    ["sales", { name: "Retururi", headers: ["Document retur", "Data", "Produs", "Cantitate", "Preț unitar", "Net", "TVA", "Brut"], rows: (salesResult.data ?? []).filter((r) => Number(r.direction) < 0).map((r) => [r.transaction_number, r.sold_at, r.product_name, Math.abs(Number(r.quantity)), amountPerUnit(r.gross_amount, r.quantity), Math.abs(Number(r.net_amount ?? 0)), Math.abs(Number(r.vat_amount ?? 0)), Math.abs(Number(r.gross_amount ?? 0))]) }],
    ["sales", { name: "Nomenclator-produse", headers: ["Produs", "SKU", "UM", "Preț vânzare", "Cost", "TVA", "Activ"], rows: (productsResult.data ?? []).map((r) => [r.name, r.sku, r.unit_of_measure, r.sale_price == null ? "LIPSĂ" : Number(r.sale_price), r.cost_price == null ? "LIPSĂ" : Number(r.cost_price), `${Number(r.vat_rate ?? 0)}%`, r.active ? "Da" : "Nu"]) }],
    ["payments", { name: "Incasari-pe-metode-plata", headers: ["Document", "Data", "Metodă", "Total", "Bacșiș", "Status"], rows: (paymentsResult.data ?? []).map((r) => { const method = Array.isArray(r.payment_methods) ? r.payment_methods[0] : r.payment_methods; return [r.transaction_number, r.sold_at, method?.name || method?.type || "Necunoscut", Number(r.total ?? 0), Number(r.tip_amount ?? 0), r.status]; }) }],
    ["cash", { name: "Registru-de-casa-operativ", headers: ["Data și ora", "Document", "Explicație", "Încasare", "Plată", "Sold"], rows: cashLedger.map((r) => [r.at, r.document, r.explanation, r.cashIn, r.cashOut, r.balance]) }],
    ["cash", { name: "Reconciliere-inchideri-si-Z", headers: ["Deschis", "Închis", "Sold inițial", "Numerar așteptat", "Numerar numărat", "Diferență", "Status sesiune", "Confirmare emitere Z fiscal", "Data confirmării"], rows: (closesResult.data ?? []).map((r) => [r.opened_at, r.closed_at, Number(r.opening_cash ?? 0), Number(r.expected_cash ?? 0), Number(r.counted_cash ?? 0), Number(r.cash_difference ?? 0), r.status, r.fiscal_z_report_done ? "Da" : "Nu", r.fiscal_z_report_at]) }],
    ["purchases", { name: "Achizitii", headers: ["Data recepției", "Data facturii", "Factură", "Furnizor", "CUI furnizor", "Net", "TVA", "Brut", "NIR", "Data NIR", "Status"], rows: (purchasesResult.data ?? []).map((r) => { const supplier = Array.isArray(r.suppliers) ? r.suppliers[0] : r.suppliers; return [r.purchase_date, r.supplier_invoice_date, r.invoice_number, supplier?.name || r.supplier, supplier?.tax_id, Number(r.subtotal_amount ?? 0), Number(r.tax_total ?? 0), Number(r.total_amount ?? 0), r.nir_number, r.nir_date, r.status]; }) }],
    ["purchases", { name: "Achizitii-detaliu", headers: ["Data", "Factură", "Furnizor", "CUI furnizor", "Produs", "UM", "Cantitate facturată", "Cantitate recepționată", "Preț unitar furnizor", "Net linie", "Cotă TVA", "TVA linie", "Brut linie", "NIR"], rows: (purchaseItemsResult.data ?? []).map((r) => { const purchase = purchasesById.get(r.purchase_id); const supplier = Array.isArray(purchase?.suppliers) ? purchase?.suppliers[0] : purchase?.suppliers; return [purchase?.purchase_date, purchase?.invoice_number, supplier?.name || purchase?.supplier, supplier?.tax_id, r.product_name || r.item_name, r.unit_of_measure, Number(r.quantity ?? 0), Number(r.received_quantity ?? r.quantity ?? 0), Number(r.unit_cost ?? 0), Number(r.total_cost ?? 0), `${Number(r.tax_rate ?? 0)}%`, Number(r.tax_amount ?? 0), Number(r.total_cost ?? 0) + Number(r.tax_amount ?? 0), purchase?.nir_number]; }) }],
    ["stock", { name: "Balanta-stoc", headers: ["Produs", "UM", "Cantitate registru", "Cantitate curentă", "Diferență", "CMP", "Activ"], rows: (stockResult.data ?? []).map((r) => [r.name, r.unit_of_measure, Number(r.ledger_quantity ?? 0), Number(r.recorded_quantity ?? 0), Number(r.variance ?? 0), Number(r.cost_price ?? 0), r.active ? "Da" : "Nu"]) }],
  ];
  if (requestedReport || requestedFormat) {
    if (!requestedReport || !["csv", "xlsx"].includes(requestedFormat ?? "")) return new Response("Raport sau format invalid.", { status: 400 });
    const selected = datasets.find(([section, dataset]) => sections.has(section) && dataset.name === requestedReport);
    if (!selected) return new Response("Raport indisponibil pentru accesul curent.", { status: 403 });
    const dataset = selected[1];
    const isCsv = requestedFormat === "csv";
    const generated = isCsv ? null : await createXlsx(dataset.headers, dataset.rows);
    const body: BodyInit = isCsv
      ? csv(dataset.headers, dataset.rows.map((row) => row.map((value) => typeof value === "number" ? decimal(value) : value)))
      : new Uint8Array(generated!).slice().buffer;
    await adminAudit(orgId, user.id, range.from, range.to, [...sections], requestedFormat!, dataset.name, permissions);
    return new Response(body, { headers: { "Content-Type": isCsv ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${dataset.name}-${range.from}-${range.to}.${requestedFormat}"`, "Cache-Control": "no-store" } });
  }
  const zip = new JSZip(); const org = orgResult.data;
  zip.file("README.txt", `Dosar de lucru pentru contabil — ${org?.company_legal_name || org?.name || "Firmă"}\nPerioada: ${range.from} — ${range.to}\nGenerat direct din baza de date: ${new Date().toISOString()}\nSecțiuni incluse: ${[...sections].join(", ")}\n\nIMPORTANT: exporturile sunt date operative pentru verificare. Confirmarea Z nu înlocuiește raportul fiscal emis de aparatul de marcat. Registrul de casă operativ trebuie validat pe baza documentelor justificative. Registrele contabile obligatorii și balanța se întocmesc în programul contabil.`);
  for (const [section, dataset] of datasets) {
    if (!sections.has(section)) continue;
    const csvName = `${dataset.name}.csv`; const xlsxName = `${dataset.name}.xlsx`;
    if (filePlan.has(csvName)) zip.file(csvName, csv(dataset.headers, dataset.rows.map((row) => row.map((value) => typeof value === "number" ? decimal(value) : value))));
    if (filePlan.has(xlsxName)) zip.file(xlsxName, await createXlsx(dataset.headers, dataset.rows));
  }
  await adminAudit(orgId, user.id, range.from, range.to, [...sections], "zip-csv-xlsx", null, permissions);
  const body = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const output = new ArrayBuffer(body.byteLength); new Uint8Array(output).set(body);
  return new Response(output, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="Dosar-contabil-${range.from}-${range.to}.zip"`, "Cache-Control": "no-store" } });
}

async function adminAudit(orgId: string, userId: string, from: string, to: string, sections: PackageSection[], format: string, report: string | null, permissions: unknown) {
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  await admin.from("team_audit_events").insert({ organisation_id: orgId, actor_user_id: userId, action: "accounting_package_downloaded", metadata: { from, to, sections, format, report, permissions } });
}
