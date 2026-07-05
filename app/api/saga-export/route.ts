/**
 * Saga XML Export API
 *
 * Exports NIR (purchases) and Ieșiri (sales) in Saga C's native XML format.
 * Two separate file types — Saga routes them via FurnizorCIF comparison:
 *   NIR:    FurnizorCIF = supplier's CIF  →  Intrări
 *   Ieșiri: FurnizorCIF = own org's CIF   →  Ieșiri
 *
 * Query params:
 *   type: "nir" | "iesiri"
 *   from: start date (YYYY-MM-DD)
 *   to:   end date   (YYYY-MM-DD)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import {
  generateFacturiXml,
  formatSagaDate,
  type SagaFactura,
  type SagaLinie,
} from "@/lib/ro-accounting/saga-xml";

type PurchaseRow = {
  id: string;
  site_id: string | null;
  supplier: string | null;
  invoice_number: string | null;
  nir_number: string | null;
  purchase_date: string;
  supplier_rel: { name: string | null; tax_id: string | null }[] | { name: string | null; tax_id: string | null } | null;
  purchase_items: Array<{
    product_id: string | null;
    product_name: string | null;
    quantity: number;
    unit_cost: number | null;
    unit_of_measure: string | null;
    tax_rate: number | null;
  }>;
};

type TransactionItemRow = {
  product_name: string | null;
  quantity: number | null;
  vat_rate: number | null;
  net_amount: number | null;
  vat_amount: number | null;
  gross_amount: number | null;
  line_total: number | null;
  pos_transactions: {
    sold_at: string;
    status: string;
    site_id: string | null;
  } | {
    sold_at: string;
    status: string;
    site_id: string | null;
  }[] | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "nir";
  const from = searchParams.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);
  const fromTs = `${from}T00:00:00.000Z`;
  const toTs = `${to}T23:59:59.999Z`;

  if (type !== "nir" && type !== "iesiri") {
    return new NextResponse("Invalid export type. Use: nir or iesiri", { status: 400 });
  }

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
    .select("name,company_legal_name,anaf_cif,fiscalnet_cif,saga_gestiune_code,saga_export_enabled")
    .eq("id", orgId)
    .single();

  if (!org?.saga_export_enabled) {
    return new NextResponse("Saga module is not installed", { status: 403 });
  }
  const entitled = await hasEntitlement(orgId, "reports.accountant_pack");
  if (!entitled) {
    return new NextResponse("Plan upgrade required for Saga export", { status: 403 });
  }

  const orgName = org?.company_legal_name ?? org?.name ?? "franchisetech";
  const orgCui = org?.anaf_cif ?? org?.fiscalnet_cif ?? "";
  const rawOrgGestiune = (org as Record<string, unknown> | null)?.saga_gestiune_code;
  const orgGestiune = typeof rawOrgGestiune === "string" && rawOrgGestiune.trim()
    ? rawOrgGestiune.trim()
    : undefined;
  const { data: siteRows } = await supabase
    .from("sites")
    .select("id,saga_gestiune_code")
    .eq("organisation_id", orgId);
  const siteGestiuneById = new Map(
    ((siteRows ?? []) as Array<{ id: string; saga_gestiune_code: string | null }>)
      .filter((site) => site.saga_gestiune_code?.trim())
      .map((site) => [site.id, site.saga_gestiune_code!.trim()])
  );
  const gestiuneForSite = (siteId: string | null | undefined) =>
    (siteId ? siteGestiuneById.get(siteId) : undefined) ?? orgGestiune;

  let facturi: SagaFactura[] = [];
  let filename = "";

  try {
    if (type === "nir") {
      // Column names matched to the real production schema (purchases has
      // no supplier_name column -- it's `supplier` (free text) plus an
      // optional FK to suppliers; purchase_items uses unit_cost/
      // unit_of_measure/tax_rate, not unit_price/unit/vat_rate).
      const { data: purchases } = await supabase
        .from("purchases")
        .select(`
          id,
          site_id,
          supplier,
          invoice_number,
          nir_number,
          purchase_date,
          supplier_rel:suppliers(name, tax_id),
          purchase_items(product_id, product_name, quantity, unit_cost, unit_of_measure, tax_rate)
        `)
        .eq("organisation_id", orgId)
        .gte("purchase_date", fromTs)
        .lte("purchase_date", toTs)
        .order("purchase_date");

      // Collect product IDs to look up saga_article_code
      const allProductIds = [
        ...new Set(
          (purchases ?? []).flatMap((p) => (p as PurchaseRow).purchase_items.map((i) => i.product_id).filter(Boolean))
        ),
      ] as string[];
      const articleCodeMap = new Map<string, string>();
      if (allProductIds.length > 0) {
        const { data: prodRows } = await supabase
          .from("products")
          .select("id,saga_article_code")
          .eq("organisation_id", orgId)
          .in("id", allProductIds);
        for (const pr of (prodRows ?? []) as Array<{ id: string; saga_article_code: string | null }>) {
          if (pr.saga_article_code) articleCodeMap.set(pr.id, pr.saga_article_code);
        }
      }

      facturi = ((purchases ?? []) as PurchaseRow[]).map((p) => {
        const supplierRelRaw = p.supplier_rel;
        const supplierRel = Array.isArray(supplierRelRaw) ? supplierRelRaw[0] : supplierRelRaw;
        const supplierCif = supplierRel?.tax_id ?? "";
        const supplierName = supplierRel?.name ?? p.supplier ?? "Furnizor necunoscut";

        const linii: SagaLinie[] = (p.purchase_items ?? []).map((item) => {
          const qty = Number(item.quantity ?? 0);
          const pret = Number(item.unit_cost ?? 0);
          const procTva = Number(item.tax_rate ?? 21);
          const valoare = qty * pret;
          const tva = valoare * (procTva / 100);
          const codArticolFurnizor = item.product_id ? articleCodeMap.get(item.product_id) : undefined;
          return {
            descriere: item.product_name ?? "Produs",
            um: item.unit_of_measure ?? "buc",
            cantitate: qty,
            pret,
            valoare,
            procTva,
            tva,
            ...(codArticolFurnizor ? { codArticolFurnizor } : {}),
          };
        });

        const gestiune = gestiuneForSite(p.site_id);
        return {
          furnizorNume: supplierName,
          furnizorCif: supplierCif,
          clientNume: orgName,
          clientCif: orgCui,
          facturaNumar: p.invoice_number ?? p.nir_number ?? p.id.slice(0, 8).toUpperCase(),
          facturaData: formatSagaDate(p.purchase_date),
          ...(gestiune ? { gestiune } : {}),
          linii,
        };
      });

      filename = `saga-nir-${from}-${to}.xml`;
    } else {
      // Iesiri: FurnizorCIF = own org CIF so Saga routes to Ieșiri
      // Filtered on pos_transactions.sold_at (real sale date), not
      // pos_transaction_items.created_at -- for migrated historical sales,
      // created_at is the bulk-import timestamp, not the real sale date.
      // This generates the actual Saga XML filed with the accountant, so a
      // wrong filter here means a wrong export, not just a wrong UI number.
      const { data: itemsRaw } = await supabase
        .from("pos_transactions")
        .select(`
          sold_at,
          status,
          site_id,
          pos_transaction_items(product_name,quantity,vat_rate,net_amount,vat_amount,gross_amount,line_total)
        `)
        .eq("organisation_id", orgId)
        .gte("sold_at", fromTs)
        .lte("sold_at", toTs);

      type RawTransactionItem = { product_name: string | null; quantity: number | null; vat_rate: number | null; net_amount: number | null; vat_amount: number | null; gross_amount: number | null; line_total: number | null };
      type RawTransaction = { sold_at: string; status: string; site_id: string | null; pos_transaction_items: RawTransactionItem[] };
      const items = ((itemsRaw ?? []) as unknown as RawTransaction[]).flatMap((tx) =>
        (tx.pos_transaction_items ?? []).map((item) => ({
          ...item,
          pos_transactions: { sold_at: tx.sold_at, status: tx.status, site_id: tx.site_id },
        }))
      );

      // Group by (date, product_name, vat_rate) — one Factura per day
      type DayKey = string;
      type LineKey = string;
      const dayMeta = new Map<DayKey, { date: string; gestiune?: string }>();
      const byDay = new Map<DayKey, Map<LineKey, { descriere: string; um: string; cantitate: number; valoare: number; tva: number; procTva: number }>>();

      for (const item of (items ?? []) as TransactionItemRow[]) {
        const txRaw = item.pos_transactions;
        const tx = Array.isArray(txRaw) ? txRaw[0] : txRaw;
        if (!tx || tx.status === "voided") continue;

        const date = tx.sold_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
        const gestiune = gestiuneForSite(tx.site_id);
        const dayKey = `${date}||${gestiune ?? ""}`;
        const productName = item.product_name ?? "Produs necunoscut";
        const procTva = Number(item.vat_rate ?? 0);
        const lineKey = `${productName}||${procTva}`;

        const qty = Number(item.quantity ?? 1);
        const gross = Number(item.gross_amount ?? item.line_total ?? 0);
        const vat = Number(item.vat_amount ?? 0);
        const net = Number(item.net_amount ?? (gross - vat));

        if (!byDay.has(dayKey)) {
          byDay.set(dayKey, new Map());
          dayMeta.set(dayKey, { date, gestiune });
        }
        const dayMap = byDay.get(dayKey)!;

        const existing = dayMap.get(lineKey);
        if (existing) {
          existing.cantitate += qty;
          existing.valoare += net;
          existing.tva += vat;
        } else {
          dayMap.set(lineKey, { descriere: productName, um: "buc", cantitate: qty, valoare: net, tva: vat, procTva });
        }
      }

      facturi = Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dayKey, lineMap]) => {
          const meta = dayMeta.get(dayKey);
          const date = meta?.date ?? dayKey.split("||")[0] ?? new Date().toISOString().slice(0, 10);
          const linii: SagaLinie[] = Array.from(lineMap.values()).map((l) => ({
            descriere: l.descriere,
            um: l.um,
            cantitate: l.cantitate,
            pret: l.cantitate > 0 ? l.valoare / l.cantitate : 0,
            valoare: l.valoare,
            procTva: l.procTva,
            tva: l.tva,
          }));
          return {
            furnizorNume: orgName,
            furnizorCif: orgCui,
            clientNume: "Clienți diverși",
            clientCif: "",
            facturaNumar: `ZR-${date.replace(/-/g, "")}`,
            facturaData: formatSagaDate(date),
            ...(meta?.gestiune ? { gestiune: meta.gestiune } : {}),
            linii,
          };
        });

      filename = `saga-iesiri-${from}-${to}.xml`;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Export error: ${msg}`, { status: 500 });
  }

  const xml = generateFacturiXml(facturi);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
