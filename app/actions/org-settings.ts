"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { assertEntitlement, EntitlementDeniedError } from "@/lib/billing/entitlement-resolver";

function canManage(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

// ── CUI / fiscal identity ─────────────────────────────────────────────────────

export type SaveOrgCuiResult = { error?: string };

export async function saveOrgCui(formData: FormData): Promise<SaveOrgCuiResult> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return { error: "Unauthorized" };

  const raw = (formData.get("cui") as string | null) ?? "";
  const cui = raw.trim().replace(/^RO/i, "").replace(/[^0-9]/g, "");
  if (!cui) return { error: "CUI lipsă" };

  const denumire = ((formData.get("denumire") as string | null) ?? "").trim() || null;
  const adresa = ((formData.get("adresa") as string | null) ?? "").trim() || null;
  const vatRegistered = formData.get("vat_registered") === "true";
  const verified = formData.get("verified") === "true";

  await supabase
    .from("organisations")
    .update({
      fiscalnet_cif: cui,
      anaf_cif: cui,
      tax_id_verified: verified,
      company_legal_name: denumire,
      company_address: adresa,
      anaf_vat_registered: vatRegistered,
    })
    .eq("id", orgId);

  revalidatePath("/app/settings");
  revalidatePath("/app/settings/accountant");
  revalidatePath("/app/invoices");
  revalidatePath("/app/onboarding");
  return {};
}

// ── Notification preferences ──────────────────────────────────────────────────

export type NotificationKey =
  | "stock_low"
  | "stock_empty"
  | "bon_consum_generated"
  | "efactura_rejected"
  | "efactura_deadline"
  | "nir_missing_cui"
  | "daily_report"
  | "weekly_report"
  | "sales_alert";

export async function updateNotificationPreference(
  key: NotificationKey,
  enabled: boolean
): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (!canManage(membership.role)) return;

  const { data: org } = await supabase
    .from("organisations")
    .select("notification_preferences")
    .eq("id", orgId)
    .single();

  const current = (org?.notification_preferences ?? {}) as Record<string, boolean>;
  await supabase
    .from("organisations")
    .update({ notification_preferences: { ...current, [key]: enabled } })
    .eq("id", orgId);

  revalidatePath("/app/settings");
}

// ── Integration/module installation ──────────────────────────────────────────

type InstallableBusinessModule =
  | "kitchen_display"
  | "table_service"
  | "saga_export"
  | "fiscalnet"
  | "anaf_efactura";

const MODULE_COLUMN: Record<InstallableBusinessModule, string> = {
  kitchen_display: "kitchen_display_enabled",
  table_service: "table_service_enabled",
  saga_export: "saga_export_enabled",
  fiscalnet: "fiscalnet_enabled",
  anaf_efactura: "efactura_enabled",
};

const MODULE_ENTITLEMENT: Partial<Record<InstallableBusinessModule, Parameters<typeof assertEntitlement>[1]>> = {
  kitchen_display: "kitchen.enabled",
  table_service: "kitchen.table_service",
  saga_export: "reports.accountant_pack",
  fiscalnet: "fiscal.fiscalnet",
  anaf_efactura: "fiscal.efactura",
};

const MODULE_SETUP_HREF: Record<InstallableBusinessModule, string> = {
  kitchen_display: "/app/kitchen",
  table_service: "/app/settings/tables",
  saga_export: "/app/settings/accountant?install=saga",
  fiscalnet: "/app/settings?tab=fiscal",
  anaf_efactura: "/app/settings?tab=fiscal",
};

function safeReturnTo(formData: FormData): string {
  const raw = String(formData.get("returnTo") ?? "/app/settings?tab=integrations");
  return raw.startsWith("/app/") ? raw : "/app/settings?tab=integrations";
}

function withInstallError(returnTo: string, message: string): string {
  const separator = returnTo.includes("?") ? "&" : "?";
  return `${returnTo}${separator}install_error=${encodeURIComponent(message)}`;
}

function isMissingModuleSchemaError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    message.includes("schema cache") ||
    message.includes("saga_export_enabled") ||
    message.includes("efactura_enabled")
  );
}

export async function setBusinessModuleInstalled(formData: FormData): Promise<void> {
  const { supabase, membership, orgId } = await getActiveOrg();
  const returnTo = safeReturnTo(formData);
  if (!canManage(membership.role)) {
    redirect(withInstallError(returnTo, "Nu ai permisiune să modifici modulele."));
  }

  const moduleKey = String(formData.get("module") ?? "") as InstallableBusinessModule;
  const installed = String(formData.get("installed") ?? "") === "true";
  const column = MODULE_COLUMN[moduleKey];
  if (!column) {
    redirect(withInstallError(returnTo, "Modul necunoscut."));
  }

  if (installed) {
    const entitlement = MODULE_ENTITLEMENT[moduleKey];
    try {
      if (entitlement) await assertEntitlement(orgId, entitlement);
    } catch (error) {
      if (error instanceof EntitlementDeniedError) {
        redirect("/app/billing?reason=module_required");
      }
      throw error;
    }
  }

  const { error } = await supabase
    .from("organisations")
    .update({ [column]: installed })
    .eq("id", orgId);

  if (error) {
    const message = isMissingModuleSchemaError(error)
      ? "Baza de date trebuie actualizată înainte să instalezi acest modul."
      : "Modulul nu a putut fi actualizat. Încearcă din nou.";
    redirect(withInstallError(returnTo, message));
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  revalidatePath("/app/integrations");
  revalidatePath("/app/setup-checklist");
  revalidatePath("/app/pos");
  revalidatePath("/app/pos");
  if (installed) redirect(MODULE_SETUP_HREF[moduleKey]);
}

// ── Onboarding completion ─────────────────────────────────────────────────────

export async function completeOnboarding(): Promise<never> {
  const { supabase, membership, orgId } = await getActiveOrg();
  if (canManage(membership.role)) {
    await supabase
      .from("organisations")
      .update({ onboarding_completed: true })
      .eq("id", orgId);
  }
  redirect("/app");
}
