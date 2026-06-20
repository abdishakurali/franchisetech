import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getActiveOrg() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const selectedOrgId = cookieStore.get("franchisetech_active_org_id")?.value ?? null;

  const { data: memberships, error: memError } = await supabase
    .from("organisation_members")
    .select("id, organisation_id, role, status, organisations(id, name, business_type, country, country_code, currency_code, currency_symbol, kitchen_display_enabled, restaurant_order_flow_enabled, table_service_enabled, order_types_enabled, kitchen_stations_enabled, product_modifiers_enabled, courses_enabled, kitchen_printing_enabled, payment_split_enabled, tips_enabled, compact_workstation_nav_enabled, fiscalnet_enabled, fiscalnet_mock_mode, fiscalnet_connection_mode, fiscalnet_api_host, fiscalnet_bonuri_path, fiscalnet_raspuns_path, fiscalnet_auto_print, fiscalnet_ask_before_print, fiscalnet_manual_only, fiscalnet_timeout_ms, fiscalnet_retry_count, fiscalnet_cif, fiscalnet_operator_code, fiscalnet_vat_groups, fiscalnet_payment_type_map)")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active")
    .order("created_at", { ascending: true });

  if (memError) {
    console.error("membership_query_failed", { code: memError.code, message: memError.message });
  }

  const membership = memberships?.length
    ? (selectedOrgId
        ? memberships.find((m) => m.organisation_id === selectedOrgId) ?? memberships[0]
        : memberships[0])
    : null;

  if (!membership) redirect("/onboarding");
  // Derive currency from org settings (country_code RO -> RON, else EUR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgRow = (membership as any).organisations;
  const orgInfo = Array.isArray(orgRow) ? orgRow[0] : orgRow;
  const currency: string = orgInfo?.currency_code ?? "EUR";
  const currencySymbol: string = orgInfo?.currency_symbol ?? "€";
  return { supabase, user, membership, orgId: membership.organisation_id, currency, currencySymbol };
}

export function money(value: number | null | undefined) {
  return formatCurrency(value, "EUR", "€");
}

export function formatCurrency(value: number | string | null | undefined, code = "EUR", symbol = "€") {
  const n = Number(value ?? 0);
  const amount = Number.isFinite(n) ? n : 0;
  if (code === "RON") return `${amount.toFixed(2)} lei`;
  if (symbol) return `${symbol}${amount.toFixed(2)}`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: code || "EUR" }).format(amount);
}

export function numberValue(formData: FormData, key: string, fallback = 0) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export type SaleItemRow = {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
};

export function parseSalesCsv(csv: string): SaleItemRow[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const index = (names: string[]) => names.map((name) => headers.indexOf(name)).find((i) => i >= 0) ?? -1;
  const nameIdx = index(["product name", "product", "item", "name"]);
  const qtyIdx = index(["quantity", "qty"]);
  const unitIdx = index(["unit price", "price"]);
  const totalIdx = index(["total", "total amount", "amount"]);
  if (nameIdx < 0) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const quantity = Number(cols[qtyIdx] || 1) || 1;
    const unitPrice = Number(cols[unitIdx] || 0) || 0;
    const total = Number(cols[totalIdx] || quantity * unitPrice) || quantity * unitPrice;
    return {
      product_name: cols[nameIdx] || "Imported item",
      quantity,
      unit_price: unitPrice,
      total_amount: total,
    };
  });
}
