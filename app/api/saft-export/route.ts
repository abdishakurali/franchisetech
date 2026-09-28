/**
 * SAF-T D406 Export API — stock movements (draft, per lib/ro-accounting/saf-t-xml.ts).
 *
 * Query params:
 *   org:   organisation id (optional — defaults to the caller's own org)
 *   month: 1-12
 *   year:  e.g. 2026
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { hasAccountantPartnerAccess } from "@/lib/accountant/permissions";
import { fetchStockMovements, stockMovementQty, stockMovementProduct } from "@/lib/ro-accounting/stock-movements";
import {
  generateSaftXml,
  type SaftProduct,
  type SaftSupplier,
  type SaftStockMovementInput,
} from "@/lib/ro-accounting/saf-t-xml";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestedOrgId = searchParams.get("org");
  const now = new Date();
  const ym = searchParams.get("ym");
  const ymMatch = ym?.match(/^(\d{4})-(\d{2})$/);
  const year = ymMatch ? Number(ymMatch[1]) : Number(searchParams.get("year") ?? now.getUTCFullYear());
  const month = ymMatch ? Number(ymMatch[2]) : Number(searchParams.get("month") ?? now.getUTCMonth() + 1);
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
    return new NextResponse("Invalid month or year", { status: 400 });
  }
  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, month, 1)).toISOString();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id,role,accountant_permissions")
    .eq("user_id", user.id)
    .in("role", ["owner", "manager", "accountant"])
    .or("status.is.null,status.eq.active")
    .eq(requestedOrgId ? "organisation_id" : "user_id", requestedOrgId ?? user.id)
    .limit(1)
    .single();
  if (!membership) return new NextResponse("No org", { status: 403 });
  const orgId = membership.organisation_id;
  const accountantPermissions = Array.isArray(membership.accountant_permissions) ? membership.accountant_permissions : [];
  if (membership.role === "accountant" && !accountantPermissions.some((p: string) => p === "stock" || p === "purchases")) {
    return new NextResponse("Acces interzis pentru acest export.", { status: 403 });
  }

  const entitled = await hasEntitlement(orgId, "reports.accountant_pack");
  if (!entitled && !(await hasAccountantPartnerAccess(supabase, orgId))) {
    return new NextResponse("Plan upgrade required for SAF-T export", { status: 403 });
  }

  const { data: org } = await supabase
    .from("organisations")
    .select("name,company_legal_name,anaf_cif,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const { data: vatRateRows } = await supabase
    .from("vat_rates")
    .select("name,rate")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("sort_order");

  const movementRows = await fetchStockMovements(supabase, orgId, { from, to });

  const { data: purchaseRows } = await supabase
    .from("purchases")
    .select("supplier,supplier_id,supplier_rel:suppliers(id,name)")
    .eq("organisation_id", orgId)
    .gte("purchase_date", from)
    .lte("purchase_date", to);

  type PurchaseRow = { supplier: string | null; supplier_id: string | null; supplier_rel: { id: string; name: string | null } | { id: string; name: string | null }[] | null };
  const supplierMap = new Map<string, string>();
  for (const p of (purchaseRows ?? []) as PurchaseRow[]) {
    const rel = Array.isArray(p.supplier_rel) ? p.supplier_rel[0] : p.supplier_rel;
    const id = rel?.id ?? p.supplier_id;
    const name = rel?.name ?? p.supplier;
    if (id && name) supplierMap.set(id, name);
  }
  const suppliers: SaftSupplier[] = [...supplierMap.entries()].map(([supplierId, name]) => ({ supplierId, name }));

  const productMap = new Map<string, SaftProduct>();
  const movements: SaftStockMovementInput[] = [];
  for (const row of movementRows) {
    const product = stockMovementProduct(row);
    // Prefer the merchant's own product code (SKU) — an accountant reading
    // this file needs something they can cross-reference against NIRs and
    // invoices, not the product's internal database id. Only falls back to
    // the row id when the product was never given a SKU.
    const productCode = product?.sku || row.product_id || "UNKNOWN";
    if (!productMap.has(productCode)) {
      productMap.set(productCode, {
        productCode,
        description: product?.name ?? "Produs necunoscut",
        unitOfMeasure: product?.unit_of_measure ?? row.unit_of_measure ?? "buc",
      });
    }
    const qty = stockMovementQty(row);
    movements.push({
      productCode,
      quantity: qty,
      unitOfMeasure: row.unit_of_measure ?? product?.unit_of_measure ?? "buc",
      dbMovementType: row.movement_type ?? "manual_adjustment",
      movementDate: row.performed_at,
      bookValue: row.unit_cost != null ? row.unit_cost * Math.abs(qty) : null,
      // STOCK_MOVEMENT_SELECT fetches "reason" but StockMovementQueryRow doesn't
      // declare it — same gap other callers of fetchStockMovements would hit.
      comments: (row as { reason?: string | null }).reason ?? null,
    });
  }

  const monthStart = String(month).padStart(2, "0");
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const xml = generateSaftXml({
    header: {
      cif: org?.anaf_cif ?? org?.fiscalnet_cif ?? "",
      companyName: org?.company_legal_name ?? org?.name ?? "franchisetech",
      selectionStartDate: `${year}-${monthStart}-01`,
      selectionEndDate: `${year}-${monthStart}-${String(daysInMonth).padStart(2, "0")}`,
    },
    suppliers,
    products: [...productMap.values()],
    taxRates: (vatRateRows ?? []).map((r) => ({ name: r.name as string, rate: Number(r.rate) })),
    movements,
  });

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="saft-d406-${year}-${monthStart}.xml"`,
    },
  });
}
