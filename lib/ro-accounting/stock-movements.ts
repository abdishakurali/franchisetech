/** Production stock_movements uses quantity_change (not quantity). */

import type { SupabaseClient } from "@supabase/supabase-js";

export type StockMovementProductRef = {
  cost_price?: number | null;
  vat_rate?: number | null;
  name?: string;
  unit_of_measure?: string | null;
  sku?: string | null;
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

/**
 * The cost snapshotted on the movement itself (CMP at time of consumption
 * for sale_used/return; the price paid for purchase_received). Returns null
 * when the row has no unit_cost recorded — this is not rare (org-wide,
 * roughly 14.7% of sale_used rows and 8.75% of purchase_received rows have
 * no unit_cost, mostly rows predating the column or a product whose
 * cost_price was still unset at the time).
 *
 * This used to fall back to the product's CURRENT cost_price when the row's
 * own value was missing — silently substituting today's price for a
 * historical row's unknown one, in every report built on this helper. Null
 * means unknown; callers must render that as unknown, not fill it in.
 */
export function stockMovementUnitCost(row: StockMovementQueryRow): number | null {
  if (row.unit_cost == null) return null;
  return Number(row.unit_cost);
}

export function stockMovementUnit(row: StockMovementQueryRow): string {
  return row.unit_of_measure ?? stockMovementProduct(row)?.unit_of_measure ?? "buc";
}

/** Production schema: quantity_change on movements; unit_cost snapshotted at insert time. */
export const STOCK_MOVEMENT_SELECT =
  "id,product_id,quantity_change,unit_cost,unit_of_measure,movement_type,performed_at,reason";

const PAGE_SIZE = 1000;

/** Thrown (only when the caller opts in with `throwOnError`) instead of
 * silently returning a truncated list when a page query fails. */
export class StockMovementsQueryError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "StockMovementsQueryError";
  }
}

export type FetchStockMovementsOptions = {
  /** Abort in-flight queries once the caller's time budget is spent. */
  signal?: AbortSignal;
  /** Throw StockMovementsQueryError on a failed page instead of logging and
   * returning the rows fetched so far (the legacy behaviour, which can turn
   * a timeout into a wrong-but-plausible total). */
  throwOnError?: boolean;
  /** Narrower column list; must include id and performed_at (keyset). */
  select?: string;
  /** Skip the products lookup (caller resolves products itself). */
  skipProducts?: boolean;
};

/** Quote a value for use inside a PostgREST or=(...) filter. */
function pgrstQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export async function fetchProductMap(
  supabase: SupabaseClient,
  orgId: string,
  productIds: string[],
  options: FetchStockMovementsOptions = {},
): Promise<Map<string, StockMovementProductRef>> {
  const productMap = new Map<string, StockMovementProductRef>();
  if (productIds.length === 0) return productMap;

  let query = supabase
    .from("products")
    .select("id,name,unit_of_measure,cost_price,vat_rate,sku")
    .eq("organisation_id", orgId)
    .in("id", productIds);
  if (options.signal) query = query.abortSignal(options.signal);
  const { data: products, error } = await query;
  if (error && options.throwOnError) {
    throw new StockMovementsQueryError(`products lookup failed: ${error.message}`, error);
  }

  for (const p of (products ?? []) as Array<StockMovementProductRef & { id: string }>) {
    productMap.set(p.id, p);
  }
  return productMap;
}

export async function fetchStockMovements(
  supabase: SupabaseClient,
  orgId: string,
  filters: {
    movementType?: string;
    from?: string;
    to?: string;
    before?: string;
  } = {},
  options: FetchStockMovementsOptions = {},
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
  //
  // Keyset (seek) pagination on (performed_at, id), NOT .range() offsets:
  // OFFSET n makes Postgres produce and discard n rows (through the UNION
  // ALL view and its RLS checks) on every page, so page k costs ~k pages of
  // work and the whole fetch is quadratic. On 2026-11-10 that pushed pages
  // 18-22 of a `before` query past the statement timeout and the gestiune PDF
  // route past Vercel's 300 s limit. Each keyset page starts where the last
  // one ended, so every page costs the same.
  const rows: StockMovementQueryRow[] = [];
  let cursor: { performedAt: string; id: string } | null = null;
  let page = 0;
  for (;;) {
    let query = supabase
      .from("stock_movements_reconciled")
      .select(options.select ?? STOCK_MOVEMENT_SELECT)
      .eq("organisation_id", orgId);

    if (filters.movementType) query = query.eq("movement_type", filters.movementType);
    if (filters.from) query = query.gte("performed_at", filters.from);
    if (filters.to) query = query.lte("performed_at", filters.to);
    if (filters.before) query = query.lt("performed_at", filters.before);
    if (cursor) {
      const ts = pgrstQuote(cursor.performedAt);
      query = query
        .gte("performed_at", cursor.performedAt)
        .or(`performed_at.gt.${ts},and(performed_at.eq.${ts},id.gt.${pgrstQuote(cursor.id)})`);
    }

    let ordered = query.order("performed_at").order("id").limit(PAGE_SIZE);
    if (options.signal) ordered = ordered.abortSignal(options.signal);
    const { data, error } = await ordered;

    if (error) {
      console.error("[fetchStockMovements] query failed", { orgId, filters, page, error: error.message });
      if (options.throwOnError) {
        throw new StockMovementsQueryError(`stock movements page ${page} failed: ${error.message}`, error);
      }
      break;
    }
    if (!data?.length) break;

    const pageRows = data as unknown as Array<StockMovementQueryRow & { id: string }>;
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) break;
    const last = pageRows[pageRows.length - 1];
    cursor = { performedAt: last.performed_at, id: last.id };
    page += 1;
  }

  if (!rows.length) return [];
  if (options.skipProducts) return rows;

  const productIds = [...new Set(rows.map((r) => r.product_id).filter(Boolean))] as string[];
  const productMap = await fetchProductMap(supabase, orgId, productIds, options);

  return rows.map((row) => ({
    ...row,
    products: row.product_id ? productMap.get(row.product_id) ?? null : null,
  })) as StockMovementQueryRow[];
}
