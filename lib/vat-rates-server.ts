import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrgVatRate } from "@/lib/vat-rates";
import { VAT_DEFAULTS_BY_COUNTRY } from "@/lib/vat-rates";

export async function listActiveVatRates(
  supabase: SupabaseClient,
  orgId: string
): Promise<OrgVatRate[]> {
  const { data } = await supabase
    .from("vat_rates")
    .select("id,name,rate,is_default,active,fiscalnet_vat_group,sort_order")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("sort_order")
    .order("rate");
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    rate: Number(row.rate),
    is_default: row.is_default as boolean | null,
    active: row.active as boolean | null,
    fiscalnet_vat_group: row.fiscalnet_vat_group as number | null,
    sort_order: row.sort_order as number | null,
  }));
}

export async function listAllVatRates(
  supabase: SupabaseClient,
  orgId: string
): Promise<OrgVatRate[]> {
  const { data } = await supabase
    .from("vat_rates")
    .select("id,name,rate,is_default,active,fiscalnet_vat_group,sort_order")
    .eq("organisation_id", orgId)
    .order("sort_order")
    .order("rate");
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    rate: Number(row.rate),
    is_default: row.is_default as boolean | null,
    active: row.active as boolean | null,
    fiscalnet_vat_group: row.fiscalnet_vat_group as number | null,
    sort_order: row.sort_order as number | null,
  }));
}

/**
 * vatRegistered defaults to false because it always is at the point this
 * runs: it's called from org creation, before ANAF
 * registration status is ever known or asked about. A RO org keeps 0% as
 * its selling default, while all standard rates remain active so purchase
 * documents can record supplier VAT independently. The selling path applies
 * the ANAF registration gate separately. Non-RO countries are unaffected.
 */
export async function seedOrgVatRatesIfEmpty(
  supabase: SupabaseClient,
  orgId: string,
  countryCode: string | null | undefined,
  vatRegistered: boolean = false
): Promise<void> {
  const { count } = await supabase
    .from("vat_rates")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId);
  if ((count ?? 0) > 0) return;

  const code = (countryCode ?? "IE").toUpperCase();
  const defaults = VAT_DEFAULTS_BY_COUNTRY[code] ?? VAT_DEFAULTS_BY_COUNTRY.IE;
  const gateByRegistration = code === "RO" && !vatRegistered;
  const rows = defaults.map((d, i) => ({
    organisation_id: orgId,
    name: d.name,
    rate: d.rate,
    fiscalnet_vat_group: d.fiscalnet_vat_group,
    is_default: gateByRegistration ? d.rate === 0 : d.is_default,
    active: true,
    sort_order: i + 1,
  }));
  await supabase.from("vat_rates").insert(rows);
}
