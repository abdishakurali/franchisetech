import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { correctiveActionLabel, formatTemp, assetDisplayName, targetRangeLabel } from "@/lib/temperature";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReportExportButtons } from "@/components/app/ReportExportButtons";

interface Props {
  searchParams: Promise<{ from?: string; to?: string; status?: string; unit?: string }>;
}

export default async function ActionsReportPage({ searchParams }: Props) {
  const params  = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, organisations(name, business_type)")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/onboarding");

  const orgId = membership.organisation_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = (membership as any).organisations as { name: string; business_type: string | null } | null;

  const toDate   = params.to   ? new Date(params.to)   : new Date();
  const fromDate = params.from ? new Date(params.from) : subDays(toDate, 29);

  let actionsQuery = supabase
    .from("corrective_actions")
    .select("*, assets(id, name, asset_type, min_temp, max_temp), sites(name), profiles!completed_by(full_name, email), temperature_readings(value_c, status, taken_at, created_at, updated_at)")
    .eq("organisation_id", orgId)
    .gte("created_at", startOfDay(fromDate).toISOString())
    .lte("created_at", endOfDay(toDate).toISOString())
    .order("created_at", { ascending: false });
  if (params.unit) actionsQuery = actionsQuery.eq("asset_id", params.unit);
  const [{ data: actions }, { data: assets }] = await Promise.all([
    actionsQuery,
    supabase.from("assets").select("id, name, asset_type").eq("organisation_id", orgId).order("name"),
  ]);

  const openFollowUps = (actions ?? []).filter((a) => a.follow_up_required);
  const exportRows = (actions ?? []).map((a) => ({
    Business: org?.name ?? "",
    Kitchen: a.sites?.name ?? "",
    Unit: assetDisplayName(a.assets),
    "Checked at": a.temperature_readings?.taken_at ? format(new Date(a.temperature_readings.taken_at), "yyyy-MM-dd HH:mm") : "",
    "Entered at": a.temperature_readings?.created_at ? format(new Date(a.temperature_readings.created_at), "yyyy-MM-dd HH:mm") : format(new Date(a.created_at), "yyyy-MM-dd HH:mm"),
    Temperature: a.temperature_readings ? formatTemp(a.temperature_readings.value_c) : "",
    "Target range": a.assets?.asset_type ? targetRangeLabel(a.assets.asset_type) : "",
    Status: a.temperature_readings?.status ?? "",
    Staff: a.profiles?.full_name ?? a.profiles?.email ?? "",
    "Action taken": `${correctiveActionLabel(a.action_type)}: ${a.description}`,
    "Late entry": "",
    Edited: a.temperature_readings?.updated_at ? "Yes" : "No",
    "Manager review status": "",
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="print:hidden p-4 sm:p-6 lg:p-8 pb-0">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Actions Taken Report</h1>
            <p className="text-slate-500 text-sm mt-1">Corrective actions recorded after failed checks</p>
          </div>
          <ReportExportButtons filename={`franchisetech-actions-${format(fromDate, "yyyy-MM-dd")}-to-${format(toDate, "yyyy-MM-dd")}`} rows={exportRows} />
        </div>
        <form className="mb-4 rounded-lg border border-slate-100 bg-white p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1"><label className="text-xs text-slate-500">From</label><Input type="date" name="from" defaultValue={format(fromDate, "yyyy-MM-dd")} /></div>
          <div className="space-y-1"><label className="text-xs text-slate-500">To</label><Input type="date" name="to" defaultValue={format(toDate, "yyyy-MM-dd")} /></div>
          <div className="space-y-1"><label className="text-xs text-slate-500">Unit</label><select name="unit" defaultValue={params.unit ?? ""} className="h-9 rounded-md border border-slate-200 px-3 text-sm"><option value="">All units</option>{(assets ?? []).map((a) => <option key={a.id} value={a.id}>{assetDisplayName(a)}</option>)}</select></div>
          <Button type="submit" variant="outline" className="gap-2"><Filter className="h-4 w-4" />Apply</Button>
        </form>
        {openFollowUps.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{openFollowUps.length}</strong> action{openFollowUps.length > 1 ? "s" : ""} require{openFollowUps.length === 1 ? "s" : ""} a follow-up check.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 lg:p-8 pt-0 print:p-8 print:pt-8">
        {/* Report header */}
        <div className="border-2 border-slate-900 p-5 mb-6 print:border-black">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-lg text-slate-900">franchisetech — Actions Taken</p>
              <p className="text-sm text-slate-500">Corrective Actions Record</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p className="font-medium text-slate-900">{org?.name}</p>
              {org?.business_type && <p>{org.business_type}</p>}
              <p className="mt-1">Period: {format(fromDate, "d MMM yyyy")} – {format(toDate, "d MMM yyyy")}</p>
              <p>Generated: {format(new Date(), "d MMM yyyy, HH:mm")}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="text-center"><p className="text-2xl font-bold text-slate-900">{(actions ?? []).length}</p><p className="text-xs text-slate-500">Total actions</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-amber-600">{openFollowUps.length}</p><p className="text-xs text-slate-500">Follow-up needed</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-green-600">{(actions ?? []).length - openFollowUps.length}</p><p className="text-xs text-slate-500">Completed</p></div>
          </div>
        </div>

        {(actions ?? []).length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg">
            <CheckCircle2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No actions recorded in this period.</p>
            <p className="text-slate-400 text-sm mt-1">Actions appear here after a failed temperature check.</p>
            <Link href="/app/checks/new" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Log a check</Link>
          </div>
        ) : (
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Checked at</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Kitchen</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Unit</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Temperature</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Action taken</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Description</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">By</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500 text-xs">Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {(actions ?? []).map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500 text-xs whitespace-nowrap">
                      {a.temperature_readings
                        ? format(new Date(a.temperature_readings.taken_at), "d MMM, HH:mm")
                        : format(new Date(a.completed_at), "d MMM, HH:mm")}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-xs">{a.sites?.name ?? "—"}</td>
                    <td className="py-2 px-3 font-medium text-slate-900 text-xs">{assetDisplayName(a.assets)}</td>
                    <td className="py-2 px-3 text-xs">
                      {a.temperature_readings ? (
                        <span className="font-bold text-red-600">{formatTemp(a.temperature_readings.value_c)}</span>
                      ) : "—"}
                    </td>
                    <td className="py-2 px-3 text-slate-700 text-xs">{correctiveActionLabel(a.action_type)}</td>
                    <td className="py-2 px-3 text-slate-500 text-xs max-w-xs"><p className="truncate">{a.description}</p></td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{a.profiles?.full_name ?? a.profiles?.email ?? "—"}</td>
                    <td className="py-2 px-3 text-xs">
                      {a.follow_up_required
                        ? <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Required</Badge>
                        : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sign-off */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-slate-500 mb-6">Manager review &amp; signature:</p>
            <div className="border-b border-slate-300 mb-1" style={{ minWidth: 200 }} />
            <p className="text-xs text-slate-400">Name &amp; date</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Business: {org?.name}</p>
            <p className="text-xs text-slate-400">Period: {format(fromDate, "d MMM")} – {format(toDate, "d MMM yyyy")}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
          franchisetech supports food-safety records. It does not replace the operator&apos;s responsibility under food law.
        </p>
      </div>
    </div>
  );
}
