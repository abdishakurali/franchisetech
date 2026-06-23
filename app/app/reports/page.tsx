import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { isModuleEnabled } from "@/lib/business-modules";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { filterReportLinks } from "@/lib/app-report-links";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { ReportsSearch } from "@/components/app/ReportsSearch";

export default async function ReportsHubPage() {
  const { countryCode, profileLocale, supabase, orgId } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const orgModules = await fetchOrgModuleFlags(supabase, orgId);
  const inventoryVisible = isModuleEnabled(orgModules, "inventory");
  const recipeVisible = isModuleEnabled(orgModules, "recipe_costing");
  const visibleReports = filterReportLinks(t, { inventoryVisible, recipeVisible });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{t.reports.pageTitle}</h1>
        <p className="text-sm text-slate-500">{t.reports.pageSubtitle}</p>
      </div>
      <ReportsSearch reports={visibleReports} searchPlaceholder={t.reports.searchPlaceholder ?? "Caută raport…"} />
    </div>
  );
}
