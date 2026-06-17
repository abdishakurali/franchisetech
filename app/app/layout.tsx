export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/AppShell";
import { SupportChat } from "@/components/app/SupportChat";
import { ensureReferralCode } from "@/lib/referrals";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { listAccessibleSites, getActiveSiteId } from "@/lib/site-context";
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
  if (activeOrg?.id) {
    const [
      { count: productCount },
      { count: paymentMethodCount },
      { count: txCount },
      { data: openSession },
      { data: subscription },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id).eq("active", true).eq("available_in_pos", true),
      supabase.from("payment_methods").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id),
      supabase.from("pos_transactions").select("*", { count: "exact", head: true }).eq("organisation_id", activeOrg.id).eq("status", "completed"),
      supabase.from("pos_sessions").select("id,status").eq("organisation_id", activeOrg.id).eq("status", "open").limit(1).maybeSingle(),
      supabase.from("billing_subscriptions").select("id,status").eq("organisation_id", activeOrg.id).in("status", ["trialing", "active"]).limit(1).maybeSingle(),
    ]);

    setupComplete = [
      (productCount ?? 0) > 0,
      (paymentMethodCount ?? 0) > 0,
      Boolean(openSession),
      (txCount ?? 0) > 0,
      (txCount ?? 0) > 0,
      Boolean(subscription),
    ].every(Boolean);
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
