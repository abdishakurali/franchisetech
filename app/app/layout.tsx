export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { SupportChat } from "@/components/app/SupportChat";
import { chatwootIdentifierHash } from "@/lib/chatwoot/identity";
import { PostHogIdentify } from "@/components/app/PostHogIdentify";
import { ensureReferralCode } from "@/lib/referrals";
import { getSubscriptionStatus, isSubscriptionBlockedForApp } from "@/lib/billing/subscription";
import { listAccessibleSites, getActiveSiteId } from "@/lib/site-context";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { isModuleNavVisible } from "@/lib/business-modules";
import { requireModuleForPathname } from "@/lib/module-guard";
import type { SubscriptionStatus } from "@/lib/billing/subscription";

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

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const subStatus = activeOrg?.id
    ? await getSubscriptionStatus(activeOrg.id).catch(() => null as SubscriptionStatus | null)
    : null;

  const subscriptionBlocked = isSubscriptionBlockedForApp(subStatus);

  // Resolve accessible sites and active site (non-blocking — falls back gracefully)
  let accessibleSites: { id: string; name: string }[] = [];
  let activeSiteId: string | null = null;
  if (activeOrg?.id && membership?.id && !subscriptionBlocked) {
    try {
      accessibleSites = await listAccessibleSites(supabase, activeOrg.id, membership.id, userRole);
      activeSiteId = await getActiveSiteId(accessibleSites);
    } catch {
      // Non-fatal — layout must not crash if site lookup fails
    }
  }

  const referral = activeOrg?.id && !subscriptionBlocked
    ? await ensureReferralCode(activeOrg.id)
    : null;

  let setupComplete = false;
  let moduleVisibility = {
    inventory: false,
    recipeCosting: false,
    teamAdvanced: false,
    multiSite: false,
    kitchenOps: false,
  };

  if (activeOrg?.id && !subscriptionBlocked) {
    const { count: txCount } = await supabase
      .from("pos_transactions")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", activeOrg.id)
      .eq("status", "completed");

    const moduleFlags = await fetchOrgModuleFlags(supabase, activeOrg.id);

    setupComplete = (txCount ?? 0) > 0;
    const hasTrial = subStatus?.state === "trialing" || subStatus?.state === "soft_trial";

    moduleVisibility = {
      inventory: isModuleNavVisible({ org: moduleFlags, module: "inventory", subscriptionPlan: subStatus?.plan, hasTrial }),
      recipeCosting: isModuleNavVisible({ org: moduleFlags, module: "recipe_costing", subscriptionPlan: subStatus?.plan, hasTrial }),
      teamAdvanced: isModuleNavVisible({ org: moduleFlags, module: "team_advanced", subscriptionPlan: subStatus?.plan, hasTrial }),
      multiSite: isModuleNavVisible({ org: moduleFlags, module: "multi_site", subscriptionPlan: subStatus?.plan, hasTrial }),
      kitchenOps: isModuleNavVisible({ org: moduleFlags, module: "kitchen_ops", subscriptionPlan: subStatus?.plan, hasTrial }),
    };
  }

  if (activeOrg?.id && !subscriptionBlocked && pathname.startsWith("/app/") && !pathname.startsWith("/app/settings") && !pathname.startsWith("/app/billing")) {
    await requireModuleForPathname(pathname);
  }

  const isWorkstationRoute = pathname.startsWith("/app/pos") || pathname.startsWith("/app/kitchen") || pathname.startsWith("/app/tables") || pathname.startsWith("/app/settings");

  const chatwootHash = chatwootIdentifierHash(user.id);

  const { locale: appLocale } = getAppLocaleAndText(
    activeOrg?.country_code ?? null,
    (profile?.locale as string | null) ?? null,
  );

  return (
    <AppI18nProvider key={appLocale} orgIsRO={activeOrg?.country_code === "RO"} initialLocale={appLocale}>
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
      <PostHogIdentify
        userId={user.id}
        email={user.email}
        orgId={activeOrg?.id ?? null}
        orgName={activeOrg?.name ?? null}
      />
      {!isWorkstationRoute && (
        <SupportChat
          userId={user.id}
          userName={profile?.full_name}
          userEmail={user.email}
          identifierHash={chatwootHash}
        />
      )}
    </AppShell>
    </AppI18nProvider>
  );
}
