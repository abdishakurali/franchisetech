import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isLeadAdmin } from "@/lib/leads/admin";
import { DEFAULT_NEXT_ACTION, LEAD_STATUS_LABELS, PIPELINE_STATUSES, type LeadStatus } from "@/lib/leads/demo-lead";
import { LeadRowForm } from "@/components/app/LeadRowForm";

export const metadata = { title: "Cereri demo", robots: { index: false, follow: false } };

type LeadRow = {
  id: string;
  created_at: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  business_type: string;
  locations: string;
  message: string | null;
  source_article: string | null;
  cta_id: string | null;
  utm_source: string | null;
  email_status: string;
  status: LeadStatus;
  is_test?: boolean;
  next_action?: string | null;
  next_action_due?: string | null;
  notes?: string | null;
  organisation_id?: string | null;
};

const BASE_COLUMNS =
  "id, created_at, business_name, contact_name, email, phone, business_type, locations, message, source_article, cta_id, utm_source, email_status, status";
const LIFECYCLE_COLUMNS = `${BASE_COLUMNS}, is_test, next_action, next_action_due, notes, organisation_id`;

/**
 * Demo leads for the founder. Hidden (404) for everyone who isn't a lead admin
 * (lib/leads/admin.ts); data is read with the service role only after that check,
 * because demo_leads has no RLS policies by design.
 */
export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isLeadAdmin(user)) notFound();

  const { view } = await searchParams;
  const showAll = view === "all";
  const service = await createServiceClient();

  // Before the lifecycle migration the extra columns don't exist; fall back to the base set.
  let lifecycle = true;
  const full = await service.from("demo_leads").select(LIFECYCLE_COLUMNS).order("created_at", { ascending: false }).limit(200);
  let rows = (full.data ?? []) as unknown as LeadRow[];
  let error = full.error;
  if (error?.code === "42703") {
    lifecycle = false;
    const base = await service.from("demo_leads").select(BASE_COLUMNS).order("created_at", { ascending: false }).limit(200);
    rows = (base.data ?? []) as unknown as LeadRow[];
    error = base.error;
  }
  const all = rows;
  const leads = showAll ? all : all.filter((l) => PIPELINE_STATUSES.includes(l.status) && !l.is_test);

  const enquiriesByEmail = new Map<string, number>();
  for (const l of all) enquiriesByEmail.set(l.email.toLowerCase(), (enquiriesByEmail.get(l.email.toLowerCase()) ?? 0) + 1);

  const counts = new Map<LeadStatus, number>();
  for (const l of all) if (PIPELINE_STATUSES.includes(l.status) && !l.is_test) counts.set(l.status, (counts.get(l.status) ?? 0) + 1);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cereri demo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Din formularul de pe /demo. {showAll ? "Toate, inclusiv spam și test." : "Fără spam și test."}
          </p>
        </div>
        <Link href={showAll ? "/app/leads" : "/app/leads?view=all"} className="text-sm underline">
          {showAll ? "Doar pipeline" : "Arată și spam/test"}
        </Link>
      </div>

      {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">Nu s-au putut încărca cererile.</p> : null}
      {!lifecycle ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Migrarea pentru statusuri (20261027150000) nu este aplicată: poți vedea cererile, dar nu le poți actualiza încă.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {PIPELINE_STATUSES.map((s) => (
          <span key={s} className="rounded-full border border-border px-2.5 py-1">
            {LEAD_STATUS_LABELS[s]}: {counts.get(s) ?? 0}
          </span>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {leads.length === 0 ? <li className="text-sm text-muted-foreground">Nicio cerere încă.</li> : null}
        {leads.map((l) => {
          const earlier = (enquiriesByEmail.get(l.email.toLowerCase()) ?? 1) - 1;
          return (
            <li key={l.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {l.business_name} <span className="font-normal text-muted-foreground">· {l.contact_name}</span>
                  </p>
                  <p className="text-sm">
                    <a className="underline" href={`mailto:${l.email}`}>{l.email}</a>
                    {l.phone ? <> · <a className="underline" href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a></> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {l.business_type} · {l.locations} loc. · {new Date(l.created_at).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                    {earlier > 0 ? ` · încă ${earlier} cerere(i) de la același email` : ""}
                    {l.email_status !== "sent" ? ` · email: ${l.email_status}` : ""}
                    {l.organisation_id ? " · are cont franchisetech" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sursă:{" "}
                    {l.source_article ? <Link className="underline" href={`/blog/${l.source_article}`}>{l.source_article}</Link> : "direct"}
                    {l.cta_id ? ` (${l.cta_id})` : ""}
                    {l.utm_source ? ` · utm: ${l.utm_source}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{LEAD_STATUS_LABELS[l.status] ?? l.status}</span>
              </div>
              {l.message ? <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">{l.message}</p> : null}
              {lifecycle ? (
                <div className="mt-3">
                  <LeadRowForm
                    id={l.id}
                    status={l.status}
                    nextAction={l.next_action ?? null}
                    nextActionDue={l.next_action_due ?? null}
                    notes={l.notes ?? null}
                    defaultNextAction={DEFAULT_NEXT_ACTION[l.status] ?? null}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
