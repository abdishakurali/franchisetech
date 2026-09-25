import type { PlanCode } from "@/lib/billing/plan-codes";

/**
 * Static per-plan entitlement data — no I/O, no server-only imports. Split
 * out of entitlement-resolver.ts (which needs createServiceClient/next/server
 * for resolveEntitlements(orgId) and friends) because lib/business-modules.ts
 * imports planEntitlements/EntitlementKey through lib/billing/entitlements.ts,
 * and business-modules.ts is reachable from client components (e.g.
 * PurchaseForm.tsx via lib/product-module-fields.ts). Importing anything from
 * a module that also imports next/headers pulls next/headers into the client
 * bundle and breaks the build — this file exists so that chain stays pure.
 */
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
  | "loyalty.enabled"
  | "team.advanced_roles"
  | "owner_digest.enabled"
  | "reports.gestiune"
  | "reports.accountant_pack"
  | "support.priority"
  | "multi_site.enabled"
  | "multi_site.site_switching"
  | "reports.per_site"
  | "fiscal.multi_site";

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
  "loyalty.enabled",
  "team.advanced_roles",
  "owner_digest.enabled",
];

const SCALE_ENTITLEMENTS: readonly EntitlementKey[] = [
  ...OPERATIONS_ENTITLEMENTS,
  "reports.accountant_pack",
  "support.priority",
];

// ── New pricing generation (2026-09) — Free / Pro ("growth") / Multi ("team") ──
// FREE mirrors CORE_ENTITLEMENTS exactly (till, products, VAT, fiscal, basic
// reports) — it's the permanent no-card tier every signup lands on. GROWTH is
// OPERATIONS_ENTITLEMENTS plus the accountant export pack (moved down from
// legacy Scale-only, per the pricing restructure). TEAM adds multi-site on
// top of GROWTH. None of this touches CORE/OPERATIONS/SCALE above — those
// stay exactly as they are for the 2 legacy subscribers.
const FREE_ENTITLEMENTS: readonly EntitlementKey[] = [...CORE_ENTITLEMENTS];

const GROWTH_ENTITLEMENTS: readonly EntitlementKey[] = [
  ...OPERATIONS_ENTITLEMENTS,
  "reports.accountant_pack",
];

const TEAM_ENTITLEMENTS: readonly EntitlementKey[] = [
  ...GROWTH_ENTITLEMENTS,
  "support.priority",
];

/**
 * Static per-plan entitlement set — what a plan TIER grants in principle.
 * Deliberately NOT the same question as resolveEntitlements(orgId), which
 * additionally folds in subscription status (fallback for expired/unpaid/
 * canceled) and per-org overrides. lib/billing/entitlements.ts derives its
 * coarse BusinessModuleKey membership from this function specifically —
 * never from resolveEntitlements — because the coarse system has never had
 * a concept of subscription status, and deriving from the per-org resolved
 * set would silently grant modules to e.g. an expired core-plan org via
 * FALLBACK_ENTITLEMENTS, which the coarse system has never done.
 */
export function planEntitlements(plan: PlanCode | null): EntitlementKey[] {
  if (plan === "scale") return [...SCALE_ENTITLEMENTS];
  if (plan === "operations") return [...OPERATIONS_ENTITLEMENTS];
  if (plan === "core") return [...CORE_ENTITLEMENTS];
  if (plan === "team") return [...TEAM_ENTITLEMENTS];
  if (plan === "growth") return [...GROWTH_ENTITLEMENTS];
  if (plan === "free") return [...FREE_ENTITLEMENTS];
  return [];
}
