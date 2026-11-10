/**
 * Which products the stock page lists.
 *
 * The page lists is_stock_tracked OR is_ingredient, but the purchase form offers
 * is_purchaseable OR is_ingredient. A purchaseable item that is neither tracked
 * nor an ingredient got its stock increased by a purchase but never appeared on
 * the stock page (2 such products in live data). Such a product is now also
 * listed when it has any stock evidence: a non-zero stock figure, a posted /
 * received purchase line, or a stock movement. Stored flags are not changed.
 */
export type StockPageRow<P> = P & { untracked?: boolean };

type Base = { id: string; name: string; current_stock_qty: number | string | null };

export function mergeStockPageProducts<P extends Base>(
  tracked: P[],
  untrackedCandidates: P[],
  evidence: { purchasedIds: Iterable<string>; movedIds: Iterable<string> },
): StockPageRow<P>[] {
  const seen = new Set(tracked.map((p) => p.id));
  const purchased = new Set(evidence.purchasedIds);
  const moved = new Set(evidence.movedIds);
  const extra: StockPageRow<P>[] = [];
  for (const p of untrackedCandidates) {
    if (seen.has(p.id)) continue;
    const qty = Number(p.current_stock_qty ?? 0);
    if (qty !== 0 || purchased.has(p.id) || moved.has(p.id)) {
      seen.add(p.id);
      extra.push({ ...p, untracked: true });
    }
  }
  if (!extra.length) return tracked;
  return [...tracked, ...extra].sort((a, b) => a.name.localeCompare(b.name, "ro"));
}

/** Product ids that appear on a posted or received purchase. */
export function postedPurchaseProductIds(
  lines: Array<{ product_id: string | null; purchase_id: string | null }>,
  purchases: Array<{ id: string; status: string | null }>,
): Set<string> {
  const posted = new Set(purchases.filter((p) => p.status === "posted" || p.status === "received").map((p) => p.id));
  const ids = new Set<string>();
  for (const l of lines) if (l.product_id && l.purchase_id && posted.has(l.purchase_id)) ids.add(l.product_id);
  return ids;
}
