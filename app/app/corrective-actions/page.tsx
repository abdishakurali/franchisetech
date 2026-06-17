import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTemp, statusBg, statusLabel } from "@/lib/temperature";
import { CATEGORY_META, targetRangeLabelForCategory as catTargetLabel } from "@/lib/food-safety-rules";
import type { CheckCategory } from "@/lib/food-safety-rules";
import { getTemperatureChecks, getActionsTaken } from "@/lib/tracking";
import Link from "next/link";

export default async function ActionsPage() {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
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
  const window90 = { from: new Date(now - 90 * 86_400_000), to: new Date(now) };

  // All checks (90 days) — actionNeeded flag already computed in tracking
  const allChecks = await getTemperatureChecks(supabase, orgId, window90);

  // All completed actions (90 days)
  const completedActions = await getActionsTaken(supabase, orgId, window90);

  // Section A: fail readings with no corrective action
  const needsAction = allChecks.filter((r) => r.actionNeeded);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actions Taken</h1>
          <p className="text-slate-500 text-sm mt-1">
            Failed checks needing action, and completed corrective actions.
          </p>
        </div>
        <Link href="/app/checks/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Log temperature check
          </Button>
        </Link>
      </div>

      {/* ── Section A: Needs action ─────────────────────────────────────────── */}
      <Card className={`mb-6 ${needsAction.length > 0 ? "border-red-200 bg-red-50/40" : "border-slate-100"}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-base flex items-center gap-2 ${needsAction.length > 0 ? "text-red-800" : "text-slate-700"}`}>
            {needsAction.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            Needs action
            {needsAction.length > 0 && (
              <Badge className="ml-1 bg-red-600 text-white border-0 text-xs">
                {needsAction.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {needsAction.length === 0 ? (
            <p className="text-sm text-slate-500">
              No failed checks waiting for an action. All clear.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-red-100 text-xs text-slate-500">
                    <th className="text-left py-2 pr-3 font-medium">Checked at</th>
                    <th className="text-left py-2 pr-3 font-medium">Unit</th>
                    <th className="text-left py-2 pr-3 font-medium">Temperature</th>
                    <th className="text-left py-2 pr-3 font-medium">Target range</th>
                    <th className="text-left py-2 pr-3 font-medium">Staff</th>
                    <th className="text-left py-2 pr-3 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {needsAction.map((r) => (
                    <tr key={r.id} className="border-b border-red-50 last:border-0">
                      <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">
                        {format(new Date(r.taken_at), "d MMM, HH:mm")}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-slate-900">{r.subjectLabel}</td>
                      <td className="py-2.5 pr-3 font-bold text-red-600">
                        {r.value_c != null ? formatTemp(r.value_c) : <span className="text-slate-400 font-normal text-xs">{CATEGORY_META[(r.check_category ?? "cold_storage") as CheckCategory]?.shortLabel}</span>}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 text-xs">
                        {catTargetLabel((r.check_category ?? "cold_storage") as CheckCategory, r.delivery_type)}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 text-xs">{r.staffLabel}</td>
                      <td className="py-2.5 pr-3">
                        <Badge variant="outline" className={statusBg("fail")}>
                          {statusLabel("fail")}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <Link href={`/app/corrective-actions/${r.id}`}>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1 text-xs h-7">
                            Record action <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section B: Actions recorded ────────────────────────────────────── */}
      <Card className="border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actions recorded</CardTitle>
        </CardHeader>
        <CardContent>
          {completedActions.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No actions recorded yet.</p>
              <p className="text-slate-400 text-xs mt-1">
                Actions appear here after a failed check has an action saved.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="text-left py-2 pr-3 font-medium">Checked at</th>
                    <th className="text-left py-2 pr-3 font-medium">Unit</th>
                    <th className="text-left py-2 pr-3 font-medium">Failed temp</th>
                    <th className="text-left py-2 pr-3 font-medium">Action taken</th>
                    <th className="text-left py-2 pr-3 font-medium">Description</th>
                    <th className="text-left py-2 pr-3 font-medium">Completed by</th>
                    <th className="text-left py-2 font-medium">Completed at</th>
                  </tr>
                </thead>
                <tbody>
                  {completedActions.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap text-xs">
                        {a.temperature_readings
                          ? format(new Date(a.temperature_readings.taken_at), "d MMM, HH:mm")
                          : format(new Date(a.completed_at), "d MMM, HH:mm")}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-slate-900">{a.unitLabel}</td>
                      <td className="py-2.5 pr-3">
                        {a.failedTemp ? (
                          <span className="font-bold text-red-600">{a.failedTemp}</span>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-700">{a.actionLabel}</td>
                      <td className="py-2.5 pr-3 text-slate-500 max-w-xs">
                        <p className="truncate">{a.description}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-400 text-xs">{a.staffLabel}</td>
                      <td className="py-2.5 text-slate-400 text-xs whitespace-nowrap">
                        {format(new Date(a.completed_at), "d MMM, HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
