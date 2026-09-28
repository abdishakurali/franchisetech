export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
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
  const { data: { user } } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: memberships }, headersList] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("organisation_members")
      .select("*, organisations(*)")
      .eq("user_id", user.id)
      .or("status.is.null,status.eq.active")
      .order("created_at", { ascending: true })
      .limit(1),
    headers(),
  ]);

  const membership = memberships?.[0] ?? null;
  const activeOrgFull = membership?.organisations ?? null;
  // Never forward admin_notes (internal-only) to this client component —
  // organisations(*) above pulls every column, but this prop reaches the
  // tenant's own browser via the RSC payload.
  const activeOrg = activeOrgFull
    ? (({ admin_notes: _adminNotes, ...rest }) => rest)(activeOrgFull)
    : null;
  const userRole = membership?.role ?? null;

  const pathname = headersList.get("x-pathname") ?? "";

  // External accountants use a deliberately narrow, read-only product
  // surface. Do not expose operational pages even if they know a URL.
  if (userRole === "accountant") redirect("/accountant");

  const [subStatus, completedTxCount] = activeOrg?.id
    ? await Promise.all([
        getSubscriptionStatus(activeOrg.id).catch(() => null as SubscriptionStatus | null),
        supabase
          .from("pos_transactions")
          .select("*", { count: "exact", head: true })
          .eq("organisation_id", activeOrg.id)
          .eq("status", "completed")
          .then(({ count }) => count ?? 0),
      ])
    : [null, 0];

  const subscriptionBlocked = isSubscriptionBlockedForApp(subStatus);

  const hasRealSubscription =
    subStatus?.state === "active" ||
    subStatus?.state === "trialing" ||
    subStatus?.state === "past_due";

  // Completed-sale count is needed both for the delayed verification gate
  // below and for setupComplete further down — computed once here so a new
  // signup only pays the query cost a single time per request.
  const txCount = completedTxCount;

  // New signups get a fully unrestricted 5-day trial (see
  // lib/billing/subscription.ts's created_at-based fallback) — no forced
  // card-verification redirect mid-trial, regardless of Z-report views or
  // sale count. Once the 5 days are up, getSubscriptionStatus resolves to a
  // blocked state and the paywall in components/app/AppShell.tsx takes over.

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
    ? await ensureReferralCode(activeOrg.id, false)
    : null;

  let setupComplete = false;
  let moduleVisibility = {
    inventory: false,
    purchases: false,
    recipeCosting: false,
    teamAdvanced: false,
    multiSite: false,
    kitchenOps: false,
  };

  if (activeOrg?.id && !subscriptionBlocked) {
    const moduleFlags = await fetchOrgModuleFlags(supabase, activeOrg.id);

    setupComplete = txCount > 0;
    const hasTrial = subStatus?.state === "trialing" || subStatus?.state === "soft_trial";

    moduleVisibility = {
      inventory: isModuleNavVisible({ org: moduleFlags, module: "inventory", subscriptionPlan: subStatus?.plan, hasTrial }),
      purchases: isModuleNavVisible({ org: moduleFlags, module: "purchases", subscriptionPlan: subStatus?.plan, hasTrial }),
      recipeCosting: isModuleNavVisible({ org: moduleFlags, module: "recipe_costing", subscriptionPlan: subStatus?.plan, hasTrial }),
      teamAdvanced: isModuleNavVisible({ org: moduleFlags, module: "team_advanced", subscriptionPlan: subStatus?.plan, hasTrial }),
      multiSite: isModuleNavVisible({ org: moduleFlags, module: "multi_site", subscriptionPlan: subStatus?.plan, hasTrial }),
      kitchenOps: isModuleNavVisible({ org: moduleFlags, module: "kitchen_ops", subscriptionPlan: subStatus?.plan, hasTrial }),
    };
  }

  if (activeOrg?.id && !subscriptionBlocked && pathname.startsWith("/app/") && !pathname.startsWith("/app/settings") && !pathname.startsWith("/app/billing")) {
    await requireModuleForPathname(pathname);
  }

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
    </AppShell>
    </AppI18nProvider>
  );
}
