import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RefrigerationReport } from "@/components/app/RefrigerationReport";
import { subDays } from "date-fns";
import { getRefrigerationReportData } from "@/lib/tracking";

interface Props {
  searchParams: Promise<{
    from?: string;
    to?: string;
    siteId?: string;
    assetId?: string;
    tour?: string;
  }>;
}

export default async function RefrigerationReportPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, organisations(name, business_type, country)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");
  const orgId = membership.organisation_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = (membership as any).organisations as {
    name: string;
    business_type: string | null;
    country: string;
  } | null;

  const toDate = params.to ? new Date(params.to) : new Date();
  const fromDate = params.from ? new Date(params.from) : subDays(toDate, 6);

  // Use tracking layer — fixes ambiguous profiles FK (migration 006 added updated_by)
  const { readings, actions } = await getRefrigerationReportData(supabase, orgId, {
    from: fromDate,
    to: toDate,
    siteId: params.siteId,
  });

  const [{ data: verifications }, { data: sites }, { data: assets }] = await Promise.all([
    supabase
      .from("manager_reviews")
      .select("*, profiles(full_name), sites(name)")
      .eq("organisation_id", orgId)
      .gte("review_date", fromDate.toISOString().slice(0, 10))
      .lte("review_date", toDate.toISOString().slice(0, 10))
      .order("reviewed_at", { ascending: true }),
    supabase.from("sites").select("*").eq("organisation_id", orgId).order("name"),
    supabase.from("assets").select("*").eq("organisation_id", orgId).eq("active", true).order("name"),
  ]);

  const selectedSite = params.siteId ? sites?.find((s) => s.id === params.siteId) : null;

  return (
    <RefrigerationReport
      readings={readings}
      correctiveActions={actions}
      verifications={(verifications ?? []).map((v) => ({
        id: v.id,
        period_start: v.review_date,
        period_end: v.review_date,
        review_date: v.review_date,
        reviewed_at: v.reviewed_at,
        status: v.status,
        notes: v.notes,
        profiles: v.profiles,
        sites: v.sites,
      }))}
      sites={sites ?? []}
      assets={assets ?? []}
      selectedSiteId={params.siteId}
      fromDate={fromDate}
      toDate={toDate}
      orgName={org?.name ?? "Organisation"}
      orgBusinessType={org?.business_type ?? null}
      selectedSiteName={selectedSite?.name ?? null}
      generatedByName={profile?.full_name ?? profile?.email ?? null}
      tour={params.tour}
    />
  );
}
