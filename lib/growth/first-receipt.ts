import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveAccountType } from "@/lib/analytics/account-type";
import { formatBucharestTime } from "@/lib/email/signup-alert";

// Promise to new cafes: first fiscal receipt within 2 days of signup.
// Signup time = organisations.created_at. First LIVE receipt = earliest
// fiscal_receipt_attempts row with status "success" and mock_mode false.
// Every FiscalNet path writes that table (browser log-attempt RPC, server
// service.ts), and mock receipts are always mock_mode true / "mock_success".
// pos_transactions.fiscal_receipt_status is NOT used: it collapses
// mock_success into "success".

export const NO_LIVE_RECEIPT_ALERT_ACTION = "founder_alert.no_live_receipt_24h";
export const ALERT_AFTER_HOURS = 24;
/** Orgs older than this are past the promise already; do not alert them on first deploy. */
export const ALERT_LOOKBACK_HOURS = 72;

const HOUR_MS = 3_600_000;

export type ReceiptAttemptRow = {
  organisation_id: string;
  status: string;
  mock_mode: boolean | null;
  attempted_at: string;
};

export type OrgRow = {
  id: string;
  name: string | null;
  business_type: string | null;
  created_at: string;
};

export type OrgReceiptTimeline = {
  orgId: string;
  name: string;
  businessType: string | null;
  ownerEmail: string | null;
  signupAt: string;
  firstLiveReceiptAt: string | null;
  hoursToFirstLiveReceipt: number | null;
};

export function isLiveReceiptAttempt(row: Pick<ReceiptAttemptRow, "status" | "mock_mode">): boolean {
  return row.status === "success" && row.mock_mode === false;
}

export function buildTimelines(
  orgs: OrgRow[],
  attempts: ReceiptAttemptRow[],
  ownerEmails: Map<string, string>,
): OrgReceiptTimeline[] {
  const firstLive = new Map<string, string>();
  for (const a of attempts) {
    if (!isLiveReceiptAttempt(a)) continue;
    const prev = firstLive.get(a.organisation_id);
    if (!prev || Date.parse(a.attempted_at) < Date.parse(prev)) firstLive.set(a.organisation_id, a.attempted_at);
  }
  return orgs.map((o) => {
    const first = firstLive.get(o.id) ?? null;
    return {
      orgId: o.id,
      name: o.name ?? "—",
      businessType: o.business_type,
      ownerEmail: ownerEmails.get(o.id) ?? null,
      signupAt: o.created_at,
      firstLiveReceiptAt: first,
      hoursToFirstLiveReceipt: first
        ? Math.round(((Date.parse(first) - Date.parse(o.created_at)) / HOUR_MS) * 10) / 10
        : null,
    };
  });
}

/** Real-customer orgs that are 24h–72h past signup, have no live receipt and were not alerted yet. */
export function selectOrgsToAlert(
  timelines: OrgReceiptTimeline[],
  alreadyAlerted: Set<string>,
  now: Date,
): OrgReceiptTimeline[] {
  const latestSignup = now.getTime() - ALERT_AFTER_HOURS * HOUR_MS;
  const earliestSignup = now.getTime() - ALERT_LOOKBACK_HOURS * HOUR_MS;
  return timelines.filter((t) => {
    const signup = Date.parse(t.signupAt);
    if (Number.isNaN(signup) || signup > latestSignup || signup < earliestSignup) return false;
    if (t.firstLiveReceiptAt) return false;
    if (alreadyAlerted.has(t.orgId)) return false;
    return deriveAccountType(t.ownerEmail, t.name) === "real_customer";
  });
}

export function buildNoLiveReceiptAlert(t: OrgReceiptTimeline, now: Date): { subject: string; body: string } {
  const hours = Math.floor((now.getTime() - Date.parse(t.signupAt)) / HOUR_MS);
  const subject = `Fără bon fiscal după ${hours}h — ${t.name}`;
  const body = [
    `${t.name} nu are încă niciun bon fiscal real (FiscalNet live) după ${hours} de ore.`,
    `Promisiunea: primul bon fiscal în 2 zile, altfel nu plătește nimic.`,
    "",
    `Afacere: ${t.name}`,
    `Tip afacere: ${t.businessType ?? "—"}`,
    `Email: ${t.ownerEmail ?? "—"}`,
    `Ora înscrierii: ${formatBucharestTime(t.signupAt)}`,
    `Termen 48h: ${formatBucharestTime(new Date(Date.parse(t.signupAt) + 48 * HOUR_MS).toISOString())}`,
    "",
    "Următorul pas: sunați azi și conectați casa de marcat (FiscalNet, mod live).",
    "Bonurile din modul test nu se numără.",
  ].join("\n");
  return { subject, body };
}

/** Signup and first live receipt per org created since `sinceIso`. Service-role client. */
export async function fetchReceiptTimelines(supabase: SupabaseClient, sinceIso: string): Promise<OrgReceiptTimeline[]> {
  const { data: orgs, error } = await supabase
    .from("organisations")
    .select("id, name, business_type, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (orgs ?? []) as OrgRow[];
  if (rows.length === 0) return [];
  const ids = rows.map((o) => o.id);

  const [{ data: attempts, error: attemptsErr }, { data: owners, error: ownersErr }] = await Promise.all([
    supabase
      .from("fiscal_receipt_attempts")
      .select("organisation_id, status, mock_mode, attempted_at")
      .in("organisation_id", ids)
      .eq("status", "success")
      .eq("mock_mode", false),
    supabase
      .from("organisation_members")
      .select("organisation_id, profiles(email)")
      .in("organisation_id", ids)
      .eq("role", "owner"),
  ]);
  if (attemptsErr) throw attemptsErr;
  if (ownersErr) throw ownersErr;

  const ownerEmails = new Map<string, string>();
  for (const m of (owners ?? []) as unknown as Array<{ organisation_id: string; profiles?: { email?: string | null } | null }>) {
    const email = m.profiles?.email;
    if (email && !ownerEmails.has(m.organisation_id)) ownerEmails.set(m.organisation_id, email);
  }
  return buildTimelines(rows, (attempts ?? []) as ReceiptAttemptRow[], ownerEmails);
}
