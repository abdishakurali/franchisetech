"use server";

import { revalidatePath } from "next/cache";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";

export type DeliveryIntegrationUpdate = {
  provider: "glovo" | "bolt" | "tazz";
  storeAddressId: string;
  isActive: boolean;
};

function canManage(role: string | null | undefined) {
  return ["owner", "manager"].includes(role ?? "");
}

// No UI caller today (checked 2026-11-12). Writes used to ignore the Supabase
// error; now a refused write throws so any future caller cannot miss it.
function throwIfError(where: string, error: { code?: string; message?: string } | null) {
  if (!error) return;
  console.error(`[delivery] ${where} failed`, error.code, error.message);
  throw new Error(`delivery_${where}_failed`);
}

export async function saveDeliveryIntegration(update: DeliveryIntegrationUpdate): Promise<void> {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return;

  const { error } = await supabase
    .from("delivery_integrations")
    .upsert(
      {
        organisation_id: orgId,
        provider: update.provider,
        store_address_id: update.storeAddressId,
        is_active: update.isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organisation_id,provider" },
    );
  throwIfError("save_integration", error);

  revalidatePath("/app/settings");
}

export async function saveProductMapping(
  provider: "glovo" | "bolt" | "tazz",
  externalSku: string,
  productId: string,
): Promise<void> {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return;

  const { error } = await supabase
    .from("delivery_product_mappings")
    .upsert(
      {
        organisation_id: orgId,
        provider,
        external_sku: externalSku,
        product_id: productId,
      },
      { onConflict: "organisation_id,provider,external_sku" },
    );
  throwIfError("save_mapping", error);

  revalidatePath("/app/settings");
}

export async function deleteProductMapping(
  provider: "glovo" | "bolt" | "tazz",
  externalSku: string,
): Promise<void> {
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  if (!canManage(membership.role)) return;

  const { error } = await supabase
    .from("delivery_product_mappings")
    .delete()
    .eq("organisation_id", orgId)
    .eq("provider", provider)
    .eq("external_sku", externalSku);
  throwIfError("delete_mapping", error);

  revalidatePath("/app/settings");
}

export async function getDeliveryOrders(limit = 50) {
  const { supabase, orgId } = await getKitchenOpsContext();

  const { data } = await supabase
    .from("pos_transactions")
    .select("id,order_source,external_order_id,total_amount,status,transaction_date,payment_method")
    .eq("organisation_id", orgId)
    .in("order_source", ["glovo", "bolt", "tazz"])
    .order("transaction_date", { ascending: false })
    .limit(limit);

  return data ?? [];
}
