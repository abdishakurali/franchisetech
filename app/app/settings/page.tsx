import {
  addCategory, updateCategory, deleteCategory,
  addUnit, updateUnit, deleteUnit,
  updateOrgCountry, updateOrgCurrency, updateOrganisationIndustry,
  addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  addVatRate, updateVatRate, deleteVatRate, seedDefaultVatRates,
} from "@/app/actions/kitchenops";
import { AnafSettingsCard } from "@/components/app/AnafSettingsCard";
import { TestimonialPromptCard } from "@/components/app/TestimonialPromptCard";
import { IntegrationCards } from "@/components/app/IntegrationCards";
import { PaymentMethodsCard } from "@/components/app/PaymentMethodsCard";
import { VatRatesCard } from "@/components/app/VatRatesCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { VAT_DEFAULTS_BY_COUNTRY } from "@/lib/vat-rates";
import Link from "next/link";
import { CopyReferralButton } from "@/components/app/CopyReferralButton";
import { ensureReferralCode } from "@/lib/referrals";
import { CashDrawerSettingsCard } from "@/components/app/CashDrawerSettingsCard";
import { FiscalNetSettingsCard } from "@/components/app/FiscalNetSettingsCard";
import { SettingsTabNav } from "@/components/app/SettingsTabNav";
import type { CashDrawerMode } from "@/lib/cash-drawer";
import { FormSelect } from "@/components/app/FormSelect";
import { AppLocaleSwitcher } from "@/components/app/AppLocaleSwitcher";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { createServiceClient } from "@/lib/supabase/server";
import { industryLabel, industryOptions } from "@/lib/restaurant-features-i18n";
import { getSuggestedFeaturesForIndustry } from "@/lib/restaurant-features";
import { DEFAULT_OPERATIONAL_UNITS } from "@/lib/units-of-measure";
import { CuiLookupCard } from "@/components/app/CuiLookupCard";
import { OwnerDigestCard, type OwnerDigestTeamMember } from "@/components/app/OwnerDigestCard";
import { BillingPanel } from "@/components/billing/BillingPanel";
import { CheckCircle2, Circle, AlertCircle, ExternalLink } from "lucide-react";

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

const TAB_ALIASES: Record<string, string> = {
  features: "operations",
  modules: "operations",
  products: "operations",
  hardware: "operations",
  anaf: "fiscal",
};

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
  searchParams?: Promise<{ tab?: string; locked?: string; msg?: string; reason?: string; checkout?: string; install_error?: string }>;
}) {
  const params = await searchParams;
  const rawTab = params?.tab ?? "business";
  const activeTab = TAB_ALIASES[rawTab] ?? rawTab;
  const lockedModule = params?.locked ?? null;
  const lockedMessage = params?.msg ? decodeURIComponent(params.msg) : null;

  const { supabase, orgId, membership, user, profileLocale } = await getKitchenOpsContext();

  const orgRow = (
    Array.isArray(membership.organisations)
      ? membership.organisations[0]
      : membership.organisations
  ) as Record<string, unknown> | null;

  const org = orgRow as { id?: string; name?: string; business_type?: string } | null;
  const canEdit = canManage(membership.role);

  const rawCode    = (orgRow?.country_code as string) ?? null;
  const legacyText = (orgRow?.country as string) ?? null;
  const countryCode = resolveCountryCode(rawCode, legacyText);
  const { locale, t } = getAppLocaleAndText(countryCode, profileLocale);
  const isRO        = countryCode === "RO";
  const currencyCode = (orgRow?.currency_code as string) ?? "EUR";

  // ── Data fetching ─────────────────────────────────────────────────────
  const [
    { data: categories },
    { data: profile },
    { data: paymentMethods },
    { data: vatRates },
  ] = await Promise.all([
    supabase.from("product_categories").select("*").eq("organisation_id", orgId).order("name"),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("payment_methods").select("*").eq("organisation_id", orgId).order("created_at"),
    supabase.from("vat_rates").select("*").eq("organisation_id", orgId).order("sort_order"),
  ]);

  // ANAF connection status (RO only)
  let anafConnected = false;
  const anafCif     = (orgRow?.anaf_cif as string | null) ?? "";
  const anafVatRegistered = Boolean(orgRow?.anaf_vat_registered ?? false);
  if (isRO) {
    const { count } = await supabase
      .from("anaf_oauth_tokens")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId);
    anafConnected = (count ?? 0) > 0;
  }

  const anafAuthUrl = isRO && process.env.ANAF_CLIENT_ID
    ? `https://logincert.anaf.ro/anaf-oauth2/v1/authorize?response_type=code&client_id=${process.env.ANAF_CLIENT_ID}&redirect_uri=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL ?? "https://franchisetech.ro") + "/api/anaf/auth/callback")}&token_content_type=jwt&state=${orgId}`
    : null;

  const fiscalnetEnabled = Boolean(orgRow?.fiscalnet_enabled ?? false);
  const efacturaEnabled = Boolean(orgRow?.efactura_enabled ?? false);

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

  const customUnits      = unitsResult.data.filter((u) => u.organisation_id === orgId);
  const customUnitNames  = new Set(customUnits.map((u) => u.name));
  const globalUnitNames  = unitsResult.data.filter((u) => u.organisation_id === null).map((u) => u.name);
  const defaultUnits     = [...new Set([...DEFAULT_OPERATIONAL_UNITS, ...globalUnitNames].filter((u) => !customUnitNames.has(u)))];

  // Referrals
  const referral = await ensureReferralCode(orgId).catch(() => ({
    available: false, link: null, code: null, creditMonths: 0, daysLeft: null, referrals: [],
  }));

  // CUI / fiscal identity
  const fiscalnetCif     = (orgRow?.fiscalnet_cif as string | null) ?? "";
  const taxIdVerified    = Boolean(orgRow?.tax_id_verified ?? false);
  const companyLegalName = (orgRow?.company_legal_name as string | null) ?? "";
  const companyAddress   = (orgRow?.company_address as string | null) ?? "";

  const digestAllowed = await hasEntitlement(orgId, "owner_digest.enabled", { write: false });
  const ownerDigestFrequency: "off" | "daily" | "weekly" =
    orgRow?.owner_digest_frequency === "daily" || orgRow?.owner_digest_frequency === "weekly"
      ? orgRow.owner_digest_frequency
      : "off";
  const ownerDigestInitial = {
    enabled: Boolean(orgRow?.owner_digest_enabled ?? false),
    frequency: ownerDigestFrequency,
    dayOfWeek: Number(orgRow?.owner_digest_day_of_week ?? 1),
    timeOfDay: String(orgRow?.owner_digest_time_of_day ?? "08:00").slice(0, 5),
    timezone: String(orgRow?.owner_digest_timezone ?? "Europe/Bucharest"),
    recipients: Array.isArray(orgRow?.owner_digest_recipients)
      ? (orgRow.owner_digest_recipients as string[])
      : [],
  };
  let digestTeamMembers: OwnerDigestTeamMember[] = [];
  if (canEdit) {
    const service = await createServiceClient();
    const { data: members } = await service
      .from("organisation_members")
      .select("id,user_id,role,status")
      .eq("organisation_id", orgId)
      .or("status.is.null,status.eq.active")
      .order("created_at", { ascending: true });
    const userIds = (members ?? []).map((m) => m.user_id).filter(Boolean);
    const { data: profiles } = userIds.length
      ? await service.from("profiles").select("id,full_name,email").in("id", userIds)
      : { data: [] };
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    digestTeamMembers = (members ?? [])
      .map((member) => {
        const profile = profileById.get(member.user_id);
        const email = profile?.email ?? (member.user_id === user.id ? user.email : null);
        if (!email) return null;
        return {
          id: member.id,
          name: profile?.full_name ?? email,
          email,
          role: member.role ?? "staff",
        };
      })
      .filter((member): member is OwnerDigestTeamMember => Boolean(member));
  }

  // BC series + accountant setup completion (RO only)
  let latestBcNumber: string | null = null;
  let bcCount = 0;
  let sagaProductCount = 0;
  if (isRO) {
    const [bcLatest, bcTotal, sagaCount] = await Promise.all([
      supabase
        .from("bon_consum_documents")
        .select("bc_number")
        .eq("organisation_id", orgId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("bon_consum_documents")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", orgId),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", orgId)
        .not("saga_article_code", "is", null),
    ]);
    latestBcNumber = bcLatest.data?.[0]?.bc_number ?? null;
    bcCount = bcTotal.count ?? 0;
    sagaProductCount = sagaCount.count ?? 0;
  }

  const sagaGestiuneCode = (orgRow?.saga_gestiune_code as string | null) ?? null;
  const sagaInstalled = Boolean(orgRow?.saga_export_enabled ?? false);
  const accountantStepsDone = [
    !!fiscalnetCif,
    !!sagaGestiuneCode,
    sagaProductCount > 0,
    false, // compliance documents — cannot check in DB
  ].filter(Boolean).length;

  // ── Tabs ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: "business",     label: t.settings.tabBusiness },
    { id: "operations",   label: isRO ? "Operațiuni" : "Operations" },
    ...(isRO && (fiscalnetEnabled || efacturaEnabled || sagaInstalled)
      ? [{ id: "fiscal", label: "Fiscal" }]
      : []),
    { id: "integrations", label: "Marketplace" },
    { id: "notifications",label: isRO ? "Notificări" : t.settings.tabNotifications },
    { id: "billing",      label: t.settings.tabBilling },
    { id: "team", label: isRO ? "Echipă" : "Team", href: "/app/settings/team" },
  ];

  return (
    <div className="settings-page-wrapper max-w-4xl p-4 sm:p-6">
      <div className="settings-page-heading mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">{t.settings.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.settings.subtitleSimple}</p>
      </div>

      <SettingsTabNav tabs={tabs} />

      {/* ── BUSINESS TAB ─────────────────────────────────────────────── */}
      {activeTab === "business" && (
        <div className="space-y-6">
          {/* CUI autofill (RO only) */}
          {isRO && (
            <CuiLookupCard
              initialCui={fiscalnetCif}
              initialVerified={taxIdVerified}
              initialDenumire={companyLegalName}
              initialAdresa={companyAddress}
              initialVatRegistered={anafVatRegistered}
              canEdit={canEdit}
            />
          )}

          {/* Business profile */}
          <Card>
            <CardHeader><CardTitle>{t.settings.business.profileTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">{t.settings.business.businessName}</p>
                  <p className="font-medium">{org?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.settings.business.businessType}</p>
                  <p className="font-medium capitalize">{industryLabel(org?.business_type, locale)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.settings.business.yourName}</p>
                  <p className="font-medium">{profile?.full_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t.settings.business.email}</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <Link href="/app/profile" className="inline-flex text-sm text-blue-600 hover:underline">
                {t.settings.business.editProfile}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.business.businessTypeTitle}</CardTitle>
              <CardDescription>{t.settings.business.businessTypeDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit ? (
                <form action={updateOrganisationIndustry as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="business_type">{t.settings.business.industry}</Label>
                    <FormSelect
                      name="business_type"
                      defaultValue={org?.business_type ?? "other"}
                      className="mt-1"
                      options={industryOptions(locale)}
                    />
                  </div>
                  <Button type="submit" variant="outline">{t.settings.business.saveBusinessType}</Button>
                </form>
              ) : (
                <p className="text-sm font-medium">{industryLabel(org?.business_type, locale)}</p>
              )}
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {getSuggestedFeaturesForIndustry(org?.business_type).length
                  ? t.settings.business.suggestedFeaturesHighlight
                  : t.settings.business.openFeaturesHint}
              </div>
            </CardContent>
          </Card>

          {/* Country */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.business.countryTitle}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{t.settings.business.countryDesc}</p>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <form action={updateOrgCountry as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="country_code">{t.settings.business.country}</Label>
                    <FormSelect
                      name="country_code"
                      defaultValue={countryCode}
                      className="mt-1"
                      options={COUNTRY_OPTIONS.map((opt) => ({ value: opt.code, label: opt.label }))}
                    />
                  </div>
                  <Button type="submit" variant="outline" className="mb-0.5">{t.settings.business.saveCountry}</Button>
                </form>
              ) : (
                <p className="text-sm font-medium">
                  {COUNTRY_OPTIONS.find((o) => o.code === countryCode)?.label ?? countryCode}
                  <span className="ml-2 text-xs text-slate-400">{t.settings.business.contactOwner}</span>
                </p>
              )}
              {isRO && (
                <p className="mt-3 text-xs text-green-700 bg-green-50 rounded px-3 py-2">
                  {t.settings.business.receiptsVisible}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.business.currencyTitle}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{t.settings.business.currencyDesc}</p>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <form action={updateOrgCurrency as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="currency_code">{t.settings.business.currencyTitle}</Label>
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
                  <Button type="submit" variant="outline" className="mb-0.5">{t.settings.business.saveCurrency}</Button>
                </form>
              ) : (
                <p className="text-sm font-medium">{currencyCode}
                  <span className="ml-2 text-xs text-slate-400">{t.settings.business.contactOwner}</span>
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5 space-y-2">
                <Label>{t.settings.business.language}</Label>
                <p className="text-sm text-slate-500">{t.settings.business.languageDesc}</p>
                <AppLocaleSwitcher key={locale} initialLocale={locale} />
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

          {/* VAT rates */}
          {canEdit && (() => {
            const defaults = VAT_DEFAULTS_BY_COUNTRY[countryCode] ?? [];
            const existing = new Set((vatRates ?? []).map((r) => Number(r.rate)));
            return defaults.some((d) => !existing.has(d.rate));
          })() && (
            <form action={seedDefaultVatRates as unknown as (fd: FormData) => Promise<void>} className="mb-2">
              <input type="hidden" name="country_code" value={countryCode} />
              <Button type="submit" variant="outline" size="sm">{t.settings.business.addStandardTax}</Button>
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

        </div>
      )}

      {/* ── OPERATIONS TAB ───────────────────────────────────────────── */}
      {activeTab === "operations" && (
        <div className="space-y-6">
          {lockedModule && lockedMessage ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle>Modul indisponibil</CardTitle>
                <CardDescription>{lockedMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/app/settings?tab=integrations">
                  <Button variant="outline">Deschide Marketplace</Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {/* Product categories */}
          {(["inventory", "pos"] as const).map((scope) => {
            const scopeCats = (categories ?? []).filter(
              (c) =>
                (c as { category_type?: string }).category_type === scope ||
                ((c as { category_type?: string }).category_type === "both" && scope === "pos")
            );
            const title =
              scope === "inventory"
                ? (t.settings.categoryInventory ?? "Inventory categories")
                : (t.settings.categoryPos ?? "POS categories");
            return (
              <Card key={scope}>
                <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
                <CardContent>
                  <form action={addCategory as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap gap-3 items-end mb-4">
                    <input type="hidden" name="category_type" value={scope} />
                    <div><Label>Name</Label><Input name="name" required placeholder={scope === "inventory" ? "e.g. MATERIA PRIMA" : "e.g. Hot Drinks"} className="w-40" /></div>
                    <div><Label>Colour</Label><Input name="color" type="color" defaultValue="#2563eb" className="h-10 w-16 p-1" /></div>
                    <div><Label>Sort order</Label><Input name="sort_order" type="number" placeholder="1" className="w-20" /></div>
                    <Button type="submit" variant="outline" size="sm">Add category</Button>
                  </form>
                  <div className="space-y-2">
                    {scopeCats.map((c) => (
                      <form key={c.id} action={updateCategory as unknown as (fd: FormData) => Promise<void>} className="grid gap-2 rounded-lg border border-slate-100 p-2 sm:grid-cols-[1fr_72px_90px_160px_auto_auto] sm:items-end">
                        <input type="hidden" name="id" value={c.id} />
                        <div><Label>Name</Label><Input name="name" defaultValue={c.name} required /></div>
                        <div><Label>Colour</Label><Input name="color" type="color" defaultValue={c.color ?? "#64748b"} className="h-10 w-16 p-1" /></div>
                        <div><Label>Sort</Label><Input name="sort_order" type="number" defaultValue={c.sort_order ?? 0} /></div>
                        <div>
                          <Label>{t.settings.type}</Label>
                          <FormSelect
                            name="category_type"
                            defaultValue={(c as { category_type?: string }).category_type === "both" ? scope : ((c as { category_type?: string }).category_type ?? scope)}
                            options={[
                              { value: "pos", label: t.settings.categoryPos },
                              { value: "inventory", label: t.settings.categoryInventory },
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
            );
          })}

          {/* Units of measurement */}
          <Card>
            <CardHeader><CardTitle>Units of measurement</CardTitle></CardHeader>
            <CardContent>
              <form action={addUnit as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap gap-3 items-end mb-4">
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
                  <form key={u.id} action={updateUnit as unknown as (fd: FormData) => Promise<void>} className="grid gap-2 rounded-lg border border-slate-100 p-2 sm:grid-cols-[1fr_120px_auto_auto] sm:items-end">
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

          {/* Cash drawer */}
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

      {/* ── FISCAL & CONTABILITATE TAB (RO only) ─────────────────────── */}
      {activeTab === "fiscal" && isRO && (efacturaEnabled || fiscalnetEnabled || sagaInstalled) && (
        <div className="space-y-6">

          {efacturaEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                e-Factura
                {anafConnected ? (
                  <Badge className="bg-green-100 text-green-800 border-0 text-xs">Conectat</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-0 text-xs">Neconectat</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Obligatorie pentru toate firmele românești din ianuarie 2025.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 space-y-1">
                <p className="font-medium">De știut:</p>
                <p>Fiecare factură B2B trebuie transmisă în SPV în <strong>5 zile lucrătoare</strong>. Amenda pentru netransmitere: <strong>1.000–2.500 lei per factură</strong>.</p>
              </div>
              {anafConnected ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Conectat la ANAF SPV — facturile pot fi transmise automat.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Neconectat la ANAF SPV
                  </div>
                  <Link href="/app/settings?tab=integrations">
                    <Button size="sm">Conectează cu ANAF SPV &rarr;</Button>
                  </Link>
                </div>
              )}
              <Link
                href="/help/romania-efactura"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Ghid complet e-Factura <ExternalLink className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
          )}

          {efacturaEnabled && (
          <AnafSettingsCard
            canEdit={canEdit}
            anafConnected={anafConnected}
            anafCif={anafCif}
            anafVatRegistered={anafVatRegistered}
            anafAuthUrl={anafAuthUrl}
          />
          )}

          {sagaInstalled && (
          <Card>
            <CardHeader>
              <CardTitle>Contabilitate</CardTitle>
              <CardDescription>Configurare Saga, bon de consum colectiv, metodă de calcul CMP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Configurare contabil (Saga, CMP, coduri)</p>
                  <p className="text-xs text-slate-500 mt-0.5">{accountantStepsDone}/4 pași completați</p>
                </div>
                <Link href="/app/settings/accountant">
                  <Button variant="outline" size="sm">Configurare &rarr;</Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "CUI firmă", done: !!fiscalnetCif },
                  { label: "Cod gestiune Saga", done: !!sagaGestiuneCode },
                  { label: "Coduri articole produse", done: sagaProductCount > 0 },
                  { label: "Documente legale semnate", done: false },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {done
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      : <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                    <span className={done ? "text-slate-700" : "text-slate-400"}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {sagaInstalled && (
          <Card>
            <CardHeader>
              <CardTitle>Bon de Consum Colectiv</CardTitle>
              <CardDescription>Formular 14-3-4/aA — OMFP 2634/2015</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-slate-500">Serie numere</p>
                  <p className="font-medium">
                    {bcCount > 0
                      ? `BC-${new Date().getFullYear()}-000001 — ${latestBcNumber ?? "—"}`
                      : "Niciun bon generat încă"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Bonuri generate {new Date().getFullYear()}</p>
                  <p className="font-medium">{bcCount}</p>
                </div>
                <div>
                  <p className="text-slate-500">Metodă evaluare stoc</p>
                  <Badge className="bg-blue-100 text-blue-800 border-0 mt-1">CMP rulant</Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Link href="/app/reports/consum" className="text-sm text-blue-600 hover:underline">
                  Descarcă bon de consum &rarr;
                </Link>
              </div>
              <div className="pt-1">
                <Link href="/app/settings/accountant?tab=checklist" className="text-sm text-blue-600 hover:underline">
                  Descarcă proceduri interne &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
          )}

          {fiscalnetEnabled && (
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
            cif={(anafCif || fiscalnetCif) || null}
            operatorCode={(orgRow?.fiscalnet_operator_code as string) || "1"}
            vatGroups={(orgRow?.fiscalnet_vat_groups as import("@/lib/fiscalnet/types").VatGroup[]) ?? []}
            paymentTypeMap={(orgRow?.fiscalnet_payment_type_map as Record<string, import("@/lib/fiscalnet/types").FiscalPaymentCode>) ?? {}}
          />
          )}

          {!efacturaEnabled && !fiscalnetEnabled && !sagaInstalled && (
            <Card>
              <CardHeader>
                <CardTitle>Instalează din Marketplace</CardTitle>
                <CardDescription>Alege e-Factura, FiscalNet sau Saga doar dacă le folosești.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/app/settings?tab=integrations">
                  <Button>Deschide Marketplace</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── INTEGRATIONS TAB ─────────────────────────────────────────── */}
      {activeTab === "integrations" && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 mb-4">
            {isRO
              ? "Instalează doar modulele de care ai nevoie. Dezinstalarea ascunde meniurile fără să șteargă datele."
              : "Install only the modules you need. Uninstall hides menus without deleting data."}
          </p>
          <IntegrationCards
            orgId={orgId}
            countryCode={countryCode}
            installError={params?.install_error ? decodeURIComponent(params.install_error) : null}
            returnTo="/app/settings?tab=integrations"
          />
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="space-y-2">
          {digestAllowed && (
            <OwnerDigestCard
              locale={locale}
              canEdit={canEdit}
              ownerEmail={user.email ?? ""}
              initial={ownerDigestInitial}
              teamMembers={digestTeamMembers}
            />
          )}
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
                  Share your link. You earn <strong>1 free month</strong> when your invited user makes their first payment.
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
                    <p className="font-medium">{referral.creditMonths} month{referral.creditMonths === 1 ? "" : "s"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Trial</p>
                    <p className="font-medium">{referral.daysLeft !== null ? `${referral.daysLeft} days left` : "15 days"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{referral.link}</p>
                  <CopyReferralButton link={referral.link} />
                </div>
                {referral.creditMonths > 0 && (
                  <p className="text-sm text-blue-700">Your free month credit is recorded and will be applied before billing.</p>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">People invited</p>
                  {referral.referrals.length ? (
                    referral.referrals.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <span>{r.referred_email || "New business"}</span>
                        <span className="capitalize text-slate-500">{r.status} &middot; {r.credit_months ?? 1} month</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No referrals yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <BillingPanel
            organisationId={orgId}
            countryCode={countryCode}
            profileLocale={profileLocale}
            searchParams={{ reason: params?.reason, checkout: params?.checkout }}
          />
        </div>
      )}

      <div className="mt-8">
        <TestimonialPromptCard />
      </div>
    </div>
  );
}
