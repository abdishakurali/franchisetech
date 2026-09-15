import type { SupabaseClient } from "@supabase/supabase-js";
import type { BalantaItem } from "@/lib/ro-accounting/balanta";
import { resolveBalantaIntegrity, sumMovementQty, type BalantaProductMeta } from "@/lib/ro-accounting/balanta-integrity";
import { fetchStockMovements, stockMovementQty, stockMovementUnitCost } from "@/lib/ro-accounting/stock-movements";

type ProductRow = BalantaProductMeta & { vat_rate: number | null };

export type BalantaReportData = {
  items: BalantaItem[];
  totals: { openingValue: number; entryValue: number; exitValue: number; closingValue: number };
  /** True if any item had a movement with no recorded cost. That movement's
   * quantity is still counted, but its value is not — so any item (and the
   * totals above) may be a known floor rather than the complete figure
   * whenever this, or the item's own hasUnknownCost, is true. */
  hasUnknownCost: boolean;
};

/**
 * Shared Balanță cantitativ-valorică computation, used by both the
 * on-screen page and the PDF export.
 */
export async function computeBalantaReport(
  supabase: SupabaseClient,
  orgId: string,
  fromDate: string,
  toDate: string,
  unknownLabel: string,
): Promise<BalantaReportData> {
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;

  const { data: products } = await supabase
    .from("products")
    .select("id,name,unit_of_measure,current_stock_qty,vat_rate,active,is_stock_tracked,is_ingredient")
    .eq("organisation_id", orgId);

  const [movementsDuringPeriod, movementsBeforePeriod, allMovements] = await Promise.all([
    fetchStockMovements(supabase, orgId, { from: periodStart, to: periodEnd }),
    fetchStockMovements(supabase, orgId, { before: periodStart }),
    fetchStockMovements(supabase, orgId, {}),
  ]);

  const productMap = new Map<string, ProductRow>();
  for (const p of (products ?? []) as ProductRow[]) productMap.set(p.id, p);

  // Opening stock is a NET running balance -- qty and value must stay
  // signed together (purchases/opening add, consumption subtracts).
  // knownQty tracks only the portion whose cost is actually known, so
  // avgCost below isn't diluted by quantity that contributed zero value.
  // A movement with no recorded cost still counts toward qty -- it is not
  // dropped, only its value is -- and marks hasUnknownCost so the item (and
  // report) show that value as a floor, not silently understate it as
  // complete.
  type Bucket = { qty: number; value: number; knownQty: number; hasUnknownCost: boolean };
  const emptyBucket = (): Bucket => ({ qty: 0, value: 0, knownQty: 0, hasUnknownCost: false });

  const calcOpeningStock = new Map<string, Bucket>();
  for (const m of movementsBeforePeriod) {
    if (!m.product_id) continue;
    const existing = calcOpeningStock.get(m.product_id) ?? emptyBucket();
    const qty = stockMovementQty(m);
    const cost = stockMovementUnitCost(m);
    existing.qty += qty;
    if (cost != null) {
      existing.value += qty * cost;
      existing.knownQty += qty;
    } else {
      existing.hasUnknownCost = true;
    }
    calcOpeningStock.set(m.product_id, existing);
  }

  const periodEntries = new Map<string, Bucket>();
  const periodExits = new Map<string, Bucket>();

  for (const m of movementsDuringPeriod) {
    if (!m.product_id) continue;
    const qty = stockMovementQty(m);
    const cost = stockMovementUnitCost(m);

    const isEntry =
      m.movement_type === "purchase_received" ||
      m.movement_type === "return" ||
      m.movement_type === "opening" ||
      (m.movement_type === "manual_adjustment" && qty > 0);
    const isExit =
      m.movement_type === "sale_used" ||
      m.movement_type === "wastage" ||
      (m.movement_type === "manual_adjustment" && qty < 0);

    if (isEntry) {
      const existing = periodEntries.get(m.product_id) ?? emptyBucket();
      existing.qty += Math.abs(qty);
      if (cost != null) {
        existing.value += Math.abs(qty) * cost;
        existing.knownQty += Math.abs(qty);
      } else {
        existing.hasUnknownCost = true;
      }
      periodEntries.set(m.product_id, existing);
    }

    if (isExit) {
      const existing = periodExits.get(m.product_id) ?? emptyBucket();
      existing.qty += Math.abs(qty);
      if (cost != null) {
        existing.value += Math.abs(qty) * cost;
        existing.knownQty += Math.abs(qty);
      } else {
        existing.hasUnknownCost = true;
      }
      periodExits.set(m.product_id, existing);
    }
  }

  const allProductIds = new Set<string>([
    ...calcOpeningStock.keys(),
    ...periodEntries.keys(),
    ...periodExits.keys(),
  ]);

  const items: BalantaItem[] = Array.from(allProductIds)
    .map((productId) => {
      const product = productMap.get(productId);
      const opening = calcOpeningStock.get(productId) ?? emptyBucket();
      const entries = periodEntries.get(productId) ?? emptyBucket();
      const exits = periodExits.get(productId) ?? emptyBucket();

      const closingQty = opening.qty + entries.qty - exits.qty;
      // Averaged over the KNOWN-cost quantity only, not the combined
      // opening+entry quantity -- using the latter would dilute the average
      // with quantity that contributed zero value, understating it whenever
      // a cost is missing rather than just leaving that portion unpriced.
      const knownAvailableQty = opening.knownQty + entries.knownQty;
      const avgCost = knownAvailableQty > 0 ? (opening.value + entries.value) / knownAvailableQty : 0;
      const closingValue = closingQty * avgCost;

      const ledgerQty = sumMovementQty(allMovements, productId);
      const catalogQty = Number(product?.current_stock_qty ?? 0);
      const integrityStatus = resolveBalantaIntegrity(product, { ledgerQty, catalogQty });

      return {
        productId,
        productName: product?.name ?? unknownLabel,
        unit: product?.unit_of_measure ?? "buc",
        openingQty: opening.qty,
        openingValue: opening.value,
        entryQty: entries.qty,
        entryValue: entries.value,
        exitQty: exits.qty,
        exitValue: exits.value,
        closingQty,
        closingValue: closingValue > 0 ? closingValue : 0,
        integrityStatus,
        catalogQty: product ? catalogQty : undefined,
        ledgerQty,
        hasUnknownCost: opening.hasUnknownCost || entries.hasUnknownCost || exits.hasUnknownCost,
      };
    })
    .filter((item) => item.openingQty !== 0 || item.entryQty !== 0 || item.exitQty !== 0)
    .sort((a, b) => a.productName.localeCompare(b.productName));

  const totals = items.reduce(
    (acc, item) => ({
      openingValue: acc.openingValue + item.openingValue,
      entryValue: acc.entryValue + item.entryValue,
      exitValue: acc.exitValue + item.exitValue,
      closingValue: acc.closingValue + item.closingValue,
    }),
    { openingValue: 0, entryValue: 0, exitValue: 0, closingValue: 0 },
  );

  return { items, totals, hasUnknownCost: items.some((item) => item.hasUnknownCost) };
}
