import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssetsManager } from "@/components/app/AssetsManager";

export default async function AssetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const [{ data: assets }, { data: sites }] = await Promise.all([
    supabase
      .from("assets")
      .select("*, sites(name, city)")
      .eq("organisation_id", membership.organisation_id)
      .order("name"),
    supabase
      .from("sites")
      .select("*")
      .eq("organisation_id", membership.organisation_id)
      .order("name"),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipment</h1>
          <p className="text-slate-500 text-sm mt-1">Fridges, freezers, cold rooms, hot-hold stations, and other monitored units</p>
        </div>
      </div>

      <AssetsManager
        assets={assets ?? []}
        sites={sites ?? []}
        orgId={membership.organisation_id}
        canManage={["owner", "manager"].includes(membership.role)}
      />
    </div>
  );
}
