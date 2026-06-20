export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";
import { SupportChat } from "@/components/app/SupportChat";
import { ensureReferralCode } from "@/lib/referrals";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { listAccessibleSites, getActiveSiteId } from "@/lib/site-context";
import { computeSetupProgress } from "@/lib/setup-progress";
import type { SubscriptionStatus } from "@/lib/billing/subscription";
import type { BillingPlan } from "@/lib/billing/plans";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("organisation_members")
    .select("*, organisations(*)")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .order("created_at", { ascending: true })
    .limit(1);

  const membership = memberships?.[0] ?? null;
  const activeOrg = membership?.organisations ?? null;
  const userRole = membership?.role ?? null;

  // Resolve accessible sites and active site (non-blocking — falls back gracefully)
  let accessibleSites: { id: string; name: string }[] = [];
  let activeSiteId: string | null = null;
  if (activeOrg?.id && membership?.id) {
    try {
      accessibleSites = await listAccessibleSites(supabase, activeOrg.id, membership.id, userRole);
      activeSiteId = await getActiveSiteId(accessibleSites);
    } catch {
      // Non-fatal — layout must not crash if site lookup fails
    }
  }

  const [referral, subStatus] = await Promise.all([
    activeOrg?.id ? ensureReferralCode(activeOrg.id) : Promise.resolve(null),
    activeOrg?.id ? getSubscriptionStatus(activeOrg.id).catch(() => null as SubscriptionStatus | null) : Promise.resolve(null),
  ]);

  let setupComplete = false;
  let moduleVisibility = {
    inventory: true,
    recipeCosting: true,
    teamAdvanced: true,
    multiSite: true,
  };
  let subscriptionPlan: BillingPlan | null = null;
  let hasTrial = false;

  if (activeOrg?.id) {
    const orgRow = activeOrg as Record<string, unknown>;
    const [
      { count: productCount },
      { count: paymentMethodCount },
      { count: txCount },
      { count: siteCount },
      { count: ingredientCount },
      { count: supplierCount },
      { count: purchaseCount },
      { count: recipeCount },
      { data: openSession },
      { data: subscription },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id).eq("active", true).eq("available_in_pos", true),
      supabase.from("payment_methods").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id),
      supabase.from("pos_transactions").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id).eq("status", "completed"),
      supabase.from("sites").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id).eq("active", true).eq("is_ingredient", true),
      supabase.from("suppliers").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id),
      supabase.from("purchases").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id),
      supabase.from("recipes").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id),
      supabase.from("pos_sessions").select("id,status").eq("organisation_id", activeOrg.id).eq("status", "open").limit(1).maybeSingle(),
      supabase.from("billing_subscriptions").select("id,status,plan").eq("organisation_id", activeOrg.id).in("status", ["trialing", "active"]).limit(1).maybeSingle(),
    ]);

    const progress = computeSetupProgress({
      orgName: activeOrg.name,
      country: (orgRow.country as string) ?? null,
      currencyCode: (orgRow.currency_code as string) ?? null,
      businessProfile: (orgRow.business_profile as string) ?? null,
      inventoryEnabled: Boolean(orgRow.inventory_enabled),
      recipeCostingEnabled: Boolean(orgRow.recipe_costing_enabled),
      multiSiteOpsEnabled: Boolean(orgRow.multi_site_ops_enabled),
      productCount: productCount ?? 0,
      paymentMethodCount: paymentMethodCount ?? 0,
      txCount: txCount ?? 0,
      openSession: Boolean(openSession),
      subscription: Boolean(subscription),
      siteCount: siteCount ?? 0,
      ingredientCount: ingredientCount ?? 0,
      supplierCount: supplierCount ?? 0,
      purchaseCount: purchaseCount ?? 0,
      recipeCount: recipeCount ?? 0,
    });
    setupComplete = progress.complete;

    subscriptionPlan = (subscription?.plan === "starter" || subscription?.plan === "pro" || subscription?.plan === "multi_location")
      ? subscription.plan
      : null;
    hasTrial = subStatus?.state === "trialing" || subStatus?.state === "soft_trial";

    const { canUseModule } = await import("@/lib/business-modules");
    const orgModules = {
      business_profile: (orgRow.business_profile as string | null) ?? null,
      inventory_enabled: Boolean(orgRow.inventory_enabled),
      recipe_costing_enabled: Boolean(orgRow.recipe_costing_enabled),
      team_advanced_enabled: Boolean(orgRow.team_advanced_enabled),
      multi_site_ops_enabled: Boolean(orgRow.multi_site_ops_enabled),
    };
    moduleVisibility = {
      inventory: canUseModule({ org: orgModules, module: "inventory", subscriptionPlan, hasTrial }),
      recipeCosting: canUseModule({ org: orgModules, module: "recipe_costing", subscriptionPlan, hasTrial }),
      teamAdvanced: canUseModule({ org: orgModules, module: "team_advanced", subscriptionPlan, hasTrial }),
      multiSite: canUseModule({ org: orgModules, module: "multi_site", subscriptionPlan, hasTrial }),
    };
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const blockedStates = ["none", "past_due_expired"];
  if (subStatus && blockedStates.includes(subStatus.state)) {
    if (!pathname.startsWith("/app/billing")) {
      const reason = subStatus.state === "past_due_expired" ? "past_due_expired" : "trial_expired";
      redirect(`/app/billing?reason=${reason}`);
    }
  }

  const isWorkstationRoute = pathname.startsWith("/app/pos") || pathname.startsWith("/app/kitchen") || pathname.startsWith("/app/settings");

  return (
    <AppShell
      user={user}
      profile={profile}
      activeOrg={activeOrg}
      userRole={userRole}
      setupComplete={setupComplete}
      moduleVisibility={moduleVisibility}
      trialDaysLeft={referral?.daysLeft ?? 15}
      referral={referral}
      subStatus={subStatus ?? undefined}
      accessibleSites={accessibleSites}
      activeSiteId={activeSiteId}
    >
      {children}
      {!isWorkstationRoute && (
        <SupportChat
          userId={user.id}
          userName={profile?.full_name}
          userEmail={user.email}
        />
      )}
    </AppShell>
  );
}
