import type { SupabaseClient } from "@supabase/supabase-js";
import { assertEntitlement } from "@/lib/billing/entitlement-resolver";

export type TabKitchenCartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

/** Kitchen ticket for an open table tab round — no sale_id until final payment. */
export async function createKitchenOrderForTab({
  supabase,
  orgId,
  userId,
  orgRow,
  tabId,
  siteId,
  orderNumber,
  items,
  orderType,
  tableLabel,
  note,
}: {
  supabase: SupabaseClient;
  orgId: string;
  userId: string;
  orgRow: Record<string, unknown> | null;
  tabId: string;
  siteId: string | null;
  orderNumber: string;
  items: TabKitchenCartItem[];
  orderType?: string | null;
  tableLabel?: string | null;
  note?: string | null;
}): Promise<string | null> {
  if (!items.length) return null;

  try {
    let enabled = Boolean(orgRow?.kitchen_display_enabled);
    if (!enabled) {
      const { data: featureRow, error: featureError } = await supabase
        .from("organisations")
        .select("kitchen_display_enabled")
        .eq("id", orgId)
        .maybeSingle();
      if (featureError) return null;
      enabled = Boolean(featureRow?.kitchen_display_enabled);
    }
    if (!enabled) return null;
    await assertEntitlement(orgId, "kitchen.enabled");

    const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];
    const { data: products } = productIds.length
      ? await supabase
          .from("products")
          .select("id,image_url,kitchen_station")
          .in("id", productIds)
          .eq("organisation_id", orgId)
      : { data: [] };
    const imageByProduct = new Map(
      (products ?? []).map((p: { id: string; image_url: string | null; kitchen_station?: string | null }) => [
        p.id,
        p.image_url,
      ])
    );
    const stationByProduct = new Map(
      (products ?? []).map((p: { id: string; image_url: string | null; kitchen_station?: string | null }) => [
        p.id,
        p.kitchen_station ?? null,
      ])
    );

    const { data: order, error } = await supabase
      .from("kitchen_orders")
      .insert({
        organisation_id: orgId,
        site_id: siteId,
        sale_id: null,
        table_tab_id: tabId,
        order_number: orderNumber,
        status: "sent",
        order_type: orderType || null,
        table_label: tableLabel || null,
        note: note || null,
        source: "pos",
        sent_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !order) return null;

    await supabase.from("kitchen_order_items").insert(
      items.map((item) => ({
        kitchen_order_id: order.id,
        product_id: item.product_id || null,
        name: item.product_name || "Item",
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unit_price ?? 0),
        line_total: Number(item.quantity || 1) * Number(item.unit_price ?? 0),
        image_url: imageByProduct.get(item.product_id) ?? null,
        kitchen_station: stationByProduct.get(item.product_id) ?? null,
        modifiers: {},
        status: "sent",
      }))
    );

    await supabase
      .from("pos_audit_events")
      .insert({
        organisation_id: orgId,
        event_type: "kitchen_order_created",
        after_data: { kitchen_order_id: order.id, order_number: orderNumber, table_tab_id: tabId },
        performed_by: userId,
      })
      .then(() => null, () => null);

    return order.id;
  } catch {
    return null;
  }
}
