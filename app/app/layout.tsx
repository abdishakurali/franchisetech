export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { perfSteps } from "@/lib/perf/timing";
import { headers } from "next/headers";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { AppShell } from "@/components/app/AppShell";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { PostHogIdentify } from "@/components/app/PostHogIdentify";
import { buildReferralLink } from "@/lib/referrals";
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
  const perf = perfSteps("app_layout");
  const [appContext, headersList] = await Promise.all([
    getActiveOrg(),
    headers(),
  ]);
  const { supabase, user, profile, membership } = appContext;
  perf.mark("auth");

  const orgRelation = membership?.organisations ?? null;
  const activeOrgFull = (Array.isArray(orgRelation) ? orgRelation[0] : orgRelation) as ({
    id: string;
    name: string;
    country_code?: string | null;
    trial_ends_at?: string | null;
    referral_credit_months?: number | null;
    kitchen_display_enabled?: boolean | null;
    table_service_enabled?: boolean | null;
    efactura_enabled?: boolean | null;
    compact_workstation_nav_enabled?: boolean | null;
    business_profile?: string | null;
    loyalty_enabled?: boolean | null;
    referral_code?: string | null;
    admin_notes?: unknown;
  } | null);
  // Never forward admin_notes (internal-only) to this client component —
  // This prop reaches the tenant's browser via the RSC payload.
  const activeOrg = activeOrgFull
    ? (({ admin_notes: _adminNotes, ...rest }) => rest)(activeOrgFull)
    : null;
  const userRole = membership?.role ?? null;

  const pathname = headersList.get("x-pathname") ?? "";

  // External accountants use a deliberately narrow, read-only product
  // surface. Do not expose operational pages even if they know a URL.
  if (userRole === "accountant") redirect("/accountant");

  const subStatus = activeOrg?.id
    ? await getSubscriptionStatus(activeOrg.id).catch(() => null as SubscriptionStatus | null)
    : null;

  const subscriptionBlocked = isSubscriptionBlockedForApp(subStatus);

  // New signups get a fully unrestricted 5-day trial (see
  // lib/billing/subscription.ts's created_at-based fallback) — no forced
  // card-verification redirect mid-trial, regardless of Z-report views or
  // sale count. Once the 5 days are up, getSubscriptionStatus resolves to a
  // blocked state and the paywall in components/app/AppShell.tsx takes over.

  const orgReady = Boolean(activeOrg?.id && !subscriptionBlocked);
  const needsModuleGuard =
    orgReady && pathname.startsWith("/app/") && !pathname.startsWith("/app/settings") && !pathname.startsWith("/app/billing");

  // Sites, referral, module flags and the module guard are independent reads;
  // they used to run as four sequential rounds on every navigation.
  const [sitesResult, moduleFlags] = await Promise.all([
    // Resolve accessible sites and active site (non-blocking — falls back gracefully)
    activeOrg?.id && membership?.id && !subscriptionBlocked
      ? (async () => {
          try {
            const sites = await listAccessibleSites(supabase, activeOrg.id, membership.id, userRole);
            return { sites, activeSiteId: await getActiveSiteId(sites) };
          } catch {
            // Non-fatal — layout must not crash if site lookup fails
            return null;
          }
        })()
      : Promise.resolve(null),
    orgReady ? fetchOrgModuleFlags(supabase, activeOrg!.id) : Promise.resolve(null),
    needsModuleGuard ? requireModuleForPathname(pathname) : Promise.resolve(),
  ]);
  perf.mark("org_data");
  perf.done();
  const accessibleSites: { id: string; name: string }[] = sitesResult?.sites ?? [];
  const activeSiteId: string | null = sitesResult?.activeSiteId ?? null;

  const setupComplete = false;
  let moduleVisibility = {
    inventory: false,
    purchases: false,
    recipeCosting: false,
    teamAdvanced: false,
    multiSite: false,
    kitchenOps: false,
  };

  if (orgReady && moduleFlags) {
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

  const referralCode = activeOrg?.referral_code ?? null;
  const referral = activeOrg ? {
    link: referralCode ? buildReferralLink(referralCode) : null,
    code: referralCode,
    creditMonths: Number(activeOrg.referral_credit_months ?? 0),
    daysLeft: subStatus?.trialDaysLeft ?? null,
  } : null;

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
