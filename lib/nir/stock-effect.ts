/**
 * "What did posting this purchase do to stock?" for the purchase detail page.
 *
 * The post_nir_purchase RPC does not store the stock level before posting, and
 * products.current_stock_qty keeps moving with every sale, so a "before" figure
 * could only be guessed. We show two facts instead:
 *  - added:  the purchase_received stock movements written for THIS purchase
 *            (exactly what posting added, in the product's unit), and
 *  - now:    the product's current stock, read live.
 */
export type StockEffectRow = {
  productId: string;
  name: string;
  /** Unit the product's stock is counted in (what `added` and `now` are in). */
  productUnit: string;
  /** Unit typed on the purchase line(s), for comparison. */
  lineUnits: string[];
  /** Sum of purchase_received movements for this purchase, or null if none found. */
  added: number | null;
  /** Current stock, or null if the product could not be read (deleted/no access). */
  now: number | null;
};

type Line = { product_id?: string | null; product_name?: string | null; item_name?: string | null; unit_of_measure?: string | null };
type Movement = { product_id: string | null; quantity_change: number | string | null };
type Product = { id: string; name?: string | null; current_stock_qty: number | string | null; unit_of_measure: string | null };

export function buildStockEffectRows(lines: Line[], movements: Movement[], products: Product[]): StockEffectRow[] {
  const productById = new Map(products.map((p) => [p.id, p]));
  const added = new Map<string, number>();
  for (const m of movements) {
    if (!m.product_id) continue;
    added.set(m.product_id, (added.get(m.product_id) ?? 0) + Number(m.quantity_change ?? 0));
  }
  const rows = new Map<string, StockEffectRow>();
  for (const line of lines) {
    const id = line.product_id;
    if (!id) continue;
    const product = productById.get(id);
    const unit = (line.unit_of_measure ?? "").trim();
    const existing = rows.get(id);
    if (existing) {
      if (unit && !existing.lineUnits.includes(unit)) existing.lineUnits.push(unit);
      continue;
    }
    rows.set(id, {
      productId: id,
      name: product?.name ?? line.product_name ?? line.item_name ?? "—",
      productUnit: product?.unit_of_measure ?? "each",
      lineUnits: unit ? [unit] : [],
      added: added.has(id) ? added.get(id)! : null,
      now: product && product.current_stock_qty != null ? Number(product.current_stock_qty) : null,
    });
  }
  return [...rows.values()];
}

/** Rows where a posted NIR has no stock movement: worth a visible warning. */
export function rowsMissingMovement(rows: StockEffectRow[]): StockEffectRow[] {
  return rows.filter((r) => r.added === null);
}
