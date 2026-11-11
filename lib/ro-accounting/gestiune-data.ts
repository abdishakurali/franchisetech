import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementProduct,
  stockMovementUnitCost,
  StockMovementsQueryError,
  type StockMovementQueryRow,
} from "@/lib/ro-accounting/stock-movements";
import { fetchOpeningStock, type VatBucket } from "@/lib/ro-accounting/opening-stock";
import type { GestiuneMovement } from "@/lib/ro-accounting/gestiune";
import { fetchAll } from "@/lib/supabase/fetch-all";

export type GestiunePurchaseRow = {
  id: string;
  purchase_date: string;
  supplier: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  tax_total: number | null;
  purchase_items: Array<{ tax_rate: number | null; total_cost: number | null }>;
};

export type GestiuneLabels = {
  openingBalance: string;
  unknownSupplier: string;
  rawConsumption: string;
  zReportItems: (count: number) => string;
};

export type GestiuneReportData = {
  org: { name: string | null; fiscalnet_cif: string | null } | null;
  movements: GestiuneMovement[];
  totals: {
    intrari19: number; intrari9: number; intrari5: number; intrari0: number; intrariTotal: number;
    iesiri19: number; iesiri9: number; iesiri5: number; iesiri0: number; iesiriTotal: number;
  };
  openingStock: VatBucket;
  closingStock: VatBucket;
  /** True if any opening-stock or period movement in this report had
   * no recorded cost. Those movements contribute 0 to their VAT bucket
   * rather than today's price standing in for an unknown historical one --
   * so every total below is a known floor whenever this is true, not
   * necessarily the complete figure. */
  hasUnknownCost: boolean;
};

const emptyBucket = (): VatBucket => ({ tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 });
const VAT_KEYS = ["tva19", "tva9", "tva5", "tva0"] as const;

function addToBucket(bucket: VatBucket, vatRate: number, value: number) {
  if (vatRate === 21) bucket.tva19 += value;
  else if (vatRate === 11) bucket.tva9 += value;
  else if (vatRate === 5) bucket.tva5 += value;
  else bucket.tva0 += value;
  bucket.total += value;
}

/** Split a signed bucket into its positive part and the magnitude of its negative part. */
function splitBySign(bucket: VatBucket): { plus: VatBucket; minus: VatBucket } {
  const plus = emptyBucket();
  const minus = emptyBucket();
  for (const k of VAT_KEYS) {
    if (bucket[k] > 0) plus[k] += bucket[k];
    else if (bucket[k] < 0) minus[k] += -bucket[k];
  }
  plus.total = VAT_KEYS.reduce((s, k) => s + plus[k], 0);
  minus.total = VAT_KEYS.reduce((s, k) => s + minus[k], 0);
  return { plus, minus };
}

/** Float noise only (far below a ban), so skipping the row never moves a printed total. */
const isZero = (b: VatBucket) => VAT_KEYS.every((k) => Math.abs(b[k]) < 1e-6);

/**
 * Descriptions for stock movements that are neither a NIR purchase nor a
 * sale consumption. Every one of these is already counted in the next
 * period's Stoc inițial (opening-stock.ts sums ALL movement types), so the
 * period must show them too -- otherwise Stoc final(N) != Stoc inițial(N+1).
 * Rows are kept single-signed: "plus" rows are entries, "minus" rows exits.
 */
const ADJUSTMENT_DESCRIPTIONS: Record<string, { plus: string; minus: string }> = {
  manual_adjustment: { plus: "Ajustare manuală stoc (plus)", minus: "Ajustare manuală stoc (minus)" },
  wastage: { plus: "Pierderi / casare (corecție plus)", minus: "Pierderi / casare" },
  return: { plus: "Retur reintrat în stoc", minus: "Retur (corecție minus)" },
  opening: { plus: "Sold inițial introdus în perioadă", minus: "Sold inițial introdus (corecție minus)" },
  invoice_sale: { plus: "Ieșire pe factură (corecție plus)", minus: "Ieșire pe factură" },
  free_issue: { plus: "Transfer gratuit (corecție plus)", minus: "Transfer gratuit" },
  invoice_return: { plus: "Stornare factură (reintrare în stoc)", minus: "Stornare factură (corecție minus)" },
};

const NIR_LEDGER_DIFFERENCE = {
  plus: "Diferență recepție în stoc față de NIR (plus)",
  minus: "Diferență recepție în stoc față de NIR (minus)",
};

function adjustmentDescription(movementType: string, sign: "plus" | "minus"): string {
  return ADJUSTMENT_DESCRIPTIONS[movementType]?.[sign] ?? `Mișcare stoc „${movementType}” (${sign})`;
}

/** One movement's signed value (positive = into stock) and its VAT rate, or null when its cost is unknown. */
function movementValue(m: StockMovementQueryRow): { value: number; vatRate: number } | null {
  const cost = stockMovementUnitCost(m);
  if (cost == null) return null;
  return {
    value: stockMovementQty(m) * cost,
    vatRate: Number(stockMovementProduct(m)?.vat_rate ?? 21),
  };
}

export type GestiunePeriod = {
  movements: GestiuneMovement[];
  totals: GestiuneReportData["totals"];
  closingStock: VatBucket;
  hasUnknownCost: boolean;
};

/**
 * Pure period computation (no I/O), so continuity can be tested directly.
 *
 * Stoc final must be the same ledger balance that the next period opens
 * with. fetchOpeningStock values every stock_movements_reconciled row before
 * the date at quantity_change * unit_cost, bucketed by the product's VAT
 * rate. So the period has to account for every movement in it, on that same
 * basis:
 *   - NIR rows come from the purchases table (the signed document: NIR date,
 *     invoiced quantity, purchase VAT rate), unchanged.
 *   - Bon de consum rows are the sale_used movements, unchanged.
 *   - Every other movement type (manual adjustments, wastage, returns,
 *     opening entries, invoice sales, free issues, invoice storno) becomes an
 *     "ajustare" row. These used to be left out of the period entirely.
 *   - purchase_received movements are what NIR posting actually put into
 *     stock. When their value differs from the NIR documents in this period
 *     (NIR dated in one month but posted in the next, received quantity
 *     different from invoiced, purchase VAT rate different from the
 *     product's VAT rate), the difference is shown as its own labelled
 *     "ajustare" row instead of silently breaking the closing balance.
 * Result: closing = opening + every period movement = next period's opening.
 */
export function buildGestiunePeriod(input: {
  fromDate: string;
  toDate: string;
  openingStock: VatBucket;
  purchases: GestiunePurchaseRow[];
  periodMovements: StockMovementQueryRow[];
  labels: GestiuneLabels;
}): GestiunePeriod {
  const { fromDate, toDate, openingStock, purchases, periodMovements, labels } = input;
  const movements: GestiuneMovement[] = [];
  let hasUnknownCost = false;

  if (openingStock.total > 0) {
    movements.push({
      date: fromDate,
      documentType: "stoc_initial",
      description: labels.openingBalance,
      ...openingStock,
    });
  }

  // ── NIR documents (purchases table) ──────────────────────────────────
  const nirTotal = emptyBucket();
  for (const p of purchases) {
    const nirByVat = emptyBucket();
    for (const item of p.purchase_items ?? []) {
      addToBucket(nirByVat, Number(item.tax_rate ?? 21), Number(item.total_cost ?? 0));
    }
    if (nirByVat.total > 0) {
      movements.push({
        date: p.purchase_date,
        documentType: "nir",
        documentNumber: p.invoice_number ?? undefined,
        description: p.supplier ?? labels.unknownSupplier,
        ...nirByVat,
      });
      for (const k of VAT_KEYS) nirTotal[k] += nirByVat[k];
      nirTotal.total += nirByVat.total;
    }
  }

  // ── Ledger movements in the period ───────────────────────────────────
  const consumByDate = new Map<string, VatBucket>();
  const ledgerPurchases = emptyBucket();
  // key: `${date}|${movementType}` -> signed bucket per sign
  const adjustments = new Map<string, { date: string; type: string; plus: VatBucket; minus: VatBucket }>();

  for (const m of periodMovements) {
    const v = movementValue(m);
    if (v == null) {
      hasUnknownCost = true;
      continue;
    }
    const type = m.movement_type ?? "manual_adjustment";
    const dateKey = m.performed_at.slice(0, 10);

    if (type === "sale_used") {
      // Consumption is shown as a positive outflow. Signed (not Math.abs) so
      // a reversal row (positive quantity_change) reduces it, exactly as it
      // raises the next opening balance.
      const existing = consumByDate.get(dateKey) ?? emptyBucket();
      addToBucket(existing, v.vatRate, -v.value);
      consumByDate.set(dateKey, existing);
    } else if (type === "purchase_received") {
      addToBucket(ledgerPurchases, v.vatRate, v.value);
    } else {
      const key = `${dateKey}|${type}`;
      const entry = adjustments.get(key) ?? { date: dateKey, type, plus: emptyBucket(), minus: emptyBucket() };
      if (v.value >= 0) addToBucket(entry.plus, v.vatRate, v.value);
      else addToBucket(entry.minus, v.vatRate, -v.value);
      adjustments.set(key, entry);
    }
  }

  for (const [dateKey, values] of [...consumByDate.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (isZero(values)) continue;
    movements.push({
      date: dateKey,
      documentType: "consum",
      description: labels.rawConsumption,
      ...values,
    });
  }

  const adjustmentRows: GestiuneMovement[] = [];
  for (const entry of adjustments.values()) {
    for (const sign of ["plus", "minus"] as const) {
      if (isZero(entry[sign])) continue;
      adjustmentRows.push({
        date: entry.date,
        documentType: "ajustare",
        direction: sign === "plus" ? "in" : "out",
        description: adjustmentDescription(entry.type, sign),
        ...entry[sign],
      });
    }
  }

  const nirDifference = emptyBucket();
  for (const k of VAT_KEYS) nirDifference[k] = ledgerPurchases[k] - nirTotal[k];
  nirDifference.total = ledgerPurchases.total - nirTotal.total;
  const { plus: diffPlus, minus: diffMinus } = splitBySign(nirDifference);
  // A period-level reconciliation line, dated at the end of the period.
  if (!isZero(diffPlus)) {
    adjustmentRows.push({ date: toDate, documentType: "ajustare", direction: "in", description: NIR_LEDGER_DIFFERENCE.plus, ...diffPlus });
  }
  if (!isZero(diffMinus)) {
    adjustmentRows.push({ date: toDate, documentType: "ajustare", direction: "out", description: NIR_LEDGER_DIFFERENCE.minus, ...diffMinus });
  }
  movements.push(...adjustmentRows);

  // Intrări: period NIR + "plus" adjustments. Ieșiri: consumption + "minus"
  // adjustments. Opening stock is a starting balance, not a period inflow,
  // and must not be double-counted as "Total intrări".
  const totals = movements.reduce(
    (acc, m) => {
      const isIn = m.documentType === "nir" || (m.documentType === "ajustare" && m.direction === "in");
      const isOut = m.documentType === "consum" || (m.documentType === "ajustare" && m.direction === "out");
      if (isIn) {
        acc.intrari19 += m.tva19;
        acc.intrari9 += m.tva9;
        acc.intrari5 += m.tva5;
        acc.intrari0 += m.tva0;
        acc.intrariTotal += m.total;
      } else if (isOut) {
        acc.iesiri19 += m.tva19;
        acc.iesiri9 += m.tva9;
        acc.iesiri5 += m.tva5;
        acc.iesiri0 += m.tva0;
        acc.iesiriTotal += m.total;
      }
      return acc;
    },
    { intrari19: 0, intrari9: 0, intrari5: 0, intrari0: 0, intrariTotal: 0, iesiri19: 0, iesiri9: 0, iesiri5: 0, iesiri0: 0, iesiriTotal: 0 }
  );

  const closingStock: VatBucket = {
    tva19: openingStock.tva19 + totals.intrari19 - totals.iesiri19,
    tva9: openingStock.tva9 + totals.intrari9 - totals.iesiri9,
    tva5: openingStock.tva5 + totals.intrari5 - totals.iesiri5,
    tva0: openingStock.tva0 + totals.intrari0 - totals.iesiri0,
    total: openingStock.total + totals.intrariTotal - totals.iesiriTotal,
  };

  movements.sort((a, b) => {
    if (a.documentType === "stoc_initial") return -1;
    if (b.documentType === "stoc_initial") return 1;
    return a.date.localeCompare(b.date);
  });

  return { movements, totals, closingStock, hasUnknownCost };
}

/** First instant of the day after `date` (YYYY-MM-DD), in UTC like periodStart. */
function nextDayStart(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

/**
 * Shared Raport de Gestiune computation, used by both the on-screen page and
 * the PDF export -- kept in one place after several subtle bugs (signed vs.
 * absolute values, stale date columns) turned up from duplicated copies of
 * this logic across the report and its downloads.
 */
export async function computeGestiuneReport(
  supabase: SupabaseClient,
  orgId: string,
  fromDate: string,
  toDate: string,
  labels: GestiuneLabels,
  options: { signal?: AbortSignal } = {},
): Promise<GestiuneReportData> {
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;
  // The next period's opening is everything strictly before this instant, so
  // the period's movements are bounded by it too (not by 23:59:59.999, which
  // would drop a movement in the last sub-millisecond of the day).
  const periodEndExclusive = nextDayStart(toDate);

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .maybeSingle();

  // Aggregated per (product, unit_cost) -- never row-by-row over the whole
  // history before the period. See lib/ro-accounting/opening-stock.ts.
  const opening = await fetchOpeningStock(supabase, orgId, periodStart, { signal: options.signal });

  // Paged: a long period can hold more than PostgREST's 1000-row cap.
  const { data: purchases, error: purchasesError } = await fetchAll<GestiunePurchaseRow>(() => supabase
    .from("purchases")
    .select(`
      id, purchase_date, supplier, invoice_number, total_amount, tax_total,
      purchase_items(tax_rate, total_cost)
    `)
    .eq("organisation_id", orgId)
    .in("status", ["posted", "received"])
    .gte("purchase_date", periodStart)
    .lte("purchase_date", periodEnd), { keys: ["purchase_date", "id"], signal: options.signal });
  if (purchasesError) {
    throw new StockMovementsQueryError(`purchases query failed: ${purchasesError.message}`, purchasesError);
  }

  // Every movement type in the period, from the same view the opening
  // balance reads -- not only sale_used.
  const periodMovements = await fetchStockMovements(
    supabase,
    orgId,
    { from: periodStart, before: periodEndExclusive },
    { signal: options.signal, throwOnError: true },
  );

  const period = buildGestiunePeriod({
    fromDate,
    toDate,
    openingStock: opening.openingStock,
    purchases: (purchases ?? []) as GestiunePurchaseRow[],
    periodMovements,
    labels,
  });

  // Each consumption day gets its own sequential Bon de Consum number
  // (OMFP 2634/2015 Annex 1 pct. 24) -- assign_bc_number is idempotent per
  // (org, from, to), so repeat report views reuse the same number. Numbers
  // are assigned one at a time in date order (not via Promise.all) so that
  // newly-numbered dates always receive a strictly increasing number in
  // chronological order -- concurrent calls would race for the next
  // sequence value and could hand a later date a lower number than an
  // earlier one.
  const consumRows = period.movements
    .filter((m) => m.documentType === "consum" && m.total > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  for (const row of consumRows) {
    const { data } = await supabase.rpc("assign_bc_number", { p_org_id: orgId, p_from: row.date, p_to: row.date });
    row.documentNumber = (data as string | null) ?? undefined;
  }

  return {
    org,
    movements: period.movements,
    totals: period.totals,
    openingStock: opening.openingStock,
    closingStock: period.closingStock,
    hasUnknownCost: opening.hasUnknownCost || period.hasUnknownCost,
  };
}
