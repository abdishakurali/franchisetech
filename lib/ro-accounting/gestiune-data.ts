import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchStockMovements,
  stockMovementQty,
  stockMovementProduct,
  stockMovementUnitCost,
} from "@/lib/ro-accounting/stock-movements";
import type { GestiuneMovement } from "@/lib/ro-accounting/gestiune";

type PurchaseRow = {
  id: string;
  purchase_date: string;
  supplier: string | null;
  invoice_number: string | null;
  total_amount: number | null;
  tax_total: number | null;
  purchase_items: Array<{ tax_rate: number | null; total_cost: number | null }>;
};

type TransactionRow = {
  sold_at: string;
  status: string;
  pos_transaction_items: Array<{ vat_rate: number | null; gross_amount: number | null; line_total: number | null }>;
};

type VatBucket = { tva19: number; tva9: number; tva5: number; tva0: number; total: number };

export type GestiuneReportData = {
  org: { name: string | null; fiscalnet_cif: string | null } | null;
  movements: GestiuneMovement[];
  totals: {
    intrari19: number; intrari9: number; intrari5: number; intrari0: number; intrariTotal: number;
    iesiri19: number; iesiri9: number; iesiri5: number; iesiri0: number; iesiriTotal: number;
  };
  openingStock: VatBucket;
  closingStock: VatBucket;
};

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
  labels: { openingBalance: string; unknownSupplier: string; rawConsumption: string; zReportItems: (count: number) => string },
): Promise<GestiuneReportData> {
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;

  const { data: org } = await supabase
    .from("organisations")
    .select("name,fiscalnet_cif")
    .eq("id", orgId)
    .single();

  const movements: GestiuneMovement[] = [];

  const movementsBeforePeriod = await fetchStockMovements(supabase, orgId, { before: periodStart });

  // Opening stock is a NET running balance -- purchases/opening entries add
  // (positive quantity_change), consumption subtracts (negative
  // quantity_change). Math.abs() here would treat consumption as inbound
  // stock and wildly overstate the balance.
  const openingStock: VatBucket = { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };
  for (const m of movementsBeforePeriod) {
    const qty = stockMovementQty(m);
    const value = qty * stockMovementUnitCost(m);
    const prod = stockMovementProduct(m);
    const vatRate = Number(prod?.vat_rate ?? 21);

    if (vatRate === 21) openingStock.tva19 += value;
    else if (vatRate === 11) openingStock.tva9 += value;
    else if (vatRate === 5) openingStock.tva5 += value;
    else openingStock.tva0 += value;
    openingStock.total += value;
  }

  if (openingStock.total > 0) {
    movements.push({
      date: fromDate,
      documentType: "stoc_initial",
      description: labels.openingBalance,
      ...openingStock,
    });
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      id, purchase_date, supplier, invoice_number, total_amount, tax_total,
      purchase_items(tax_rate, total_cost)
    `)
    .eq("organisation_id", orgId)
    .in("status", ["posted", "received"])
    .gte("purchase_date", periodStart)
    .lte("purchase_date", periodEnd)
    .order("purchase_date");

  for (const p of (purchases ?? []) as PurchaseRow[]) {
    const nirByVat: VatBucket = { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };
    for (const item of p.purchase_items ?? []) {
      const value = Number(item.total_cost ?? 0);
      const vatRate = Number(item.tax_rate ?? 21);
      if (vatRate === 21) nirByVat.tva19 += value;
      else if (vatRate === 11) nirByVat.tva9 += value;
      else if (vatRate === 5) nirByVat.tva5 += value;
      else nirByVat.tva0 += value;
      nirByVat.total += value;
    }

    if (nirByVat.total > 0) {
      movements.push({
        date: p.purchase_date,
        documentType: "nir",
        documentNumber: p.invoice_number ?? undefined,
        description: p.supplier ?? labels.unknownSupplier,
        ...nirByVat,
      });
    }
  }

  const consumMovements = await fetchStockMovements(supabase, orgId, {
    movementType: "sale_used",
    from: periodStart,
    to: periodEnd,
  });

  const consumByDate = new Map<string, VatBucket>();
  for (const m of consumMovements) {
    const dateKey = m.performed_at.slice(0, 10);
    const existing = consumByDate.get(dateKey) ?? { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0 };

    const qty = Math.abs(stockMovementQty(m));
    const value = qty * stockMovementUnitCost(m);
    const prodConsum = stockMovementProduct(m);
    const vatRate = Number(prodConsum?.vat_rate ?? 21);

    if (vatRate === 21) existing.tva19 += value;
    else if (vatRate === 11) existing.tva9 += value;
    else if (vatRate === 5) existing.tva5 += value;
    else existing.tva0 += value;
    existing.total += value;

    consumByDate.set(dateKey, existing);
  }

  // Each consumption day gets its own sequential Bon de Consum number
  // (OMFP 2634/2015 Annex 1 pct. 24) -- assign_bc_number is idempotent per
  // (org, from, to), so repeat report views reuse the same number. Numbers
  // are assigned one at a time in date order (not via Promise.all) so that
  // newly-numbered dates always receive a strictly increasing number in
  // chronological order -- concurrent calls would race for the next
  // sequence value and could hand a later date a lower number than an
  // earlier one.
  const consumDaysWithValue = Array.from(consumByDate.entries())
    .filter(([, v]) => v.total > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const bcNumberByDate = new Map<string, string | null>();
  for (const [dateKey] of consumDaysWithValue) {
    const { data } = await supabase.rpc("assign_bc_number", { p_org_id: orgId, p_from: dateKey, p_to: dateKey });
    bcNumberByDate.set(dateKey, data as string | null);
  }

  for (const [dateKey, values] of consumDaysWithValue) {
    movements.push({
      date: dateKey,
      documentType: "consum",
      documentNumber: bcNumberByDate.get(dateKey) ?? undefined,
      description: labels.rawConsumption,
      ...values,
    });
  }

  // Filtered on pos_transactions.sold_at (real sale date), not
  // pos_transaction_items.created_at (row-insert time; for migrated
  // historical sales that's the bulk-import timestamp).
  const { data: transactions } = await supabase
    .from("pos_transactions")
    .select(`sold_at, status, pos_transaction_items(vat_rate, gross_amount, line_total)`)
    .eq("organisation_id", orgId)
    .gte("sold_at", periodStart)
    .lte("sold_at", periodEnd);

  const salesByDate = new Map<string, VatBucket & { count: number }>();
  for (const tx of (transactions ?? []) as TransactionRow[]) {
    if (tx.status === "voided") continue;
    const dateKey = tx.sold_at.slice(0, 10);
    const existing = salesByDate.get(dateKey) ?? { tva19: 0, tva9: 0, tva5: 0, tva0: 0, total: 0, count: 0 };

    for (const item of tx.pos_transaction_items ?? []) {
      const value = Number(item.gross_amount ?? item.line_total ?? 0);
      const vatRate = Number(item.vat_rate ?? 21);

      if (vatRate === 21) existing.tva19 += value;
      else if (vatRate === 11) existing.tva9 += value;
      else if (vatRate === 5) existing.tva5 += value;
      else existing.tva0 += value;
      existing.total += value;
      existing.count += 1;
    }

    salesByDate.set(dateKey, existing);
  }

  for (const [dateKey, values] of Array.from(salesByDate.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    if (values.total > 0) {
      movements.push({
        date: dateKey,
        documentType: "vanzare",
        description: labels.zReportItems(values.count),
        tva19: values.tva19,
        tva9: values.tva9,
        tva5: values.tva5,
        tva0: values.tva0,
        total: values.total,
      });
    }
  }

  // intrari* accumulates ONLY period NIR (goods actually received in this
  // date range) -- opening stock is a separate starting balance, not a
  // period inflow, and must not be double-counted as "Total intrari".
  const totals = movements.reduce(
    (acc, m) => {
      if (m.documentType === "nir") {
        acc.intrari19 += m.tva19;
        acc.intrari9 += m.tva9;
        acc.intrari5 += m.tva5;
        acc.intrari0 += m.tva0;
        acc.intrariTotal += m.total;
      } else if (m.documentType === "consum" || m.documentType === "vanzare") {
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

  return { org, movements, totals, openingStock, closingStock };
}
