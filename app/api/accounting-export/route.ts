import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const decimal = (value: unknown) => Number(value ?? 0).toFixed(2).replace(".", ",");
const csv = (headers: string[], rows: unknown[][]) =>
  `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "journal";
  const from = url.searchParams.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = url.searchParams.get("to") ?? new Date().toISOString().slice(0, 10);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Autentificare necesară.", { status: 401 });
  const { data: membership } = await supabase.from("organisation_members")
    .select("organisation_id,role").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership || !["owner", "manager"].includes(membership.role ?? "")) {
    return new NextResponse("Nu aveți acces la exporturile contabile.", { status: 403 });
  }
  if (!await hasEntitlement(membership.organisation_id, "reports.accountant_pack")) {
    return new NextResponse("Exportul contabil necesită planul corespunzător.", { status: 403 });
  }
  const orgId = membership.organisation_id;
  const start = `${from}T00:00:00.000Z`;
  const end = `${to}T23:59:59.999Z`;
  let body: string;

  if (type === "journal") {
    const { data, error } = await supabase.from("canonical_sales_lines")
      .select("transaction_number,sold_at,product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,direction")
      .eq("organisation_id", orgId).gte("sold_at", start).lte("sold_at", end).order("sold_at");
    if (error) return new NextResponse(error.message, { status: 500 });
    body = csv(
      ["Document", "Data", "Produs", "Cantitate", "Cotă TVA", "Net", "TVA", "Brut", "Sens"],
      (data ?? []).map((row) => [row.transaction_number, row.sold_at, row.product_name, row.quantity, `${Number(row.vat_rate)}%`, decimal(row.net_amount), decimal(row.vat_amount), decimal(row.gross_amount), Number(row.direction) > 0 ? "Vânzare" : "Retur"]),
    );
  } else if (type === "inventory") {
    const { data, error } = await supabase.from("canonical_stock_balances")
      .select("name,unit_of_measure,ledger_quantity,recorded_quantity,variance,cost_price,reorder_level,active")
      .eq("organisation_id", orgId).order("name");
    if (error) return new NextResponse(error.message, { status: 500 });
    body = csv(
      ["Produs", "UM", "Cantitate registru", "Cantitate catalog", "Diferență", "CMP", "Prag reaprovizionare", "Activ"],
      (data ?? []).map((row) => [row.name, row.unit_of_measure, row.ledger_quantity, row.recorded_quantity, row.variance, decimal(row.cost_price), row.reorder_level, row.active ? "Da" : "Nu"]),
    );
  } else if (type === "nir") {
    const { data, error } = await supabase.from("purchases")
      .select("nir_number,purchase_date,invoice_number,supplier,purchase_items(product_name,quantity,unit_of_measure,unit_cost,total_cost,tax_rate)")
      .eq("organisation_id", orgId).in("status", ["posted", "received"])
      .gte("purchase_date", from).lte("purchase_date", to).order("purchase_date");
    if (error) return new NextResponse(error.message, { status: 500 });
    body = csv(
      ["NIR", "Data", "Factură", "Furnizor", "Produs", "Cantitate", "UM", "Cost unitar", "Valoare", "TVA"],
      (data ?? []).flatMap((purchase) => (purchase.purchase_items ?? []).map((item) => [purchase.nir_number, purchase.purchase_date, purchase.invoice_number, purchase.supplier, item.product_name, item.quantity, item.unit_of_measure, decimal(item.unit_cost), decimal(item.total_cost), `${Number(item.tax_rate ?? 0)}%`])),
    );
  } else {
    return new NextResponse("Tip de export invalid. Folosiți journal, inventory sau nir.", { status: 400 });
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${from}-${to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
