import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import Link from "next/link";
import { TeamClient } from "./TeamClient";
import { redirect } from "next/navigation";

function makeAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function TeamSettingsPage() {
  const { membership, orgId } = await getKitchenOpsContext();

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

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/app/settings" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Settings
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-semibold text-slate-950">Team</h1>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-3 text-sm text-red-700">
          Error loading members: {(error as { message?: string }).message}
        </div>
      )}

      <TeamClient initialMembers={enrichedMembers} />
    </div>
  );
}
