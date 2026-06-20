import { redirect } from "next/navigation";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import {
  canUseModule,
  moduleBlockReason,
  pathnameRequiresModule,
} from "@/lib/business-modules";
import type { BusinessModuleKey } from "@/lib/billing/entitlements";
import type { BillingPlan } from "@/lib/billing/plans";

function subscriptionPlan(plan: string | null | undefined): BillingPlan | null {
  if (plan === "starter" || plan === "pro" || plan === "multi_location") return plan;
  return null;
}

export async function requireBusinessModule(module: BusinessModuleKey): Promise<void> {
  const { membership, supabase, orgId } = await getActiveOrg();
  const org = await fetchOrgModuleFlags(supabase, orgId);
  const sub = await getSubscriptionStatus(orgId).catch(() => null);
  const hasTrial = sub?.state === "trialing" || sub?.state === "soft_trial";

  if (canUseModule({
    org,
    module,
    subscriptionPlan: subscriptionPlan(sub?.plan),
    hasTrial,
  })) {
    return;
  }

  const reason = moduleBlockReason({
    org,
    module,
    subscriptionPlan: subscriptionPlan(sub?.plan),
    hasTrial,
  });
  redirect(`/app/settings?tab=features&locked=${module}&msg=${encodeURIComponent(reason ?? "Module not available")}`);
}

export async function requireModuleForPathname(pathname: string): Promise<void> {
  const moduleKey = pathnameRequiresModule(pathname);
  if (moduleKey) await requireBusinessModule(moduleKey);
}
