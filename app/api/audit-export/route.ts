/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "transactions";
  const from = searchParams.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);
  const fromTs = `${from}T00:00:00.000Z`;
  const toTs = `${to}T23:59:59.999Z`;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id,role")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return new NextResponse("No org", { status: 403 });
  const orgId = membership.organisation_id;
  try {
    await assertEntitlement(orgId, "reports.audit", { write: false });
  } catch (error) {
    const response = entitlementDeniedResponse(error);
    if (response) return response;
    throw error;
  }

  let csv = "";

  try {
    if (type === "transactions") {
      const { data } = await supabase
        .from("pos_transactions")
        .select("transaction_number,sold_at,status,subtotal,subtotal_net,tax_total,tip_amount,total,total_gross,payment_methods(name)")
        .eq("organisation_id", orgId)
        .gte("sold_at", fromTs).lte("sold_at", toTs)
        .order("sold_at");
      const rows = (data ?? []).map((r: any) => ({
        transaction_number: r.transaction_number,
        sold_at: r.sold_at,
        status: r.status,
        subtotal_net: r.subtotal_net ?? "",
        tax_total: r.tax_total ?? "",
        tip_amount: r.tip_amount ?? "0",
        gross_ex_tips: ((r.total_gross ?? r.total ?? 0) - (r.tip_amount ?? 0)).toFixed(2),
        total_gross: r.total_gross ?? r.total ?? "",
        payment_method: r.payment_methods?.name ?? "",
      }));
      csv = toCsv(["transaction_number","sold_at","status","subtotal_net","tax_total","tip_amount","gross_ex_tips","total_gross","payment_method"], rows);

    } else if (type === "items") {
      const { data } = await supabase
        .from("pos_transaction_items")
        .select("*,pos_transactions(transaction_number,sold_at,status)")
        .eq("organisation_id", orgId)
        .gte("created_at", fromTs).lte("created_at", toTs)
        .order("created_at");
      const rows = (data ?? []).map((r: any) => ({
        transaction_number: r.pos_transactions?.transaction_number ?? "",
        sold_at: r.pos_transactions?.sold_at ?? "",
        status: r.pos_transactions?.status ?? "",
        product_name: r.product_name,
        quantity: r.quantity,
        unit_price: r.unit_price,
        vat_rate: r.vat_rate ?? 0,
        net_amount: r.net_amount ?? "",
        vat_amount: r.vat_amount ?? "",
        gross_amount: r.gross_amount ?? r.line_total ?? "",
        line_total: r.line_total,
      }));
      csv = toCsv(["transaction_number","sold_at","status","product_name","quantity","unit_price","vat_rate","net_amount","vat_amount","gross_amount","line_total"], rows);

    } else if (type === "vat_summary") {
      const { data } = await supabase
        .from("pos_transaction_items")
        .select("vat_rate,net_amount,vat_amount,gross_amount,line_total,transaction_id")
        .eq("organisation_id", orgId)
        .gte("created_at", fromTs).lte("created_at", toTs);
      const byRate = new Map<number, { net: number; vat: number; gross: number; count: number }>();
      for (const item of (data ?? []) as any[]) {
        const rate = Number(item.vat_rate ?? 0);
        const gross = Number(item.gross_amount ?? item.line_total ?? 0);
        const vat = Number(item.vat_amount ?? 0);
        const net = Number(item.net_amount ?? gross - vat);
        const entry = byRate.get(rate) ?? { net: 0, vat: 0, gross: 0, count: 0 };
        entry.net += net; entry.vat += vat; entry.gross += gross; entry.count += 1;
        byRate.set(rate, entry);
      }
      const rows = Array.from(byRate.entries()).sort(([a],[b]) => a - b).map(([rate, v]) => ({
        vat_rate_pct: rate,
        net_sales: v.net.toFixed(2),
        vat_amount: v.vat.toFixed(2),
        gross_sales: v.gross.toFixed(2),
        line_items: v.count,
      }));
      csv = toCsv(["vat_rate_pct","net_sales","vat_amount","gross_sales","line_items"], rows as any);

    } else if (type === "void_log") {
      let rows: Record<string, unknown>[] = [];
      try {
        const { data } = await supabase
          .from("pos_audit_events")
          .select("performed_at,event_type,reason,transaction_id,profiles(full_name,email),pos_transactions(transaction_number,total,sold_at)")
          .eq("organisation_id", orgId)
          .in("event_type", ["voided","refunded"])
          .gte("performed_at", fromTs).lte("performed_at", toTs)
          .order("performed_at");
        rows = (data ?? []).map((e: any) => ({
          performed_at: e.performed_at,
          event_type: e.event_type,
          transaction_number: e.pos_transactions?.transaction_number ?? "",
          transaction_total: e.pos_transactions?.total ?? "",
          sold_at: e.pos_transactions?.sold_at ?? "",
          reason: e.reason ?? "",
          performed_by: e.profiles?.full_name || e.profiles?.email || "",
        }));
      } catch {
        rows = [];
      }
      csv = rows.length
        ? toCsv(["performed_at","event_type","transaction_number","transaction_total","sold_at","reason","performed_by"], rows)
        : "No void records found for this period.\n";

    } else if (type === "food_safety") {
      let rows: Record<string, unknown>[] = [];
      try {
        const { data } = await supabase
          .from("temperature_readings")
          .select("*")
          .eq("organisation_id", orgId)
          .gte("recorded_at", fromTs).lte("recorded_at", toTs)
          .order("recorded_at");
        rows = (data ?? []) as any[];
      } catch {
        try {
          const { data } = await supabase
            .from("haccp_checks")
            .select("*")
            .eq("organisation_id", orgId)
            .gte("created_at", fromTs).lte("created_at", toTs)
            .order("created_at");
          rows = (data ?? []) as any[];
        } catch { rows = []; }
      }
      csv = rows.length ? toCsv(Object.keys(rows[0]), rows) : "No food safety records found for this period.\n";

    } else if (type === "actions") {
      let rows: Record<string, unknown>[] = [];
      try {
        const { data } = await supabase
          .from("corrective_actions")
          .select("*")
          .eq("organisation_id", orgId)
          .gte("created_at", fromTs).lte("created_at", toTs)
          .order("created_at");
        rows = (data ?? []) as any[];
      } catch { rows = []; }
      csv = rows.length ? toCsv(Object.keys(rows[0]), rows) : "No corrective actions found for this period.\n";

    } else {
      csv = "Unknown export type.\n";
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Export error: ${msg}`, { status: 500 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-${from}-${to}.csv"`,
    },
  });
}
