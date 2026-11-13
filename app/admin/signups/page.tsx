import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/admin/access";
import { createServiceClient } from "@/lib/supabase/server";
import { loadOrganisations, loadSubscriptions } from "@/lib/admin/queries";
import { onboardingStepLabel, signupStage } from "@/lib/admin/metrics";
import { PageHeader, Pill, TableWrap } from "@/components/admin/AdminUi";
import { formatRoDate, formatRoDateTime } from "@/lib/format/ro-datetime";

export const dynamic = "force-dynamic";

const PAGE = 50;

export default async function AdminSignupsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const service = await createServiceClient();
  const now = new Date();
  const [orgs, subs] = await Promise.all([loadOrganisations(service), loadSubscriptions(service)]);
  const subByOrg = new Map(subs.filter((s) => s.organisation_id).map((s) => [s.organisation_id as string, s]));
  const sorted = [...orgs].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const pageRows = sorted.slice((page - 1) * PAGE, page * PAGE);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const stalledCount = sorted.filter((o) => signupStage(o, now) === "stalled").length;

  return (
    <>
      <PageHeader
        title="Înscrieri"
        subtitle={`${orgs.length} organizații · ${stalledCount} cu onboarding neterminat de peste 2h. Cele mai noi primele.`}
      />
      <TableWrap>
        <thead>
          <tr>
            <th>Creată</th>
            <th>Firmă</th>
            <th>Pas onboarding</th>
            <th>Stare</th>
            <th>Card verificat</th>
            <th>Prima vânzare</th>
            <th>Trial până</th>
            <th>Abonament</th>
            <th>Sursă</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((o) => {
            const stage = signupStage(o, now);
            const sub = subByOrg.get(o.id);
            return (
              <tr key={o.id}>
                <td className="whitespace-nowrap">{formatRoDateTime(o.created_at)}</td>
                <td className="font-medium">{o.name ?? "—"}</td>
                <td className="whitespace-nowrap">{onboardingStepLabel(o.onboarding_step, o.onboarding_completed)}</td>
                <td>
                  {stage === "complete" ? <Pill tone="good">finalizat</Pill> : stage === "stalled" ? <Pill tone="bad">blocat</Pill> : <Pill tone="warn">în curs</Pill>}
                </td>
                <td className="whitespace-nowrap">{o.card_verified_at ? formatRoDate(o.card_verified_at) : "—"}</td>
                <td className="whitespace-nowrap">{o.growth_first_sale_at ? formatRoDateTime(o.growth_first_sale_at) : "—"}</td>
                <td className="whitespace-nowrap">{formatRoDate(o.trial_ends_at)}</td>
                <td>{sub ? `${sub.plan ?? "?"} · ${sub.status ?? "?"}` : "—"}</td>
                <td>{o.acquisition_source ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>
      {pages > 1 ? (
        <div className="mt-3 flex gap-3 text-sm">
          {page > 1 ? <Link className="underline" href={`/admin/signups?page=${page - 1}`}>← Mai noi</Link> : null}
          <span className="text-muted-foreground">Pagina {page} din {pages}</span>
          {page < pages ? <Link className="underline" href={`/admin/signups?page=${page + 1}`}>Mai vechi →</Link> : null}
        </div>
      ) : null}
    </>
  );
}
