import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { listOperationalUnitNames, validateOperationalUnit } from "@/lib/units-of-measure";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";

// ── helpers ────────────────────────────────────────────────────────────────
function parseCsvText(raw: string): Record<string, string>[] {
  const lines = raw.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    // Handle quoted fields
    const cols: string[] = [];
    let cur = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
  });
}

function safe(v: string | undefined) { return (v ?? "").trim(); }
function safeNum(v: string | undefined) { return Number(v ?? 0) || 0; }

// ── route ──────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
      .from("organisation_members")
      .select("organisation_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!membership) return NextResponse.json({ error: "No organisation" }, { status: 400 });
    if (!["owner", "manager"].includes(membership.role ?? "")) {
      return NextResponse.json({ error: "Manager access required" }, { status: 403 });
    }

    const orgId = membership.organisation_id as string;
    try {
      await assertEntitlement(orgId, "purchases.nir");
    } catch (error) {
      const response = entitlementDeniedResponse(error);
      if (response) return response;
      throw error;
    }

    // ── parse body ──────────────────────────────────────────────────────
    let rows: Record<string, string>[] = [];
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      // File upload takes priority over pasted text
      const file = fd.get("csv_file") as File | null;
      const csvText = fd.get("csv_text") as string | null;
      if (file && file.size > 0) {
        rows = parseCsvText(await file.text());
      } else if (csvText) {
        rows = parseCsvText(csvText);
      }
    } else {
      const text = await req.text();
      rows = parseCsvText(text);
    }

    if (!rows.length) {
      return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
    }

    // ── validate required columns ───────────────────────────────────────
    const required = ["product_name", "quantity", "unit_cost"];
    const parseErrors: string[] = [];
    const validRows = rows.filter((r, i) => {
      const missing = required.filter((col) => !safe(r[col]));
      if (missing.length) {
        parseErrors.push(`Row ${i + 2}: missing ${missing.join(", ")}`);
        return false;
      }
      if (isNaN(safeNum(r.quantity)) || safeNum(r.quantity) <= 0) {
        parseErrors.push(`Row ${i + 2}: quantity must be > 0`);
        return false;
      }
      if (isNaN(safeNum(r.unit_cost)) || safeNum(r.unit_cost) < 0) {
        parseErrors.push(`Row ${i + 2}: unit_cost must be >= 0`);
        return false;
      }
      return true;
    });

    if (!validRows.length) {
      return NextResponse.json({ error: "All rows failed validation", errors: parseErrors }, { status: 400 });
    }

    const [allowedUnits, vatRates] = await Promise.all([
      listOperationalUnitNames(supabase, orgId),
      listActiveVatRates(supabase, orgId),
    ]);
    const defaultUnit = allowedUnits[0] ?? "each";
    const defaultVatRate = getDefaultVatRateValue(vatRates);
    const unitErrors = validRows.flatMap((row, i) => {
      const rawUnit = safe(row.unit) || defaultUnit;
      const validation = validateOperationalUnit(rawUnit, allowedUnits);
      return validation.ok ? [] : [`Row ${i + 2}: ${validation.error}`];
    });
    if (unitErrors.length) {
      return NextResponse.json({ error: "Invalid unit of measure", errors: unitErrors }, { status: 400 });
    }

    // ── resolve suppliers ───────────────────────────────────────────────
    const supplierNames = [...new Set(validRows.map((r) => safe(r.supplier_name)).filter(Boolean))];
    const { data: existingSuppliers } = await supabase
      .from("suppliers")
      .select("id, name")
      .eq("organisation_id", orgId)
      .in("name", supplierNames.length ? supplierNames : ["__never__"]);

    const supplierMap = new Map((existingSuppliers ?? []).map((s) => [s.name.toLowerCase(), s.id as string]));
    let suppliersCreated = 0;

    for (const name of supplierNames) {
      if (!supplierMap.has(name.toLowerCase())) {
        const { data: ns } = await supabase
          .from("suppliers")
          .insert({ organisation_id: orgId, name, active: true })
          .select("id")
          .single();
        if (ns?.id) { supplierMap.set(name.toLowerCase(), ns.id); suppliersCreated++; }
      }
    }

    // ── resolve products ────────────────────────────────────────────────
    const productNames = [...new Set(validRows.map((r) => safe(r.product_name)).filter(Boolean))];
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id, name, current_stock_qty, cost_price, unit_of_measure")
      .eq("organisation_id", orgId)
      .in("name", productNames.length ? productNames : ["__never__"]);

    const productMap = new Map(
      (existingProducts ?? []).map((p) => [
        p.name.toLowerCase(),
        { id: p.id as string, current_stock_qty: Number(p.current_stock_qty ?? 0), unit_of_measure: p.unit_of_measure as string | null },
      ])
    );
    let productsCreated = 0;

    for (const row of validRows) {
      const name = safe(row.product_name);
      if (!productMap.has(name.toLowerCase())) {
        const unitOfMeasure = safe(row.unit) || defaultUnit;
        const { data: np } = await supabase
          .from("products")
          .insert({
            organisation_id: orgId,
            name,
            unit_of_measure: unitOfMeasure,
            cost_price: safeNum(row.unit_cost),
            sale_price: 0,
            vat_rate: defaultVatRate,
            is_ingredient: true,
            is_stock_tracked: true,
            is_sellable: false,
            available_in_pos: false,
            current_stock_qty: 0,
            active: true,
          })
          .select("id")
          .single();
        if (np?.id) {
          productMap.set(name.toLowerCase(), { id: np.id, current_stock_qty: 0, unit_of_measure: unitOfMeasure });
          productsCreated++;
        }
      }
    }

    // ── group into purchases by (supplier + date + invoice) ─────────────
    type PurchaseGroup = {
      supplierName: string;
      supplierId: string | null;
      purchaseDate: string;
      invoiceNumber: string | null;
      rows: typeof validRows;
    };

    const groupKey = (r: Record<string, string>) =>
      `${safe(r.supplier_name)}||${safe(r.purchased_at) || new Date().toISOString().slice(0, 10)}||${safe(r.invoice_number)}`;

    const groupMap = new Map<string, PurchaseGroup>();
    for (const row of validRows) {
      const k = groupKey(row);
      if (!groupMap.has(k)) {
        const supplierName = safe(row.supplier_name);
        groupMap.set(k, {
          supplierName,
          supplierId: supplierMap.get(supplierName.toLowerCase()) ?? null,
          purchaseDate: safe(row.purchased_at) || new Date().toISOString().slice(0, 10),
          invoiceNumber: safe(row.invoice_number) || null,
          rows: [],
        });
      }
      groupMap.get(k)!.rows.push(row);
    }

    // ── create purchases + items + update stock ──────────────────────────
    let purchasesCreated = 0;
    let itemsImported = 0;
    const importErrors: string[] = [...parseErrors];

    for (const group of groupMap.values()) {
      const totalAmount = group.rows.reduce(
        (s, r) => s + safeNum(r.quantity) * safeNum(r.unit_cost),
        0
      );

      const purchaseDateStr = group.purchaseDate;
      const purchasedAt = (() => {
        try {
          const d = new Date(`${purchaseDateStr}T12:00:00`);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        } catch { return new Date().toISOString(); }
      })();

      const { data: purchase, error: purchaseErr } = await supabase
        .from("purchases")
        .insert({
          organisation_id: orgId,
          supplier_id: group.supplierId || null,
          supplier: group.supplierName || "Direct",
          purchased_at: purchasedAt,
          purchase_date: purchaseDateStr,
          reference: group.invoiceNumber,
          invoice_number: group.invoiceNumber,
          total_amount: totalAmount,
          status: "received",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (purchaseErr || !purchase) {
        importErrors.push(`Could not create purchase for ${group.supplierName}: ${purchaseErr?.message ?? "unknown"}`);
        continue;
      }
      purchasesCreated++;

      for (const row of group.rows) {
        const productName = safe(row.product_name);
        const productEntry = productMap.get(productName.toLowerCase());
        if (!productEntry) {
          importErrors.push(`Product not found after lookup: ${productName}`);
          continue;
        }

        const qty = safeNum(row.quantity);
        const unitCost = safeNum(row.unit_cost);
        const totalCost = qty * unitCost;
        const unitOfMeasure = safe(row.unit) || productEntry.unit_of_measure || defaultUnit;

        // Insert purchase item
        await supabase.from("purchase_items").insert({
          organisation_id: orgId,
          purchase_id: purchase.id,
          product_id: productEntry.id,
          product_name: productName,
          item_name: productName,
          quantity: qty,
          unit_cost: unitCost,
          total_cost: totalCost,
          unit_of_measure: unitOfMeasure,
          tax_rate: defaultVatRate,
          tax_amount: (totalCost * defaultVatRate) / 100,
        });

        // Update product stock and cost
        const { data: currentProduct } = await supabase
          .from("products")
          .select("current_stock_qty")
          .eq("id", productEntry.id)
          .single();

        const newQty = Number((Number(currentProduct?.current_stock_qty ?? 0) + qty).toFixed(3));

        await supabase
          .from("products")
          .update({ current_stock_qty: newQty, cost_price: unitCost })
          .eq("id", productEntry.id)
          .eq("organisation_id", orgId);

        // Stock movement
        await supabase.from("stock_movements").insert({
          organisation_id: orgId,
          product_id: productEntry.id,
          movement_type: "purchase_received",
          quantity_change: qty,
          unit_of_measure: unitOfMeasure,
          reference_type: "purchase",
          reference_id: purchase.id,
          reason: group.invoiceNumber ? `Invoice ${group.invoiceNumber}` : `Purchase import`,
          performed_by: user.id,
        }).then(() => null, () => null); // non-fatal

        // Update our local cache for subsequent rows
        productEntry.current_stock_qty = newQty;
        itemsImported++;
      }
    }

    return NextResponse.json({
      ok: true,
      purchases_created: purchasesCreated,
      items_imported: itemsImported,
      suppliers_created: suppliersCreated,
      products_created: productsCreated,
      errors: importErrors.slice(0, 20),
      skipped: validRows.length - itemsImported,
      imported: itemsImported,
    });

  } catch (err: unknown) {
    console.error("Purchases import error:", err);
    return NextResponse.json(
      { error: "Import failed", detail: String((err as Error)?.message ?? err) },
      { status: 500 }
    );
  }
}
