import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizePlan as _normalizePlan, type PlanCode as _PlanCode } from "@/lib/billing/plan-codes";

export type PlanCode = _PlanCode;
export type EntitlementKey =
  | "pos.enabled"
  | "pos.discounts"
  | "pos.transaction_history"
  | "pos.till_sessions"
  | "pos.offline_queue"
  | "products.enabled"
  | "products.csv"
  | "vat.enabled"
  | "reports.sales"
  | "reports.till_close"
  | "reports.vat"
  | "fiscal.fiscalnet"
  | "fiscal.z_report"
  | "fiscal.x_report"
  | "fiscal.vat_groups"
  | "fiscal.efactura"
  | "team.owner_role"
  | "team.staff_roles"
  | "team.unlimited_staff"
  | "pos.split_payments"
  | "pos.tips"
  | "pos.cash_drawer_connector"
  | "inventory.enabled"
  | "inventory.stock_movements"
  | "purchases.suppliers"
  | "purchases.nir"
  | "reports.stock"
  | "reports.audit"
  | "recipes.enabled"
  | "recipes.costing"
  | "recipes.stock_depletion"
  | "kitchen.enabled"
  | "kitchen.order_flow"
  | "kitchen.stations"
  | "kitchen.order_types"
  | "kitchen.table_service"
  | "team.advanced_roles"
  | "owner_digest.enabled"
  | "reports.gestiune"
  | "reports.accountant_pack"
  | "support.priority"
  | "multi_site.enabled"
  | "multi_site.site_switching"
  | "reports.per_site"
  | "fiscal.multi_site";

type EntitlementStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "grace_period"
  | "expired"
  | "unpaid"
  | "canceled";

type EntitlementLimitKey = "kitchen.screen_limit";

export type EntitlementErrorBody = {
  error: "entitlement_denied";
  key: EntitlementKey | EntitlementLimitKey;
  plan_required: PlanCode | "multi_site";
  current_plan: PlanCode | null;
  upgrade_url: "/pricing";
};

type ResolvedEntitlements = {
  orgId: string;
  currentPlan: PlanCode | null;
  status: EntitlementStatus;
  entitlements: Set<EntitlementKey>;
  limits: Record<EntitlementLimitKey, number | "unlimited">;
};

const CORE_ENTITLEMENTS: readonly EntitlementKey[] = [
  "pos.enabled",
  "pos.discounts",
  "pos.transaction_history",
  "pos.till_sessions",
  "pos.offline_queue",
  "products.enabled",
  "products.csv",
  "vat.enabled",
  "reports.sales",
  "reports.till_close",
  "reports.vat",
  "fiscal.fiscalnet",
  "fiscal.z_report",
  "fiscal.x_report",
  "fiscal.vat_groups",
  "fiscal.efactura",
  "team.owner_role",
  "team.staff_roles",
  "team.unlimited_staff",
];

const OPERATIONS_ENTITLEMENTS: readonly EntitlementKey[] = [
  ...CORE_ENTITLEMENTS,
  "pos.split_payments",
  "pos.tips",
  "pos.cash_drawer_connector",
  "inventory.enabled",
  "inventory.stock_movements",
  "purchases.suppliers",
  "purchases.nir",
  "reports.stock",
  "reports.audit",
  "reports.gestiune",
  "recipes.enabled",
  "recipes.costing",
  "recipes.stock_depletion",
  "kitchen.enabled",
  "kitchen.order_flow",
  "kitchen.stations",
  "kitchen.order_types",
  "kitchen.table_service",
  "team.advanced_roles",
  "owner_digest.enabled",
];

const SCALE_ENTITLEMENTS: readonly EntitlementKey[] = [
  ...OPERATIONS_ENTITLEMENTS,
  "reports.accountant_pack",
  "support.priority",
];

const MULTI_SITE_ENTITLEMENTS: readonly EntitlementKey[] = [
  "multi_site.enabled",
  "multi_site.site_switching",
  "reports.per_site",
  "fiscal.multi_site",
];

const FALLBACK_ENTITLEMENTS: readonly EntitlementKey[] = [
  "reports.till_close",
  "reports.vat",
  "pos.transaction_history",
];

const GRACE_PERIOD_WRITE_BLOCKS = new Set<EntitlementKey>([
  "team.advanced_roles",
  "recipes.enabled",
  "purchases.nir",
  "kitchen.enabled",
]);

const REQUIRED_PLAN: Record<EntitlementKey | EntitlementLimitKey, PlanCode | "multi_site"> = {
  "pos.enabled": "core",
  "pos.discounts": "core",
  "pos.transaction_history": "core",
  "pos.till_sessions": "core",
  "pos.offline_queue": "core",
  "products.enabled": "core",
  "products.csv": "core",
  "vat.enabled": "core",
  "reports.sales": "core",
  "reports.till_close": "core",
  "reports.vat": "core",
  "fiscal.fiscalnet": "core",
  "fiscal.z_report": "core",
  "fiscal.x_report": "core",
  "fiscal.vat_groups": "core",
  "fiscal.efactura": "core",
  "team.owner_role": "core",
  "team.staff_roles": "core",
  "team.unlimited_staff": "core",
  "pos.split_payments": "operations",
  "pos.tips": "operations",
  "pos.cash_drawer_connector": "operations",
  "inventory.enabled": "operations",
  "inventory.stock_movements": "operations",
  "purchases.suppliers": "operations",
  "purchases.nir": "operations",
  "reports.stock": "operations",
  "reports.audit": "operations",
  "reports.gestiune": "operations",
  "recipes.enabled": "operations",
  "recipes.costing": "operations",
  "recipes.stock_depletion": "operations",
  "kitchen.enabled": "operations",
  "kitchen.order_flow": "operations",
  "kitchen.stations": "operations",
  "kitchen.order_types": "operations",
  "kitchen.table_service": "operations",
  "kitchen.screen_limit": "operations",
  "team.advanced_roles": "operations",
  "owner_digest.enabled": "operations",
  "reports.accountant_pack": "scale",
  "support.priority": "scale",
  "multi_site.enabled": "multi_site",
  "multi_site.site_switching": "multi_site",
  "reports.per_site": "multi_site",
  "fiscal.multi_site": "multi_site",
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: ResolvedEntitlements }>();

export class EntitlementDeniedError extends Error {
  body: EntitlementErrorBody;

  constructor(body: EntitlementErrorBody) {
    super(`Entitlement denied: ${body.key}`);
    this.name = "EntitlementDeniedError";
    this.body = body;
  }
}

export function entitlementDeniedResponse(error: unknown): NextResponse | null {
  if (!(error instanceof EntitlementDeniedError)) return null;
  return NextResponse.json(error.body, { status: 403 });
}

export function invalidateEntitlementCache(orgId?: string | null): void {
  if (orgId) cache.delete(orgId);
  else cache.clear();
}

export const normalizePlan = _normalizePlan;

function planEntitlements(plan: PlanCode | null): EntitlementKey[] {
  if (plan === "scale") return [...SCALE_ENTITLEMENTS];
  if (plan === "operations") return [...OPERATIONS_ENTITLEMENTS];
  if (plan === "core") return [...CORE_ENTITLEMENTS];
  return [];
}

function limitForPlan(plan: PlanCode | null): number | "unlimited" {
  if (plan === "scale") return "unlimited";
  if (plan === "operations") return 3;
  return 0;
}

function future(iso: string | null | undefined): boolean {
  return Boolean(iso && new Date(iso).getTime() > Date.now());
}

function resolveStatus(rawStatus: string | null | undefined, currentPeriodEnd: string | null | undefined, graceEnd: string | null | undefined): EntitlementStatus {
  if (rawStatus === "trialing") return "trialing";
  if (rawStatus === "active") return "active";
  if (rawStatus === "grace_period") return "grace_period";
  if (rawStatus === "past_due") return future(graceEnd) ? "past_due" : "expired";
  if (rawStatus === "canceled") return future(currentPeriodEnd) ? "active" : "canceled";
  if (rawStatus === "unpaid") return "unpaid";
  return "expired";
}

function isMissingSchemaObjectError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("organisation_entitlement_overrides")
  );
}

async function applyOverrides(orgId: string, entitlements: Set<EntitlementKey>, limits: Record<EntitlementLimitKey, number | "unlimited">) {
  const service = await createServiceClient();
  const { data, error } = await service
    .from("organisation_entitlement_overrides")
    .select("entitlement_key,enabled,limit_key,limit_value,expires_at")
    .eq("organisation_id", orgId);

  if (error) {
    if (!isMissingSchemaObjectError(error)) console.error("organisation_entitlement_overrides", error.message);
    return;
  }

  const now = Date.now();
  for (const row of data ?? []) {
    if (row.expires_at && new Date(row.expires_at).getTime() <= now) continue;
    const key = row.entitlement_key as EntitlementKey | null;
    if (key) {
      if (row.enabled) entitlements.add(key);
      else entitlements.delete(key);
    }
    if (row.limit_key === "kitchen.screen_limit") {
      limits["kitchen.screen_limit"] = row.limit_value === "unlimited" ? "unlimited" : Math.max(0, Number(row.limit_value ?? 0));
    }
  }
}

export async function resolveEntitlements(orgId: string): Promise<ResolvedEntitlements> {
  const cached = cache.get(orgId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const service = await createServiceClient();
  const [{ data: org }, { data: sub }] = await Promise.all([
    service
      .from("organisations")
      .select("trial_ends_at,multi_site_ops_enabled")
      .eq("id", orgId)
      .maybeSingle(),
    service
      .from("billing_subscriptions")
      .select("plan,status,current_period_end,grace_period_ends_at,created_at")
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const softTrial = !sub && future(org?.trial_ends_at);
  const status = softTrial
    ? "trialing"
    : resolveStatus(sub?.status ?? null, sub?.current_period_end ?? null, sub?.grace_period_ends_at ?? null);
  const currentPlan = softTrial || status === "trialing" ? "operations" : normalizePlan(sub?.plan ?? null);
  const fallback = status === "expired" || status === "unpaid" || status === "canceled";
  const entitlements = new Set<EntitlementKey>(fallback ? FALLBACK_ENTITLEMENTS : planEntitlements(currentPlan));
  const limits: Record<EntitlementLimitKey, number | "unlimited"> = {
    "kitchen.screen_limit": fallback ? 0 : limitForPlan(currentPlan),
  };

  const multiSiteEnabled = (sub?.plan === "multi_location") || (currentPlan === "scale" && Boolean(org?.multi_site_ops_enabled));
  if (!fallback && multiSiteEnabled) {
    for (const key of MULTI_SITE_ENTITLEMENTS) entitlements.add(key);
  }

  await applyOverrides(orgId, entitlements, limits);

  const value = { orgId, currentPlan, status, entitlements, limits };
  cache.set(orgId, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

export async function hasEntitlement(
  orgId: string,
  key: EntitlementKey,
  options: { write?: boolean } = {}
): Promise<boolean> {
  const resolved = await resolveEntitlements(orgId);
  if (options.write && resolved.status === "grace_period" && GRACE_PERIOD_WRITE_BLOCKS.has(key)) {
    return false;
  }
  return resolved.entitlements.has(key);
}

export async function assertEntitlement(
  orgId: string,
  key: EntitlementKey,
  options: { write?: boolean } = { write: true }
): Promise<void> {
  const resolved = await resolveEntitlements(orgId);
  const allowed = await hasEntitlement(orgId, key, options);
  if (allowed) return;
  throw new EntitlementDeniedError({
    error: "entitlement_denied",
    key,
    plan_required: REQUIRED_PLAN[key],
    current_plan: resolved.currentPlan,
    upgrade_url: "/pricing",
  });
}

export async function assertUsageBelowLimit(
  orgId: string,
  key: EntitlementLimitKey,
  currentUsage: number
): Promise<void> {
  const resolved = await resolveEntitlements(orgId);
  const limit = resolved.limits[key];
  if (limit === "unlimited" || currentUsage < limit) return;
  throw new EntitlementDeniedError({
    error: "entitlement_denied",
    key,
    plan_required: REQUIRED_PLAN[key],
    current_plan: resolved.currentPlan,
    upgrade_url: "/pricing",
  });
}
