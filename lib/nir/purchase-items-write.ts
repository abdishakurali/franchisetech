import type { PurchaseLineInput } from "@/lib/nir/purchase";

export type PurchaseWriteResult =
  | { ok: true }
  | { ok: false; stage: "delete" | "insert"; message: string };

/**
 * Replace a draft purchase's lines. Unlike the old version in
 * app/actions/kitchenops.ts, the delete and insert results are checked: a failed
 * insert used to leave a draft with 0 lines and no message, and posting it then
 * failed with NO_ITEMS (also silently). Callers must surface `ok: false`.
 */
export async function replacePurchaseItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  purchaseId: string,
  items: PurchaseLineInput[],
  productLookup: Map<string, string>,
): Promise<PurchaseWriteResult> {
  const del = await supabase
    .from("purchase_items")
    .delete()
    .eq("purchase_id", purchaseId)
    .eq("organisation_id", orgId);
  if (del?.error) return { ok: false, stage: "delete", message: String(del.error.message ?? del.error) };
  if (!items.length) return { ok: true };
  const ins = await supabase.from("purchase_items").insert(
    items.map((item) => ({
      organisation_id: orgId,
      purchase_id: purchaseId,
      product_id: item.product_id,
      product_name: productLookup.get(item.product_id) || "Item",
      item_name: productLookup.get(item.product_id) || "Item",
      quantity: item.quantity,
      received_quantity: item.received_quantity,
      unit_cost: item.unit_cost,
      total_cost: item.total_cost,
      tax_rate: item.tax_rate,
      tax_amount: item.tax_amount,
      unit_of_measure: item.unit_of_measure,
    })),
  );
  if (ins?.error) return { ok: false, stage: "insert", message: String(ins.error.message ?? ins.error) };
  return { ok: true };
}
