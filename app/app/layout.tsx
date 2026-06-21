export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { SupportChat } from "@/components/app/SupportChat";
import { PostHogIdentify } from "@/components/app/PostHogIdentify";
import { ensureReferralCode } from "@/lib/referrals";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { listAccessibleSites, getActiveSiteId } from "@/lib/site-context";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { isModuleEnabled } from "@/lib/business-modules";
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
    inventory: false,
    recipeCosting: false,
    teamAdvanced: false,
    multiSite: false,
  };

  if (activeOrg?.id) {
    const { count: txCount } = await supabase
      .from("pos_transactions")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", activeOrg.id)
      .eq("status", "completed");

    const moduleFlags = await fetchOrgModuleFlags(supabase, activeOrg.id);

    setupComplete = (txCount ?? 0) > 0;

    moduleVisibility = {
      inventory: isModuleEnabled(moduleFlags, "inventory"),
      recipeCosting: isModuleEnabled(moduleFlags, "recipe_costing"),
      teamAdvanced: isModuleEnabled(moduleFlags, "team_advanced"),
      multiSite: isModuleEnabled(moduleFlags, "multi_site"),
    };
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (activeOrg?.id && pathname.startsWith("/app/") && !pathname.startsWith("/app/settings") && !pathname.startsWith("/app/billing")) {
    await requireModuleForPathname(pathname);
  }

  const blockedStates = ["none", "past_due_expired"];
  if (subStatus && blockedStates.includes(subStatus.state)) {
    if (!pathname.startsWith("/app/billing")) {
      const reason = subStatus.state === "past_due_expired" ? "past_due_expired" : "trial_expired";
      redirect(`/app/billing?reason=${reason}`);
    }
  }

  const isWorkstationRoute = pathname.startsWith("/app/pos") || pathname.startsWith("/app/kitchen") || pathname.startsWith("/app/settings");

  return (
    <AppI18nProvider orgIsRO={activeOrg?.country_code === "RO"}>
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
        />
      )}
    </AppShell>
    </AppI18nProvider>
  );
}
