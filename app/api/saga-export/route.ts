/**
 * Saga XML Export API
 *
 * Exports NIR (purchases) and Sales data in Saga-compatible XML format.
 *
 * Query params:
 * - type: "nir" | "sales" | "combined" (default: combined)
 * - from: start date (YYYY-MM-DD)
 * - to: end date (YYYY-MM-DD)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateNirXml, generateSalesXml, generateCombinedXml, type SagaNir, type SagaVanzare } from "@/lib/ro-accounting/saga-xml";

type PurchaseRow = {
  id: string;
  supplier_name: string | null;
  invoice_number: string | null;
  purchase_date: string;
  total_gross: number | null;
  total_vat: number | null;
  purchase_items: Array<{
    product_name: string | null;
    quantity: number;
    unit: string | null;
    unit_price: number;
    vat_rate: number | null;
  }>;
};

type TransactionItemRow = {
  vat_rate: number | null;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
  line_total: number | null;
  pos_transactions: {
    sold_at: string;
    status: string;
  } | {
    sold_at: string;
    status: string;
  }[] | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "combined";
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

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const orgName = org?.name ?? "franchisetech";
  const orgCui = org?.fiscalnet_cif ?? undefined;

  let xml = "";
  let filename = "";

  try {
    if (type === "nir" || type === "combined") {
      const { data: purchases } = await supabase
        .from("purchases")
        .select(`
          id,
          supplier_name,
          invoice_number,
          purchase_date,
          total_gross,
          total_vat,
          purchase_items(product_name, quantity, unit, unit_price, vat_rate)
        `)
        .eq("organisation_id", orgId)
        .gte("purchase_date", fromTs)
        .lte("purchase_date", toTs)
        .order("purchase_date");

      const nirList: SagaNir[] = ((purchases ?? []) as PurchaseRow[]).map((p) => ({
        data: p.purchase_date,
        furnizor: p.supplier_name ?? "Furnizor necunoscut",
        nrFactura: p.invoice_number ?? undefined,
        valoare: Number(p.total_gross ?? 0),
        tva: Number(p.total_vat ?? 0),
        articole: (p.purchase_items ?? []).map((item) => ({
          denumire: item.product_name ?? "Produs",
          cantitate: Number(item.quantity ?? 0),
          um: item.unit ?? "buc",
          pretUnitar: Number(item.unit_price ?? 0),
          cotaTva: Number(item.vat_rate ?? 19),
        })),
      }));

      if (type === "nir") {
        xml = generateNirXml({ orgName, orgCui, nirList });
        filename = `saga-nir-${from}-${to}.xml`;
      } else {
        const salesData = await getSalesData(supabase, orgId, fromTs, toTs);
        xml = generateCombinedXml({ orgName, orgCui, nirList, vanzariList: salesData });
        filename = `saga-export-${from}-${to}.xml`;
      }
    } else if (type === "sales") {
      const salesData = await getSalesData(supabase, orgId, fromTs, toTs);
      xml = generateSalesXml({ orgName, orgCui, vanzariList: salesData });
      filename = `saga-vanzari-${from}-${to}.xml`;
    } else {
      return new NextResponse("Invalid export type. Use: nir, sales, or combined", { status: 400 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Export error: ${msg}`, { status: 500 });
  }

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function getSalesData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  fromTs: string,
  toTs: string
): Promise<SagaVanzare[]> {
  const { data: items } = await supabase
    .from("pos_transaction_items")
    .select(`
      vat_rate,
      net_amount,
      vat_amount,
      gross_amount,
      line_total,
      pos_transactions(sold_at, status)
    `)
    .eq("organisation_id", orgId)
    .gte("created_at", fromTs)
    .lte("created_at", toTs);

  const byDate = new Map<string, { valoare: number; tva: number; tva19: number; tva9: number; tva5: number; tva0: number }>();

  for (const item of (items ?? []) as TransactionItemRow[]) {
    const txRaw = item.pos_transactions;
    const tx = Array.isArray(txRaw) ? txRaw[0] : txRaw;
    if (!tx || tx.status === "voided") continue;

    const date = tx.sold_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    const existing = byDate.get(date) ?? { valoare: 0, tva: 0, tva19: 0, tva9: 0, tva5: 0, tva0: 0 };

    const gross = Number(item.gross_amount ?? item.line_total ?? 0);
    const vat = Number(item.vat_amount ?? 0);
    const rate = Number(item.vat_rate ?? 0);

    existing.valoare += gross;
    existing.tva += vat;

    if (rate === 19) existing.tva19 += gross;
    else if (rate === 9) existing.tva9 += gross;
    else if (rate === 5) existing.tva5 += gross;
    else existing.tva0 += gross;

    byDate.set(date, existing);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      data: date,
      valoare: v.valoare,
      tva: v.tva,
      totalTva19: v.tva19 > 0 ? v.tva19 : undefined,
      totalTva9: v.tva9 > 0 ? v.tva9 : undefined,
      totalTva5: v.tva5 > 0 ? v.tva5 : undefined,
      totalTva0: v.tva0 > 0 ? v.tva0 : undefined,
    }));
}
