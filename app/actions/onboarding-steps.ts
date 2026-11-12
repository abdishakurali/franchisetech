"use server";

import { redirect } from "next/navigation";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { saveOrgModuleFlags } from "@/lib/org-module-flags";
import { trackOnboardingStepCompleted, type OnboardingFunnelStep } from "@/lib/onboarding/step-events";

function canManage(role: string): boolean {
  return ["owner", "manager"].includes(role);
}

// Before 2026-11-12 every onboarding_step update below was unchecked and the
// action redirected anyway. If the update failed, the onboarding resume guard
// sent the owner back to the previous step: a loop with no message.
const STEP_SAVE_FAILED = "Pasul nu s-a salvat. Încercați din nou; dacă se repetă, scrieți-ne pe WhatsApp.";

type ActiveOrg = Awaited<ReturnType<typeof getActiveOrg>>;

// Analytics only: reads the org name for the test-account classification.
// Never throws and never blocks the step.
async function trackStep(ctx: ActiveOrg, step: OnboardingFunnelStep, orgName?: string | null): Promise<void> {
  try {
    let name = orgName;
    if (name === undefined) {
      const { data } = await ctx.supabase.from("organisations").select("name").eq("id", ctx.orgId).maybeSingle();
      name = (data?.name as string | undefined) ?? null;
    }
    trackOnboardingStepCompleted(step, { userId: ctx.user.id, orgId: ctx.orgId, email: ctx.user.email, orgName: name });
  } catch {
    // analytics must not block onboarding
  }
}

function stepFailed(where: string, error: { code?: string; message?: string }): { error: string } {
  console.error(`[onboarding] ${where} failed`, error.code, error.message);
  return { error: STEP_SAVE_FAILED };
}

// ── Step: Funcționalități (modules) ─────────────────────────────────────
// Replaces the old implicit two-question profile inference with an
// explicit choice (docs/onboarding-redesign-audit-2026-09-19.md Section R).
// team_advanced_enabled / multi_site_ops_enabled aren't part of the
// customer-facing picker — preserved as-is from whatever account creation
// set them to.
export async function saveOnboardingModules(input: {
  inventory_enabled: boolean;
  purchases_enabled: boolean;
  recipe_costing_enabled: boolean;
}): Promise<{ error: string } | void> {
  const ctx = await getActiveOrg();
  const { supabase, membership, orgId } = ctx;
  if (!canManage(membership.role)) return { error: "Permission denied." };

  const { data: org } = await supabase
    .from("organisations")
    .select("name, business_profile, team_advanced_enabled, multi_site_ops_enabled")
    .eq("id", orgId)
    .maybeSingle();

  const result = await saveOrgModuleFlags(supabase, orgId, {
    business_profile: org?.business_profile ?? null,
    inventory_enabled: input.inventory_enabled,
    purchases_enabled: input.purchases_enabled,
    recipe_costing_enabled: input.recipe_costing_enabled,
    team_advanced_enabled: Boolean(org?.team_advanced_enabled),
    multi_site_ops_enabled: Boolean(org?.multi_site_ops_enabled),
  });
  if (!result.ok) return { error: result.error };

  const { error } = await supabase.from("organisations").update({ onboarding_step: "menu" }).eq("id", orgId);
  if (error) return stepFailed("saveOnboardingModules", error);
  await trackStep(ctx, "modules", org?.name ?? null);
  redirect("/onboarding/menu");
}

// ── Step: Meniu (menu builder) ──────────────────────────────────────────
// Product/category creation itself reuses the existing addProductFromPos /
// addCategoryInline actions (app/actions/kitchenops.ts) — this action is
// only the "Continuă" transition, gated on having at least one sellable
// product so first sale is never reached with nothing to sell.
export async function advanceFromMenu(): Promise<{ error: string } | void> {
  const ctx = await getActiveOrg();
  const { supabase, membership, orgId } = ctx;
  if (!canManage(membership.role)) return { error: "Permission denied." };

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .eq("active", true);
  if (!count) {
    return { error: "Adaugă cel puțin un produs înainte de a continua." };
  }

  const { data: org } = await supabase
    .from("organisations")
    .select("name, country_code")
    .eq("id", orgId)
    .maybeSingle();
  const isRO = org?.country_code === "RO";
  const nextStep = isRO ? "fiscal" : "first_sale";

  const { error } = await supabase.from("organisations").update({ onboarding_step: nextStep }).eq("id", orgId);
  if (error) return stepFailed("advanceFromMenu", error);
  await trackStep(ctx, "menu", org?.name ?? null);
  redirect(isRO ? "/onboarding/fiscal" : "/app/pos?onboarding=1&welcome=1");
}

// ── Step: FiscalNet (RO only) ───────────────────────────────────────────
// FiscalNet config itself is saved via the existing saveFiscalNetSettings
// action (app/actions/fiscalnet.ts) — this is only the "Continuă" /
// "Continuă în mod test" transition. Fiscal setup is explicitly not a
// first-sale blocker (docs/lean-cafe-platform-audit-2026-09-17.md: fiscal
// is "conditional, not an activation blocker"). Goes straight to POS — no
// "everything is ready, click here" interstitial in between.
export async function advanceFromFiscal(): Promise<{ error: string } | void> {
  const ctx = await getActiveOrg();
  const { supabase, membership, orgId } = ctx;
  if (!canManage(membership.role)) return { error: "Permission denied." };
  const { error } = await supabase.from("organisations").update({ onboarding_step: "first_sale" }).eq("id", orgId);
  if (error) return stepFailed("advanceFromFiscal", error);
  await trackStep(ctx, "fiscal");
  redirect("/app/pos?onboarding=1&welcome=1");
}

// Called from PosRegister right as it navigates to /onboarding/result after
// a completed onboarding first sale (see redirectAfterSaleTo). Without this,
// app/onboarding/layout.tsx's resume guard would see onboarding_step still
// at "first_sale" and bounce a re-entering org straight back to POS via
// onboardingStepRoute — the guard's job is exactly to enforce "resume where
// the DB says", so the DB has to actually say "result" before the result
// page is reachable. No redirect() here: the caller is already client-side
// navigating.
export async function markFirstSaleDoneForOnboarding(): Promise<{ error: string } | void> {
  const ctx = await getActiveOrg();
  const { supabase, membership, orgId } = ctx;
  if (!canManage(membership.role)) return { error: "Permission denied." };
  const { error } = await supabase
    .from("organisations")
    .update({ onboarding_step: "result" })
    .eq("id", orgId)
    .not("onboarding_step", "in", "(complete)");
  if (error) return stepFailed("markFirstSaleDoneForOnboarding", error);
  await trackStep(ctx, "first_sale");
}

// ── Step: Gata (result -> operational dashboard) ────────────────────────
// The first_sale growth milestone is already recorded inside
// completeSaleReturn (app/actions/kitchenops.ts) when the sale itself
// posts — this only flips the onboarding gate so app/onboarding/layout.tsx
// and app/app/layout.tsx stop routing this org through the guided flow.
export async function completeOnboardingJourney(): Promise<{ error: string } | void> {
  const ctx = await getActiveOrg();
  const { supabase, membership, orgId } = ctx;
  if (!canManage(membership.role)) return { error: "Permission denied." };
  const { error } = await supabase
    .from("organisations")
    .update({
      onboarding_step: "complete",
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", orgId);
  if (error) return stepFailed("completeOnboardingJourney", error);
  // The only place onboarding_completed is sent: the org row now says complete.
  await trackStep(ctx, "result");
  redirect("/app");
}
