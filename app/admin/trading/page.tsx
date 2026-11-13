import { requirePlatformAdmin } from "@/lib/admin/access";
import { createServiceClient } from "@/lib/supabase/server";
import {
  loadFiscalAttempts,
  loadLastSaleAt,
  loadOpenSessions,
  loadOrganisations,
  loadRecentFiscalFailures,
  loadSales,
  loadSubscriptions,
  payingOrgIds,
} from "@/lib/admin/queries";
import { summarizeTrading } from "@/lib/admin/metrics";
import { PageHeader, Pill, Section, TableWrap, lei } from "@/components/admin/AdminUi";
import { formatRoDateTime } from "@/lib/format/ro-datetime";

export const dynamic = "force-dynamic";

export default async function AdminTradingPage() {
  await requirePlatformAdmin();
  const service = await createServiceClient();
  const now = new Date();
  const [orgs, subs, sales, sessions, attempts, failures] = await Promise.all([
    loadOrganisations(service),
    loadSubscriptions(service),
    loadSales(service, 7),
    loadOpenSessions(service),
    loadFiscalAttempts(service, 7),
    loadRecentFiscalFailures(service, 20),
  ]);
  const paying = payingOrgIds(subs);
  const rows = summarizeTrading({ orgs, payingOrgIds: paying, tx: sales, openSessions: sessions, attempts, now });
  // Paying cafés with no sale this week: look up their real last sale (one row each).
  const missing = rows.filter((r) => !r.lastSaleAt).map((r) => r.organisationId);
  const lastSale = await loadLastSaleAt(service, missing);
  const nameOf = new Map(orgs.map((o) => [o.id, o.name ?? o.id.slice(0, 8)]));

  return (
    <>
      <PageHeader
        title="Vânzări live"
        subtitle={`Cafenelele care plătesc sau au vândut în ultimele 7 zile. ${formatRoDateTime(now)}. Bonuri fiscale: doar încercări reale (fără mod test).`}
      />
      <TableWrap>
        <thead>
          <tr>
            <th>Cafenea</th>
            <th className="text-right">Azi</th>
            <th className="text-right">7 zile</th>
            <th>Ultima vânzare</th>
            <th className="text-right">Case deschise</th>
            <th className="text-right">Fiscal trimis / eșuat (7z)</th>
            <th className="text-right">Bonuri neconfirmate / eșuate</th>
            <th>Alerte</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={8} className="text-muted-foreground">Nicio activitate.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.organisationId} className={r.alerts.length ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                <td>
                  <span className="font-medium">{r.name}</span>{" "}
                  {r.paying ? <Pill tone="good">plătește</Pill> : <Pill>trial / gratuit</Pill>}
                </td>
                <td className="text-right tabular-nums">{lei(r.salesToday)}<div className="text-xs text-muted-foreground">{r.countToday} bonuri</div></td>
                <td className="text-right tabular-nums">{lei(r.sales7d)}<div className="text-xs text-muted-foreground">{r.count7d} bonuri</div></td>
                <td className="whitespace-nowrap">{formatRoDateTime(r.lastSaleAt ?? lastSale.get(r.organisationId) ?? null)}</td>
                <td className="text-right tabular-nums">
                  {r.openSessions}
                  {r.oldestOpenSessionAt ? <div className="text-xs text-muted-foreground">din {formatRoDateTime(r.oldestOpenSessionAt)}</div> : null}
                </td>
                <td className="text-right tabular-nums">{r.fiscalSent7d} / <span className={r.fiscalFailed7d ? "font-semibold text-red-700" : ""}>{r.fiscalFailed7d}</span></td>
                <td className="text-right tabular-nums">{r.receiptsPending7d} / <span className={r.receiptsFailed7d ? "font-semibold text-red-700" : ""}>{r.receiptsFailed7d}</span></td>
                <td className="space-y-1">{r.alerts.length ? r.alerts.map((a) => <div key={a}><Pill tone="bad">{a}</Pill></div>) : <Pill tone="good">OK</Pill>}</td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrap>

      <Section title="Ultimele erori fiscale reale" note="fiscal_receipt_attempts și fiscal_command_log, status failed, fără mod test. Cele mai recente 20.">
        <TableWrap>
          <thead>
            <tr><th>Când</th><th>Cafenea</th><th>Tip</th><th>Cod</th><th>Detalii</th></tr>
          </thead>
          <tbody>
            {failures.length === 0 ? (
              <tr><td colSpan={5} className="text-muted-foreground">Nicio eroare.</td></tr>
            ) : (
              failures.map((f) => (
                <tr key={`${f.source}-${f.id}`}>
                  <td className="whitespace-nowrap">{formatRoDateTime(f.attempted_at)}</td>
                  <td>{nameOf.get(f.organisation_id) ?? f.organisation_id.slice(0, 8)}</td>
                  <td>{f.source}{f.command_type ? ` · ${f.command_type}` : ""}</td>
                  <td>{f.error_code ?? "—"}</td>
                  <td className="max-w-md truncate" title={f.error_info ?? ""}>{f.error_info ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Section>
    </>
  );
}
