import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogCheckForm } from "@/components/app/LogCheckForm";
import type { CheckCategory } from "@/lib/food-safety-rules";

interface Props {
  searchParams: Promise<{ assetId?: string; siteId?: string; tour?: string; category?: string }>;
}

export default async function NewCheckPage({ searchParams }: Props) {
  const params = await searchParams;
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
  const orgId = membership.organisation_id;

  const [{ data: sites }, { data: assets }] = await Promise.all([
    supabase.from("sites").select("*").eq("organisation_id", orgId).order("name"),
    supabase.from("assets").select("*, sites(name)").eq("organisation_id", orgId).eq("active", true).order("name"),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Log a Check</h1>
        <p className="text-slate-500 text-sm mt-1">
          Record any food-safety check — cold storage, cooking, delivery, and more.
        </p>
      </div>
      <LogCheckForm
        sites={sites ?? []}
        assets={assets ?? []}
        orgId={orgId}
        userId={user.id}
        preselectedAssetId={params.assetId}
        preselectedSiteId={params.siteId}
        initialCategory={params.category as CheckCategory | undefined}
        tour={params.tour}
      />
    </div>
  );
}
