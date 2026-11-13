/**
 * Pure calculations for the /admin operations panel. No I/O here: the
 * loaders in lib/admin/queries.ts read the rows (fully paged), these
 * functions turn them into numbers, so every figure is unit-tested.
 *
 * Days are Romania calendar days (Europe/Bucharest), because "sales today"
 * means the café's day, not UTC's.
 */
import { getPlan, type BillingPlan } from "@/lib/billing/plans";

const DAY_KEY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Bucharest",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-11-13" for the Romania calendar day the instant falls on. */
export function bucharestDayKey(value: string | number | Date): string {
  return DAY_KEY_FORMAT.format(value instanceof Date ? value : new Date(value));
}

/** The last `days` Romania day keys, oldest first, ending with today. */
export function lastDayKeys(days: number, now: Date = new Date()): string[] {
  // Calendar arithmetic on today's Romania date (not on instants), so DST
  // changes can never skip or repeat a day.
  const [y, m, d] = bucharestDayKey(now).split("-").map(Number);
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    keys.push(new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10));
  }
  return keys;
}

export type DayPoint = { day: string; value: number };

/** Sum `valueOf(row)` per Romania day over the last `days` days (zero-filled). */
export function dailySeries<T>(
  rows: readonly T[],
  dateOf: (row: T) => string | null | undefined,
  valueOf: (row: T) => number,
  days: number,
  now: Date = new Date(),
): DayPoint[] {
  const keys = lastDayKeys(days, now);
  const totals = new Map(keys.map((k) => [k, 0]));
  for (const row of rows) {
    const at = dateOf(row);
    if (!at) continue;
    const key = bucharestDayKey(at);
    if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + valueOf(row));
  }
  return keys.map((day) => ({ day, value: round2(totals.get(day) ?? 0) }));
}

/**
 * Current window [now - days, now) vs the window before it. `pct` is null
 * when the previous window is zero (a percentage of nothing is meaningless).
 */
export function windowDelta<T>(
  rows: readonly T[],
  dateOf: (row: T) => string | null | undefined,
  valueOf: (row: T) => number,
  days: number,
  now: Date = new Date(),
): { current: number; previous: number; pct: number | null } {
  const end = now.getTime();
  const span = days * 86_400_000;
  let current = 0;
  let previous = 0;
  for (const row of rows) {
    const at = dateOf(row);
    if (!at) continue;
    const t = new Date(at).getTime();
    if (t >= end - span && t < end) current += valueOf(row);
    else if (t >= end - 2 * span && t < end - span) previous += valueOf(row);
  }
  const pct = previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;
  return { current: round2(current), previous: round2(previous), pct };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── Signups ───────────────────────────────────────────────────────────────

export type OrgRow = {
  id: string;
  name: string | null;
  created_at: string;
  onboarding_step: string | null;
  onboarding_completed: boolean | null;
  trial_ends_at: string | null;
  card_verified_at: string | null;
  growth_first_sale_at: string | null;
  acquisition_source: string | null;
};

/** Hours after signup before an unfinished onboarding counts as stalled. */
export const STALL_AFTER_HOURS = 2;

export type SignupStage = "complete" | "in_progress" | "stalled";

export function signupStage(org: Pick<OrgRow, "created_at" | "onboarding_completed" | "onboarding_step">, now: Date = new Date()): SignupStage {
  if (org.onboarding_completed || org.onboarding_step === "complete") return "complete";
  const ageHours = (now.getTime() - new Date(org.created_at).getTime()) / 3_600_000;
  return ageHours >= STALL_AFTER_HOURS ? "stalled" : "in_progress";
}

/** Readable onboarding step. A null step means the org row exists but step 2 was never saved. */
export function onboardingStepLabel(step: string | null, completed?: boolean | null): string {
  if (completed) return "Finalizat";
  const labels: Record<string, string> = {
    modules: "2 · Funcționalități",
    menu: "3 · Meniu",
    fiscal: "4 · FiscalNet",
    first_sale: "5 · Prima vânzare",
    result: "6 · Rezultat",
    complete: "Finalizat",
  };
  return step ? (labels[step] ?? step) : "1 · Firma (fără pas salvat)";
}

// ── Billing ───────────────────────────────────────────────────────────────

export type SubscriptionRow = {
  organisation_id: string | null;
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_price_id: string | null;
};

/** Stripe statuses that are billing (or about to bill) money. */
export const BILLING_STATUSES = new Set(["active", "past_due"]);

/**
 * List-price MRR in cents from lib/billing/plans.ts (the repo's single
 * source for prices). Annual subscribers count at their monthly-equivalent
 * annual price. Stripe stays the source of truth for what was charged.
 */
export function subscriptionMrrCents(sub: SubscriptionRow): number {
  if (!sub.status || !BILLING_STATUSES.has(sub.status) || !sub.plan) return 0;
  let plan;
  try {
    plan = getPlan(sub.plan as BillingPlan);
  } catch {
    return 0;
  }
  if (!plan) return 0;
  const annualIds = [process.env[plan.annualPriceEnv]].filter(Boolean);
  if (sub.stripe_price_id && annualIds.includes(sub.stripe_price_id)) {
    return Math.round(plan.annualAmountCents / 12);
  }
  return plan.amountCents;
}

export function totalMrrCents(subs: readonly SubscriptionRow[]): number {
  return subs.reduce((sum, s) => sum + subscriptionMrrCents(s), 0);
}

// ── Live trading ──────────────────────────────────────────────────────────

export type TxRow = {
  organisation_id: string;
  sold_at: string;
  total: number | string | null;
  fiscal_receipt_status: string | null;
};
export type SessionRow = { organisation_id: string; opened_at: string | null };
export type AttemptRow = { organisation_id: string; status: string | null; mock_mode: boolean | null; attempted_at: string | null };

export type TradingRow = {
  organisationId: string;
  name: string;
  paying: boolean;
  salesToday: number;
  countToday: number;
  sales7d: number;
  count7d: number;
  lastSaleAt: string | null;
  openSessions: number;
  oldestOpenSessionAt: string | null;
  /** Real (non-mock) FiscalNet attempts, last 7 days. */
  fiscalSent7d: number;
  fiscalFailed7d: number;
  /** Sales whose receipt is still pending / failed, last 7 days. */
  receiptsPending7d: number;
  receiptsFailed7d: number;
  alerts: string[];
};

/** A paying café with no sale for this long during a trading day is flagged. */
export const QUIET_HOURS_ALERT = 3;

/**
 * One row per café that pays or traded in the window. `tx`/`attempts` must
 * cover at least the last 7 days. Alerts are the things that should make
 * the founder pick up the phone.
 */
export function summarizeTrading(input: {
  orgs: readonly Pick<OrgRow, "id" | "name">[];
  payingOrgIds: ReadonlySet<string>;
  tx: readonly TxRow[];
  openSessions: readonly SessionRow[];
  attempts: readonly AttemptRow[];
  now?: Date;
}): TradingRow[] {
  const now = input.now ?? new Date();
  const today = bucharestDayKey(now);
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const rows = new Map<string, TradingRow>();
  const nameOf = new Map(input.orgs.map((o) => [o.id, o.name ?? "(fără nume)"]));

  const row = (id: string): TradingRow => {
    let r = rows.get(id);
    if (!r) {
      r = {
        organisationId: id,
        name: nameOf.get(id) ?? id.slice(0, 8),
        paying: input.payingOrgIds.has(id),
        salesToday: 0, countToday: 0, sales7d: 0, count7d: 0, lastSaleAt: null,
        openSessions: 0, oldestOpenSessionAt: null,
        fiscalSent7d: 0, fiscalFailed7d: 0, receiptsPending7d: 0, receiptsFailed7d: 0,
        alerts: [],
      };
      rows.set(id, r);
    }
    return r;
  };

  for (const id of input.payingOrgIds) row(id);

  for (const t of input.tx) {
    const at = new Date(t.sold_at).getTime();
    const r = row(t.organisation_id);
    if (!r.lastSaleAt || t.sold_at > r.lastSaleAt) r.lastSaleAt = t.sold_at;
    if (at < weekAgo) continue;
    const amount = Number(t.total ?? 0);
    r.sales7d += amount;
    r.count7d += 1;
    if (bucharestDayKey(t.sold_at) === today) {
      r.salesToday += amount;
      r.countToday += 1;
    }
    if (t.fiscal_receipt_status === "failed") r.receiptsFailed7d += 1;
    if (t.fiscal_receipt_status === "pending" || t.fiscal_receipt_status === "api_pending") r.receiptsPending7d += 1;
  }

  for (const s of input.openSessions) {
    const r = row(s.organisation_id);
    r.openSessions += 1;
    if (s.opened_at && (!r.oldestOpenSessionAt || s.opened_at < r.oldestOpenSessionAt)) r.oldestOpenSessionAt = s.opened_at;
  }

  for (const a of input.attempts) {
    if (a.mock_mode) continue;
    if (!a.attempted_at || new Date(a.attempted_at).getTime() < weekAgo) continue;
    const r = row(a.organisation_id);
    if (a.status === "success") r.fiscalSent7d += 1;
    else if (a.status === "failed") r.fiscalFailed7d += 1;
  }

  for (const r of rows.values()) {
    r.salesToday = round2(r.salesToday);
    r.sales7d = round2(r.sales7d);
    if (r.receiptsFailed7d > 0) r.alerts.push(`${r.receiptsFailed7d} bonuri eșuate (7 zile)`);
    if (r.receiptsPending7d > 0) r.alerts.push(`${r.receiptsPending7d} bonuri neconfirmate (7 zile)`);
    if (r.oldestOpenSessionAt && now.getTime() - new Date(r.oldestOpenSessionAt).getTime() > 24 * 3_600_000) {
      r.alerts.push("Casă deschisă de peste 24h");
    }
    if (r.paying && r.lastSaleAt && r.openSessions > 0 && now.getTime() - new Date(r.lastSaleAt).getTime() > QUIET_HOURS_ALERT * 3_600_000) {
      r.alerts.push(`Casă deschisă, nicio vânzare de ${QUIET_HOURS_ALERT}h+`);
    }
    if (r.paying && r.count7d === 0) r.alerts.push("Plătește, dar nicio vânzare în 7 zile");
  }

  return [...rows.values()].sort((a, b) => Number(b.paying) - Number(a.paying) || b.sales7d - a.sales7d);
}

/**
 * Rows worth a founder's attention: paying cafés, cafés that sold in the
 * last 7 days, and tills opened in the last 24h. Old test or abandoned orgs
 * whose till was simply never closed are left out (counted separately), so
 * they can't bury a real alert.
 */
export function isLiveTradingRow(r: TradingRow, now: Date = new Date()): boolean {
  if (r.paying || r.count7d > 0) return true;
  return Boolean(r.oldestOpenSessionAt && now.getTime() - new Date(r.oldestOpenSessionAt).getTime() <= 24 * 3_600_000);
}
