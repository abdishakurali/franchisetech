/**
 * Keep products.current_stock_qty and the stock_movements ledger in step.
 *
 * Before 2026-11-12 the manual stock actions inserted the movement first and
 * then updated the product. A failed update left a movement for a change that
 * never happened, so the gestiune/balanță reports disagreed with stock on hand
 * (bulkUpdateProductStock even returned ok: true). addProduct swallowed the
 * opening movement entirely.
 *
 * Now the product is updated first, because that write can be undone: we know
 * the old quantity. If the movement insert then fails, the product goes back to
 * the old quantity, so a failure never leaves one without the other.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export type StockWriteResult =
  | { ok: true }
  | { ok: false; stage: "update" | "movement"; rolledBack: boolean; message: string };

export async function setProductStockWithMovement(
  supabase: Db,
  args: {
    orgId: string;
    productId: string;
    oldQty: number;
    newQty: number;
    unit: string;
    userId: string | null;
  },
): Promise<StockWriteResult> {
  const { orgId, productId, oldQty, newQty, unit, userId } = args;
  const delta = newQty - oldQty;

  const upd = await supabase
    .from("products")
    .update({ current_stock_qty: newQty })
    .eq("id", productId)
    .eq("organisation_id", orgId);
  if (upd?.error) {
    return { ok: false, stage: "update", rolledBack: true, message: String(upd.error.message ?? upd.error) };
  }
  if (delta === 0) return { ok: true };

  const mov = await supabase.from("stock_movements").insert({
    organisation_id: orgId,
    product_id: productId,
    movement_type: "manual_adjustment",
    quantity_change: delta,
    unit_of_measure: unit,
    reason: "Manual stock adjustment",
    performed_by: userId,
  });
  if (mov?.error) {
    const back = await supabase
      .from("products")
      .update({ current_stock_qty: oldQty })
      .eq("id", productId)
      .eq("organisation_id", orgId);
    if (back?.error) console.error("[stock] rollback after failed movement also failed", productId, back.error.message);
    return { ok: false, stage: "movement", rolledBack: !back?.error, message: String(mov.error.message ?? mov.error) };
  }
  return { ok: true };
}

export type OpeningStockResult =
  | { ok: true }
  | { ok: false; productRemoved: boolean; message: string };

/**
 * Write the "opening" movement for a product that was just inserted with
 * current_stock_qty = qty. If the movement fails, the new product is removed
 * again (it has no history yet) so the owner can simply save the form again.
 * If even that delete fails, its stock is set back to 0 so stock on hand still
 * matches the (empty) ledger.
 */
export async function recordOpeningStock(
  supabase: Db,
  args: { orgId: string; productId: string; qty: number; unit: string },
): Promise<OpeningStockResult> {
  const { orgId, productId, qty, unit } = args;
  const mov = await supabase.from("stock_movements").insert({
    organisation_id: orgId,
    product_id: productId,
    movement_type: "opening",
    quantity_change: qty,
    unit_of_measure: unit,
    reason: "Opening stock",
  });
  if (!mov?.error) return { ok: true };
  const message = String(mov.error.message ?? mov.error);

  const del = await supabase.from("products").delete().eq("id", productId).eq("organisation_id", orgId);
  if (!del?.error) return { ok: false, productRemoved: true, message };

  const zero = await supabase
    .from("products")
    .update({ current_stock_qty: 0 })
    .eq("id", productId)
    .eq("organisation_id", orgId);
  if (zero?.error) console.error("[stock] could not reset opening stock after failed movement", productId, zero.error.message);
  return { ok: false, productRemoved: false, message };
}
