"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrg, stringValue } from "@/lib/kitchenops/data";

function canManage(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

export async function updateSagaGestiuneCode(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const code = stringValue(formData, "saga_gestiune_code").toUpperCase();
  await supabase
    .from("organisations")
    .update({ saga_gestiune_code: code || null })
    .eq("id", orgId);
  revalidatePath("/app/settings/accountant");
}

export async function updateSiteSagaGestiuneCode(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const siteId = stringValue(formData, "site_id");
  const code = stringValue(formData, "saga_gestiune_code").toUpperCase();
  if (!siteId) return;
  await supabase
    .from("sites")
    .update({ saga_gestiune_code: code || null })
    .eq("id", siteId)
    .eq("organisation_id", orgId);
  revalidatePath("/app/settings/accountant");
}

export async function updateProductSagaCode(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const productId = stringValue(formData, "product_id");
  const code = stringValue(formData, "saga_article_code");
  if (!productId) return;
  await supabase
    .from("products")
    .update({ saga_article_code: code || null })
    .eq("id", productId)
    .eq("organisation_id", orgId);
  revalidatePath("/app/settings/accountant");
}
