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
 * runs: it's called from org creation / ensurePosDefaults, before ANAF
 * registration status is ever known or asked about. A RO org is seeded
 * with only its 0% rate active and default; 21%/11% are still created (so
 * the rate definitions exist, unchanged, for later) but inactive — matching
 * the shape the Gate A fix leaves an unregistered org's catalog in, and
 * required by the vat_rates registration trigger: without this, seeding a
 * brand-new unregistered RO org's default 21%-active-and-default row would
 * fail against that trigger the moment it runs. Non-RO countries (no ANAF
 * concept) are unaffected regardless of the flag.
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
    active: gateByRegistration ? d.rate === 0 : true,
    sort_order: i + 1,
  }));
  await supabase.from("vat_rates").insert(rows);
}
