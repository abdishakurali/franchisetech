import JSZip from "jszip";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { monthRange, normalizeMonth } from "@/lib/accountant/period";

export const dynamic = "force-dynamic";

const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const csv = (headers: string[], rows: unknown[][]) => `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")}`;
const decimal = (value: unknown) => Number(value ?? 0).toFixed(2).replace(".", ",");

export async function GET(request: Request) {
  const url = new URL(request.url); const orgId = url.searchParams.get("org"); const month = normalizeMonth(url.searchParams.get("month"));
  if (!orgId) return new Response("Firma lipsește.", { status: 400 });
  const range = monthRange(month); const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Autentificare necesară.", { status: 401 });
  const { data: membership } = await supabase.from("organisation_members").select("role,accountant_permissions").eq("organisation_id", orgId).eq("user_id", user.id).or("status.is.null,status.eq.active").maybeSingle();
  if (!membership || !["owner", "manager", "accountant"].includes(membership.role)) return new Response("Acces interzis.", { status: 403 });

  const [orgResult, salesResult, paymentsResult, closesResult, purchasesResult, stockResult] = await Promise.all([
    supabase.from("organisations").select("name,company_legal_name,anaf_cif").eq("id", orgId).single(),
    supabase.from("canonical_sales_lines").select("transaction_number,sold_at,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,direction").eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at"),
    supabase.from("pos_transactions").select("transaction_number,sold_at,total,tip_amount,status,payment_methods(name,type)").eq("organisation_id", orgId).gte("sold_at", range.start).lte("sold_at", range.end).order("sold_at"),
    supabase.from("pos_sessions").select("opened_at,closed_at,opening_cash,expected_cash,counted_cash,cash_difference,status").eq("organisation_id", orgId).gte("opened_at", range.start).lte("opened_at", range.end).order("opened_at"),
    supabase.from("purchases").select("purchase_date,invoice_number,supplier,subtotal_amount,tax_total,total_amount,status,nir_number").eq("organisation_id", orgId).gte("purchase_date", range.from).lte("purchase_date", range.to).order("purchase_date"),
    supabase.from("canonical_stock_balances").select("name,unit_of_measure,ledger_quantity,recorded_quantity,variance,cost_price,active").eq("organisation_id", orgId).order("name"),
  ]);
  const failed = [salesResult, paymentsResult, closesResult, purchasesResult, stockResult].find((result) => result.error);
  if (failed?.error) return new Response("Pachetul nu a putut fi generat în siguranță.", { status: 500 });

  const vat = new Map<number, { net: number; tax: number; gross: number }>();
  for (const row of salesResult.data ?? []) { const rate = Number(row.vat_rate ?? 0); const current = vat.get(rate) ?? { net: 0, tax: 0, gross: 0 }; current.net += Number(row.net_amount ?? 0); current.tax += Number(row.vat_amount ?? 0); current.gross += Number(row.gross_amount ?? 0); vat.set(rate, current); }
  const zip = new JSZip(); const org = orgResult.data;
  zip.file("README.txt", `Pachet de date POS — ${org?.company_legal_name || org?.name || "Firmă"}\nPerioada: ${month}\nGenerat: ${new Date().toISOString()}\n\nFișierele sunt exporturi operaționale pentru verificarea contabilului și nu sunt declarate registre contabile oficiale.`);
  zip.file("Vanzari.csv", csv(["Document", "Data", "Produs", "Cantitate", "TVA", "Net", "TVA valoare", "Brut", "Tip"], (salesResult.data ?? []).map((r) => [r.transaction_number, r.sold_at, r.product_name, r.quantity, `${r.vat_rate}%`, decimal(r.net_amount), decimal(r.vat_amount), decimal(r.gross_amount), Number(r.direction) < 0 ? "Retur" : "Vânzare"])));
  zip.file("Vanzari-pe-cote-TVA.csv", csv(["Cotă TVA", "Net", "TVA", "Brut"], [...vat.entries()].map(([rate, v]) => [`${rate}%`, decimal(v.net), decimal(v.tax), decimal(v.gross)])));
  zip.file("Incasari-pe-metode-plata.csv", csv(["Document", "Data", "Metodă", "Total", "Bacșiș", "Status"], (paymentsResult.data ?? []).map((r) => { const method = Array.isArray(r.payment_methods) ? r.payment_methods[0] : r.payment_methods; return [r.transaction_number, r.sold_at, method?.name || method?.type || "Necunoscut", decimal(r.total), decimal(r.tip_amount), r.status]; })));
  zip.file("Inchideri-casa.csv", csv(["Deschis", "Închis", "Sold inițial", "Numerar așteptat", "Numerar declarat", "Diferență", "Status"], (closesResult.data ?? []).map((r) => [r.opened_at, r.closed_at, decimal(r.opening_cash), decimal(r.expected_cash), decimal(r.counted_cash), decimal(r.cash_difference), r.status])));
  zip.file("Achizitii.csv", csv(["Data", "Factură", "Furnizor", "Net", "TVA", "Brut", "NIR", "Status"], (purchasesResult.data ?? []).map((r) => [r.purchase_date, r.invoice_number, r.supplier, decimal(r.subtotal_amount), decimal(r.tax_total), decimal(r.total_amount), r.nir_number, r.status])));
  zip.file("Balanta-stoc.csv", csv(["Produs", "UM", "Cantitate registru", "Cantitate curentă", "Diferență", "CMP", "Activ"], (stockResult.data ?? []).map((r) => [r.name, r.unit_of_measure, r.ledger_quantity, r.recorded_quantity, r.variance, decimal(r.cost_price), r.active ? "Da" : "Nu"])));

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  await admin.from("team_audit_events").insert({ organisation_id: orgId, actor_user_id: user.id, action: "accounting_package_downloaded", metadata: { month, format: "zip-csv" } });
  const body = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  const output = new ArrayBuffer(body.byteLength);
  new Uint8Array(output).set(body);
  return new Response(output, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="Pachet-contabil-${month}.zip"`, "Cache-Control": "no-store" } });
}
