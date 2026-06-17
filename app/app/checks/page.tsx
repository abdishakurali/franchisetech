import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";
import { Plus, Clock, Pencil, AlertTriangle, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTemperatureChecks } from "@/lib/tracking";
import { statusBg, statusLabel, formatTemp, assetTypeLabel } from "@/lib/temperature";
import { CATEGORY_META, CHECK_TYPE_OPTIONS, targetRangeLabelForCategory } from "@/lib/food-safety-rules";
import type { CheckCategory } from "@/lib/food-safety-rules";

interface Props {
  searchParams: Promise<{
    from?: string;
    to?: string;
    category?: string;
    assetId?: string;
    status?: string;
  }>;
}

export default async function ChecksPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/onboarding");

  const orgId = membership.organisation_id;

  // Date range — default last 7 days
  const toDate   = params.to   ? new Date(params.to)   : new Date();
  const fromDate = params.from ? new Date(params.from) : subDays(toDate, 6);

  const [checks, { data: assets }] = await Promise.all([
    getTemperatureChecks(supabase, orgId, {
      from: fromDate,
      to: toDate,
      category: params.category && params.category !== "all" ? params.category : undefined,
      assetId:  params.assetId  && params.assetId  !== "all" ? params.assetId  : undefined,
    }),
    supabase.from("assets").select("id, name, asset_type").eq("organisation_id", orgId).order("name"),
  ]);

  // Client-side status filter
  const filtered = params.status && params.status !== "all"
    ? checks.filter((r) => r.status === params.status)
    : checks;

  const passCount         = checks.filter((r) => r.status === "pass").length;
  const warnCount         = checks.filter((r) => r.status === "warning").length;
  const failCount         = checks.filter((r) => r.status === "fail").length;
  const actionNeededCount = checks.filter((r) => r.actionNeeded).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checks</h1>
          <p className="text-slate-500 text-sm mt-1">All food-safety temperature checks for your kitchen.</p>
        </div>
        <Link href="/app/checks/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0">
            <Plus className="h-4 w-4" /> Log check
          </Button>
        </Link>
      </div>

      {/* Summary stats */}
      {checks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Pass",          count: passCount,         color: "text-green-700", bg: "bg-green-50 border-green-100" },
            { label: "Warning",       count: warnCount,         color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
            { label: "Fail",          count: failCount,         color: "text-red-700",   bg: failCount > 0         ? "bg-red-50 border-red-200"  : "bg-slate-50 border-slate-100" },
            { label: "Action needed", count: actionNeededCount, color: "text-red-700",   bg: actionNeededCount > 0 ? "bg-red-50 border-red-200"  : "bg-slate-50 border-slate-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border p-3 ${s.bg}`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action needed banner */}
      {actionNeededCount > 0 && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 flex-1">
            <strong>{actionNeededCount}</strong> failed check{actionNeededCount !== 1 ? "s" : ""} still need{actionNeededCount === 1 ? "s" : ""} an action recorded.
          </p>
          <Link href="/app/corrective-actions">
            <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50 flex-shrink-0">
              Record actions
            </Button>
          </Link>
        </div>
      )}

      {/* Filters */}
      <form className="mb-5 flex flex-wrap gap-3 items-end rounded-lg border border-slate-100 bg-white p-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-500">From</label>
          <Input type="date" name="from" defaultValue={format(fromDate, "yyyy-MM-dd")} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">To</label>
          <Input type="date" name="to" defaultValue={format(toDate, "yyyy-MM-dd")} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Check type</label>
          <Select name="category" defaultValue={params.category ?? "all"}>
            <SelectTrigger className="h-8 text-sm w-48"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {CHECK_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Status</label>
          <Select name="status" defaultValue={params.status ?? "all"}>
            <SelectTrigger className="h-8 text-sm w-32"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Unit</label>
          <Select name="assetId" defaultValue={params.assetId ?? "all"}>
            <SelectTrigger className="h-8 text-sm w-40"><SelectValue placeholder="All units" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All units</SelectItem>
              {(assets ?? []).map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name} · {assetTypeLabel(a.asset_type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="outline" size="sm" className="h-8">Apply</Button>
      </form>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-14 text-center">
          <Thermometer className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="font-medium text-slate-500">No checks in this period.</p>
          <p className="text-slate-400 text-sm mt-1">Log your first check to see it here.</p>
          <Link href="/app/checks/new">
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="h-4 w-4" /> Log a check
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="py-2.5 px-3 font-medium">Checked at</th>
                <th className="py-2.5 px-3 font-medium">Entered at</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Unit / Food item</th>
                <th className="py-2.5 px-3 font-medium">Temperature</th>
                <th className="py-2.5 px-3 font-medium">Target</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Staff</th>
                <th className="py-2.5 px-3 font-medium">Action / Notes</th>
                <th className="py-2.5 px-3 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const cat = (r.check_category ?? "cold_storage") as CheckCategory;
                return (
                  <tr key={r.id} className={`border-b border-slate-50 last:border-0 ${r.status === "fail" ? "bg-red-50/20" : "hover:bg-slate-50/40"}`}>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {format(new Date(r.taken_at), "d MMM, HH:mm")}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-xs">
                      {format(new Date(r.created_at), "d MMM, HH:mm")}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200 whitespace-nowrap">
                        {CATEGORY_META[cat]?.shortLabel ?? cat}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {r.subjectLabel}
                    </td>
                    <td className={`py-2.5 px-3 font-bold ${
                      r.status === "pass" ? "text-green-700" : r.status === "warning" ? "text-amber-700" : "text-red-700"
                    }`}>
                      {r.value_c != null ? formatTemp(r.value_c) : cat === "cooling" ? "Time-based" : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs">
                      {targetRangeLabelForCategory(cat, r.delivery_type)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className={`text-xs ${statusBg(r.status as "pass"|"warning"|"fail")}`}>
                        {statusLabel(r.status as "pass"|"warning"|"fail")}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-xs">{r.staffLabel}</td>
                    <td className="py-2.5 px-3 text-xs max-w-[180px]">
                      {r.actionNeeded ? (
                        <Link href={`/app/corrective-actions/${r.id}`} className="text-red-600 font-medium hover:underline whitespace-nowrap">
                          Record action →
                        </Link>
                      ) : r.corrective_actions?.length ? (
                        <span className="text-green-700 font-medium">✓ {r.corrective_actions[0].description}</span>
                      ) : r.notes ? (
                        <span className="text-slate-500 truncate block">{r.notes}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.enteredLater && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> Late
                          </Badge>
                        )}
                        {r.edited && (
                          <Badge variant="outline" className="text-[10px] gap-0.5">
                            <Pencil className="h-2.5 w-2.5" /> Edited
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
