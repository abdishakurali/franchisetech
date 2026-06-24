import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { isModuleNavVisible } from "@/lib/business-modules";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { filterReportLinks } from "@/lib/app-report-links";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { ReportsSearch } from "@/components/app/ReportsSearch";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import Link from "next/link";

export default async function ReportsHubPage() {
  const { countryCode, profileLocale, supabase, orgId } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const orgModules = await fetchOrgModuleFlags(supabase, orgId);
  const sub = await getSubscriptionStatus(orgId).catch(() => null);
  const hasTrial = sub?.state === "trialing" || sub?.state === "soft_trial";
  const inventoryVisible = isModuleNavVisible({ org: orgModules, module: "inventory", subscriptionPlan: sub?.plan, hasTrial });
  const recipeVisible = isModuleNavVisible({ org: orgModules, module: "recipe_costing", subscriptionPlan: sub?.plan, hasTrial });
  const accountantPackVisible = await hasEntitlement(orgId, "reports.accountant_pack", { write: false });
  const visibleReports = filterReportLinks(t, { inventoryVisible, recipeVisible, accountantPackVisible });
  const showCoreUpgradePrompt = !inventoryVisible && !hasTrial;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{t.reports.pageTitle}</h1>
        <p className="text-sm text-slate-500">{t.reports.pageSubtitle}</p>
      </div>
      {showCoreUpgradePrompt && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
          Want stock reports, recipes and kitchen display?{" "}
          <Link href="/pricing" className="font-semibold underline underline-offset-4">
            Upgrade to Operations — €79/mo.
          </Link>
        </div>
      )}
      <ReportsSearch reports={visibleReports} searchPlaceholder={t.reports.searchPlaceholder ?? "Caută raport…"} />
    </div>
  );
}
