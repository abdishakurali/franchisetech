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
  const prod = stockMovementProduct(row);
  return Number(prod?.cost_price ?? 0);
}

export function stockMovementUnit(row: StockMovementQueryRow): string {
  return row.unit_of_measure ?? stockMovementProduct(row)?.unit_of_measure ?? "buc";
}

/** Production schema: quantity_change on movements; cost from products.cost_price. */
export const STOCK_MOVEMENT_SELECT =
  "id,product_id,quantity_change,unit_of_measure,movement_type,performed_at,reason";

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
  let query = supabase
    .from("stock_movements")
    .select(STOCK_MOVEMENT_SELECT)
    .eq("organisation_id", orgId);

  if (filters.movementType) query = query.eq("movement_type", filters.movementType);
  if (filters.from) query = query.gte("performed_at", filters.from);
  if (filters.to) query = query.lte("performed_at", filters.to);
  if (filters.before) query = query.lt("performed_at", filters.before);

  const { data: rows, error } = await query.order("performed_at");
  if (error || !rows?.length) return [];

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
