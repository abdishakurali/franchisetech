import vercelConfig from "@/vercel.json";
import { requirePlatformAdmin } from "@/lib/admin/access";
import { createServiceClient } from "@/lib/supabase/server";
import { loadHealth } from "@/lib/admin/queries";
import { PageHeader, Pill, Section, TableWrap } from "@/components/admin/AdminUi";
import { formatRoDateTime } from "@/lib/format/ro-datetime";

export const dynamic = "force-dynamic";

const STALE_HOURS = 26;

function isStale(iso: string | null, now: Date): boolean {
  return !iso || now.getTime() - new Date(iso).getTime() > STALE_HOURS * 3_600_000;
}

export default async function AdminHealthPage() {
  await requirePlatformAdmin();
  const service = await createServiceClient();
  const now = new Date();
  const health = await loadHealth(service);
  const crons = (vercelConfig as { crons?: { path: string; schedule: string }[] }).crons ?? [];

  // Only some jobs leave a trace in the database; say so instead of guessing.
  const evidence: Record<string, { at: string | null; note: string } | undefined> = {
    "/api/cron/analytics-health": (() => {
      const latest = health.checks.map((c) => c.last_success_at).filter(Boolean).sort().pop() ?? null;
      return { at: latest, note: "analytics_health_checks.last_success_at" };
    })(),
  };

  return (
    <>
      <PageHeader title="Sănătate" subtitle={`Joburi programate, trimiteri de email și cereri demo. ${formatRoDateTime(now)}.`} />

      <Section
        title="Joburi programate (vercel.json)"
        note="Doar unele joburi scriu în baza de date când rulează. Pentru celelalte nu există încă jurnal — vezi docs/admin-panel-proposal.md (tabelul cron_runs propus)."
      >
        <TableWrap>
          <thead>
            <tr><th>Job</th><th>Program (UTC)</th><th>Ultima rulare dovedită</th><th>Sursă</th></tr>
          </thead>
          <tbody>
            {crons.map((c) => {
              const ev = evidence[c.path];
              return (
                <tr key={c.path}>
                  <td className="font-mono text-xs">{c.path}</td>
                  <td className="font-mono text-xs">{c.schedule}</td>
                  <td>
                    {ev ? (
                      <span className="flex items-center gap-2">
                        {formatRoDateTime(ev.at)} {isStale(ev.at, now) ? <Pill tone="bad">vechi</Pill> : <Pill tone="good">OK</Pill>}
                      </span>
                    ) : (
                      <Pill>fără jurnal</Pill>
                    )}
                  </td>
                  <td className="text-xs text-muted-foreground">{ev?.note ?? "—"}</td>
                </tr>
              );
            })}
            <tr>
              <td className="font-mono text-xs">owner-digest (email zilnic proprietar)</td>
              <td className="font-mono text-xs">—</td>
              <td>
                <span className="flex items-center gap-2">
                  {formatRoDateTime(health.digest.lastSentAt)} {isStale(health.digest.lastSentAt, now) ? <Pill tone="bad">vechi</Pill> : <Pill tone="good">OK</Pill>}
                </span>
              </td>
              <td className="text-xs text-muted-foreground">owner_digest_send_log · 7z: {health.digest.sent7d} trimise, {health.digest.failed7d} eșuate</td>
            </tr>
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Verificări analytics">
        <TableWrap>
          <thead>
            <tr><th>Sursă</th><th>Ultima încercare</th><th>Ultimul succes</th><th>Ultima eroare</th></tr>
          </thead>
          <tbody>
            {health.checks.length === 0 ? (
              <tr><td colSpan={4} className="text-muted-foreground">Niciun rând.</td></tr>
            ) : (
              health.checks.map((c) => (
                <tr key={c.source}>
                  <td>{c.source}</td>
                  <td className="whitespace-nowrap">{formatRoDateTime(c.last_attempt_at)}</td>
                  <td className="whitespace-nowrap">{formatRoDateTime(c.last_success_at)}</td>
                  <td className="max-w-md truncate" title={c.last_error ?? ""}>{c.last_error ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Section>

      <Section title="Emailuri" note="Mementouri (reminder_send_log) cu altă stare decât sent, ultimele 7 zile.">
        <p className="text-sm">
          Mementouri eșuate 7z: {health.remindersFailed7d ? <Pill tone="bad">{health.remindersFailed7d}</Pill> : <Pill tone="good">0</Pill>}
        </p>
      </Section>

      <Section title="Cereri demo recente" note="Ultimele 10 din demo_leads. Detalii și urmărire în /app/leads.">
        <TableWrap>
          <thead>
            <tr><th>Când</th><th>Firmă</th><th>Stare</th><th>Email notificare</th></tr>
          </thead>
          <tbody>
            {health.demoLeads.length === 0 ? (
              <tr><td colSpan={4} className="text-muted-foreground">Nicio cerere.</td></tr>
            ) : (
              health.demoLeads.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap">{formatRoDateTime(l.created_at)}</td>
                  <td>{l.business_name} {l.is_test ? <Pill>test</Pill> : null}</td>
                  <td>{l.status}</td>
                  <td>{l.email_status === "sent" ? <Pill tone="good">sent</Pill> : <Pill tone="warn">{l.email_status}</Pill>}</td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Section>
    </>
  );
}
