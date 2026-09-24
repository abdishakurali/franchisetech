import {
  addCategory, updateCategory, deleteCategory,
  updateOrgCountry, updateOrgCurrency, updateOrganisationIndustry,
  addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  addVatRate, updateVatRate, deleteVatRate, seedDefaultVatRates,
  addUnit, updateUnit, deleteUnit,
  updateSite,
  approveProductVat, updateSgrPolicy,
  updateBusinessProfileAndModules,
} from "@/app/actions/kitchenops";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUCT_INVENTORY_CATEGORY_EMBED } from "@/lib/supabase/product-selects";
import { SettingsSection } from "@/components/app/SettingsSection";
import { SettingsListSection } from "@/components/app/SettingsListSection";
import { unitLabel } from "@/lib/units-of-measure";
import { AnafSettingsCard } from "@/components/app/AnafSettingsCard";
import { TestimonialPromptCard } from "@/components/app/TestimonialPromptCard";
import { IntegrationCards } from "@/components/app/IntegrationCards";
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
import { FiscalNetSettingsCard } from "@/components/app/FiscalNetSettingsCard";
import { ScrollToAnchor } from "@/components/app/ScrollToAnchor";
import { SettingsSectionNav } from "@/components/app/SettingsSectionNav";
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
import { NotificationPreferences } from "@/components/app/NotificationPreferences";
import type { NotificationKey } from "@/app/actions/org-settings";
import { BillingPanel } from "@/components/billing/BillingPanel";
import { CheckCircle2, Circle, AlertCircle, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";
import { getAllTables, getFloorSections } from "@/app/actions/table-service";
import { listAccessibleSites, requireActiveSite } from "@/lib/site-context";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { LEAN_PRODUCT_SCOPE_ENABLED } from "@/lib/product-scope";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import type { BillingPlan } from "@/lib/billing/plans";
import { BusinessModulesCard } from "@/components/app/BusinessModulesCard";
import { TeamClient } from "@/app/app/settings/team/TeamClient";
import { AccountantSettingsSection, type AccountingOrg } from "@/components/app/AccountantSettingsSection";
import { AccountantAccessCard } from "@/components/app/AccountantAccessCard";

const TablesSettingsClient = dynamic(() =>
  import("@/components/app/TablesSettingsClient").then((m) => m.TablesSettingsClient)
);

const COUNTRY_OPTIONS = [
  { code: "IE", label: "Ireland" },
  { code: "RO", label: "Romania" },
  { code: "UK", label: "United Kingdom" },
  { code: "OTHER", label: "Other" },
] as const;

const METHOD_TYPE_OPTIONS = ["cash", "card", "online", "other"].map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

const FISCALNET_CODE_OPTIONS = [
  { value: "", label: "— none —" },
  { value: "1", label: "1 – Cash" },
  { value: "2", label: "2 – Card" },
  { value: "3", label: "3 – Credit" },
  { value: "4", label: "4 – Tichete masă" },
  { value: "5", label: "5 – Tichete valorice" },
  { value: "6", label: "6 – Voucher" },
  { value: "7", label: "7 – Plată modernă" },
  { value: "8", label: "8 – Altele" },
];

// Verified against every real ?tab= link in the codebase (grepped, not
// assumed) rather than trusting the old map, which carried three aliases
// (features/modules/hardware) that no navigation anywhere ever generates,
// and was missing "general" -- a live, broken link in VatRateSelect.tsx
// that has pointed nowhere since it was written.
//
//   anaf        -- InvoiceActions.tsx, ANAF OAuth callback route
//   products    -- ProductEditForm.tsx / products/new (its own link text
//                  is literally "Manage categories")
//   operations  -- module-guard.ts's locked-module redirect,
//                  DashboardModulePrompts.tsx, the inventory module's
//                  settingsHref in billing/catalog.ts
//   general     -- VatRateSelect.tsx ("Add rates in Settings") -- was
//                  broken, landing on no matching tab or alias at all
const TAB_ALIASES: Record<string, string> = {
  anaf: "fiscal",
  products: "categories",
  operations: "categories",
  integrations: "fiscal",
  general: "business",
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
  searchParams?: Promise<{ tab?: string; locked?: string; msg?: string; reason?: string; checkout?: string; install_error?: string; install?: string }>;
}) {
  const params = await searchParams;
  const rawTab = params?.tab ?? "overview";
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
    { data: sites },
  ] = await Promise.all([
    supabase.from("product_categories").select("*").eq("organisation_id", orgId).order("name"),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("payment_methods").select("*").eq("organisation_id", orgId).order("created_at"),
    supabase.from("vat_rates").select("*").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("sites").select("id,name,address,city").eq("organisation_id", orgId).order("created_at"),
  ]);
  const primarySite = sites?.[0] ?? null;
  const hasMultipleSites = (sites?.length ?? 0) > 1;

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

  // FiscalNet measured history — a setting that contradicts its own history
  // (enabled, with no receipts ever attempted) says so here rather than
  // just showing the toggle as if that alone meant it's working.
  let fiscalReceiptAttempts = 0;
  let fiscalLastAttemptAt: string | null = null;
  let fiscalLastAttemptStatus: string | null = null;
  let sessionsClosedCount = 0;
  let zReportsDoneCount = 0;
  let lastZReportAt: string | null = null;
  if (isRO && fiscalnetEnabled) {
    const [attemptsAgg, lastAttempt, sessionsAgg, zReportsAgg] = await Promise.all([
      supabase.from("fiscal_receipt_attempts").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
      supabase
        .from("fiscal_receipt_attempts")
        .select("attempted_at,status")
        .eq("organisation_id", orgId)
        .order("attempted_at", { ascending: false })
        .limit(1),
      supabase.from("pos_sessions").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "closed"),
      supabase
        .from("pos_sessions")
        .select("fiscal_z_report_at", { count: "exact" })
        .eq("organisation_id", orgId)
        .eq("fiscal_z_report_done", true)
        .order("fiscal_z_report_at", { ascending: false })
        .limit(1),
    ]);
    fiscalReceiptAttempts = attemptsAgg.count ?? 0;
    fiscalLastAttemptAt = lastAttempt.data?.[0]?.attempted_at ?? null;
    fiscalLastAttemptStatus = lastAttempt.data?.[0]?.status ?? null;
    sessionsClosedCount = sessionsAgg.count ?? 0;
    zReportsDoneCount = zReportsAgg.count ?? 0;
    lastZReportAt = zReportsAgg.data?.[0]?.fiscal_z_report_at ?? null;
  }

  // Units — full CRUD. addUnit/updateUnit/deleteUnit (app/actions/kitchenops.ts)
  // reject any name that collides (case-insensitively) with a standard unit's
  // code or Romanian label via isReservedUnitName(), so a custom unit can't
  // re-create the old "Buc"/"Units" duplication this list used to guard
  // against by being read-only.
  const { data: customUnitRows } = await supabase
    .from("units_of_measure")
    .select("id,name,abbreviation")
    .eq("organisation_id", orgId)
    .order("name");
  const customUnits = customUnitRows ?? [];

  // Referrals
  const referral = await ensureReferralCode(orgId, false).catch(() => ({
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

  // VAT review queue — products blocked from POS pending accountant approval.
  // Once compliance_enforcement_at passes, unapproved products hard-fail at sale time
  // (post_pos_document raises PRODUCT_VAT_REVIEW_REQUIRED), so owners need advance warning.
  let vatReviewCount = 0;
  const complianceEnforcementAt = (orgRow?.compliance_enforcement_at as string | null) ?? null;
  if (isRO) {
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("active", true)
      .eq("is_sellable", true)
      .in("vat_status", ["pending", "ambiguous"]);
    vatReviewCount = count ?? 0;
  }
  const daysUntilEnforcement = complianceEnforcementAt
    ? Math.ceil((new Date(complianceEnforcementAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Data repair (merged from the former /app/settings/data-repair route) —
  // RO-only, same gate as the VAT review banner above: the VAT queue and SGR
  // policy concepts are meaningless outside Romanian fiscal compliance.
  let dataRepairProducts: Array<{ id: string; name: string; vat_rate: number; vat_status: string | null; category: string | null; inventory_category: unknown }> = [];
  let dataRepairRates: Array<{ id: string; name: string; rate: number }> = [];
  let dataRepairBatches: Array<{ id: string; repair_type: string; status: string; summary: unknown; created_at: string; completed_at: string | null }> = [];
  let sgrPolicy: { sgr_policy: string | null; sgr_deposit_amount: number | null; sgr_vat_rate: number | null } | null = null;
  if (isRO) {
    const [{ data: repairProductsData }, { data: ratesData }, { data: batchesData }, { data: sgrData }] = await Promise.all([
      supabase.from("products")
        .select(`id,name,vat_rate,vat_status,category,${PRODUCT_INVENTORY_CATEGORY_EMBED}(name)`)
        .eq("organisation_id", orgId)
        .in("vat_status", ["pending", "ambiguous"])
        .eq("active", true)
        .order("name"),
      supabase.from("vat_rates").select("id,name,rate").eq("organisation_id", orgId).eq("active", true).order("sort_order"),
      supabase.from("repair_batches").select("id,repair_type,status,summary,created_at,completed_at").eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(20),
      supabase.from("organisations").select("sgr_policy,sgr_deposit_amount,sgr_vat_rate").eq("id", orgId).single(),
    ]);
    dataRepairProducts = (repairProductsData ?? []) as typeof dataRepairProducts;
    dataRepairRates = ratesData ?? [];
    dataRepairBatches = batchesData ?? [];
    sgrPolicy = sgrData ?? null;
  }

  // Modules — subscriptionPlan/hasTrial computed the same way app/app/layout.tsx
  // does for module-nav visibility, reused here to gate which toggles are locked.
  const subStatus = await getSubscriptionStatus(orgId).catch(() => null);
  const hasTrialForModules = subStatus?.state === "trialing" || subStatus?.state === "soft_trial";

  // Tables (merged from the former /app/settings/tables route). Gated the
  // same way app/app/pos/page.tsx gates its own table-service UI — parked
  // behind LEAN_PRODUCT_SCOPE_ENABLED regardless of the org's DB flag, so
  // Settings never offers to configure something POS won't actually show.
  const tableServiceEnabled = !LEAN_PRODUCT_SCOPE_ENABLED && Boolean(orgRow?.table_service_enabled);
  const orgModuleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const multiSiteTables = orgModuleFlags.multi_site_ops_enabled === true;
  let tablesActiveSiteId: string | null = null;
  let tablesSites: { id: string; name: string }[] = [];
  let tables: Awaited<ReturnType<typeof getAllTables>> = [];
  let floorSections: Awaited<ReturnType<typeof getFloorSections>> = [];
  if (tableServiceEnabled) {
    if (multiSiteTables) {
      tablesSites = await listAccessibleSites(supabase, orgId, membership.id, membership.role);
      const resolved = await requireActiveSite(supabase, orgId, membership.id, membership.role);
      tablesActiveSiteId = resolved.siteId;
    }
    const tablesSiteFilter = multiSiteTables ? tablesActiveSiteId : undefined;
    [tables, floorSections] = await Promise.all([
      getAllTables(tablesSiteFilter),
      getFloorSections(tablesSiteFilter),
    ]);
  }

  // Team (merged from the former /app/settings/team route) — admin-client
  // read because RLS blocks reading other members' profiles/roles directly.
  // Kept as its own query rather than reusing digestTeamMembers above: that
  // one is active-members-only with a narrower profile select (built for the
  // digest recipient picker), while Team needs every member (including
  // disabled ones) plus role_title/phone for the management table.
  type TeamProfile = { id: string; full_name: string | null; email: string | null; role_title: string | null; phone: string | null };
  type TeamMember = { id: string; user_id: string; role: string; status: string; created_at: string; invited_by: string | null; disabled_at: string | null; profile: TeamProfile | null };
  let teamMembers: TeamMember[] = [];
  let teamMembersError: string | null = null;
  let advancedRolesAllowed = false;
  if (canEdit) {
    const admin = await createServiceClient();
    const { data: rawMembers, error: teamError } = await admin
      .from("organisation_members")
      .select("id,user_id,role,status,created_at,invited_by,disabled_at")
      .eq("organisation_id", orgId)
      .order("created_at");
    teamMembersError = teamError?.message ?? null;
    const teamUserIds = (rawMembers ?? []).map((m) => m.user_id);
    const { data: teamProfiles } = await admin
      .from("profiles")
      .select("id,full_name,email,role_title,phone")
      .in("id", teamUserIds.length ? teamUserIds : ["00000000-0000-0000-0000-000000000000"]);
    const teamProfileMap = new Map((teamProfiles ?? []).map((p) => [p.id, p as TeamProfile]));
    teamMembers = (rawMembers ?? []).map((m) => ({ ...m, profile: teamProfileMap.get(m.user_id) ?? null }));
    advancedRolesAllowed = await hasEntitlement(orgId, "team.advanced_roles", { write: true });
  }

  const sagaGestiuneCode = (orgRow?.saga_gestiune_code as string | null) ?? null;
  const sagaInstalled = Boolean(orgRow?.saga_export_enabled ?? false);
  const accountantStepsDone = [
    !!fiscalnetCif,
    !!sagaGestiuneCode,
    sagaProductCount > 0,
    false, // compliance documents — cannot check in DB
  ].filter(Boolean).length;

  // Accountant (merged from the former /app/settings/accountant route).
  // orgRow already carries every AccountingOrg field via MEMBERSHIP_SELECT —
  // no separate organisations query needed. Sites need saga_gestiune_code,
  // which the hub's own "location" sites query above doesn't select, so this
  // stays a small dedicated query, matching the original page exactly.
  const installingSaga = params?.install === "saga";
  let accountantSites: Array<{ id: string; name: string | null; city: string | null; address: string | null; saga_gestiune_code: string | null }> = [];
  let accountantEntitled = false;
  if (sagaInstalled) {
    const [{ data: siteRows }, entitled] = await Promise.all([
      supabase.from("sites").select("id, name, city, address, saga_gestiune_code").eq("organisation_id", orgId).order("name"),
      hasEntitlement(orgId, "reports.accountant_pack"),
    ]);
    accountantSites = siteRows ?? [];
    accountantEntitled = entitled;
  }

  // ── Section nav ──────────────────────────────────────────────────────
  // One scrollable page — every destination is either an anchored section
  // below or, for Team/Accountant/Data repair (formerly separate routes),
  // merged directly into the page as sections too. Old URLs redirect here.
  const sectionNav: Array<{ id: string; label: string }> = [
    { id: "business",         label: t.settings.tabBusiness },
    ...(isRO && (fiscalnetEnabled || efacturaEnabled || sagaInstalled)
      ? [{ id: "fiscal", label: "Fiscal" }]
      : []),
    ...(isRO ? [{ id: "accountant", label: "Contabilitate" }] : []),
    { id: "modules",          label: isRO ? "Module" : "Modules" },
    { id: "units",            label: isRO ? "Unități de măsură" : "Units" },
    { id: "payment-methods",  label: isRO ? "Metode de plată" : "Payment methods" },
    { id: "categories",       label: isRO ? "Categorii" : "Categories" },
    { id: "location",         label: isRO ? "Locație" : "Location" },
    ...(canEdit ? [{ id: "team", label: isRO ? "Echipă" : "Team" }] : []),
    { id: "marketplace",      label: "Marketplace" },
    ...(tableServiceEnabled ? [{ id: "tables", label: isRO ? "Mese" : "Tables" }] : []),
    { id: "notifications",    label: isRO ? "Notificări" : t.settings.tabNotifications },
    ...(isRO ? [{ id: "data-repair", label: "Controlul datelor" }] : []),
    { id: "billing",          label: t.settings.tabBilling },
  ];
  const scrollTarget = activeTab !== "overview" ? activeTab : null;

  const unitsEditor = (
<div className="space-y-6">
          <SettingsSection
            title={isRO ? "Unități standard" : "Standard units"}
            description={
              isRO
                ? "Acestea sunt mereu disponibile și nu pot fi editate."
                : "Always available, and can't be edited."
            }
          >
            <div className="flex flex-wrap gap-2">
              {DEFAULT_OPERATIONAL_UNITS.map((u) => (
                <Badge key={u} variant="outline" className="text-mid">{unitLabel(u, isRO ? "ro" : "en")}</Badge>
              ))}
            </div>
          </SettingsSection>

          <SettingsListSection
            title={isRO ? "Unități personalizate" : "Custom units"}
            description={
              isRO
                ? "Un nume care ar duplica o unitate standard (ex. „Buc”/„Units”) nu este acceptat."
                : "A name that would duplicate a standard unit (e.g. \"Buc\"/\"Units\") is rejected."
            }
            rows={customUnits.map((u: { id: string; name: string; abbreviation: string | null }) => ({
              id: u.id,
              primary: u.name,
              secondary: u.abbreviation || null,
              editValues: { name: u.name, abbreviation: u.abbreviation ?? "" },
            }))}
            canEdit={canEdit}
            addFields={[
              { key: "name", label: isRO ? "Nume" : "Name", type: "text", placeholder: isRO ? "ex. cutie mică" : "e.g. small box" },
              { key: "abbreviation", label: isRO ? "Abreviere (opțional)" : "Abbreviation (optional)", type: "text", placeholder: "ex. cut." },
            ]}
            editFields={[
              { key: "name", label: isRO ? "Nume" : "Name", type: "text" },
              { key: "abbreviation", label: isRO ? "Abreviere" : "Abbreviation", type: "text" },
            ]}
            addDefaults={{ name: "", abbreviation: "" }}
            addAction={addUnit as unknown as (fd: FormData) => Promise<void>}
            updateAction={updateUnit as unknown as (fd: FormData) => Promise<void>}
            deleteAction={deleteUnit as unknown as (fd: FormData) => Promise<void>}
            addLabel={isRO ? "+ Adaugă unitate" : "+ Add unit"}
            emptyLabel={isRO ? "Nicio unitate personalizată încă." : "No custom units yet."}
          />
        </div>
  );

  const paymentsEditor = (
<div className="space-y-6">
          <SettingsListSection
            title={isRO ? "Metode de plată" : "Payment methods"}
            description={fiscalnetEnabled ? "FiscalNet enabled — assign a payment code (1–8) to each method." : undefined}
            rows={((paymentMethods ?? []) as Array<{ id: string; name: string; type: string; active: boolean; fiscalnet_code?: number | null }>).map((m) => ({
              id: m.id,
              primary: m.name,
              secondary: `${m.type.charAt(0).toUpperCase()}${m.type.slice(1)}${fiscalnetEnabled && m.fiscalnet_code != null ? ` · FN code ${m.fiscalnet_code}` : ""}`,
              badge: { label: m.active ? "Active" : "Inactive", active: m.active },
              editValues: { name: m.name, type: m.type, fiscalnet_code: m.fiscalnet_code ?? "", active: m.active },
            }))}
            canEdit={canEdit}
            addFields={[
              { key: "name", label: "Name", type: "text", placeholder: "e.g. Tichete masă" },
              { key: "type", label: "Type", type: "select", options: METHOD_TYPE_OPTIONS },
              ...(fiscalnetEnabled ? [{ key: "fiscalnet_code", label: "FiscalNet code", type: "select" as const, options: FISCALNET_CODE_OPTIONS }] : []),
            ]}
            editFields={[
              { key: "name", label: "Name", type: "text" },
              { key: "type", label: "Type", type: "select", options: METHOD_TYPE_OPTIONS },
              ...(fiscalnetEnabled ? [{ key: "fiscalnet_code", label: "FiscalNet code", type: "select" as const, options: FISCALNET_CODE_OPTIONS }] : []),
              { key: "active", label: "Active", type: "toggle" },
            ]}
            addDefaults={{ name: "", type: "cash", fiscalnet_code: "", active: true }}
            addAction={addPaymentMethod as unknown as (fd: FormData) => Promise<void>}
            updateAction={updatePaymentMethod as unknown as (fd: FormData) => Promise<void>}
            deleteAction={deletePaymentMethod as unknown as (fd: FormData) => Promise<void>}
            addLabel="+ Add payment method"
            emptyLabel="No payment methods yet."
          />
        </div>
  );

  const locationEditor = (
<div className="space-y-6">
          <SettingsSection
            title={isRO ? "Locație" : "Location"}
            description={
              hasMultipleSites
                ? undefined
                : isRO
                  ? "O singură locație — selectorul de locații apare automat când există o a doua."
                  : "One location — a location switcher appears automatically once a second one exists."
            }
          >
            {primarySite ? (
              canEdit ? (
                <form action={updateSite as unknown as (fd: FormData) => Promise<void>} className="grid gap-3 sm:grid-cols-3 sm:items-end">
                  <input type="hidden" name="id" value={primarySite.id} />
                  <div><Label>{isRO ? "Nume" : "Name"}</Label><Input name="name" defaultValue={primarySite.name} required /></div>
                  <div><Label>{isRO ? "Adresă" : "Address"}</Label><Input name="address" defaultValue={primarySite.address ?? ""} /></div>
                  <div><Label>{isRO ? "Oraș" : "City"}</Label><Input name="city" defaultValue={primarySite.city ?? ""} /></div>
                  <Button type="submit" variant="outline" size="sm" className="sm:col-span-3 sm:w-fit">
                    {isRO ? "Salvează" : "Save"}
                  </Button>
                </form>
              ) : (
                <div className="text-sm">
                  <p className="font-medium">{primarySite.name}</p>
                  <p className="text-muted-foreground">{[primarySite.address, primarySite.city].filter(Boolean).join(", ") || "—"}</p>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">{isRO ? "Nicio locație configurată." : "No location configured."}</p>
            )}
          </SettingsSection>
        </div>
  );

  const categoriesEditor = (
<div className="space-y-6">
          {(["inventory", "pos"] as const).map((scope) => {
            const scopeCats = (categories ?? []).filter(
              (c) =>
                (c as { category_type?: string }).category_type === scope ||
                ((c as { category_type?: string }).category_type === "both" && scope === "pos")
            ) as Array<{ id: string; name: string; color: string | null; sort_order: number | null; category_type?: string }>;
            const title =
              scope === "inventory"
                ? (t.settings.categoryInventory ?? "Inventory categories")
                : (t.settings.categoryPos ?? "POS categories");
            const typeOptions = [
              { value: "pos", label: t.settings.categoryPos },
              { value: "inventory", label: t.settings.categoryInventory },
            ];
            const rows = scopeCats.map((c) => ({
              id: c.id,
              primary: c.name,
              secondary: `Sort ${c.sort_order ?? 0}`,
              editValues: {
                name: c.name,
                color: c.color ?? "#64748b",
                sort_order: c.sort_order ?? 0,
                category_type: c.category_type === "both" ? scope : (c.category_type ?? scope),
              },
            }));
            return (
              <SettingsListSection
                key={scope}
                title={title}
                rows={rows}
                canEdit={canEdit}
                addFields={[
                  { key: "name", label: "Name", type: "text", placeholder: scope === "inventory" ? "e.g. MATERIA PRIMA" : "e.g. Hot Drinks" },
                  { key: "color", label: "Colour", type: "color" },
                  { key: "sort_order", label: "Sort order", type: "number", placeholder: "1", className: "w-20" },
                ]}
                editFields={[
                  { key: "name", label: "Name", type: "text" },
                  { key: "color", label: "Colour", type: "color" },
                  { key: "sort_order", label: "Sort", type: "number", className: "w-20" },
                  { key: "category_type", label: t.settings.type, type: "select", options: typeOptions },
                ]}
                hiddenAddValues={{ category_type: scope }}
                addDefaults={{ name: "", color: "#2563eb", sort_order: "" }}
                addAction={addCategory as unknown as (fd: FormData) => Promise<void>}
                updateAction={updateCategory as unknown as (fd: FormData) => Promise<void>}
                deleteAction={deleteCategory as unknown as (fd: FormData) => Promise<void>}
                addLabel="Add category"
                emptyLabel="No categories yet."
              />
            );
          })}
        </div>
  );

  const fiscalEditor = (
<div className="space-y-6">

          {/* Measured history, not just the toggle. A "fiscalnet_enabled: true"
              checkbox with zero receipt attempts ever recorded is a setting
              contradicting its own history — this says so instead of letting
              the toggle alone imply it's working. */}
          {fiscalnetEnabled && (
          <Card className={fiscalReceiptAttempts === 0 ? "border-amber-200 bg-amber-50" : undefined}>
            <CardHeader>
              <CardTitle>Istoric FiscalNet</CardTitle>
              <CardDescription>
                {fiscalReceiptAttempts === 0
                  ? "FiscalNet este activat, dar nu există nicio încercare de emitere bon fiscal înregistrată."
                  : "Activitate măsurată, nu doar starea conexiunii."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Încercări bon fiscal</p>
                  <p className={`font-medium ${fiscalReceiptAttempts === 0 ? "text-amber-700" : ""}`}>{fiscalReceiptAttempts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ultima încercare</p>
                  <p className="font-medium">
                    {fiscalLastAttemptAt
                      ? `${new Date(fiscalLastAttemptAt).toLocaleString("ro-RO")} (${fiscalLastAttemptStatus ?? "—"})`
                      : "Niciodată"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sesiuni închise</p>
                  <p className="font-medium">{sessionsClosedCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rapoarte Z generate</p>
                  <p className="font-medium">
                    {zReportsDoneCount}
                    {lastZReportAt ? ` (ultimul: ${new Date(lastZReportAt).toLocaleDateString("ro-RO")})` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {efacturaEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                e-Factura
                {anafConnected ? (
                  <Badge className="bg-reconciled/15 text-reconciled border-0 text-xs">Conectat</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-0 text-xs">Neconectat</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Obligatorie pentru toate firmele românești din ianuarie 2025.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-accent border border-brass/25 p-4 text-sm text-foreground space-y-1">
                <p className="font-medium">De știut:</p>
                <p>Fiecare factură B2B trebuie transmisă în SPV în <strong>5 zile lucrătoare</strong>. Amenda pentru netransmitere: <strong>1.000–2.500 lei per factură</strong>.</p>
              </div>
              {anafConnected ? (
                <div className="flex items-center gap-2 text-sm text-reconciled">
                  <CheckCircle2 className="h-4 w-4" />
                  Conectat la ANAF SPV — facturile pot fi transmise automat.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Neconectat la ANAF SPV
                  </div>
                  <Link href="#marketplace">
                    <Button size="sm">Conectează cu ANAF SPV &rarr;</Button>
                  </Link>
                </div>
              )}
              <Link
                href="/help/romania-efactura"
                className="inline-flex items-center gap-1 text-sm text-brass hover:underline"
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
                  <p className="text-sm font-medium text-foreground">Configurare contabil (Saga, CMP, coduri)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{accountantStepsDone}/4 pași completați</p>
                </div>
                <Link href="#accountant">
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
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-reconciled shrink-0" />
                      : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
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
                  <p className="text-muted-foreground">Serie numere</p>
                  <p className="font-medium">
                    {bcCount > 0
                      ? `BC-${new Date().getFullYear()}-000001 — ${latestBcNumber ?? "—"}`
                      : "Niciun bon generat încă"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bonuri generate {new Date().getFullYear()}</p>
                  <p className="font-medium">{bcCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Metodă evaluare stoc</p>
                  <Badge className="bg-accent text-foreground border-0 mt-1">CMP rulant</Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <Link href="/app/reports/consum" className="text-sm text-brass hover:underline">
                  Descarcă bon de consum &rarr;
                </Link>
              </div>
              <div className="pt-1">
                <Link href="#accountant" className="text-sm text-brass hover:underline">
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
                <Link href="#marketplace">
                  <Button>Deschide Marketplace</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
  );

  return (
    <div className="settings-page-wrapper mx-auto min-h-full w-full max-w-[1280px] bg-card p-4 sm:p-6">
      <div className="settings-page-heading mb-8">
        <h1 className="text-[26px] font-bold tracking-[-0.025em] text-foreground">{t.settings.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{org?.name ?? t.settings.subtitleSimple}{isRO ? ` · ${anafVatRegistered ? "plătitor de TVA" : "neplătitor de TVA"}` : ""}</p>
      </div>

      {vatReviewCount > 0 && (
        <Link
          href="#data-repair"
          className={`mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm ${
            daysUntilEnforcement !== null && daysUntilEnforcement <= 3
              ? "border-attention/40 bg-attention/10 text-red-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              {vatReviewCount} {vatReviewCount === 1 ? "produs are" : "produse au"} nevoie de validare TVA
            </p>
            <p className="mt-0.5">
              {daysUntilEnforcement !== null && daysUntilEnforcement > 0
                ? `Aceste produse vor deveni nevandabile la casă în ${daysUntilEnforcement} ${daysUntilEnforcement === 1 ? "zi" : "zile"}, dacă nu sunt aprobate. Mergeți la Controlul datelor pentru a le revizui.`
                : "Aceste produse pot fi deja blocate la vânzare. Mergeți la Controlul datelor pentru a le revizui."}
            </p>
          </div>
        </Link>
      )}

      {/* Rendered here, not inside a specific section: this banner comes from
          module-guard.ts's redirect (?tab=operations&locked=X&msg=Y). A
          cross-cutting notice like this shouldn't depend on scroll
          position — that's exactly what made the original redirect target
          silently wrong for as long as it was. */}
      {lockedModule && lockedMessage ? (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>Modul indisponibil</CardTitle>
            <CardDescription>{lockedMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="#marketplace">
              <Button variant="outline">Deschide Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* One scrollable page, no tabs, no "Gestionează" accordion — every
          section below is always visible and always editable inline,
          including former separate routes (Team, Accountant, Data repair)
          now merged in as sections too. Sticks to the top on scroll and
          highlights whichever section is actually in view. */}
      <SettingsSectionNav sections={sectionNav} />

      <ScrollToAnchor targetId={scrollTarget} />

      <div className="space-y-12">

      {/* ── BUSINESS ─────────────────────────────────────────────────── */}
      <section id="business" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.settings.tabBusiness}</h2>
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
                  <p className="text-sm text-muted-foreground">{t.settings.business.businessName}</p>
                  <p className="font-medium">{org?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.settings.business.businessType}</p>
                  <p className="font-medium capitalize">{industryLabel(org?.business_type, locale)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.settings.business.yourName}</p>
                  <p className="font-medium">{profile?.full_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.settings.business.email}</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <Link href="/app/profile" className="inline-flex text-sm text-brass hover:underline">
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
              <div className="rounded-lg bg-secondary p-3 text-sm text-mid">
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
              <p className="text-sm text-muted-foreground mt-1">{t.settings.business.countryDesc}</p>
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
                  <span className="ml-2 text-xs text-muted-foreground">{t.settings.business.contactOwner}</span>
                </p>
              )}
              {isRO && (
                <p className="mt-3 text-xs text-reconciled bg-reconciled/10 rounded px-3 py-2">
                  {t.settings.business.receiptsVisible}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.business.currencyTitle}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t.settings.business.currencyDesc}</p>
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
                  <span className="ml-2 text-xs text-muted-foreground">{t.settings.business.contactOwner}</span>
                </p>
              )}

              <div className="mt-6 border-t border-border pt-5 space-y-2">
                <Label>{t.settings.business.language}</Label>
                <p className="text-sm text-muted-foreground">{t.settings.business.languageDesc}</p>
                <AppLocaleSwitcher key={locale} initialLocale={locale} />
              </div>
            </CardContent>
          </Card>

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
      </section>

      {/* ── FISCAL (RO only) ─────────────────────────────────────────── */}
      {isRO && (fiscalnetEnabled || efacturaEnabled || sagaInstalled) && (
        <section id="fiscal" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Fiscal</h2>
          {fiscalEditor}
        </section>
      )}

      {/* ── ACCOUNTANT ───────────────────────────────────────────────── */}
      {isRO && (
        <section id="accountant" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Contabilitate</h2>
          <div className="space-y-6"><AccountantAccessCard />
          {sagaInstalled && <AccountantSettingsSection
            supabase={supabase}
            orgId={orgId}
            countryCode={countryCode}
            org={orgRow as unknown as AccountingOrg}
            sites={accountantSites}
            installingSaga={installingSaga}
            entitled={accountantEntitled}
          />}</div>
        </section>
      )}

      {/* ── MODULES ──────────────────────────────────────────────────── */}
      <section id="modules" className="scroll-mt-20">
        <BusinessModulesCard
          org={orgModuleFlags}
          canEdit={canEdit}
          subscriptionPlan={(subStatus?.plan as BillingPlan | null) ?? null}
          hasTrial={hasTrialForModules}
          locale={locale}
          updateAction={updateBusinessProfileAndModules}
        />
      </section>

      {/* ── UNITS ────────────────────────────────────────────────────── */}
      <section id="units" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Unități de măsură" : "Units"}</h2>
        {unitsEditor}
      </section>

      {/* ── PAYMENT METHODS ──────────────────────────────────────────── */}
      <section id="payment-methods" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Metode de plată" : "Payment methods"}</h2>
        {paymentsEditor}
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section id="categories" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Categorii" : "Categories"}</h2>
        {categoriesEditor}
      </section>

      {/* ── LOCATION ─────────────────────────────────────────────────── */}
      <section id="location" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Locație" : "Location"}</h2>
        {locationEditor}
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────── */}
      {canEdit && (
        <section id="team" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Echipă" : "Team"}</h2>
          {teamMembersError && (
            <div className="mb-4 rounded bg-attention/10 px-4 py-3 text-sm text-attention">
              Error loading members: {teamMembersError}
            </div>
          )}
          <TeamClient initialMembers={teamMembers} advancedRolesAllowed={advancedRolesAllowed} />
        </section>
      )}

      {/* ── MARKETPLACE ──────────────────────────────────────────────── */}
      <section id="marketplace" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Marketplace</h2>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            {isRO
              ? "Instalează doar modulele de care ai nevoie. Dezinstalarea ascunde meniurile fără să șteargă datele."
              : "Install only the modules you need. Uninstall hides menus without deleting data."}
          </p>
          <IntegrationCards
            orgId={orgId}
            countryCode={countryCode}
            installError={params?.install_error ? decodeURIComponent(params.install_error) : null}
            returnTo="/app/settings?tab=marketplace"
          />
        </div>
      </section>

      {/* ── TABLES ───────────────────────────────────────────────────── */}
      {tableServiceEnabled && (
        <section id="tables" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Mese" : "Tables"}</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              {isRO
                ? "Configurează planul sălii — secțiuni, layout și mese. Ospătarii aleg masa direct din POS."
                : "Configure the floor plan — sections, layout, and tables. Staff pick the table directly in POS."}
            </p>
            <TablesSettingsClient
              tables={tables}
              sections={floorSections}
              sites={tablesSites}
              multiSite={multiSiteTables}
              activeSiteId={tablesActiveSiteId}
            />
          </div>
        </section>
      )}

      {/* ── NOTIFICATIONS ────────────────────────────────────────────── */}
      <section id="notifications" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{isRO ? "Notificări" : t.settings.tabNotifications}</h2>
        <div className="space-y-6">
          {digestAllowed && (
            <OwnerDigestCard
              locale={locale}
              canEdit={canEdit}
              ownerEmail={user.email ?? ""}
              initial={ownerDigestInitial}
              teamMembers={digestTeamMembers}
            />
          )}
          <NotificationPreferences
            initialPrefs={(orgRow?.notification_preferences as Partial<Record<NotificationKey, boolean>>) ?? {}}
            canEdit={canEdit}
            reportsIncluded={digestAllowed}
          />
        </div>
      </section>

      {/* ── DATA REPAIR (RO only) ────────────────────────────────────── */}
      {isRO && (
        <section id="data-repair" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Controlul datelor</h2>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Excepțiile sunt blocate din POS până la validare și fiecare corecție rămâne în audit.</p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l-4 border-red-500 bg-card p-4">
                <p className="text-sm text-muted-foreground">TVA de validat</p>
                <p className="mt-1 text-2xl font-semibold">{dataRepairProducts.length}</p>
              </div>
              <div className="border-l-4 border-amber-500 bg-card p-4">
                <p className="text-sm text-muted-foreground">Blocarea începe</p>
                <p className="mt-1 text-sm font-semibold">{complianceEnforcementAt ? new Date(complianceEnforcementAt).toLocaleString("ro-RO") : "Imediat"}</p>
              </div>
              <div className="border-l-4 border-emerald-600 bg-card p-4">
                <p className="text-sm text-muted-foreground">Loturi finalizate</p>
                <p className="mt-1 text-2xl font-semibold">{dataRepairBatches.filter((batch) => batch.status === "completed").length}</p>
              </div>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Coada TVA</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Produs</TableHead><TableHead>Categorie</TableHead><TableHead>Stare</TableHead><TableHead>Cotă aprobată</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {dataRepairProducts.map((product) => {
                      const categoryRelation = product.inventory_category as unknown as { name?: string | null } | Array<{ name?: string | null }> | null;
                      const category = Array.isArray(categoryRelation) ? categoryRelation[0]?.name : categoryRelation?.name;
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{category ?? product.category ?? "Fără categorie"}</TableCell>
                          <TableCell><Badge variant="secondary">{product.vat_status === "ambiguous" ? "Ambiguu" : "În așteptare"}</Badge></TableCell>
                          <TableCell>
                            {canEdit ? (
                              <form action={approveProductVat} className="flex min-w-56 gap-2">
                                <input type="hidden" name="product_id" value={product.id} />
                                <select name="vat_rate" defaultValue={String(product.vat_rate)} className="h-9 flex-1 rounded-md border bg-card px-2 text-sm">
                                  {dataRepairRates.map((rate) => <option key={rate.id} value={Number(rate.rate)}>{rate.name} ({Number(rate.rate)}%)</option>)}
                                </select>
                                <button className="h-9 rounded-md bg-ink px-3 text-sm font-medium text-white">Aprobă</button>
                              </form>
                            ) : "Doar proprietarul sau managerul poate aproba."}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!dataRepairProducts.length && <TableRow><TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Nu există produse blocate pentru TVA.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Politica SGR aprobată de contabil</CardTitle></CardHeader>
              <CardContent>
                <form action={updateSgrPolicy} className="grid gap-3 sm:grid-cols-[1fr_9rem_9rem_auto] sm:items-end">
                  <label className="text-sm">Tratament
                    <select name="sgr_policy" defaultValue={sgrPolicy?.sgr_policy ?? "accountant_approval_required"} className="mt-1 h-10 w-full rounded-md border bg-card px-2">
                      <option value="accountant_approval_required">Necesită aprobarea contabilului</option>
                      <option value="outside_vat_scope">În afara bazei TVA</option>
                      <option value="included_in_taxable_base">Inclus în baza taxabilă</option>
                    </select>
                  </label>
                  <label className="text-sm">Garanție
                    <input name="sgr_deposit_amount" type="number" min="0" step="0.01" defaultValue={Number(sgrPolicy?.sgr_deposit_amount ?? 0.5)} className="mt-1 h-10 w-full rounded-md border px-2" />
                  </label>
                  <label className="text-sm">TVA
                    <input name="sgr_vat_rate" type="number" min="0" step="0.01" defaultValue={Number(sgrPolicy?.sgr_vat_rate ?? 0)} className="mt-1 h-10 w-full rounded-md border px-2" />
                  </label>
                  <button className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white">Salvează</button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Jurnal loturi de reparație</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {dataRepairBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between border-b py-2 text-sm">
                    <span>{batch.repair_type} · {new Date(batch.created_at).toLocaleString("ro-RO")}</span>
                    <Badge variant="outline">{batch.status}</Badge>
                  </div>
                ))}
                {!dataRepairBatches.length && <p className="py-6 text-center text-sm text-muted-foreground">Nu există loturi de reparație.</p>}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* ── BILLING ──────────────────────────────────────────────────── */}
      <section id="billing" className="scroll-mt-20">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t.settings.tabBilling}</h2>
        <div className="space-y-6">
          {referral.available && referral.link && (
            <Card>
              <CardHeader>
                <CardTitle>{t.referrals.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t.referrals.shareBefore}<strong>{t.referrals.shareBold}</strong>{t.referrals.shareAfter}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.referrals.code}</p>
                    <p className="font-medium">{referral.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.referrals.creditEarned}</p>
                    <p className="font-medium">{t.referrals.months(referral.creditMonths)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.referrals.trial}</p>
                    <p className="font-medium">{referral.daysLeft !== null ? t.referrals.daysLeft(referral.daysLeft) : t.referrals.daysLeftDefault}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-all rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">{referral.link}</p>
                  <CopyReferralButton link={referral.link} />
                </div>
                {referral.creditMonths > 0 && (
                  <p className="text-sm text-brass">{t.referrals.creditAppliedNote}</p>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t.referrals.peopleInvited}</p>
                  {referral.referrals.length ? (
                    referral.referrals.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <span>{r.referred_email || t.referrals.newBusiness}</span>
                        <span className="text-muted-foreground">{r.status ? (t.referrals.status[r.status] ?? r.status) : ""} &middot; {t.referrals.months(r.credit_months ?? 1)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.referrals.noReferralsYet}</p>
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
      </section>

      </div>

      <div className="mt-8">
        <TestimonialPromptCard />
      </div>
    </div>
  );
}
