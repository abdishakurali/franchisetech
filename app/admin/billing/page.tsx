import { requirePlatformAdmin } from "@/lib/admin/access";
import { createServiceClient } from "@/lib/supabase/server";
import { loadBillingEvents, loadOrganisations, loadSubscriptions } from "@/lib/admin/queries";
import { BILLING_STATUSES, dailySeries, subscriptionMrrCents, totalMrrCents } from "@/lib/admin/metrics";
import { DailyBars, KpiCard, PageHeader, Pill, Section, TableWrap, eur } from "@/components/admin/AdminUi";
import { formatRoDate, formatRoDateTime } from "@/lib/format/ro-datetime";

export const dynamic = "force-dynamic";

const FAILURE_TYPES = new Set(["invoice.payment_failed", "payment_intent.payment_failed", "charge.failed"]);

export default async function AdminBillingPage() {
  await requirePlatformAdmin();
  const service = await createServiceClient();
  const now = new Date();
  const [orgs, subs, events] = await Promise.all([loadOrganisations(service), loadSubscriptions(service), loadBillingEvents(service, 90)]);
  const nameOf = new Map(orgs.map((o) => [o.id, o.name ?? o.id.slice(0, 8)]));
  const active = subs.filter((s) => s.status && BILLING_STATUSES.has(s.status));
  const failed = events.filter((e) => FAILURE_TYPES.has(e.event_type));
  const errored = events.filter((e) => e.error || e.processed === false);
  const failed30 = failed.filter((e) => now.getTime() - new Date(e.created_at).getTime() < 30 * 86_400_000).length;

  return (
    <>
      <PageHeader
        title="Facturare"
        subtitle="Din billing_subscriptions și billing_events (webhook Stripe). MRR la preț de listă din lib/billing/plans.ts — Stripe rămâne sursa pentru ce s-a încasat."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="MRR (preț de listă)" value={eur(totalMrrCents(subs))} />
        <KpiCard label="Abonamente active" value={String(active.length)} hint={`${subs.length} în total`} />
        <KpiCard label="Plăți eșuate 30 zile" value={String(failed30)} tone={failed30 ? "bad" : "good"} hint={`${failed.length} în 90 zile`} />
        <KpiCard label="Webhook-uri cu eroare 90z" value={String(errored.length)} tone={errored.length ? "bad" : "good"} />
      </div>

      <div className="mt-6">
        <DailyBars title="Plăți eșuate pe zi (90 zile)" points={dailySeries(failed, (e) => e.created_at, () => 1, 90, now)} />
      </div>

      <Section title="Abonamente">
        <TableWrap>
          <thead>
            <tr><th>Cafenea</th><th>Plan</th><th>Stare</th><th>Perioada curentă până</th><th>Anulare la final</th><th className="text-right">MRR</th></tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr><td colSpan={6} className="text-muted-foreground">Niciun abonament.</td></tr>
            ) : (
              subs.map((s, i) => (
                <tr key={`${s.organisation_id}-${i}`}>
                  <td className="font-medium">{s.organisation_id ? nameOf.get(s.organisation_id) ?? s.organisation_id.slice(0, 8) : "—"}</td>
                  <td>{s.plan ?? "—"}</td>
                  <td>{s.status === "active" ? <Pill tone="good">active</Pill> : s.status === "past_due" ? <Pill tone="bad">past_due</Pill> : <Pill>{s.status ?? "—"}</Pill>}</td>
                  <td className="whitespace-nowrap">{formatRoDate(s.current_period_end)}</td>
                  <td>{s.cancel_at_period_end ? <Pill tone="warn">da</Pill> : "nu"}</td>
                  <td className="text-right tabular-nums">{eur(subscriptionMrrCents(s))}</td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Evenimente Stripe recente (90 zile)" note="Ultimele 50. Plățile eșuate și erorile de procesare sunt marcate.">
        <TableWrap>
          <thead>
            <tr><th>Când</th><th>Tip</th><th>Cafenea</th><th>Procesat</th><th>Eroare</th></tr>
          </thead>
          <tbody>
            {events.slice(0, 50).map((e) => (
              <tr key={e.id} className={FAILURE_TYPES.has(e.event_type) || e.error ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                <td className="whitespace-nowrap">{formatRoDateTime(e.created_at)}</td>
                <td>{e.event_type}</td>
                <td>{e.organisation_id ? nameOf.get(e.organisation_id) ?? e.organisation_id.slice(0, 8) : "—"}</td>
                <td>{e.processed ? "da" : <Pill tone="bad">nu</Pill>}</td>
                <td className="max-w-xs truncate" title={e.error ?? ""}>{e.error ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Section>
    </>
  );
}
