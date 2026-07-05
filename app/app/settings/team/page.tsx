import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { TeamClient } from "./TeamClient";
import { redirect } from "next/navigation";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { SettingsTabNav } from "@/components/app/SettingsTabNav";

function makeAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function TeamSettingsPage() {
  const { membership, orgId, countryCode } = await getKitchenOpsContext();

  // Only owner/manager can see this page
  if (!["owner","manager"].includes(membership.role ?? "")) {
    redirect("/app/settings");
  }

  // Use admin client — regular Supabase client is blocked by RLS when
  // trying to read other users' profiles and membership rows.
  const admin = makeAdminClient();

  const { data: members, error } = await admin
    .from("organisation_members")
    .select("id,user_id,role,status,created_at,invited_by,disabled_at")
    .eq("organisation_id", orgId)
    .order("created_at");

  const userIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
  const { data: profiles } = await admin
    .from("profiles")
    .select("id,full_name,email,role_title,phone")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = Object.fromEntries(
    ((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string | null; role_title: string | null; phone: string | null }>)
      .map((p) => [p.id, p])
  );
  const enrichedMembers = (members ?? []).map((m: { id: string; user_id: string; role: string; status: string; created_at: string; invited_by: string | null; disabled_at: string | null }) => ({
    ...m,
    profile: profileMap[m.user_id] ?? null,
  }));
  const advancedRolesAllowed = await hasEntitlement(orgId, "team.advanced_roles", { write: true });

  const isRO = countryCode === "RO";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgInfo = (membership as any).organisations;
  const org = Array.isArray(orgInfo) ? orgInfo[0] : orgInfo;
  const fiscalnetEnabled = Boolean(org?.fiscalnet_enabled);
  const efacturaEnabled = Boolean(org?.efactura_enabled);
  const sagaInstalled = Boolean(org?.saga_export_enabled);

  const tabs = [
    { id: "business",     label: "Business" },
    { id: "operations",   label: isRO ? "Operațiuni" : "Operations" },
    ...(isRO && (fiscalnetEnabled || efacturaEnabled || sagaInstalled)
      ? [{ id: "fiscal", label: "Fiscal" }]
      : []),
    { id: "integrations", label: "Marketplace" },
    { id: "notifications",label: isRO ? "Notificări" : "Notifications" },
    { id: "billing",      label: isRO ? "Facturare" : "Billing" },
    { id: "team", label: isRO ? "Echipă" : "Team", href: "/app/settings/team" },
  ];

  return (
    <div className="settings-page-wrapper max-w-4xl p-4 sm:p-6">
      <div className="settings-page-heading mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">{isRO ? "Setări" : "Settings"}</h1>
        <p className="text-sm text-slate-500 mt-1">{isRO ? "Configurează contul și organizația ta" : "Configure your account and organization"}</p>
      </div>

      <SettingsTabNav tabs={tabs} />

      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          Error loading members: {(error as { message?: string }).message}
        </div>
      )}

      <TeamClient initialMembers={enrichedMembers} advancedRolesAllowed={advancedRolesAllowed} />
    </div>
  );
}
