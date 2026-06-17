import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Wrench, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PrintButton } from "@/components/app/PrintButton";

export default async function CalibrationReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, organisations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");
  const orgId = membership.organisation_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = (membership as any).organisations as { name: string } | null;

  const { data: records } = await supabase
    .from("calibration_records")
    .select("*, probe_thermometers(name, serial_number), profiles(full_name), sites(name)")
    .eq("organisation_id", orgId)
    .order("checked_at", { ascending: false });

  const methodLabel: Record<string, string> = {
    ice_point: "Ice point (0°C reference)",
    boiling_point: "Boiling point (100°C reference)",
    comparison: "Comparison with calibrated probe",
    other: "Other method",
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calibration Report</h1>
          <p className="text-slate-500 text-sm mt-1">Probe thermometer calibration records</p>
        </div>
        <PrintButton />
      </div>

      {/* Report header */}
      <div className="border-2 border-slate-900 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-lg">franchisetech</p>
            <h2 className="text-xl font-bold text-slate-900">Probe Thermometer Calibration Record</h2>
            <p className="text-sm text-slate-500 mt-0.5">HACCP Calibration Records — Equipment Accuracy Log</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-medium text-slate-900">{org?.name ?? "Organisation"}</p>
            <p className="mt-1">Generated: {format(new Date(), "d MMM yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Records table */}
      {!records || records.length === 0 ? (
        <Card className="border-slate-100">
          <CardContent className="text-center py-12">
            <Wrench className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No calibration records yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Calibration records will appear here once probes have been calibrated.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Date checked</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Probe name</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Serial number</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Method</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Result</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Checked by</th>
                <th className="text-left py-2.5 px-3 font-medium text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {format(new Date(r.checked_at), "d MMM yyyy, HH:mm")}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {r.probe_thermometers?.name ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-xs">
                    {r.probe_thermometers?.serial_number ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-xs">
                    {methodLabel[r.method] ?? r.method}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {r.result === "pass" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-green-700 font-medium">Pass</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <span className="text-red-700 font-medium">Fail</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-xs">
                    {r.profiles?.full_name ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs">
                    {r.notes ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Signature */}
      <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-slate-500 mb-6">Manager / Supervisor signature:</p>
          <div className="border-b border-slate-300 mb-1" />
          <p className="text-xs text-slate-400">Name &amp; date</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Business: {org?.name}</p>
          <p className="text-xs text-slate-400">Generated: {format(new Date(), "d MMM yyyy")}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          franchisetech helps maintain food-safety records and operational controls. It does not replace the responsibility
          of the food business operator to comply with applicable food law and official guidance.
        </p>
      </div>
    </div>
  );
}
