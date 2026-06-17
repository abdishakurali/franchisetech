import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SitesManager } from "@/components/app/SitesManager";

export default async function SitesPage() {
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

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("organisation_id", membership.organisation_id)
    .order("name");

  // Get asset counts per site
  const { data: assetCounts } = await supabase
    .from("assets")
    .select("site_id")
    .eq("organisation_id", membership.organisation_id)
    .eq("active", true);

  const countBySite: Record<string, number> = {};
  assetCounts?.forEach((a) => {
    countBySite[a.site_id] = (countBySite[a.site_id] ?? 0) + 1;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
        <p className="text-slate-500 text-sm mt-1">Your food business locations</p>
      </div>
      <SitesManager
        sites={sites ?? []}
        assetCounts={countBySite}
        orgId={membership.organisation_id}
        canManage={["owner", "manager"].includes(membership.role)}
      />
    </div>
  );
}
