/**
 * Central data-access layer for all HACCP check data.
 *
 * All queries use explicit FK hints (profiles!taken_by, profiles!completed_by)
 * to avoid PostgREST ambiguity introduced when migration 006 added `updated_by`
 * FK columns to temperature_readings and corrective_actions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { differenceInHours, differenceInMinutes, startOfDay, endOfDay, subDays } from "date-fns";
import {
  assetDisplayName,
  correctiveActionLabel,
  formatTemp,
  statusLabel,
} from "./temperature";
import { categoryLabel as _categoryLabel } from "./food-safety-rules";
import type { CheckCategory } from "./food-safety-rules";

// ─── Shared filter type ────────────────────────────────────────────────────────
export type CheckFilters = {
  from?: Date;
  to?: Date;
  siteId?: string;
  assetId?: string;
  category?: string;
};

// ─── Normalised row types ──────────────────────────────────────────────────────

export type TemperatureCheckRow = {
  id: string;
  value_c: number | null;
  status: "pass" | "warning" | "fail";
  taken_at: string;
  created_at: string;
  updated_at: string | null;
  source: string;
  notes: string | null;
  organisation_id: string;
  site_id: string | null;
  asset_id: string | null;
  // New category fields
  check_category: string | null;
  food_item: string | null;
  supplier_name: string | null;
  delivery_type: string | null;
  finished_cooking_at: string | null;
  placed_in_fridge_at: string | null;
  assets: {
    id: string;
    name: string;
    asset_type: string;
    min_temp: number | null;
    max_temp: number | null;
    location: string | null;
  } | null;
  sites: { name: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
  corrective_actions: Array<{ id: string; description: string; action_type: string }> | null;
  // Derived labels
  unitLabel: string;
  staffLabel: string;
  subjectLabel: string;   // unit name OR food item
  categoryLabel: string;
  enteredLater: boolean;
  edited: boolean;
  actionNeeded: boolean;
};

export type ActionRow = {
  id: string;
  reading_id: string | null;
  action_type: string;
  description: string;
  completed_at: string;
  created_at: string;
  updated_at: string | null;
  follow_up_required: boolean;
  organisation_id: string;
  site_id: string | null;
  asset_id: string | null;
  assets: {
    id: string;
    name: string;
    asset_type: string;
    min_temp: number | null;
    max_temp: number | null;
  } | null;
  sites: { name: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
  temperature_readings: {
    value_c: number;
    status: string;
    taken_at: string;
    created_at: string;
    updated_at: string | null;
  } | null;
  // Derived labels
  unitLabel: string;
  staffLabel: string;
  actionLabel: string;
  failedTemp: string | null;
};

export type ManagerAttentionItem = {
  id: string;
  readingId: string;
  dateTime: string;
  kitchen: string;
  unit: string;
  issue: string;
  status: string;
  href: string;
};

export type HistoryRow = {
  id: string;
  checkedAt: string;
  enteredAt: string;
  type: string;
  kitchen: string;
  unit: string;
  status: string;
  staff: string;
  action: string;
  late: boolean;
  edited: boolean;
  actionNeeded: boolean;
};

export type RefrigReportData = {
  readings: TemperatureCheckRow[];
  actions: ActionRow[];
  passCount: number;
  warnCount: number;
  failCount: number;
  actionsNeeded: number;
  enteredLaterCount: number;
  editedCount: number;
  actionByReadingId: Map<string, ActionRow>;
};

// ─── Org membership ────────────────────────────────────────────────────────────

export async function getCurrentUserOrganisation(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id, role, organisations(id, name, business_type, country)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return null;

  return {
    userId: user.id,
    orgId: membership.organisation_id as string,
    role: membership.role as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    organisation: (membership as any).organisations as {
      id: string;
      name: string;
      business_type: string | null;
      country: string;
    } | null,
  };
}

// ─── Temperature checks ────────────────────────────────────────────────────────

export async function getTemperatureChecks(
  supabase: SupabaseClient,
  orgId: string,
  filters?: CheckFilters
): Promise<TemperatureCheckRow[]> {
  const toDate = filters?.to ?? new Date();
  const fromDate = filters?.from ?? subDays(toDate, 6);

  // profiles!taken_by — explicit hint avoids "multiple FK refs" error (migration 006 added updated_by)
  let query = supabase
    .from("temperature_readings")
    .select(
      "id, value_c, status, taken_at, created_at, updated_at, source, notes, organisation_id, site_id, asset_id, " +
        "check_category, food_item, supplier_name, delivery_type, finished_cooking_at, placed_in_fridge_at, " +
        "assets(id, name, asset_type, min_temp, max_temp, location), " +
        "sites(name), " +
        "profiles!taken_by(full_name, email), " +
        "corrective_actions(id, description, action_type)"
    )
    .eq("organisation_id", orgId)
    .gte("taken_at", startOfDay(fromDate).toISOString())
    .lte("taken_at", endOfDay(toDate).toISOString())
    .order("taken_at", { ascending: false });

  if (filters?.siteId)   query = (query as typeof query).eq("site_id", filters.siteId);
  if (filters?.assetId)  query = (query as typeof query).eq("asset_id", filters.assetId);
  if (filters?.category) query = (query as typeof query).eq("check_category", filters.category);

  const { data, error } = await query;

  if (error) {
    console.error("[tracking] getTemperatureChecks error", {
      code: error.code,
      message: error.message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hint: (error as any).hint,
      orgId,
      from: startOfDay(fromDate).toISOString(),
      to: endOfDay(toDate).toISOString(),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((r) => {
    const enteredLater =
      Boolean(r.created_at) &&
      Boolean(r.taken_at) &&
      differenceInHours(new Date(r.created_at), new Date(r.taken_at)) >= 2;
    const edited =
      Boolean(r.updated_at) &&
      Boolean(r.created_at) &&
      differenceInMinutes(new Date(r.updated_at), new Date(r.created_at)) > 1;
    const actionNeeded =
      r.status === "fail" && !(r.corrective_actions?.length);

    const cat = (r.check_category ?? "cold_storage") as CheckCategory;
    const unitLbl = assetDisplayName(r.assets);
    const subjectLbl = r.food_item ?? r.supplier_name ?? unitLbl;

    return {
      ...r,
      unitLabel: unitLbl,
      subjectLabel: subjectLbl,
      categoryLabel: _categoryLabel(cat),
      staffLabel: r.profiles?.full_name ?? r.profiles?.email ?? "Unknown staff",
      enteredLater,
      edited,
      actionNeeded,
    } as TemperatureCheckRow;
  });
}

// ─── Corrective actions ────────────────────────────────────────────────────────

export async function getActionsTaken(
  supabase: SupabaseClient,
  orgId: string,
  filters?: CheckFilters
): Promise<ActionRow[]> {
  const toDate = filters?.to ?? new Date();
  const fromDate = filters?.from ?? subDays(toDate, 6);

  // profiles!completed_by — explicit hint (migration 006 added updated_by FK)
  let query = supabase
    .from("corrective_actions")
    .select(
      "id, reading_id, action_type, description, completed_at, created_at, updated_at, follow_up_required, " +
        "organisation_id, site_id, asset_id, " +
        "assets(id, name, asset_type, min_temp, max_temp), " +
        "sites(name), " +
        "profiles!completed_by(full_name, email), " +
        "temperature_readings(value_c, status, taken_at, created_at, updated_at)"
    )
    .eq("organisation_id", orgId)
    .gte("created_at", startOfDay(fromDate).toISOString())
    .lte("created_at", endOfDay(toDate).toISOString())
    .order("created_at", { ascending: false });

  if (filters?.siteId) query = (query as typeof query).eq("site_id", filters.siteId);
  if (filters?.assetId) query = (query as typeof query).eq("asset_id", filters.assetId);

  const { data, error } = await query;

  if (error) {
    console.error("[tracking] getActionsTaken error", {
      code: error.code,
      message: error.message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hint: (error as any).hint,
      orgId,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((a) => ({
    ...a,
    unitLabel: assetDisplayName(a.assets),
    staffLabel: a.profiles?.full_name ?? a.profiles?.email ?? "Unknown staff",
    actionLabel: correctiveActionLabel(a.action_type),
    failedTemp: a.temperature_readings ? formatTemp(a.temperature_readings.value_c) : null,
  })) as ActionRow[];
}

// ─── Manager attention ─────────────────────────────────────────────────────────

export async function getManagerAttention(
  supabase: SupabaseClient,
  orgId: string,
  date?: Date
): Promise<ManagerAttentionItem[]> {
  const targetDate = date ?? new Date();
  const checks = await getTemperatureChecks(supabase, orgId, {
    from: startOfDay(targetDate),
    to: endOfDay(targetDate),
  });

  const items: ManagerAttentionItem[] = [];

  for (const r of checks) {
    if (r.actionNeeded) {
      items.push({
        id: `${r.id}-action`,
        readingId: r.id,
        dateTime: r.taken_at,
        kitchen: r.sites?.name ?? "Main Kitchen",
        unit: r.unitLabel,
        issue: `${formatTemp(r.value_c)} failed — no action recorded`,
        status: "Action needed",
        href: "/app/corrective-actions",
      });
    }
    if (r.enteredLater) {
      items.push({
        id: `${r.id}-late`,
        readingId: r.id,
        dateTime: r.taken_at,
        kitchen: r.sites?.name ?? "Main Kitchen",
        unit: r.unitLabel,
        issue: "Entered more than 2 hours after check time",
        status: "Entered later",
        href: "/app/reports/refrigeration",
      });
    }
    if (r.edited) {
      items.push({
        id: `${r.id}-edited`,
        readingId: r.id,
        dateTime: r.taken_at,
        kitchen: r.sites?.name ?? "Main Kitchen",
        unit: r.unitLabel,
        issue: "Check was edited after entry",
        status: "Edited",
        href: "/app/reports/refrigeration",
      });
    }
  }

  return items;
}

// ─── History events ────────────────────────────────────────────────────────────

export async function getHistoryEvents(
  supabase: SupabaseClient,
  orgId: string,
  filters?: CheckFilters
): Promise<HistoryRow[]> {
  const checks = await getTemperatureChecks(supabase, orgId, filters);

  return checks.map((r) => ({
    id: `temperature-${r.id}`,
    checkedAt: r.taken_at,
    enteredAt: r.created_at,
    type: "Temperature",
    kitchen: r.sites?.name ?? "—",
    unit: r.unitLabel,
    status: statusLabel(r.status),
    staff: r.staffLabel,
    action:
      r.corrective_actions?.[0]?.description ??
      (r.status === "fail" ? "Action needed" : "—"),
    late: r.enteredLater,
    edited: r.edited,
    actionNeeded: r.actionNeeded,
  }));
}

// ─── Refrigeration report ──────────────────────────────────────────────────────

export async function getRefrigerationReportData(
  supabase: SupabaseClient,
  orgId: string,
  filters?: CheckFilters
): Promise<RefrigReportData> {
  const [readings, actions] = await Promise.all([
    getTemperatureChecks(supabase, orgId, filters),
    getActionsTaken(supabase, orgId, filters),
  ]);

  const actionByReadingId = new Map(
    actions.filter((a) => a.reading_id).map((a) => [a.reading_id!, a])
  );

  return {
    readings,
    actions,
    passCount: readings.filter((r) => r.status === "pass").length,
    warnCount: readings.filter((r) => r.status === "warning").length,
    failCount: readings.filter((r) => r.status === "fail").length,
    actionsNeeded: readings.filter(
      (r) => r.status === "fail" && !actionByReadingId.has(r.id)
    ).length,
    enteredLaterCount: readings.filter((r) => r.enteredLater).length,
    editedCount: readings.filter((r) => r.edited).length,
    actionByReadingId,
  };
}

// ─── Actions report ────────────────────────────────────────────────────────────

export async function getActionsReportData(
  supabase: SupabaseClient,
  orgId: string,
  filters?: CheckFilters
): Promise<ActionRow[]> {
  return getActionsTaken(supabase, orgId, filters);
}
