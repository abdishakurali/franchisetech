import Link from "next/link";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { isModuleEnabled } from "@/lib/business-modules";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { filterReportLinks } from "@/lib/app-report-links";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleReports.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.color}`}>
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{r.title}</p>
                  {r.tag ? (
                    <span className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 font-medium">{r.tag}</span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
