"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrg } from "@/lib/kitchenops/data";
import { assertEntitlement, EntitlementDeniedError } from "@/lib/billing/entitlement-resolver";

import type { TableShapeKind } from "@/lib/floor-plan/constants";
import { createKitchenOrderForTab } from "@/lib/table-service/kitchen-tab-order";
import type { PosCartLine } from "@/lib/pos-line-discount";
import { lineGrossAfter } from "@/lib/pos-line-discount";

export type FloorSection = {
  id: string;
  organisation_id: string;
  site_id: string | null;
  name: string;
  sort_order: number;
  background_preset: string;
  background_url: string | null;
  created_at: string;
};

export type RestaurantTable = {
  id: string;
  organisation_id: string;
  site_id: string | null;
  name: string;
  section: string | null;
  section_id: string | null;
  capacity: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  shape: TableShapeKind;
  icon_url: string | null;
  layout_x: number | null;
  layout_y: number | null;
  layout_w: number | null;
  layout_h: number | null;
};

export type TableTab = {
  id: string;
  organisation_id: string;
  site_id: string | null;
  table_id: string;
  opened_by: string | null;
  status: "open" | "bill_requested" | "closed" | "voided";
  notes: string | null;
  cover_count: number | null;
  opened_at: string;
  closed_at: string | null;
  opener_name?: string | null;
  running_total?: number;
  sale_count?: number;
};

export type TableWithStatus = RestaurantTable & {
  active_tab: TableTab | null;
};

function normalizeTableRow(t: Record<string, unknown>): RestaurantTable {
  return {
    id: String(t.id),
    organisation_id: String(t.organisation_id),
    site_id: (t.site_id as string | null) ?? null,
    name: String(t.name),
    section: (t.section as string | null) ?? null,
    section_id: (t.section_id as string | null) ?? null,
    capacity: t.capacity != null ? Number(t.capacity) : null,
    sort_order: Number(t.sort_order ?? 0),
    is_active: Boolean(t.is_active ?? true),
    created_at: String(t.created_at),
    shape: (t.shape as TableShapeKind) ?? "square",
    icon_url: (t.icon_url as string | null) ?? null,
    layout_x: t.layout_x != null ? Number(t.layout_x) : null,
    layout_y: t.layout_y != null ? Number(t.layout_y) : null,
    layout_w: t.layout_w != null ? Number(t.layout_w) : null,
    layout_h: t.layout_h != null ? Number(t.layout_h) : null,
  };
}

async function loadTabSummaries(
  supabase: Awaited<ReturnType<typeof getActiveOrg>>["supabase"],
  orgId: string,
  tabIds: string[]
): Promise<Map<string, { running_total: number; sale_count: number }>> {
  const map = new Map<string, { running_total: number; sale_count: number }>();
  if (!tabIds.length) return map;

  const { data: items } = await supabase
    .from("table_tab_items")
    .select("table_tab_id, line_total, kitchen_order_id")
    .eq("organisation_id", orgId)
    .in("table_tab_id", tabIds)
    .eq("status", "open");

  const roundsByTab = new Map<string, Set<string>>();

  for (const row of items ?? []) {
    const tabId = (row as { table_tab_id: string }).table_tab_id;
    const lineTotal = Number((row as { line_total: number }).line_total ?? 0);
    const kitchenOrderId = (row as { kitchen_order_id: string | null }).kitchen_order_id;
    const entry = map.get(tabId) ?? { running_total: 0, sale_count: 0 };
    entry.running_total += lineTotal;
    map.set(tabId, entry);
    if (kitchenOrderId) {
      const rounds = roundsByTab.get(tabId) ?? new Set<string>();
      rounds.add(kitchenOrderId);
      roundsByTab.set(tabId, rounds);
    }
  }

  for (const [id, entry] of map) {
    map.set(id, {
      running_total: Number(entry.running_total.toFixed(2)),
      sale_count: roundsByTab.get(id)?.size ?? 0,
    });
  }

  for (const tabId of tabIds) {
    if (!map.has(tabId)) {
      map.set(tabId, { running_total: 0, sale_count: 0 });
    }
  }

  return map;
}

function revalidateFloorPaths() {
  revalidatePath("/app/pos");
  revalidatePath("/app/settings/tables");
}

function canManage(role: string | null) {
  return ["owner", "manager"].includes(role ?? "");
}

function canOperate(role: string | null) {
  return ["owner", "manager", "staff", "cashier"].includes(role ?? "");
}

// ── Read ───────────────────────────────────────────────────────────────────────

export async function getTables(siteId?: string | null): Promise<TableWithStatus[]> {
  const { supabase, orgId } = await getActiveOrg();

  let query = supabase
    .from("restaurant_tables")
    .select("*")
    .eq("organisation_id", orgId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (siteId) query = query.eq("site_id", siteId);

  const { data: tables, error } = await query;
  if (error || !tables) return [];

  // Fetch active tabs for these tables in one query
  const tableIds = tables.map((t) => t.id);
  const { data: tabs } = await supabase
    .from("table_tabs")
    .select(`
      id, organisation_id, site_id, table_id, opened_by, status,
      notes, cover_count, opened_at, closed_at,
      profiles:opened_by ( full_name )
    `)
    .eq("organisation_id", orgId)
    .in("table_id", tableIds)
    .in("status", ["open", "bill_requested"]);

  const tabByTableId = new Map<string, TableTab>();
  for (const tab of tabs ?? []) {
    const t = tab as unknown as {
      id: string; organisation_id: string; site_id: string | null;
      table_id: string; opened_by: string | null; status: string;
      notes: string | null; cover_count: number | null;
      opened_at: string; closed_at: string | null;
      profiles: { full_name: string | null } | null;
    };
    tabByTableId.set(t.table_id, {
      id: t.id,
      organisation_id: t.organisation_id,
      site_id: t.site_id,
      table_id: t.table_id,
      opened_by: t.opened_by,
      status: t.status as TableTab["status"],
      notes: t.notes,
      cover_count: t.cover_count,
      opened_at: t.opened_at,
      closed_at: t.closed_at,
      opener_name: t.profiles?.full_name ?? null,
    });
  }

  const tabIds = [...tabByTableId.values()].map((t) => t.id);
  const summaries = await loadTabSummaries(supabase, orgId, tabIds);
  for (const tab of tabByTableId.values()) {
    const summary = summaries.get(tab.id);
    if (summary) {
      tab.running_total = summary.running_total;
      tab.sale_count = summary.sale_count;
    }
  }

  return tables.map((t) => ({
    ...normalizeTableRow(t as Record<string, unknown>),
    active_tab: tabByTableId.get(String(t.id)) ?? null,
  }));
}

export async function getAllTables(siteId?: string | null): Promise<RestaurantTable[]> {
  const { supabase, orgId } = await getActiveOrg();

  let query = supabase
    .from("restaurant_tables")
    .select("*")
    .eq("organisation_id", orgId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (siteId) query = query.eq("site_id", siteId);

  const { data } = await query;
  return (data ?? []).map((t) => normalizeTableRow(t as Record<string, unknown>));
}

export async function getTab(tabId: string): Promise<TableTab | null> {
  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase
    .from("table_tabs")
    .select(`
      id, organisation_id, site_id, table_id, opened_by, status,
      notes, cover_count, opened_at, closed_at,
      profiles:opened_by ( full_name )
    `)
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (!data) return null;
  const d = data as unknown as {
    id: string; organisation_id: string; site_id: string | null;
    table_id: string; opened_by: string | null; status: string;
    notes: string | null; cover_count: number | null;
    opened_at: string; closed_at: string | null;
    profiles: { full_name: string | null } | null;
  };
  return {
    id: d.id,
    organisation_id: d.organisation_id,
    site_id: d.site_id,
    table_id: d.table_id,
    opened_by: d.opened_by,
    status: d.status as TableTab["status"],
    notes: d.notes,
    cover_count: d.cover_count,
    opened_at: d.opened_at,
    closed_at: d.closed_at,
    opener_name: d.profiles?.full_name ?? null,
  };
}

export type TableTabWithTable = TableTab & {
  table_name: string;
  table_section: string | null;
  table_capacity: number | null;
};

export async function getTabWithTable(tabId: string): Promise<TableTabWithTable | null> {
  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase
    .from("table_tabs")
    .select(`
      id, organisation_id, site_id, table_id, opened_by, status,
      notes, cover_count, opened_at, closed_at,
      profiles:opened_by ( full_name ),
      restaurant_tables ( name, section, capacity )
    `)
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (!data) return null;
  const d = data as unknown as {
    id: string; organisation_id: string; site_id: string | null;
    table_id: string; opened_by: string | null; status: string;
    notes: string | null; cover_count: number | null;
    opened_at: string; closed_at: string | null;
    profiles: { full_name: string | null } | null;
    restaurant_tables: { name: string; section: string | null; capacity: number | null } | { name: string; section: string | null; capacity: number | null }[] | null;
  };
  const tableRow = Array.isArray(d.restaurant_tables) ? d.restaurant_tables[0] : d.restaurant_tables;
  return {
    id: d.id,
    organisation_id: d.organisation_id,
    site_id: d.site_id,
    table_id: d.table_id,
    opened_by: d.opened_by,
    status: d.status as TableTab["status"],
    notes: d.notes,
    cover_count: d.cover_count,
    opened_at: d.opened_at,
    closed_at: d.closed_at,
    opener_name: d.profiles?.full_name ?? null,
    table_name: tableRow?.name ?? "Masa",
    table_section: tableRow?.section ?? null,
    table_capacity: tableRow?.capacity != null ? Number(tableRow.capacity) : null,
  };
}

export async function getTableWithStatus(tableId: string, siteId?: string | null): Promise<TableWithStatus | null> {
  const { supabase, orgId } = await getActiveOrg();

  let tableQuery = supabase
    .from("restaurant_tables")
    .select("*")
    .eq("id", tableId)
    .eq("organisation_id", orgId)
    .eq("is_active", true);

  if (siteId) tableQuery = tableQuery.eq("site_id", siteId);

  const { data: table } = await tableQuery.maybeSingle();
  if (!table) return null;

  const { data: tabs } = await supabase
    .from("table_tabs")
    .select(`
      id, organisation_id, site_id, table_id, opened_by, status,
      notes, cover_count, opened_at, closed_at,
      profiles:opened_by ( full_name )
    `)
    .eq("table_id", tableId)
    .eq("organisation_id", orgId)
    .in("status", ["open", "bill_requested"])
    .maybeSingle();

  let active_tab: TableTab | null = null;
  if (tabs) {
    const t = tabs as unknown as {
      id: string; organisation_id: string; site_id: string | null;
      table_id: string; opened_by: string | null; status: string;
      notes: string | null; cover_count: number | null;
      opened_at: string; closed_at: string | null;
      profiles: { full_name: string | null } | null;
    };
    active_tab = {
      id: t.id,
      organisation_id: t.organisation_id,
      site_id: t.site_id,
      table_id: t.table_id,
      opened_by: t.opened_by,
      status: t.status as TableTab["status"],
      notes: t.notes,
      cover_count: t.cover_count,
      opened_at: t.opened_at,
      closed_at: t.closed_at,
      opener_name: t.profiles?.full_name ?? null,
    };
  }

  return { ...normalizeTableRow(table as Record<string, unknown>), active_tab };
}

export async function unlockTabForOrdering(tabId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot debloca masa." };
  }

  const { error } = await supabase
    .from("table_tabs")
    .update({ status: "open" })
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .eq("status", "bill_requested");

  if (error) return { ok: false, error: "Eroare la deblocare." };
  revalidateFloorPaths();
  return { ok: true };
}

export type PreBillLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type PreBillData = {
  tableName: string;
  tabId: string;
  openedAt: string;
  coverCount: number | null;
  lines: PreBillLine[];
  subtotal: number;
  tipOptions: { pct: number; amount: number }[];
};

export async function getPreBillData(tabId: string): Promise<PreBillData | null> {
  const tab = await getTabWithTable(tabId);
  if (!tab || (tab.status !== "open" && tab.status !== "bill_requested")) return null;

  const { supabase, orgId } = await getActiveOrg();
  const { data: items } = await supabase
    .from("table_tab_items")
    .select("product_name, quantity, unit_price, line_total")
    .eq("organisation_id", orgId)
    .eq("table_tab_id", tabId)
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const lines: PreBillLine[] = [];
  let subtotal = 0;

  for (const item of items ?? []) {
    const row = item as { product_name: string; quantity: number; unit_price: number; line_total: number };
    lines.push({
      name: row.product_name,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      lineTotal: Number(row.line_total),
    });
    subtotal += Number(row.line_total);
  }

  subtotal = Number(subtotal.toFixed(2));
  const tipOptions = [0, 5, 10, 15].map((pct) => ({
    pct,
    amount: Number((subtotal * pct / 100).toFixed(2)),
  }));

  return {
    tableName: tab.table_name,
    tabId: tab.id,
    openedAt: tab.opened_at,
    coverCount: tab.cover_count,
    lines,
    subtotal,
    tipOptions,
  };
}

// ── Table CRUD (manager/owner only) ───────────────────────────────────────────

function isMissingTableSchemaError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("restaurant_tables") ||
    message.includes("table_tabs") ||
    message.includes("table_tab_items") ||
    message.includes("schema cache")
  );
}

function tableCrudErrorMessage(error: { code?: string; message?: string } | null): string {
  if (isMissingTableSchemaError(error)) {
    return "Baza de date trebuie actualizată înainte să configurezi mesele. Contactează suportul sau rulează migrarea table_management.";
  }
  return "Eroare la salvare. Încearcă din nou.";
}

async function resolveSectionFields(
  supabase: Awaited<ReturnType<typeof getActiveOrg>>["supabase"],
  orgId: string,
  formData: FormData
): Promise<{ section_id: string | null; section: string | null }> {
  const section_id = String(formData.get("section_id") ?? "").trim() || null;
  if (section_id) {
    const { data: sec } = await supabase
      .from("restaurant_floor_sections")
      .select("name")
      .eq("id", section_id)
      .eq("organisation_id", orgId)
      .maybeSingle();
    return { section_id, section: sec?.name ?? null };
  }
  const section = String(formData.get("section") ?? "").trim() || null;
  return { section_id: null, section };
}

export async function createTable(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot adăuga mese." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Numele mesei este obligatoriu." };

  const { section_id, section } = await resolveSectionFields(supabase, orgId, formData);
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const sort_order = Number(formData.get("sort_order")) || 0;
  const site_id = String(formData.get("site_id") ?? "").trim() || null;
  const shapeRaw = String(formData.get("shape") ?? "square");
  const shape: TableShapeKind = ["square", "rectangle", "round"].includes(shapeRaw)
    ? (shapeRaw as TableShapeKind)
    : "square";
  const layout_x = Number(formData.get("layout_x")) || null;
  const layout_y = Number(formData.get("layout_y")) || null;
  const layout_w = Number(formData.get("layout_w")) || (shape === "rectangle" ? 120 : 80);
  const layout_h = Number(formData.get("layout_h")) || 80;

  const { error } = await supabase.from("restaurant_tables").insert({
    organisation_id: orgId,
    site_id,
    name,
    section,
    section_id,
    capacity: capacity !== null && Number.isFinite(capacity) ? capacity : null,
    sort_order,
    is_active: true,
    shape,
    layout_x,
    layout_y,
    layout_w,
    layout_h,
  });

  if (error) return { ok: false, error: tableCrudErrorMessage(error) };
  revalidateFloorPaths();
  return { ok: true };
}

export async function updateTable(tableId: string, formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot modifica mese." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Numele mesei este obligatoriu." };

  const { section_id, section } = await resolveSectionFields(supabase, orgId, formData);
  const shapeRaw = String(formData.get("shape") ?? "").trim();
  const shape = ["square", "rectangle", "round"].includes(shapeRaw)
    ? (shapeRaw as TableShapeKind)
    : undefined;

  const { error } = await supabase
    .from("restaurant_tables")
    .update({
      name,
      section,
      section_id,
      ...(shape ? { shape } : {}),
      capacity: (() => {
        const raw = String(formData.get("capacity") ?? "").trim();
        if (!raw) return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      })(),
      sort_order: Number(formData.get("sort_order")) || 0,
    })
    .eq("id", tableId)
    .eq("organisation_id", orgId);

  if (error) return { ok: false, error: tableCrudErrorMessage(error) };
  revalidateFloorPaths();
  return { ok: true };
}

export async function deactivateTable(tableId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot dezactiva mese." };
  }

  // Block if table has an open tab
  const { data: openTab } = await supabase
    .from("table_tabs")
    .select("id")
    .eq("table_id", tableId)
    .in("status", ["open", "bill_requested"])
    .maybeSingle();

  if (openTab) return { ok: false, error: "Masa are un bon deschis. Închide bonul înainte de dezactivare." };

  const { error } = await supabase
    .from("restaurant_tables")
    .update({ is_active: false })
    .eq("id", tableId)
    .eq("organisation_id", orgId);

  if (error) return { ok: false, error: "Eroare la dezactivare." };
  revalidateFloorPaths();
  return { ok: true };
}

// ── Tab actions ────────────────────────────────────────────────────────────────

export async function openTab(
  tableId: string,
  opts?: { coverCount?: number; notes?: string; siteId?: string | null }
): Promise<{ ok: true; tabId: string } | { ok: false; error: string }> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canOperate((membership as { role: string }).role)) {
    return { ok: false, error: "Nu ai permisiunea de a deschide bonuri." };
  }

  // Check table belongs to org
  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("id, is_active, organisation_id")
    .eq("id", tableId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (!table) return { ok: false, error: "Masa nu a fost găsită." };
  if (!table.is_active) return { ok: false, error: "Masa este dezactivată." };

  // Idempotency: check if there's already an open tab
  const { data: existingTab } = await supabase
    .from("table_tabs")
    .select("id, status")
    .eq("table_id", tableId)
    .in("status", ["open", "bill_requested"])
    .maybeSingle();

  if (existingTab) return { ok: false, error: "Masa are deja un bon deschis." };

  const { data: newTab, error } = await supabase
    .from("table_tabs")
    .insert({
      organisation_id: orgId,
      site_id: opts?.siteId ?? null,
      table_id: tableId,
      opened_by: user.id,
      status: "open",
      cover_count: opts?.coverCount ?? null,
      notes: opts?.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !newTab) return { ok: false, error: "Eroare la deschiderea bonului." };
  revalidateFloorPaths();
  return { ok: true, tabId: newTab.id };
}

export async function requestBill(tabId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, user } = await getActiveOrg();

  const update: Record<string, unknown> = { status: "bill_requested" };
  // bill_requested_at/by added when migration 057 applied — set if columns exist
  update.bill_requested_at = new Date().toISOString();
  update.bill_requested_by = user.id;

  const { error } = await supabase
    .from("table_tabs")
    .update(update)
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .eq("status", "open");

  if (error) {
    // Fallback without audit columns if migration not yet applied
    const { error: fallbackErr } = await supabase
      .from("table_tabs")
      .update({ status: "bill_requested" })
      .eq("id", tabId)
      .eq("organisation_id", orgId)
      .eq("status", "open");
    if (fallbackErr) return { ok: false, error: "Eroare la actualizarea statusului." };
  }

  revalidateFloorPaths();
  revalidatePath("/app/pos");
  return { ok: true };
}

export async function closeTab(tabId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId } = await getActiveOrg();

  const { error } = await supabase
    .from("table_tabs")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .in("status", ["open", "bill_requested"]);

  if (error) return { ok: false, error: "Eroare la închiderea bonului." };

  revalidateFloorPaths();
  return { ok: true };
}

export async function voidTab(tabId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot anula bonuri." };
  }

  const { error } = await supabase
    .from("table_tabs")
    .update({ status: "voided", closed_at: new Date().toISOString() })
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .in("status", ["open", "bill_requested"]);

  if (error) return { ok: false, error: "Eroare la anularea bonului." };

  await supabase
    .from("table_tab_items")
    .update({ status: "voided" })
    .eq("table_tab_id", tabId)
    .eq("organisation_id", orgId)
    .eq("status", "open");

  revalidateFloorPaths();
  return { ok: true };
}

export type TabPendingItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number | null;
  line_total: number;
};

export async function getTabPendingItems(
  tabId: string
): Promise<{ items: TabPendingItem[]; subtotal: number } | null> {
  const tab = await getTabWithTable(tabId);
  if (!tab || (tab.status !== "open" && tab.status !== "bill_requested")) return null;

  const { supabase, orgId } = await getActiveOrg();
  const { data } = await supabase
    .from("table_tab_items")
    .select("id, product_id, product_name, quantity, unit_price, vat_rate, line_total")
    .eq("organisation_id", orgId)
    .eq("table_tab_id", tabId)
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const items: TabPendingItem[] = (data ?? []).map((row) => ({
    id: String((row as { id: string }).id),
    product_id: (row as { product_id: string | null }).product_id,
    product_name: String((row as { product_name: string }).product_name),
    quantity: Number((row as { quantity: number }).quantity),
    unit_price: Number((row as { unit_price: number }).unit_price),
    vat_rate: (row as { vat_rate: number | null }).vat_rate != null
      ? Number((row as { vat_rate: number }).vat_rate)
      : null,
    line_total: Number((row as { line_total: number }).line_total),
  }));

  const subtotal = Number(items.reduce((s, i) => s + i.line_total, 0).toFixed(2));
  return { items, subtotal };
}

function parseTabCartJson(cartJson: string): PosCartLine[] {
  try {
    const parsed = JSON.parse(cartJson) as PosCartLine[];
    if (!Array.isArray(parsed) || !parsed.length) return [];
    return parsed.filter(
      (line) => line.product_id && line.product_name && Number(line.quantity) > 0
    );
  } catch {
    return [];
  }
}

export async function sendTabOrder(
  tabId: string,
  cartJson: string,
  opts?: { orderType?: string; kitchenNote?: string }
): Promise<{ ok: true; roundNumber: number } | { ok: false; error: string }> {
  const { supabase, orgId, membership, user } = await getActiveOrg();
  if (!canOperate((membership as { role: string }).role)) {
    return { ok: false, error: "Nu ai permisiunea de a trimite comenzi." };
  }

  const cart = parseTabCartJson(cartJson);
  if (!cart.length) return { ok: false, error: "Coșul este gol." };

  const tab = await getTabWithTable(tabId);
  if (!tab) return { ok: false, error: "Bonul mesei nu a fost găsit." };
  if (tab.status !== "open") {
    return { ok: false, error: "Masa este blocată — folosește nota de plată pentru încasare." };
  }

  const orgRow = Array.isArray(membership.organisations)
    ? (membership.organisations[0] as Record<string, unknown>)
    : (membership.organisations as Record<string, unknown> | null);

  const { count: roundCount } = await supabase
    .from("kitchen_orders")
    .select("id", { count: "exact", head: true })
    .eq("table_tab_id", tabId)
    .eq("organisation_id", orgId);

  const roundNumber = (roundCount ?? 0) + 1;
  const orderNumber = `${tab.table_name}-R${roundNumber}`;

  const kitchenOrderId = await createKitchenOrderForTab({
    supabase,
    orgId,
    userId: user.id,
    orgRow,
    tabId,
    siteId: tab.site_id,
    orderNumber,
    items: cart.map((line) => ({
      product_id: line.product_id,
      product_name: line.product_name,
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
    orderType: opts?.orderType ?? "dine-in",
    tableLabel: tab.table_name,
    note: opts?.kitchenNote ?? null,
  });

  const rows = cart.map((line) => {
    const gross = lineGrossAfter(line, 0);
    return {
      organisation_id: orgId,
      site_id: tab.site_id,
      table_tab_id: tabId,
      product_id: line.product_id || null,
      product_name: line.product_name,
      quantity: line.quantity,
      unit_price: line.unit_price,
      vat_rate: line.vat_rate ?? null,
      line_total: Number(gross.toFixed(2)),
      status: "open",
      kitchen_order_id: kitchenOrderId,
    };
  });

  const { error } = await supabase.from("table_tab_items").insert(rows);
  if (error) return { ok: false, error: "Eroare la salvarea comenzii." };

  revalidateFloorPaths();
  revalidatePath("/app/pos");
  revalidatePath("/app/kitchen");
  return { ok: true, roundNumber };
}

export async function transferTab(
  tabId: string,
  targetTableId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canOperate((membership as { role: string }).role)) {
    return { ok: false, error: "Nu ai permisiunea de a muta mese." };
  }

  const tab = await getTabWithTable(tabId);
  if (!tab || (tab.status !== "open" && tab.status !== "bill_requested")) {
    return { ok: false, error: "Bonul mesei nu este activ." };
  }

  if (tab.table_id === targetTableId) return { ok: true };

  const { data: targetTable } = await supabase
    .from("restaurant_tables")
    .select("id, is_active")
    .eq("id", targetTableId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (!targetTable?.is_active) return { ok: false, error: "Masa țintă nu este disponibilă." };

  const { data: existingOnTarget } = await supabase
    .from("table_tabs")
    .select("id")
    .eq("table_id", targetTableId)
    .in("status", ["open", "bill_requested"])
    .maybeSingle();

  if (existingOnTarget) return { ok: false, error: "Masa țintă are deja un bon deschis." };

  const { error } = await supabase
    .from("table_tabs")
    .update({ table_id: targetTableId })
    .eq("id", tabId)
    .eq("organisation_id", orgId);

  if (error) return { ok: false, error: "Eroare la mutarea mesei." };

  revalidateFloorPaths();
  revalidatePath("/app/pos");
  return { ok: true };
}

export async function updateTabCovers(
  tabId: string,
  coverCount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId } = await getActiveOrg();
  const count = Math.max(0, Math.floor(coverCount));
  if (count < 1) return { ok: false, error: "Număr invalid de persoane." };

  const { error } = await supabase
    .from("table_tabs")
    .update({ cover_count: count })
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .in("status", ["open", "bill_requested"]);

  if (error) return { ok: false, error: "Eroare la actualizarea numărului de persoane." };

  revalidateFloorPaths();
  revalidatePath("/app/pos");
  return { ok: true };
}

export async function voidTabLine(
  lineId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot anula linii." };
  }

  const { error } = await supabase
    .from("table_tab_items")
    .update({ status: "voided" })
    .eq("id", lineId)
    .eq("organisation_id", orgId)
    .eq("status", "open");

  if (error) return { ok: false, error: "Eroare la anularea liniei." };

  revalidateFloorPaths();
  revalidatePath("/app/pos");
  return { ok: true };
}

// ── Floor sections & layout ───────────────────────────────────────────────────

export async function getFloorSections(siteId?: string | null): Promise<FloorSection[]> {
  const { supabase, orgId } = await getActiveOrg();

  let query = supabase
    .from("restaurant_floor_sections")
    .select("*")
    .eq("organisation_id", orgId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (siteId) query = query.eq("site_id", siteId);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: String(row.id),
    organisation_id: String(row.organisation_id),
    site_id: (row.site_id as string | null) ?? null,
    name: String(row.name),
    sort_order: Number(row.sort_order ?? 0),
    background_preset: String(row.background_preset ?? "wood"),
    background_url: (row.background_url as string | null) ?? null,
    created_at: String(row.created_at),
  }));
}

export async function createFloorSection(
  name: string,
  siteId?: string | null
): Promise<{ ok: true; sectionId: string } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot adăuga secțiuni." };
  }

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Numele secțiunii este obligatoriu." };

  const { data, error } = await supabase
    .from("restaurant_floor_sections")
    .insert({
      organisation_id: orgId,
      site_id: siteId ?? null,
      name: trimmed,
      background_preset: "wood",
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "Eroare la crearea secțiunii." };
  revalidateFloorPaths();
  return { ok: true, sectionId: data.id };
}

export async function updateFloorSection(
  sectionId: string,
  patch: { name?: string; background_preset?: string; background_url?: string | null; sort_order?: number }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot modifica secțiuni." };
  }

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name.trim();
  if (patch.background_preset !== undefined) update.background_preset = patch.background_preset;
  if (patch.background_url !== undefined) update.background_url = patch.background_url;
  if (patch.sort_order !== undefined) update.sort_order = patch.sort_order;

  const { error } = await supabase
    .from("restaurant_floor_sections")
    .update(update)
    .eq("id", sectionId)
    .eq("organisation_id", orgId);

  if (error) return { ok: false, error: "Eroare la salvarea secțiunii." };
  revalidateFloorPaths();
  return { ok: true };
}

export async function deleteFloorSection(sectionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot șterge secțiuni." };
  }

  const { count } = await supabase
    .from("restaurant_tables")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionId)
    .eq("organisation_id", orgId)
    .eq("is_active", true);

  if ((count ?? 0) > 0) {
    return { ok: false, error: "Secțiunea are mese active. Mută mesele înainte de ștergere." };
  }

  const { error } = await supabase
    .from("restaurant_floor_sections")
    .delete()
    .eq("id", sectionId)
    .eq("organisation_id", orgId);

  if (error) return { ok: false, error: "Eroare la ștergerea secțiunii." };
  revalidateFloorPaths();
  return { ok: true };
}

export async function uploadFloorBackground(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot încărca imagini." };
  }

  const sectionId = String(formData.get("section_id") ?? "").trim();
  const file = formData.get("background_file") as File | null;
  if (!sectionId || !file || file.size === 0) {
    return { ok: false, error: "Fișier sau secțiune lipsă." };
  }

  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Format imagine neacceptat." };
  }

  try {
    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const path = `${orgId}/floor/${sectionId}/${Date.now()}.${ext}`;
    const { data: up, error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr || !up?.path) return { ok: false, error: "Eroare la încărcare." };

    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(up.path);
    const url = pub.publicUrl;

    const { error } = await supabase
      .from("restaurant_floor_sections")
      .update({ background_url: url })
      .eq("id", sectionId)
      .eq("organisation_id", orgId);
    if (error) return { ok: false, error: "Eroare la salvarea fundalului." };

    revalidateFloorPaths();
    return { ok: true, url };
  } catch {
    return { ok: false, error: "Eroare la încărcare." };
  }
}

export type TableLayoutPatch = {
  id: string;
  layout_x: number;
  layout_y: number;
  layout_w: number;
  layout_h: number;
  shape?: TableShapeKind;
};

export async function batchSaveFloorLayout(
  tables: TableLayoutPatch[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot salva planul." };
  }

  for (const table of tables) {
    const { error } = await supabase
      .from("restaurant_tables")
      .update({
        layout_x: table.layout_x,
        layout_y: table.layout_y,
        layout_w: table.layout_w,
        layout_h: table.layout_h,
        ...(table.shape ? { shape: table.shape } : {}),
      })
      .eq("id", table.id)
      .eq("organisation_id", orgId);

    if (error) return { ok: false, error: "Eroare la salvarea layout-ului." };
  }

  revalidateFloorPaths();
  return { ok: true };
}

// ── Settings: toggle table service on org ─────────────────────────────────────

export async function setTableServiceEnabled(enabled: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, orgId, membership } = await getActiveOrg();
  if (!canManage((membership as { role: string }).role)) {
    return { ok: false, error: "Doar managerii pot modifica setările." };
  }

  if (enabled) {
    try {
      await assertEntitlement(orgId, "kitchen.table_service");
    } catch (error) {
      if (error instanceof EntitlementDeniedError) {
        return { ok: false, error: "Planul tău nu include gestionarea meselor." };
      }
      throw error;
    }
  }

  const { error } = await supabase
    .from("organisations")
    .update({ table_service_enabled: enabled })
    .eq("id", orgId);

  if (error) return { ok: false, error: "Eroare la salvarea setării." };
  revalidatePath("/app/settings/tables");
  revalidateFloorPaths();
  revalidatePath("/app/pos");
  revalidatePath("/app", "layout");
  return { ok: true };
}
