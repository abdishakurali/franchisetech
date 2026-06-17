"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, eachDayOfInterval, differenceInHours } from "date-fns";
import { Filter, Thermometer, CheckCircle2, AlertTriangle, Clock, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  statusBg,
  statusLabel,
  formatTemp,
  correctiveActionLabel,
  assetTypeLabel,
  targetRangeLabel,
} from "@/lib/temperature";
import type { Site, Asset } from "@/lib/types";
import Link from "next/link";
import { downloadCsv } from "@/lib/export";

interface Props {
  readings: Array<{
    id: string;
    value_c: number | null;
    status: string;
    taken_at: string;
    created_at: string;
    updated_at?: string | null;
    source: string;
    notes: string | null;
    assets?: {
      name: string;
      asset_type: string;
      min_temp: number | null;
      max_temp: number | null;
      location: string | null;
    } | null;
    sites?: { name: string } | null;
    profiles?: { full_name: string | null; email?: string | null } | null;
  }>;
  correctiveActions: Array<{
    id: string;
    reading_id?: string | null;
    action_type: string;
    description: string;
    completed_at: string;
    follow_up_required: boolean;
    assets?: { name: string } | null;
    profiles?: { full_name: string | null; email?: string | null } | null;
    temperature_readings?: { value_c: number; status: string; taken_at: string } | null;
  }>;
  verifications: Array<{
    id: string;
    period_start?: string | null;
    period_end?: string | null;
    review_date?: string | null;
    reviewed_at: string;
    status: string;
    notes: string | null;
    profiles?: { full_name: string | null } | null;
    sites?: { name: string } | null;
  }>;
  sites: Site[];
  assets: Asset[];
  selectedSiteId?: string;
  fromDate: Date;
  toDate: Date;
  orgName: string;
  orgBusinessType: string | null;
  selectedSiteName: string | null;
  generatedByName?: string | null;
  tour?: string;
}

export function RefrigerationReport({
  readings,
  correctiveActions,
  verifications,
  sites,
  selectedSiteId,
  fromDate,
  toDate,
  orgName,
  orgBusinessType,
  selectedSiteName,
  generatedByName,
  tour,
}: Props) {
  const router = useRouter();
  const [localSiteId, setLocalSiteId] = useState(selectedSiteId ?? "all");
  const [localFrom, setLocalFrom] = useState(format(fromDate, "yyyy-MM-dd"));
  const [localTo, setLocalTo] = useState(format(toDate, "yyyy-MM-dd"));

  const selectedSiteLabel =
    localSiteId === "all"
      ? "All kitchens"
      : sites.find((s) => s.id === localSiteId)?.name ?? "All kitchens";

  const applyFilters = () => {
    const p = new URLSearchParams();
    if (localSiteId !== "all") p.set("siteId", localSiteId);
    p.set("from", localFrom);
    p.set("to", localTo);
    if (tour) p.set("tour", tour);
    router.push(`/app/reports/refrigeration?${p}`);
  };

  const days = eachDayOfInterval({ start: fromDate, end: toDate });
  const passCount = readings.filter((r) => r.status === "pass").length;
  const warnCount = readings.filter((r) => r.status === "warning").length;
  const failCount = readings.filter((r) => r.status === "fail").length;
  const enteredLaterCount = readings.filter(
    (r) => r.created_at && r.taken_at && differenceInHours(new Date(r.created_at), new Date(r.taken_at)) >= 2
  ).length;
  const editedCount = readings.filter(
    (r) =>
      r.updated_at &&
      r.created_at &&
      new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > 60_000
  ).length;

  const actionByReadingId = new Map(
    correctiveActions.filter((ca) => ca.reading_id).map((ca) => [ca.reading_id!, ca])
  );
  const actionsNeeded = readings.filter((r) => r.status === "fail" && !actionByReadingId.has(r.id)).length;

  const latestReview = verifications.sort(
    (a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime()
  )[0];

  const reviewStatus = latestReview
    ? latestReview.status === "reviewed" || latestReview.status === "approved"
      ? "Reviewed"
      : "Needs follow-up"
    : "Not reviewed";

  // CSV export rows
  const csvRows = readings.map((r) => {
    const linked = actionByReadingId.get(r.id);
    return {
      "Business": orgName,
      "Kitchen": r.sites?.name ?? "",
      "Unit": r.assets?.name ? `${r.assets.name} (${assetTypeLabel(r.assets.asset_type as Parameters<typeof assetTypeLabel>[0])})` : "—",
      "Checked at": format(new Date(r.taken_at), "yyyy-MM-dd HH:mm"),
      "Entered at": format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
      "Temperature (°C)": r.value_c,
      "Target range": r.assets?.asset_type ? targetRangeLabel(r.assets.asset_type as Parameters<typeof targetRangeLabel>[0]) : "",
      "Status": statusLabel(r.status as "pass" | "warning" | "fail"),
      "Staff": r.profiles?.full_name ?? r.profiles?.email ?? "",
      "Action taken": linked ? `${correctiveActionLabel(linked.action_type)}: ${linked.description}` : r.status === "fail" ? "Action needed" : "",
      "Notes": r.notes ?? "",
      "Entered later": differenceInHours(new Date(r.created_at), new Date(r.taken_at)) >= 2 ? "Yes" : "No",
      "Edited": r.updated_at && new Date(r.updated_at).getTime() - new Date(r.created_at).getTime() > 60_000 ? "Yes" : "No",
      "Manager review": reviewStatus,
    };
  });

  const reportFilename = `franchisetech-refrigeration-${format(fromDate, "yyyy-MM-dd")}-to-${format(toDate, "yyyy-MM-dd")}`;

  return (
    <>
      {/* ── Screen controls (hidden in print) ─────────────────────── */}
      <div className="print:hidden">
        <div className="p-4 sm:p-6 lg:p-8 pb-0">
          {/* Tour banner */}
          {tour === "first-report" && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-semibold text-slate-900 mb-1">Your inspection report</p>
              <p className="text-sm text-slate-600 mb-4">
                This is your refrigeration report. Print or save as PDF for inspections.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </Button>
                <Link href="/app">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Refrigeration Report</h1>
              <p className="text-slate-500 text-sm mt-1">
                Temperature records — print or export for inspection
              </p>
            </div>
            {!tour && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => window.print()} variant="outline" className="gap-2">
                  <Printer className="h-4 w-4" /> Print / PDF
                </Button>
                <Button
                  onClick={() => downloadCsv(`${reportFilename}.csv`, csvRows)}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>
            )}
          </div>

          {actionsNeeded > 0 && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">
                <strong>{actionsNeeded}</strong> failed reading{actionsNeeded > 1 ? "s" : ""} still need{actionsNeeded === 1 ? "s" : ""} an action recorded.{" "}
                <Link href="/app/corrective-actions" className="underline font-medium">
                  Record actions
                </Link>
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 rounded-lg border border-slate-100 bg-white p-4 flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kitchen</Label>
              <Select value={localSiteId} onValueChange={setLocalSiteId}>
                <SelectTrigger className="h-8 text-sm w-44">
                  <span className="truncate">{selectedSiteLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All kitchens</SelectItem>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={applyFilters} className="gap-2 h-8">
              <Filter className="h-3 w-3" /> Apply
            </Button>
          </div>
        </div>
      </div>

      {/* ── Printable report body ──────────────────────────────────── */}
      <div className="report-body p-4 sm:p-6 lg:p-8 print:p-8 pt-0 print:pt-8">
        {/* ── Report header ───────────────── */}
        <div className="report-header border-2 border-slate-800 p-5 mb-6 print:border-black">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 print:hidden">
                <Thermometer className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-slate-900">franchisetech</span>
              </div>
              <div className="hidden print:flex items-center gap-2 mb-2">
                <span className="font-bold text-black text-base">franchisetech</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 print:text-black">
                Cold Storage Temperature Record
              </h2>
              <p className="text-sm text-slate-500 mt-0.5 print:text-gray-600">
                Refrigeration Monitoring Report
              </p>
            </div>
            <div className="text-right text-sm text-slate-600 print:text-black">
              <p className="font-semibold text-slate-900 print:text-black">{orgName}</p>
              {orgBusinessType && <p>{orgBusinessType}</p>}
              {selectedSiteName && <p>Kitchen: {selectedSiteName}</p>}
              <p className="mt-1">
                Period: {format(fromDate, "d MMM yyyy")} – {format(toDate, "d MMM yyyy")}
              </p>
              <p>Generated: {format(new Date(), "d MMM yyyy, HH:mm")}</p>
              {generatedByName && <p>By: {generatedByName}</p>}
            </div>
          </div>

          {/* Summary grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-4 border-t border-slate-200 print:border-gray-300">
            {[
              { val: readings.length, label: "Total checks", color: "text-slate-900 print:text-black" },
              { val: passCount, label: "Pass", color: "text-green-700 print:text-black" },
              { val: warnCount, label: "Warning", color: "text-amber-700 print:text-black" },
              { val: failCount, label: "Fail", color: "text-red-700 print:text-black" },
              { val: actionsNeeded, label: "Actions needed", color: "text-red-600 print:text-black" },
              { val: correctiveActions.length, label: "Actions done", color: "text-green-700 print:text-black" },
              { val: enteredLaterCount, label: "Entered later", color: "text-amber-700 print:text-black" },
              { val: editedCount, label: "Edited", color: "text-slate-600 print:text-black" },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-bold ${color}`}>{val}</p>
                <p className="text-xs text-slate-500 print:text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 print:border-gray-200">
            <p className="text-xs text-slate-500 print:text-gray-600">
              Manager review status:{" "}
              <span className={latestReview ? "text-green-700 print:text-black font-medium" : "text-amber-700 print:text-black"}>
                {reviewStatus}
              </span>
              {latestReview && (
                <span>
                  {" "}— {latestReview.profiles?.full_name ?? "Manager"} on{" "}
                  {format(new Date(latestReview.reviewed_at), "d MMM yyyy, HH:mm")}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Daily check tables ──────────── */}
        {readings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg print:border-gray-300">
            <Thermometer className="h-10 w-10 text-slate-200 mx-auto mb-3 print:hidden" />
            <p className="text-slate-500">No checks in this period.</p>
            <Link href="/app/checks/new" className="print:hidden">
              <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                Log temperature check
              </Button>
            </Link>
          </div>
        ) : (
          days.map((day) => {
            const dayReadings = readings.filter(
              (r) => new Date(r.taken_at).toDateString() === day.toDateString()
            );
            if (dayReadings.length === 0) return null;
            return (
              <div key={day.toISOString()} className="mb-6 page-break-inside-avoid">
                <h3 className="font-semibold text-slate-900 print:text-black bg-slate-50 print:bg-gray-100 px-3 py-2 border border-slate-200 print:border-gray-300 rounded-t text-sm">
                  {format(day, "EEEE, d MMMM yyyy")}
                </h3>
                <div className="border border-t-0 border-slate-200 print:border-gray-300 rounded-b overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 print:border-gray-300 bg-white">
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Checked at</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Entered at</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Kitchen</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Unit</th>
                        <th className="text-right py-2 px-2 font-medium text-slate-500 print:text-gray-600">Temp</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Safe range</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Status</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Staff</th>
                        <th className="text-left py-2 px-2 font-medium text-slate-500 print:text-gray-600">Action taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayReadings.map((r) => {
                        const linked = actionByReadingId.get(r.id);
                        const laterEntry = differenceInHours(new Date(r.created_at), new Date(r.taken_at)) >= 2;
                        const wasEdited =
                          Boolean(r.updated_at) &&
                          new Date(r.updated_at!).getTime() - new Date(r.created_at).getTime() > 60_000;
                        return (
                          <tr
                            key={r.id}
                            className={`border-b border-slate-100 print:border-gray-200 last:border-0 ${r.status === "fail" ? "bg-red-50/40 print:bg-white" : ""}`}
                          >
                            <td className="py-2 px-2 text-slate-600 print:text-black whitespace-nowrap">
                              {format(new Date(r.taken_at), "HH:mm")}
                              {laterEntry && (
                                <span title="Entered later">
                                  <Clock className="inline h-3 w-3 text-amber-500 ml-1" />
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-slate-400 print:text-gray-500 whitespace-nowrap">
                              {format(new Date(r.created_at), "HH:mm")}
                            </td>
                            <td className="py-2 px-2 text-slate-600 print:text-black">{r.sites?.name ?? "—"}</td>
                            <td className="py-2 px-2 font-medium text-slate-900 print:text-black">
                              {r.assets?.name ?? "—"}
                              {r.assets?.asset_type && (
                                <span className="text-slate-400 print:text-gray-500 ml-1">
                                  ({assetTypeLabel(r.assets.asset_type as Parameters<typeof assetTypeLabel>[0])})
                                </span>
                              )}
                            </td>
                            <td
                              className={`py-2 px-2 text-right font-bold ${
                                r.status === "pass"
                                  ? "text-green-700 print:text-black"
                                  : r.status === "warning"
                                  ? "text-amber-700 print:text-black"
                                  : "text-red-700 print:text-black"
                              }`}
                            >
                              {formatTemp(r.value_c)}
                            </td>
                            <td className="py-2 px-2 text-slate-500 print:text-gray-600">
                              {r.assets?.asset_type
                                ? targetRangeLabel(r.assets.asset_type as Parameters<typeof targetRangeLabel>[0])
                                : "—"}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`text-xs font-medium px-1.5 py-0.5 rounded border ${statusBg(r.status as "pass" | "warning" | "fail")}`}
                              >
                                {statusLabel(r.status as "pass" | "warning" | "fail")}
                              </span>
                              {wasEdited && (
                                <span className="ml-1 text-xs text-slate-400 print:text-gray-500">(edited)</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-slate-500 print:text-gray-600">
                              {r.profiles?.full_name ?? r.profiles?.email ?? "—"}
                            </td>
                            <td className="py-2 px-2 max-w-[180px]">
                              {linked ? (
                                <span className="text-slate-700 print:text-black">
                                  {correctiveActionLabel(linked.action_type)}: {linked.description}
                                </span>
                              ) : r.status === "fail" ? (
                                <span className="text-red-500 print:text-black font-medium">Action needed</span>
                              ) : (
                                <span className="text-slate-300 print:text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* ── Actions section ─────────────── */}
        {correctiveActions.length > 0 && (
          <div className="mt-6 mb-6">
            <h3 className="font-semibold text-slate-900 print:text-black mb-3 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500 print:hidden" />
              Corrective Actions Taken
            </h3>
            <div className="border border-slate-200 print:border-gray-300 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 print:border-gray-300 bg-slate-50 print:bg-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Date / Time</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Unit</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Failed temp</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Action taken</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Description</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">By</th>
                  </tr>
                </thead>
                <tbody>
                  {correctiveActions.map((ca) => (
                    <tr key={ca.id} className="border-b border-slate-100 print:border-gray-200 last:border-0">
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600 print:text-black">
                        {format(new Date(ca.completed_at), "d MMM, HH:mm")}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 print:text-black">{ca.assets?.name ?? "—"}</td>
                      <td className="py-2 px-3 font-bold text-red-600 print:text-black">
                        {ca.temperature_readings ? formatTemp(ca.temperature_readings.value_c) : "—"}
                      </td>
                      <td className="py-2 px-3 text-slate-700 print:text-black">
                        {correctiveActionLabel(ca.action_type)}
                      </td>
                      <td className="py-2 px-3 text-slate-500 print:text-gray-600 max-w-[200px]">
                        <p className="truncate">{ca.description}</p>
                      </td>
                      <td className="py-2 px-3 text-slate-400 print:text-gray-600">
                        {ca.profiles?.full_name ?? ca.profiles?.email ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Manager verification ─────────── */}
        {verifications.length > 0 ? (
          <div className="mt-6 mb-6">
            <h3 className="font-semibold text-slate-900 print:text-black mb-3 flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 print:hidden" />
              Manager Verification
            </h3>
            <div className="border border-slate-200 print:border-gray-300 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 print:border-gray-300 bg-slate-50 print:bg-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Reviewed on</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Period</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Reviewed by</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-500 print:text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 print:border-gray-200 last:border-0">
                      <td className="py-2 px-3 text-slate-600 print:text-black">
                        {format(new Date(v.reviewed_at), "d MMM yyyy, HH:mm")}
                      </td>
                      <td className="py-2 px-3 text-slate-500 print:text-gray-600">
                        {v.review_date ?? (v.period_start ? format(new Date(v.period_start), "d MMM") : "—")}
                        {v.period_end ? ` – ${format(new Date(v.period_end), "d MMM yyyy")}` : ""}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900 print:text-black">
                        {v.profiles?.full_name ?? "—"}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
                            v.status === "reviewed" || v.status === "approved"
                              ? "bg-green-50 text-green-700 border-green-200 print:bg-white print:text-black print:border-gray-400"
                              : "bg-amber-50 text-amber-700 border-amber-200 print:bg-white print:text-black print:border-gray-400"
                          }`}
                        >
                          {v.status === "reviewed" || v.status === "approved"
                            ? "Reviewed"
                            : "Needs follow-up"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 print:text-gray-600">{v.notes ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Print-only: blank sign-off line when not reviewed */
          <div className="mt-8 pt-6 border-t border-slate-200 print:border-gray-300">
            <p className="text-xs font-semibold text-slate-700 print:text-black mb-4">Manager Review / Sign-off</p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-slate-400 print:text-gray-500 mb-6">Manager name &amp; signature:</p>
                <div className="border-b border-slate-300 print:border-black" style={{ minWidth: 200 }} />
                <p className="text-xs text-slate-400 print:text-gray-500 mt-1">Name &amp; date</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 print:text-gray-500">Business: {orgName}</p>
                <p className="text-xs text-slate-400 print:text-gray-500">
                  Period: {format(fromDate, "d MMM")} – {format(toDate, "d MMM yyyy")}
                </p>
                <p className="text-xs text-slate-400 print:text-gray-500">
                  Generated: {format(new Date(), "d MMM yyyy")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────── */}
        <div className="mt-8 pt-4 border-t border-slate-100 print:border-gray-200">
          <p className="text-xs text-slate-400 print:text-gray-500">
            franchisetech supports food-safety records and operational controls. Food business
            operators remain responsible for complying with applicable food law and official
            guidance.
          </p>
          <p className="text-xs text-slate-400 print:text-gray-500 mt-1">
            <Clock className="inline h-3 w-3 mr-1 print:hidden" />
            &ldquo;Checked at&rdquo; = when the check happened. &ldquo;Entered at&rdquo; = when it was
            recorded in franchisetech.
          </p>
        </div>
      </div>
    </>
  );
}
