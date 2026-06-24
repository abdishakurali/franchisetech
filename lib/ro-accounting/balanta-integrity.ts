export type BalantaIntegrityStatus =
  | "ok"
  | "archived"
  | "missing"
  | "not_tracked"
  | "qty_mismatch";

export type BalantaProductMeta = {
  id: string;
  name: string;
  unit_of_measure: string | null;
  current_stock_qty: number | null;
  active?: boolean | null;
  is_stock_tracked?: boolean | null;
  is_ingredient?: boolean | null;
};

export function resolveBalantaIntegrity(
  product: BalantaProductMeta | undefined,
  opts?: { ledgerQty?: number; catalogQty?: number },
): BalantaIntegrityStatus {
  if (!product) return "missing";
  if (product.active === false) return "archived";
  if (!product.is_stock_tracked && !product.is_ingredient) return "not_tracked";
  if (opts?.ledgerQty !== undefined && opts?.catalogQty !== undefined) {
    if (Math.abs(opts.ledgerQty - opts.catalogQty) > 0.001) return "qty_mismatch";
  }
  return "ok";
}

export function sumMovementQty(
  movements: Array<{ product_id: string | null; quantity_change?: number | null; quantity?: number | null }>,
  productId: string,
): number {
  let total = 0;
  for (const m of movements) {
    if (m.product_id !== productId) continue;
    total += Number(m.quantity_change ?? m.quantity ?? 0);
  }
  return total;
}
