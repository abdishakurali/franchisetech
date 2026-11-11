import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchProductMap,
  fetchStockMovements,
  StockMovementsQueryError,
  stockMovementQty,
  stockMovementUnitCost,
  type FetchStockMovementsOptions,
  type StockMovementProductRef,
  type StockMovementQueryRow,
} from "@/lib/ro-accounting/stock-movements";

export type VatBucket = { tva19: number; tva9: number; tva5: number; tva0: number; total: number };

/** Net quantity of one product at one snapshotted unit cost (null = unknown). */
export type OpeningStockGroup = {
  product_id: string | null;
  unit_cost: number | null;
  qty: number;
};

export type OpeningStockResult = { openingStock: VatBucket; hasUnknownCost: boolean };

/**
 * Collapse movement rows to (product, unit_cost) groups. Value is linear in
 * quantity at a fixed cost, so sum(qty_i * cost) == cost * sum(qty_i): the
 * opening balance only needs these groups, never the individual rows.
 */
export function groupMovementsForOpeningStock(rows: StockMovementQueryRow[]): OpeningStockGroup[] {
  const groups = new Map<string, OpeningStockGroup>();
  for (const row of rows) {
    const cost = stockMovementUnitCost(row);
    const key = `${row.product_id ?? ""}|${cost ?? "null"}`;
    const g = groups.get(key) ?? { product_id: row.product_id, unit_cost: cost, qty: 0 };
    g.qty += stockMovementQty(row);
    groups.set(key, g);
  }
  return [...groups.values()];
}

/**
 * Opening stock is a NET running balance -- purchases/opening entries add
 * (positive quantity_change), consumption subtracts (negative
 * quantity_change). Math.abs() here would treat consumption as inbound
 * stock and wildly overstate the balance. Movements with no recorded cost
 * are excluded (not valued at today's price) and flag hasUnknownCost.
 */
export function computeOpeningStockFromGroups(
  groups: OpeningStockGroup[],
  productMap: Map<string, StockMovementProductRef>,
): OpeningStockResult {
  const openingStock: VatBucket = { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };
  let hasUnknownCost = false;
  for (const g of groups) {
    if (g.unit_cost == null) {
      hasUnknownCost = true;
      continue;
    }
    const value = g.qty * Number(g.unit_cost);
    const prod = g.product_id ? productMap.get(g.product_id) : undefined;
    const vatRate = Number(prod?.vat_rate ?? 21);

    if (vatRate === 21) openingStock.tva19 += value;
    else if (vatRate === 11) openingStock.tva9 += value;
    else if (vatRate === 5) openingStock.tva5 += value;
    else openingStock.tva0 += value;
    openingStock.total += value;
  }
  return { openingStock, hasUnknownCost };
}

const GROUP_PAGE_SIZE = 1000;
/** PostgREST error when db-aggregates-enabled is off (Supabase default). */
const AGGREGATES_DISABLED = "PGRST123";

type AggregateRow = { product_id: string | null; unit_cost: number | string | null; sum: number | string | null };

/**
 * One grouped query in the database: sum(quantity_change) per
 * (product_id, unit_cost) before the period. Returns null when PostgREST
 * aggregates are not enabled on this project, so the caller can fall back.
 */
async function fetchOpeningGroupsAggregated(
  supabase: SupabaseClient,
  orgId: string,
  before: string,
  options: FetchStockMovementsOptions,
): Promise<OpeningStockGroup[] | null> {
  const groups: OpeningStockGroup[] = [];
  for (let page = 0; ; page += 1) {
    let query = supabase
      .from("stock_movements_reconciled")
      .select("product_id,unit_cost,quantity_change.sum()")
      .eq("organisation_id", orgId)
      .lt("performed_at", before)
      .order("product_id")
      .order("unit_cost")
      .range(page * GROUP_PAGE_SIZE, page * GROUP_PAGE_SIZE + GROUP_PAGE_SIZE - 1);
    if (options.signal) query = query.abortSignal(options.signal);
    const { data, error } = await query;
    if (error) {
      if (error.code === AGGREGATES_DISABLED) return null;
      throw new StockMovementsQueryError(`opening stock aggregate failed: ${error.message}`, error);
    }
    const rows = (data ?? []) as unknown as AggregateRow[];
    for (const r of rows) {
      groups.push({
        product_id: r.product_id,
        unit_cost: r.unit_cost == null ? null : Number(r.unit_cost),
        qty: Number(r.sum ?? 0),
      });
    }
    if (rows.length < GROUP_PAGE_SIZE) return groups;
  }
}

/**
 * Net quantity per (product, snapshotted unit_cost) for every movement
 * before `before`: one grouped database aggregate, or -- when PostgREST
 * aggregates are off -- the four needed columns streamed with keyset
 * pagination and grouped here. Throws on a failed query.
 */
export async function fetchOpeningStockGroups(
  supabase: SupabaseClient,
  orgId: string,
  before: string,
  options: { signal?: AbortSignal } = {},
): Promise<OpeningStockGroup[]> {
  const opts: FetchStockMovementsOptions = { ...options, throwOnError: true };
  const groups = await fetchOpeningGroupsAggregated(supabase, orgId, before, opts);
  if (groups != null) return groups;
  const rows = await fetchStockMovements(
    supabase,
    orgId,
    { before },
    { ...opts, select: "id,product_id,quantity_change,unit_cost,performed_at", skipProducts: true },
  );
  return groupMovementsForOpeningStock(rows);
}

type LedgerAggregateRow = { product_id: string | null; sum: number | string | null };

/**
 * Ledger quantity per product over the WHOLE movement history (what
 * sum(quantity_change) says is on hand), as one grouped database aggregate
 * instead of downloading every movement ever recorded. Falls back to
 * keyset-paged rows when PostgREST aggregates are off. Throws on failure.
 */
export async function fetchLedgerQtyByProduct(
  supabase: SupabaseClient,
  orgId: string,
  options: { signal?: AbortSignal } = {},
): Promise<Map<string, number>> {
  const totals = new Map<string, number>();
  for (let page = 0; ; page += 1) {
    let query = supabase
      .from("stock_movements_reconciled")
      .select("product_id,quantity_change.sum()")
      .eq("organisation_id", orgId)
      .order("product_id")
      .range(page * GROUP_PAGE_SIZE, page * GROUP_PAGE_SIZE + GROUP_PAGE_SIZE - 1);
    if (options.signal) query = query.abortSignal(options.signal);
    const { data, error } = await query;
    if (error) {
      if (error.code !== AGGREGATES_DISABLED) {
        throw new StockMovementsQueryError(`ledger quantity aggregate failed: ${error.message}`, error);
      }
      const rows = await fetchStockMovements(
        supabase,
        orgId,
        {},
        { ...options, throwOnError: true, select: "id,product_id,quantity_change,performed_at", skipProducts: true },
      );
      totals.clear();
      for (const row of rows) {
        if (!row.product_id) continue;
        totals.set(row.product_id, (totals.get(row.product_id) ?? 0) + stockMovementQty(row));
      }
      return totals;
    }
    const rows = (data ?? []) as unknown as LedgerAggregateRow[];
    for (const r of rows) {
      if (r.product_id) totals.set(r.product_id, Number(r.sum ?? 0));
    }
    if (rows.length < GROUP_PAGE_SIZE) return totals;
  }
}

/**
 * Opening stock value per VAT bucket for everything before `before`.
 * Uses a database aggregate when available; otherwise streams only the
 * four columns it needs with keyset pagination and groups in memory.
 * Always throws on a failed query -- a partial history would print a wrong
 * Stoc initial on a fiscal report.
 */
export async function fetchOpeningStock(
  supabase: SupabaseClient,
  orgId: string,
  before: string,
  options: { signal?: AbortSignal } = {},
): Promise<OpeningStockResult> {
  const opts: FetchStockMovementsOptions = { ...options, throwOnError: true };
  const groups = await fetchOpeningStockGroups(supabase, orgId, before, options);

  const productIds = [...new Set(groups.map((g) => g.product_id).filter(Boolean))] as string[];
  const productMap = await fetchProductMap(supabase, orgId, productIds, opts);
  return computeOpeningStockFromGroups(groups, productMap);
}
