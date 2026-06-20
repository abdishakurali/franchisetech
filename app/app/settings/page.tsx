import { addCategory, updateCategory, deleteCategory, addUnit, updateUnit, deleteUnit, updateOrgCountry, updateOrgCurrency, updateOrganisationIndustry, updateBusinessCapabilities, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, addVatRate, updateVatRate, deleteVatRate, seedDefaultVatRates } from "@/app/actions/kitchenops";
import { PaymentMethodsCard } from "@/components/app/PaymentMethodsCard";
import { VatRatesCard } from "@/components/app/VatRatesCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import Link from "next/link";
import { CopyReferralButton } from "@/components/app/CopyReferralButton";
import { ensureReferralCode } from "@/lib/referrals";
import { CashDrawerSettingsCard } from "@/components/app/CashDrawerSettingsCard";
import { FiscalNetSettingsCard } from "@/components/app/FiscalNetSettingsCard";
import { SettingsTabNav } from "@/components/app/SettingsTabNav";
import type { CashDrawerMode } from "@/lib/cash-drawer";
import { BusinessCapabilitiesCard } from "@/components/app/BusinessCapabilitiesCard";
import { FormSelect } from "@/components/app/FormSelect";
import { AppLocaleSwitcher } from "@/components/app/AppLocaleSwitcher";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import type { BillingPlan } from "@/lib/billing/plans";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import {
  INDUSTRY_OPTIONS,
  RESTAURANT_FEATURE_KEYS,
  getSuggestedFeaturesForIndustry,
} from "@/lib/restaurant-features";

const DEFAULT_UNITS = ["each","portion","kg","g","litre","ml","cup","bottle","box","case","pack"];
const DEFAULT_CASH_DRAWER = {
  cash_drawer_mode: "manual" as CashDrawerMode,
  cash_drawer_connector_port: 17878,
  cash_drawer_connector_token: null as string | null,
  cash_drawer_trigger_on_cash_sale: true,
  cash_drawer_trigger_on_cash_in: true,
  cash_drawer_trigger_on_cash_out: true,
  cash_drawer_last_status: "Not checked",
};

const COUNTRY_OPTIONS = [
  { code: "IE", label: "Ireland" },
  { code: "RO", label: "Romania" },
  { code: "UK", label: "United Kingdom" },
  { code: "OTHER", label: "Other" },
] as const;

/** Map legacy free-text country to a normalised code */
function resolveCountryCode(
  code: string | null | undefined,
  legacyText: string | null | undefined
): string {
  const ALLOWED = ["IE", "RO", "UK", "OTHER"];
  if (code && ALLOWED.includes(code)) return code;
  if (!legacyText) return "IE";
  const c = legacyText.toLowerCase().trim();
  if (c === "ireland") return "IE";
  if (c === "romania") return "RO";
  if (c === "united kingdom" || c === "uk") return "UK";
  return "OTHER";
}

function canManage(role: string | null | undefined) {
  return ["owner", "manager"].includes(role ?? "");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; locked?: string; msg?: string }>;
}) {
  const params = await searchParams;
  const rawTab = params?.tab ?? "business";
  const activeTab = rawTab === "modules" ? "features" : rawTab;
  const lockedModule = params?.locked ?? null;
  const lockedMessage = params?.msg ? decodeURIComponent(params.msg) : null;

  const { supabase, orgId, membership, user } = await getKitchenOpsContext();

  // ── Org row (from membership join) ───────────────────────────────────
  const orgRow = (
    Array.isArray(membership.organisations)
      ? membership.organisations[0]
      : membership.organisations
  ) as Record<string, unknown> | null;

  const org = orgRow as { id?: string; name?: string; business_type?: string } | null;
  const canEdit = canManage(membership.role);

  // Resolve country (handle legacy free-text field)
  const rawCode     = (orgRow?.country_code as string) ?? null;
  const legacyText  = (orgRow?.country as string) ?? null;
  const countryCode = resolveCountryCode(rawCode, legacyText);
  const isRO        = countryCode === "RO";
  const currencyCode = (orgRow?.currency_code as string) ?? "EUR";

  // ── Data fetching ────────────────────────────────────────────────────
  const [
    { data: categories },
    { data: profile },
    { data: paymentMethods },
    { data: vatRates },
  ] = await Promise.all([
    supabase.from("product_categories").select("*").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("payment_methods").select("*").eq("organisation_id", orgId).order("created_at"),
    supabase.from("vat_rates").select("*").eq("organisation_id", orgId).order("sort_order"),
  ]);

  const fiscalnetEnabled = Boolean(orgRow?.fiscalnet_enabled ?? false);

  // Cash drawer
  let drawerOrg = DEFAULT_CASH_DRAWER;
  try {
    const { data, error } = await supabase
      .from("organisations")
      .select("cash_drawer_mode,cash_drawer_connector_port,cash_drawer_connector_token,cash_drawer_trigger_on_cash_sale,cash_drawer_trigger_on_cash_in,cash_drawer_trigger_on_cash_out,cash_drawer_last_status")
      .eq("id", orgId)
      .maybeSingle();
    if (!error && data) drawerOrg = { ...DEFAULT_CASH_DRAWER, ...data };
  } catch { drawerOrg = DEFAULT_CASH_DRAWER; }

  // Units
  let unitsResult: { data: Array<{ id: string; name: string; abbreviation: string | null; organisation_id: string | null }> } = { data: [] };
  try {
    const { data: u } = await supabase
      .from("units_of_measure")
      .select("id,name,abbreviation,organisation_id")
      .or(`organisation_id.eq.${orgId},organisation_id.is.null`)
      .order("name");
    unitsResult = { data: (u ?? []) as typeof unitsResult.data };
  } catch { /* table not yet created */ }

  const customUnits = unitsResult.data.filter((u) => u.organisation_id === orgId);
  const customUnitNames = new Set(customUnits.map((u) => u.name));
  const globalUnitNames = unitsResult.data.filter((u) => u.organisation_id === null).map((u) => u.name);
  const defaultUnits = [...new Set([...DEFAULT_UNITS, ...globalUnitNames].filter((u) => !customUnitNames.has(u)))];

  // Referrals
  const referral = await ensureReferralCode(orgId).catch(() => ({
    available: false, link: null, code: null, creditMonths: 0, daysLeft: null, referrals: [],
  }));

  const sub = await getSubscriptionStatus(orgId).catch(() => null);
  const subscriptionPlan = (sub?.plan === "starter" || sub?.plan === "pro" || sub?.plan === "multi_location")
    ? sub.plan as BillingPlan
    : null;
  const hasTrial = sub?.state === "trialing" || sub?.state === "soft_trial";
  const appLocale = (profile?.locale as string | null) ?? null;
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);

  // ── Tab list ─────────────────────────────────────────────────────────
  const tabs = [
    { id: "business",  label: "Business"  },
    { id: "features",  label: "Features"  },
    { id: "products",  label: "Products"  },
    { id: "hardware",  label: "Hardware"  },
    ...(isRO ? [{ id: "fiscal", label: "Receipts" }] : []),
    { id: "billing",   label: "Billing"   },
  ];

  return (
    <div className="settings-page-wrapper max-w-4xl p-4 sm:p-6">
      <div className="settings-page-heading mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Keep business details, products, payments, and hardware simple.</p>
      </div>

      {/* Horizontal tab nav */}
      <SettingsTabNav tabs={tabs} />

      {/* ── BUSINESS TAB ─────────────────────────────────────────────── */}
      {activeTab === "business" && (
        <div className="space-y-6">
          {/* Business profile */}
          <Card>
            <CardHeader><CardTitle>Business profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Business name</p>
                  <p className="font-medium">{org?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Business type</p>
                  <p className="font-medium capitalize">{org?.business_type ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Your name</p>
                  <p className="font-medium">{profile?.full_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <Link href="/app/profile" className="inline-flex text-sm text-blue-600 hover:underline">
                Edit profile &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business type</CardTitle>
              <CardDescription>Used for setup suggestions only. It never turns features on automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit ? (
                <form action={updateOrganisationIndustry as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="business_type">Industry</Label>
                    <FormSelect
                      name="business_type"
                      defaultValue={org?.business_type ?? "other"}
                      className="mt-1"
                      options={INDUSTRY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                    />
                  </div>
                  <Button type="submit" variant="outline">Save business type</Button>
                </form>
              ) : (
                <p className="text-sm font-medium">{INDUSTRY_OPTIONS.find((o) => o.value === org?.business_type)?.label ?? org?.business_type ?? "Other"}</p>
              )}
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {getSuggestedFeaturesForIndustry(org?.business_type).length
                  ? `Suggested options for your industry are highlighted in Features. Nothing turns on automatically.`
                  : "Open Features to choose stock, kitchen, payments, and other options for this business."}
              </div>
            </CardContent>
          </Card>

          {/* Business country — editable by owner/manager */}
          <Card>
            <CardHeader>
              <CardTitle>Business country</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Used to determine which local features are available.
                Enable receipt settings only for businesses that need local receipt workflows.
              </p>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <form
                  action={updateOrgCountry as unknown as (fd: FormData) => Promise<void>}
                  className="flex flex-wrap items-end gap-4"
                >
                  <div>
                    <Label htmlFor="country_code">Country</Label>
                    <FormSelect
                      name="country_code"
                      defaultValue={countryCode}
                      className="mt-1"
                      options={COUNTRY_OPTIONS.map((opt) => ({ value: opt.code, label: opt.label }))}
                    />
                  </div>
                  <Button type="submit" variant="outline" className="mb-0.5">
                    Save country
                  </Button>
                </form>
              ) : (
                <p className="text-sm font-medium">
                  {COUNTRY_OPTIONS.find((o) => o.code === countryCode)?.label ?? countryCode}
                  <span className="ml-2 text-xs text-slate-400">(contact your account owner to change)</span>
                </p>
              )}
              {isRO && (
                <p className="mt-3 text-xs text-green-700 bg-green-50 rounded px-3 py-2">
                  Receipt settings are now visible for this business.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle>Currency</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                The currency shown across the entire app — POS, reports, products, and transactions.
              </p>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <form
                  action={updateOrgCurrency as unknown as (fd: FormData) => Promise<void>}
                  className="flex flex-wrap items-end gap-4"
                >
                  <div>
                    <Label htmlFor="currency_code">Currency</Label>
                    <FormSelect
                      name="currency_code"
                      defaultValue={currencyCode}
                      className="mt-1"
                      options={[
                        { value: "EUR", label: "EUR — Euro (€)" },
                        { value: "RON", label: "RON — Romanian Leu (lei)" },
                        { value: "GBP", label: "GBP — British Pound (£)" },
                        { value: "USD", label: "USD — US Dollar ($)" },
                        { value: "DKK", label: "DKK — Danish Krone (kr)" },
                        { value: "SEK", label: "SEK — Swedish Krona (kr)" },
                        { value: "NOK", label: "NOK — Norwegian Krone (kr)" },
                        { value: "CHF", label: "CHF — Swiss Franc (Fr)" },
                        { value: "PLN", label: "PLN — Polish Złoty (zł)" },
                        { value: "CZK", label: "CZK — Czech Koruna (Kč)" },
                        { value: "HUF", label: "HUF — Hungarian Forint (Ft)" },
                      ]}
                    />
                  </div>
                  <Button type="submit" variant="outline" className="mb-0.5">
                    Save currency
                  </Button>
                </form>
              ) : (
                <p className="text-sm font-medium">{currencyCode}
                  <span className="ml-2 text-xs text-slate-400">(contact your account owner to change)</span>
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5 space-y-2">
                <Label>Language</Label>
                <p className="text-sm text-slate-500">
                  POS and register interface language for this device.
                </p>
                <AppLocaleSwitcher orgIsRO={isRO} />
              </div>
            </CardContent>
          </Card>

          {/* Payment methods */}
          <PaymentMethodsCard
            methods={(paymentMethods ?? []) as Array<{ id: string; name: string; type: string; active: boolean; fiscalnet_code?: number | null }>}
            fiscalnetEnabled={fiscalnetEnabled}
            canEdit={canEdit}
            addAction={addPaymentMethod as unknown as (fd: FormData) => Promise<void>}
            updateAction={updatePaymentMethod as unknown as (fd: FormData) => Promise<void>}
            deleteAction={deletePaymentMethod as unknown as (fd: FormData) => Promise<void>}
          />

          {/* VAT Rates */}
          {canEdit && (vatRates ?? []).length === 0 && (
            <form action={seedDefaultVatRates as unknown as (fd: FormData) => Promise<void>} className="mb-2">
              <input type="hidden" name="country_code" value={countryCode} />
              <Button type="submit" variant="outline" size="sm">
                Add standard tax rates
              </Button>
            </form>
          )}
          <VatRatesCard
            rates={(vatRates ?? []) as Array<{ id: string; name: string; rate: number; is_default?: boolean | null; active?: boolean | null; fiscalnet_vat_group?: number | null }>}
            fiscalnetEnabled={fiscalnetEnabled}
            canEdit={canEdit}
            addAction={addVatRate as unknown as (fd: FormData) => Promise<void>}
            updateAction={updateVatRate as unknown as (fd: FormData) => Promise<void>}
            deleteAction={deleteVatRate as unknown as (fd: FormData) => Promise<void>}
          />

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Add staff, assign roles, and control access for your business.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/app/settings/team">
                <Button variant="outline">Manage team &rarr;</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {(activeTab === "features" || activeTab === "modules") && (
        <BusinessCapabilitiesCard
          industry={org?.business_type}
          org={{
            business_profile: moduleFlags.business_profile ?? null,
            inventory_enabled: moduleFlags.inventory_enabled,
            recipe_costing_enabled: moduleFlags.recipe_costing_enabled,
            team_advanced_enabled: moduleFlags.team_advanced_enabled,
            multi_site_ops_enabled: moduleFlags.multi_site_ops_enabled,
          }}
          featureValues={Object.fromEntries(
            RESTAURANT_FEATURE_KEYS.map((key) => [key, Boolean(orgRow?.[key])])
          )}
          canEdit={canEdit}
          subscriptionPlan={subscriptionPlan}
          hasTrial={hasTrial}
          locale={appLocale}
          lockedModule={lockedModule}
          lockedMessage={lockedMessage}
          updateAction={updateBusinessCapabilities}
        />
      )}

      {/* ── PRODUCTS TAB ─────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Product categories</CardTitle></CardHeader>
            <CardContent>
              <form
                action={addCategory as unknown as (fd: FormData) => Promise<void>}
                className="flex flex-wrap gap-3 items-end mb-4"
              >
                <div><Label>Name</Label><Input name="name" required placeholder="e.g. Hot Drinks" className="w-40" /></div>
                <div><Label>Colour</Label><Input name="color" type="color" defaultValue="#2563eb" className="h-10 w-16 p-1" /></div>
                <div><Label>Sort order</Label><Input name="sort_order" type="number" placeholder="1" className="w-20" /></div>
                <div>
                  <Label>{isRO ? "Tip categorie" : "Category type"}</Label>
                  <FormSelect
                    name="category_type"
                    defaultValue="both"
                    options={[
                      { value: "both", label: isRO ? "POS și inventar" : "POS & Inventory" },
                      { value: "pos", label: isRO ? "Doar POS" : "POS only" },
                      { value: "inventory", label: isRO ? "Doar inventar" : "Inventory only" },
                    ]}
                  />
                </div>
                <Button type="submit" variant="outline" size="sm">Add category</Button>
              </form>
              <div className="space-y-2">
                {(categories ?? []).map((c) => (
                  <form
                    key={c.id}
                    action={updateCategory as unknown as (fd: FormData) => Promise<void>}
                    className="grid gap-2 rounded-lg border border-slate-100 p-2 sm:grid-cols-[1fr_72px_90px_160px_auto_auto] sm:items-end"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <div><Label>Name</Label><Input name="name" defaultValue={c.name} required /></div>
                    <div><Label>Colour</Label><Input name="color" type="color" defaultValue={c.color ?? "#64748b"} className="h-10 w-16 p-1" /></div>
                    <div><Label>Sort</Label><Input name="sort_order" type="number" defaultValue={c.sort_order ?? 0} /></div>
                    <div>
                      <Label>{isRO ? "Tip" : "Type"}</Label>
                      <FormSelect
                        name="category_type"
                        defaultValue={(c as {category_type?: string}).category_type ?? "both"}
                        options={[
                          { value: "both", label: isRO ? "POS și inventar" : "POS & Inventory" },
                          { value: "pos", label: isRO ? "Doar POS" : "POS only" },
                          { value: "inventory", label: isRO ? "Doar inventar" : "Inventory only" },
                        ]}
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Save</Button>
                    <Button formAction={deleteCategory as unknown as (fd: FormData) => Promise<void>} type="submit" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">Delete</Button>
                  </form>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Units of measurement</CardTitle></CardHeader>
            <CardContent>
              <form
                action={addUnit as unknown as (fd: FormData) => Promise<void>}
                className="flex flex-wrap gap-3 items-end mb-4"
              >
                <div><Label>Unit name</Label><Input name="name" required placeholder="e.g. barrel, dozen" className="w-36" /></div>
                <div><Label>Abbreviation</Label><Input name="abbreviation" placeholder="brl" className="w-24" /></div>
                <Button type="submit" variant="outline" size="sm">Add unit</Button>
              </form>
              <div className="mb-4 flex flex-wrap gap-2">
                {defaultUnits.map((u) => (
                  <Badge key={u} variant="outline" className="text-slate-600">{u}</Badge>
                ))}
              </div>
              <div className="space-y-2">
                {customUnits.map((u) => (
                  <form
                    key={u.id}
                    action={updateUnit as unknown as (fd: FormData) => Promise<void>}
                    className="grid gap-2 rounded-lg border border-slate-100 p-2 sm:grid-cols-[1fr_120px_auto_auto] sm:items-end"
                  >
                    <input type="hidden" name="id" value={u.id} />
                    <div><Label>Unit name</Label><Input name="name" defaultValue={u.name} required /></div>
                    <div><Label>Abbreviation</Label><Input name="abbreviation" defaultValue={u.abbreviation ?? ""} /></div>
                    <Button type="submit" variant="outline" size="sm">Save</Button>
                    <Button formAction={deleteUnit as unknown as (fd: FormData) => Promise<void>} type="submit" variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">Delete</Button>
                  </form>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── HARDWARE TAB ─────────────────────────────────────────────── */}
      {activeTab === "hardware" && (
        <div className="space-y-6">
          <CashDrawerSettingsCard
            settings={{
              mode: drawerOrg?.cash_drawer_mode ?? "manual",
              port: drawerOrg?.cash_drawer_connector_port ?? 17878,
              token: drawerOrg?.cash_drawer_connector_token ?? null,
              triggerOnCashSale: drawerOrg?.cash_drawer_trigger_on_cash_sale ?? true,
              triggerOnCashIn: drawerOrg?.cash_drawer_trigger_on_cash_in ?? true,
              triggerOnCashOut: drawerOrg?.cash_drawer_trigger_on_cash_out ?? true,
              lastStatus: drawerOrg?.cash_drawer_last_status ?? "Not checked",
            }}
          />
          <div className="flex justify-end">
            <a href="/app/settings/cash-drawer-audit" className="text-sm text-blue-600 hover:underline">
              View cash drawer audit log &rarr;
            </a>
          </div>
        </div>
      )}

      {/* ── FISCAL TAB (RO only) ──────────────────────────────────────── */}
      {activeTab === "fiscal" && isRO && (
        <div className="space-y-6">
          <FiscalNetSettingsCard
            orgId={orgId}
            enabled={Boolean(orgRow?.fiscalnet_enabled ?? false)}
            mockMode={(orgRow?.fiscalnet_mock_mode as boolean) !== false}
            connectionMode={((orgRow?.fiscalnet_connection_mode as string) === "file" ? "file" : "api")}
            apiHost={(orgRow?.fiscalnet_api_host as string) || "http://localhost:65400"}
            bonuriPath={(orgRow?.fiscalnet_bonuri_path as string) || null}
            raspunsPath={(orgRow?.fiscalnet_raspuns_path as string) || null}
            autoPrint={Boolean(orgRow?.fiscalnet_auto_print ?? true)}
            askBeforePrint={Boolean(orgRow?.fiscalnet_ask_before_print ?? false)}
            manualOnly={Boolean(orgRow?.fiscalnet_manual_only ?? false)}
            timeoutMs={Number(orgRow?.fiscalnet_timeout_ms ?? 30000)}
            retryCount={Number(orgRow?.fiscalnet_retry_count ?? 2)}
            cif={(orgRow?.fiscalnet_cif as string) || null}
            operatorCode={(orgRow?.fiscalnet_operator_code as string) || "1"}
            vatGroups={(orgRow?.fiscalnet_vat_groups as import('@/lib/fiscalnet/types').VatGroup[]) ?? []}
            paymentTypeMap={(orgRow?.fiscalnet_payment_type_map as Record<string, import('@/lib/fiscalnet/types').FiscalPaymentCode>) ?? {}}
          />
        </div>
      )}

      {/* ── BILLING TAB ──────────────────────────────────────────────── */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {referral.available && referral.link && (
            <Card>
              <CardHeader>
                <CardTitle>Referrals</CardTitle>
                <p className="text-sm text-slate-500">
                  Share your link. You earn <strong>1 free month</strong> when your invited user
                  makes their first payment.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-500">Referral code</p>
                    <p className="font-medium">{referral.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Credit earned</p>
                    <p className="font-medium">
                      {referral.creditMonths} month{referral.creditMonths === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Trial</p>
                    <p className="font-medium">
                      {referral.daysLeft !== null ? `${referral.daysLeft} days left` : "15 days"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {referral.link}
                  </p>
                  <CopyReferralButton link={referral.link} />
                </div>
                {referral.creditMonths > 0 && (
                  <p className="text-sm text-blue-700">
                    Your free month credit is recorded and will be applied before billing.
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">People invited</p>
                  {referral.referrals.length ? (
                    referral.referrals.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border p-3 text-sm"
                      >
                        <span>{r.referred_email || "New business"}</span>
                        <span className="capitalize text-slate-500">
                          {r.status} &middot; {r.credit_months ?? 1} month
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No referrals yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Billing &amp; subscription</CardTitle></CardHeader>
            <CardContent>
              <Link href="/app/billing" className="inline-flex text-sm text-blue-600 hover:underline">
                Manage subscription &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
