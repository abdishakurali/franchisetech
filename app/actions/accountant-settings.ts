"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveOrg, stringValue } from "@/lib/kitchenops/data";
import { logWriteError, withSaveError } from "@/lib/save-error";

// Before 2026-11-12 these updates were unchecked: a refused save looked saved
// and SAGA exports kept the old codes. A failure now returns to Settings with
// ?save_error= and the page shows a message.
const SAVE_FAILED_URL = withSaveError("/app/settings?tab=accountant");

function canManage(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

export async function updateSagaGestiuneCode(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const code = stringValue(formData, "saga_gestiune_code").toUpperCase();
  const { error } = await supabase
    .from("organisations")
    .update({ saga_gestiune_code: code || null })
    .eq("id", orgId);
  if (error) { logWriteError("updateSagaGestiuneCode", error); redirect(SAVE_FAILED_URL); }
  revalidatePath("/app/settings");
}

export async function updateSiteSagaGestiuneCode(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const siteId = stringValue(formData, "site_id");
  const code = stringValue(formData, "saga_gestiune_code").toUpperCase();
  if (!siteId) return;
  const { error } = await supabase
    .from("sites")
    .update({ saga_gestiune_code: code || null })
    .eq("id", siteId)
    .eq("organisation_id", orgId);
  if (error) { logWriteError("updateSiteSagaGestiuneCode", error); redirect(SAVE_FAILED_URL); }
  revalidatePath("/app/settings");
}

export async function updateProductSagaCode(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;
  const productId = stringValue(formData, "product_id");
  const code = stringValue(formData, "saga_article_code");
  if (!productId) return;
  const { error } = await supabase
    .from("products")
    .update({ saga_article_code: code || null })
    .eq("id", productId)
    .eq("organisation_id", orgId);
  if (error) { logWriteError("updateProductSagaCode", error); redirect(SAVE_FAILED_URL); }
  revalidatePath("/app/settings");
}
