import type { SupabaseClient } from "@supabase/supabase-js";

export type TableTabSaleValidation =
  | { ok: true; tableName: string | null }
  | { ok: false; error: string };

/** Validates tab before sale insert — only called when table_service_enabled and tabId provided. */
export async function validateTableTabForSale(
  supabase: SupabaseClient,
  orgId: string,
  tabId: string,
  userRole: string | null
): Promise<TableTabSaleValidation> {
  const { data: tab } = await supabase
    .from("table_tabs")
    .select(`
      id, status, organisation_id,
      restaurant_tables ( name )
    `)
    .eq("id", tabId)
    .eq("organisation_id", orgId)
    .maybeSingle();

  if (!tab) return { ok: false, error: "Bonul mesei nu a fost găsit." };

  const status = tab.status as string;
  if (status !== "open" && status !== "bill_requested") {
    return { ok: false, error: "Bonul mesei nu este activ." };
  }

  const isManager = ["owner", "manager"].includes(userRole ?? "");
  if (status === "bill_requested" && !isManager) {
    return { ok: false, error: "Masa este blocată — nota de plată a fost solicitată." };
  }

  const tableRow = tab.restaurant_tables as { name: string } | { name: string }[] | null;
  const tableName = Array.isArray(tableRow) ? tableRow[0]?.name ?? null : tableRow?.name ?? null;

  return { ok: true, tableName };
}

/** Links final sale to tab — non-blocking; errors are swallowed. */
export async function linkSaleToTableTab(
  supabase: SupabaseClient,
  orgId: string,
  tabId: string,
  transactionId: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("pos_transactions")
      .select("table_tab_id")
      .eq("id", transactionId)
      .maybeSingle();

    if (existing?.table_tab_id) return;

    const { data: tab } = await supabase
      .from("table_tabs")
      .select("id, status")
      .eq("id", tabId)
      .eq("organisation_id", orgId)
      .in("status", ["open", "bill_requested"])
      .maybeSingle();

    if (!tab) return;

    await supabase
      .from("pos_transactions")
      .update({ table_tab_id: tabId })
      .eq("id", transactionId)
      .eq("organisation_id", orgId);
  } catch {
    // Non-fatal — sale already saved
  }
}

/** Settles open tab items, links sale, and closes tab — non-blocking. */
export async function settleTabAndClose(
  supabase: SupabaseClient,
  orgId: string,
  tabId: string,
  transactionId: string
): Promise<void> {
  try {
    await linkSaleToTableTab(supabase, orgId, tabId, transactionId);

    const { data: tab } = await supabase
      .from("table_tabs")
      .select("id, status")
      .eq("id", tabId)
      .eq("organisation_id", orgId)
      .in("status", ["open", "bill_requested"])
      .maybeSingle();

    if (!tab) return;

    await supabase
      .from("table_tab_items")
      .update({
        status: "settled",
        settled_transaction_id: transactionId,
      })
      .eq("table_tab_id", tabId)
      .eq("organisation_id", orgId)
      .eq("status", "open");

    await supabase
      .from("table_tabs")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", tabId)
      .eq("organisation_id", orgId)
      .in("status", ["open", "bill_requested"]);
  } catch {
    // Non-fatal — sale already saved
  }
}

/** @deprecated Use settleTabAndClose on final payment. */
export async function linkSaleToTableTabAndClose(
  supabase: SupabaseClient,
  orgId: string,
  tabId: string,
  transactionId: string
): Promise<void> {
  await settleTabAndClose(supabase, orgId, tabId, transactionId);
}
