import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertTriangle, Clock, Pencil } from "lucide-react";
import { getTemperatureChecks, getActionsTaken } from "@/lib/tracking";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ date?: string; from?: string; to?: string }>;
}

export default async function ManagerReviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const reviewDate = params.date ?? new Date().toISOString().slice(0, 10);
  const from = startOfDay(new Date(reviewDate));
  const to = endOfDay(new Date(reviewDate));

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
  // Allow any org member to review (owners automatically qualify; staff can also sign off in many setups)
  const canReview = true;

  async function signOff(formData: FormData) {
    "use server";
    const serverSupabase = await createClient();
    const { data: { user: currentUser } } = await serverSupabase.auth.getUser();
    if (!currentUser) redirect("/login");

    const { data: member } = await serverSupabase
      .from("organisation_members")
      .select("organisation_id, role")
      .eq("user_id", currentUser.id)
      .limit(1)
      .single();
    if (!member) redirect("/app/manager-review");

    const date = String(formData.get("reviewDate") ?? new Date().toISOString().slice(0, 10));
    const notes = String(formData.get("notes") ?? "");
    const status = String(formData.get("status") ?? "reviewed");

    const { error } = await serverSupabase.from("manager_reviews").insert({
      organisation_id: member.organisation_id,
      review_date: date,
      reviewed_by: currentUser.id,
      status: status === "needs_followup" ? "needs_followup" : "reviewed",
      notes: notes || null,
    });

    if (error) {
      console.error("manager_review_failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    revalidatePath("/app/manager-review");
    revalidatePath("/app/reports/refrigeration");
    revalidatePath("/app");
    redirect(`/app/manager-review?date=${date}`);
  }

  // Fetch checks for the selected date using tracking layer
  const [checks, actions, { data: reviews }] = await Promise.all([
    getTemperatureChecks(supabase, orgId, { from, to }),
    getActionsTaken(supabase, orgId, { from, to }),
    supabase
      .from("manager_reviews")
      .select("*, profiles(full_name, email)")
      .eq("organisation_id", orgId)
      .eq("review_date", reviewDate)
      .order("reviewed_at", { ascending: false }),
  ]);

  const actionedIds = new Set(actions.map((a) => a.reading_id).filter(Boolean));

  const issues = checks.flatMap((r) => {
    const list = [];
    if (r.status === "fail" && !actionedIds.has(r.id)) {
      list.push({
        id: `${r.id}-action`,
        reading: r,
        status: "Action needed",
        statusClass: "bg-red-50 text-red-700 border-red-200",
        issue: `Failed check — ${r.value_c}°C — no action recorded`,
      });
    }
    if (r.status === "fail" && actionedIds.has(r.id)) {
      list.push({
        id: `${r.id}-actioned`,
        reading: r,
        status: "Action recorded",
        statusClass: "bg-green-50 text-green-700 border-green-200",
        issue: `Failed check — ${r.value_c}°C — action was recorded`,
      });
    }
    if (r.enteredLater) {
      list.push({
        id: `${r.id}-late`,
        reading: r,
        status: "Entered later",
        statusClass: "bg-amber-50 text-amber-700 border-amber-200",
        issue: "Check entered more than 2 hours after check time",
      });
    }
    if (r.edited) {
      list.push({
        id: `${r.id}-edited`,
        reading: r,
        status: "Edited",
        statusClass: "bg-slate-50 text-slate-600 border-slate-200",
        issue: "Check was edited after entry",
      });
    }
    return list;
  });

  const latestReview = reviews?.[0];
  const alreadyReviewed = !!latestReview;

  // Summary counts
  const totalChecks = checks.length;
  const failCount = checks.filter((r) => r.status === "fail").length;
  const actionNeededCount = checks.filter((r) => r.status === "fail" && !actionedIds.has(r.id)).length;
  const lateCount = checks.filter((r) => r.enteredLater).length;
  const editedCount = checks.filter((r) => r.edited).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review daily records and sign off exceptions.
          </p>
        </div>
        {/* Date selector */}
        <form method="get" className="flex items-center gap-2">
          <Input
            type="date"
            name="date"
            defaultValue={reviewDate}
            className="h-9 text-sm w-40"
          />
          <Button type="submit" variant="outline" size="sm">Go</Button>
        </form>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2 mb-6">
        {[-3, -2, -1, 0].map((offset) => {
          const d = subDays(new Date(), -offset);
          const dateStr = d.toISOString().slice(0, 10);
          const isSelected = dateStr === reviewDate;
          return (
            <Link key={offset} href={`/app/manager-review?date=${dateStr}`}>
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={isSelected ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              >
                {offset === 0 ? "Today" : format(d, "d MMM")}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Already reviewed banner */}
      {alreadyReviewed && (
        <Card className="mb-6 border-green-200 bg-green-50/60">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <span className="font-medium">Reviewed</span> by{" "}
              {latestReview.profiles?.full_name ?? latestReview.profiles?.email ?? "manager"} on{" "}
              {format(new Date(latestReview.reviewed_at), "d MMM yyyy, HH:mm")}
              {latestReview.notes ? ` — "${latestReview.notes}"` : ""}
              {latestReview.status === "needs_followup" && (
                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                  Needs follow-up
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Checks", count: totalChecks, color: "text-slate-900" },
          { label: "Failed", count: failCount, color: failCount > 0 ? "text-red-700" : "text-slate-400" },
          { label: "Action needed", count: actionNeededCount, color: actionNeededCount > 0 ? "text-red-700" : "text-slate-400" },
          { label: "Entered later", count: lateCount, color: lateCount > 0 ? "text-amber-700" : "text-slate-400" },
          { label: "Edited", count: editedCount, color: editedCount > 0 ? "text-slate-700" : "text-slate-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-100 bg-white p-3">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Issues table */}
      <Card className="mb-6 border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Manager attention for {format(new Date(reviewDate), "d MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalChecks === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No checks logged for this date.</p>
              <Link href="/app/checks/new">
                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                  Log a check
                </Button>
              </Link>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                All {totalChecks} check{totalChecks > 1 ? "s" : ""} for this date are clean — no failed, late, or edited records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="py-2 pr-3 font-medium">Checked at</th>
                    <th className="py-2 pr-3 font-medium">Kitchen</th>
                    <th className="py-2 pr-3 font-medium">Unit</th>
                    <th className="py-2 pr-3 font-medium">Staff</th>
                    <th className="py-2 pr-3 font-medium">Issue</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i) => (
                    <tr key={i.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">
                        {format(new Date(i.reading.taken_at), "HH:mm")}
                      </td>
                      <td className="py-2.5 pr-3">{i.reading.sites?.name ?? "Main Kitchen"}</td>
                      <td className="py-2.5 pr-3 font-medium">{i.reading.unitLabel}</td>
                      <td className="py-2.5 pr-3 text-slate-500 text-xs">{i.reading.staffLabel}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{i.issue}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className={i.statusClass}>
                          {i.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All checks summary */}
      {checks.length > 0 && (
        <Card className="mb-6 border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All checks on {format(new Date(reviewDate), "d MMM yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-50">
                    <th className="py-2 pr-3 font-medium">Checked at</th>
                    <th className="py-2 pr-3 font-medium">Unit</th>
                    <th className="py-2 pr-3 font-medium">Temp</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Staff</th>
                    <th className="py-2 font-medium">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">
                        {format(new Date(r.taken_at), "HH:mm")}
                      </td>
                      <td className="py-2 pr-3 font-medium text-slate-900">{r.unitLabel}</td>
                      <td className={`py-2 pr-3 font-bold ${
                        r.status === "pass" ? "text-green-700" :
                        r.status === "warning" ? "text-amber-700" : "text-red-700"
                      }`}>
                        {r.value_c}°C
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className={`text-xs ${
                          r.status === "pass" ? "bg-green-50 text-green-700 border-green-200" :
                          r.status === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-slate-400 text-xs">{r.staffLabel}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {r.enteredLater && (
                            <Badge variant="outline" className="text-[10px] gap-0.5 bg-amber-50 text-amber-700 border-amber-200">
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign-off form */}
      <Card className="border-slate-100">
        <CardHeader>
          <CardTitle className="text-base">
            {alreadyReviewed ? "Add another review" : "Manager sign-off"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canReview ? (
            <form action={signOff} className="space-y-4">
              <input type="hidden" name="reviewDate" value={reviewDate} />
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="reviewed" defaultChecked className="accent-blue-600" />
                  <span>Reviewed — records are complete</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="needs_followup" className="accent-amber-500" />
                  <span>Needs follow-up</span>
                </label>
              </div>
              <Textarea
                name="notes"
                placeholder="Notes (optional) — describe any actions or follow-ups needed…"
                rows={3}
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Mark reviewed for {format(new Date(reviewDate), "d MMM yyyy")}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">
              Sign-in as owner or manager to sign off records.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
