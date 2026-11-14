/**
 * Read-only loaders for /admin. Every function takes the service-role client,
 * which a page may only create after requirePlatformAdmin() (lib/admin/access.ts)
 * has passed. Nothing here writes.
 *
 * Every multi-row read goes through fetchAll (keyset paging), so the
 * PostgREST 1000-row cap can never silently truncate a total. Windows are
 * bounded (at most 180 days of sales) so the reads stay small.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetch-all";
import type { AttemptRow, OrgRow, SessionRow, SubscriptionRow, TxRow } from "@/lib/admin/metrics";
import { BILLING_STATUSES } from "@/lib/admin/metrics";

type Client = SupabaseClient;

function sinceIso(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * 86_400_000).toISOString();
}

function must<T>(label: string, result: { data: T[] | null; error: { message: string } | null }): T[] {
  // Fail loudly: a panel that shows a plausible-but-partial number is worse
  // than one that shows an error.
  if (result.error) throw new Error(`admin ${label}: ${result.error.message}`);
  return result.data ?? [];
}

export async function loadOrganisations(service: Client): Promise<OrgRow[]> {
  return must(
    "organisations",
    await fetchAll<OrgRow>(() =>
      service
        .from("organisations")
        .select("id,name,created_at,onboarding_step,onboarding_completed,trial_ends_at,card_verified_at,growth_first_sale_at,acquisition_source"),
    ),
  );
}

export async function loadSubscriptions(service: Client): Promise<SubscriptionRow[]> {
  return must(
    "billing_subscriptions",
    await fetchAll<SubscriptionRow>(() =>
      service
        .from("billing_subscriptions")
        .select("id,organisation_id,plan,status,current_period_end,cancel_at_period_end,stripe_price_id"),
    ),
  );
}

export function payingOrgIds(subs: readonly SubscriptionRow[]): Set<string> {
  return new Set(subs.filter((s) => s.status && BILLING_STATUSES.has(s.status) && s.organisation_id).map((s) => s.organisation_id as string));
}

/** Completed sales in the last `days` days, every org. */
export async function loadSales(service: Client, days: number): Promise<TxRow[]> {
  return must(
    "pos_transactions",
    await fetchAll<TxRow>(() =>
      service
        .from("pos_transactions")
        .select("id,organisation_id,sold_at,total,fiscal_receipt_status")
        .eq("status", "completed")
        .gte("sold_at", sinceIso(days)),
    ),
  );
}

/** Last sale per org, for orgs whose last sale is older than the sales window. One row per org (limit 1). */
export async function loadLastSaleAt(service: Client, orgIds: readonly string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  await Promise.all(
    orgIds.map(async (id) => {
      const { data, error } = await service
        .from("pos_transactions")
        .select("sold_at")
        .eq("organisation_id", id)
        .eq("status", "completed")
        .order("sold_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`admin last sale: ${error.message}`);
      if (data?.sold_at) out.set(id, data.sold_at as string);
    }),
  );
  return out;
}

export async function loadOpenSessions(service: Client): Promise<SessionRow[]> {
  return must(
    "pos_sessions",
    await fetchAll<SessionRow>(() =>
      service.from("pos_sessions").select("id,organisation_id,opened_at").eq("status", "open"),
    ),
  );
}

export async function loadFiscalAttempts(service: Client, days: number): Promise<AttemptRow[]> {
  return must(
    "fiscal_receipt_attempts",
    await fetchAll<AttemptRow>(() =>
      service
        .from("fiscal_receipt_attempts")
        .select("id,organisation_id,status,mock_mode,attempted_at")
        .gte("attempted_at", sinceIso(days)),
    ),
  );
}

export type FiscalFailure = {
  id: string;
  organisation_id: string;
  attempted_at: string | null;
  error_code: string | null;
  error_info: string | null;
  source: "bon" | "comandă";
  command_type?: string | null;
};

/** The most recent real (non-mock) fiscal failures: receipts and session commands. */
export async function loadRecentFiscalFailures(service: Client, limit = 20): Promise<FiscalFailure[]> {
  const [receipts, commands] = await Promise.all([
    service
      .from("fiscal_receipt_attempts")
      .select("id,organisation_id,attempted_at,error_code,error_info")
      .eq("status", "failed")
      .eq("mock_mode", false)
      .order("attempted_at", { ascending: false })
      .limit(limit),
    service
      .from("fiscal_command_log")
      .select("id,organisation_id,attempted_at,error_code,error_info,command_type")
      .eq("status", "failed")
      .eq("mock_mode", false)
      .order("attempted_at", { ascending: false })
      .limit(limit),
  ]);
  if (receipts.error) throw new Error(`admin fiscal failures: ${receipts.error.message}`);
  if (commands.error) throw new Error(`admin fiscal commands: ${commands.error.message}`);
  return [
    ...(receipts.data ?? []).map((r) => ({ ...r, source: "bon" as const })),
    ...(commands.data ?? []).map((r) => ({ ...r, source: "comandă" as const })),
  ]
    .sort((a, b) => String(b.attempted_at ?? "").localeCompare(String(a.attempted_at ?? "")))
    .slice(0, limit) as FiscalFailure[];
}

export type BillingEventRow = {
  id: string;
  event_type: string;
  organisation_id: string | null;
  processed: boolean | null;
  error: string | null;
  created_at: string;
};

export async function loadBillingEvents(service: Client, days: number): Promise<BillingEventRow[]> {
  return must(
    "billing_events",
    await fetchAll<BillingEventRow>(
      () =>
        service
          .from("billing_events")
          .select("id,event_type,organisation_id,processed,error,created_at")
          .gte("created_at", sinceIso(days)),
      { keys: ["created_at", "id"], descending: true },
    ),
  );
}

export type HealthCheckRow = { source: string; last_attempt_at: string | null; last_success_at: string | null; last_error: string | null };
export type SendLogSummary = { lastSentAt: string | null; failed7d: number; sent7d: number };

export async function loadHealth(service: Client) {
  const week = sinceIso(7);
  const [checks, digestLast, digestFailed, digestSent, reminderFailed, demoLeads] = await Promise.all([
    service.from("analytics_health_checks").select("source,last_attempt_at,last_success_at,last_error").order("source"),
    service.from("owner_digest_send_log").select("sent_at").order("sent_at", { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
    service.from("owner_digest_send_log").select("id", { count: "exact", head: true }).neq("status", "sent").gte("created_at", week),
    service.from("owner_digest_send_log").select("id", { count: "exact", head: true }).eq("status", "sent").gte("created_at", week),
    service.from("reminder_send_log").select("id", { count: "exact", head: true }).neq("status", "sent").gte("sent_at", week),
    service
      .from("demo_leads")
      .select("id,created_at,business_name,status,email_status,is_test")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  for (const [label, r] of Object.entries({ checks, digestLast, digestFailed, digestSent, reminderFailed, demoLeads })) {
    if (r.error) throw new Error(`admin health ${label}: ${r.error.message}`);
  }
  return {
    checks: (checks.data ?? []) as HealthCheckRow[],
    digest: {
      lastSentAt: (digestLast.data?.sent_at as string | null) ?? null,
      failed7d: digestFailed.count ?? 0,
      sent7d: digestSent.count ?? 0,
    } satisfies SendLogSummary,
    remindersFailed7d: reminderFailed.count ?? 0,
    demoLeads: (demoLeads.data ?? []) as { id: string; created_at: string; business_name: string; status: string; email_status: string; is_test: boolean | null }[],
  };
}
