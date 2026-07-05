/** Production stock_movements uses quantity_change (not quantity). */

import type { SupabaseClient } from "@supabase/supabase-js";

export type StockMovementProductRef = {
  cost_price?: number | null;
  vat_rate?: number | null;
  name?: string;
  unit_of_measure?: string | null;
};

export type StockMovementQueryRow = {
  product_id: string | null;
  quantity_change?: number | null;
  quantity?: number | null;
  unit_cost?: number | null;
  unit_of_measure?: string | null;
  movement_type?: string;
  performed_at: string;
  products?: StockMovementProductRef | StockMovementProductRef[] | null;
};

export function stockMovementQty(row: Pick<StockMovementQueryRow, "quantity_change" | "quantity">): number {
  return Number(row.quantity_change ?? row.quantity ?? 0);
}

export function stockMovementProduct(row: StockMovementQueryRow): StockMovementProductRef | null {
  if (!row.products) return null;
  return Array.isArray(row.products) ? row.products[0] ?? null : row.products;
}

export function stockMovementUnitCost(row: StockMovementQueryRow): number {
  // Prefer the cost snapshotted on the movement itself (CMP at time of consumption).
  // Falls back to the product's current cost_price for legacy rows without unit_cost.
  if (row.unit_cost != null) return Number(row.unit_cost);
  const prod = stockMovementProduct(row);
  return Number(prod?.cost_price ?? 0);
}

export function stockMovementUnit(row: StockMovementQueryRow): string {
  return row.unit_of_measure ?? stockMovementProduct(row)?.unit_of_measure ?? "buc";
}

/** Production schema: quantity_change on movements; unit_cost snapshotted at insert time. */
export const STOCK_MOVEMENT_SELECT =
  "id,product_id,quantity_change,unit_cost,unit_of_measure,movement_type,performed_at,reason";

const PAGE_SIZE = 1000;

export async function fetchStockMovements(
  supabase: SupabaseClient,
  orgId: string,
  filters: {
    movementType?: string;
    from?: string;
    to?: string;
    before?: string;
  } = {},
): Promise<StockMovementQueryRow[]> {
  // Reads from the unified view (observed stock_movements + any historical
  // reconciliation entries) so reports reflect the complete, corrected
  // picture from a single source. See supabase/migrations/20260704150000_stock_movement_reconciliations.sql.
  //
  // Paginated explicitly: a long-lived organisation can easily exceed
  // PostgREST's default 1000-row response cap (this org alone has 13,900+
  // rows before a recent date), and an un-paginated .select() would
  // silently truncate to the oldest page instead of erroring -- producing a
  // wrong-but-plausible-looking total with no indication anything was cut.
  const rows: StockMovementQueryRow[] = [];
  let page = 0;
  for (;;) {
    let query = supabase
      .from("stock_movements_reconciled")
      .select(STOCK_MOVEMENT_SELECT)
      .eq("organisation_id", orgId);

    if (filters.movementType) query = query.eq("movement_type", filters.movementType);
    if (filters.from) query = query.gte("performed_at", filters.from);
    if (filters.to) query = query.lte("performed_at", filters.to);
    if (filters.before) query = query.lt("performed_at", filters.before);

    const { data, error } = await query
      .order("performed_at")
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) {
      console.error("[fetchStockMovements] query failed", { orgId, filters, page, error: error.message });
      break;
    }
    if (!data?.length) break;

    rows.push(...(data as StockMovementQueryRow[]));
    if (data.length < PAGE_SIZE) break;
    page += 1;
  }

  if (!rows.length) return [];

  const productIds = [...new Set(rows.map((r) => r.product_id).filter(Boolean))] as string[];
  const productMap = new Map<string, StockMovementProductRef>();

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id,name,unit_of_measure,cost_price,vat_rate")
      .eq("organisation_id", orgId)
      .in("id", productIds);

    for (const p of (products ?? []) as Array<StockMovementProductRef & { id: string }>) {
      productMap.set(p.id, p);
    }
  }

  return rows.map((row) => ({
    ...row,
    products: row.product_id ? productMap.get(row.product_id) ?? null : null,
  })) as StockMovementQueryRow[];
}
