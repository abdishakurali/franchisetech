import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTemperatureChecks, getActionsTaken } from "@/lib/tracking";
import { format } from "date-fns";

// Hidden debug page — only shown when NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true
export default async function DataChainDebugPage() {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_TOOLS !== "true") {
    redirect("/app");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/onboarding");

  const orgId = membership.organisation_id;

  const [checks, actions] = await Promise.all([
    getTemperatureChecks(supabase, orgId, {
      from: new Date(now - 7 * 86_400_000),
      to: new Date(now),
    }),
    getActionsTaken(supabase, orgId, {
      from: new Date(now - 7 * 86_400_000),
      to: new Date(now),
    }),
  ]);

  const actionByReadingId = new Map(
    actions.filter((a) => a.reading_id).map((a) => [a.reading_id!, a])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto font-mono text-sm">
      <h1 className="text-xl font-bold mb-2">Data Chain Debug</h1>
      <p className="text-slate-500 text-xs mb-6">
        Hidden page — NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true required.
      </p>

      <section className="mb-8">
        <h2 className="font-semibold text-slate-700 mb-2">
          Organisation ID: <code className="bg-slate-100 px-1 rounded">{orgId}</code>
        </h2>
        <p className="text-slate-500 text-xs">User: {user.id}</p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-slate-700 mb-3">
          Temperature Readings (last 7 days) — {checks.length} record(s)
        </h2>
        {checks.length === 0 ? (
          <p className="text-red-600">⚠ No readings found — check org ID and RLS policies</p>
        ) : (
          <table className="w-full text-xs border border-slate-200 rounded">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Taken at</th>
                <th className="text-left p-2">Temp</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Unit</th>
                <th className="text-left p-2">Staff</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Linked?</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="p-2 text-slate-400">{r.id.slice(0, 8)}…</td>
                  <td className="p-2">{format(new Date(r.taken_at), "d MMM HH:mm")}</td>
                  <td className="p-2">{r.value_c}°C</td>
                  <td className="p-2">
                    <span
                      className={
                        r.status === "pass"
                          ? "text-green-600"
                          : r.status === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2">{r.unitLabel}</td>
                  <td className="p-2">{r.staffLabel}</td>
                  <td className="p-2">
                    {r.actionNeeded ? (
                      <span className="text-red-500">⚠ needed</span>
                    ) : r.corrective_actions?.length ? (
                      <span className="text-green-600">✓ done</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-2">
                    {actionByReadingId.has(r.id) ? (
                      <span className="text-green-600">✓</span>
                    ) : r.status === "fail" ? (
                      <span className="text-red-500">✗ missing</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-slate-700 mb-3">
          Corrective Actions (last 7 days) — {actions.length} record(s)
        </h2>
        {actions.length === 0 ? (
          <p className="text-slate-500">No actions yet.</p>
        ) : (
          <table className="w-full text-xs border border-slate-200 rounded">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Reading ID</th>
                <th className="text-left p-2">Unit</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">By</th>
                <th className="text-left p-2">At</th>
                <th className="text-left p-2">Reading linked?</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="p-2 text-slate-400">{a.id.slice(0, 8)}…</td>
                  <td className="p-2 text-slate-400">
                    {a.reading_id ? `${a.reading_id.slice(0, 8)}…` : "⚠ NULL"}
                  </td>
                  <td className="p-2">{a.unitLabel}</td>
                  <td className="p-2">{a.actionLabel}</td>
                  <td className="p-2">{a.staffLabel}</td>
                  <td className="p-2">{format(new Date(a.completed_at), "d MMM HH:mm")}</td>
                  <td className="p-2">
                    {a.temperature_readings ? (
                      <span className="text-green-600">✓ {a.failedTemp}</span>
                    ) : (
                      <span className="text-red-500">✗ not linked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-xs text-slate-400 mt-8">
        This page is only accessible when NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true. Do not enable in
        production.
      </p>
    </div>
  );
}
