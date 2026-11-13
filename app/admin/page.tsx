import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/admin/access";
import { createServiceClient } from "@/lib/supabase/server";
import { loadFiscalAttempts, loadOpenSessions, loadOrganisations, loadSales, loadSubscriptions, payingOrgIds } from "@/lib/admin/queries";
import { dailySeries, signupStage, summarizeTrading, totalMrrCents, windowDelta } from "@/lib/admin/metrics";
import { DailyBars, KpiCard, PageHeader, eur, lei } from "@/components/admin/AdminUi";
import { formatRoDateTime } from "@/lib/format/ro-datetime";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requirePlatformAdmin();
  const service = await createServiceClient();
  const now = new Date();
  const [orgs, subs, sales, sessions, attempts] = await Promise.all([
    loadOrganisations(service),
    loadSubscriptions(service),
    loadSales(service, 180),
    loadOpenSessions(service),
    loadFiscalAttempts(service, 7),
  ]);

  const paying = payingOrgIds(subs);
  const signups = windowDelta(orgs, (o) => o.created_at, () => 1, 90, now);
  const revenue = windowDelta(sales, (t) => t.sold_at, (t) => Number(t.total ?? 0), 90, now);
  const trading = summarizeTrading({ orgs, payingOrgIds: paying, tx: sales, openSessions: sessions, attempts, now });
  const stalled = orgs.filter((o) => signupStage(o, now) === "stalled" && now.getTime() - new Date(o.created_at).getTime() < 14 * 86_400_000);
  const fiscalFailed = trading.reduce((s, r) => s + r.fiscalFailed7d + r.receiptsFailed7d, 0);
  const alerts = trading.filter((r) => r.alerts.length > 0);
  const salesToday = trading.reduce((s, r) => s + r.salesToday, 0);

  return (
    <>
      <PageHeader title="Panou" subtitle={`Actualizat ${formatRoDateTime(now)} (ora României). Delta = ultimele 90 de zile față de cele 90 dinainte.`} />

      {alerts.length > 0 ? (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm dark:bg-red-950/30">
          <p className="font-semibold text-red-900 dark:text-red-200">Necesită atenție</p>
          <ul className="mt-2 space-y-1 text-red-900 dark:text-red-200">
            {alerts.map((r) => (
              <li key={r.organisationId}>
                <span className="font-medium">{r.name}</span>: {r.alerts.join(" · ")}
              </li>
            ))}
          </ul>
          <Link href="/admin/trading" className="mt-2 inline-block text-xs underline">Vezi vânzări live →</Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Vânzări azi (toate)" value={lei(salesToday)} hint={`${trading.reduce((s, r) => s + r.countToday, 0)} bonuri`} />
        <KpiCard label="Vânzări 90 zile" value={lei(revenue.current)} pct={revenue.pct} />
        <KpiCard label="Înscrieri 90 zile" value={String(signups.current)} pct={signups.pct} hint={`${stalled.length} blocate (14 zile)`} tone={stalled.length > 0 ? "bad" : "neutral"} />
        <KpiCard label="MRR (preț de listă)" value={eur(totalMrrCents(subs))} hint={`${paying.size} abonamente active`} />
        <KpiCard label="Bonuri fiscale eșuate 7z" value={String(fiscalFailed)} tone={fiscalFailed > 0 ? "bad" : "good"} hint="fără mod test" />
        <KpiCard label="Case deschise acum" value={String(sessions.length)} />
        <KpiCard label="Organizații total" value={String(orgs.length)} />
        <KpiCard label="Abonamente (orice stare)" value={String(subs.length)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyBars title="Vânzări pe zi (30 zile, lei)" points={dailySeries(sales, (t) => t.sold_at, (t) => Number(t.total ?? 0), 30, now)} format={lei} />
        <DailyBars title="Înscrieri pe zi (90 zile)" points={dailySeries(orgs, (o) => o.created_at, () => 1, 90, now)} />
      </div>
    </>
  );
}
