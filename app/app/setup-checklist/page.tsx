import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { computeSetupProgress } from "@/lib/setup-progress";
import { SetupChecklist } from "@/components/app/SetupChecklist";
import { getSubscriptionStatus } from "@/lib/billing/subscription";

export default async function SetupChecklistPage() {
  const { countryCode, profileLocale, supabase, orgId } = await getKitchenOpsContext();
  const { locale } = await getAppLocaleAndText(countryCode, profileLocale);

  const [
    orgResult,
    productCountResult,
    paymentCountResult,
    txCountResult,
    sessionResult,
    moduleFlags,
    subscriptionStatus,
  ] = await Promise.all([
    supabase.from("organisations").select("name,country,currency_code,business_profile").eq("id", orgId).maybeSingle(),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("active", true),
    supabase
      .from("payment_methods")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("active", true),
    supabase
      .from("pos_transactions")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", orgId)
      .eq("status", "completed"),
    supabase
      .from("pos_sessions")
      .select("id")
      .eq("organisation_id", orgId)
      .eq("status", "open")
      .limit(1)
      .maybeSingle(),
    fetchOrgModuleFlags(supabase, orgId),
    getSubscriptionStatus(orgId).catch(() => null),
  ]);

  const org = orgResult.data;
  const progress = computeSetupProgress({
    orgName: org?.name,
    country: org?.country,
    currencyCode: org?.currency_code,
    businessProfile: org?.business_profile,
    inventoryEnabled: Boolean(moduleFlags.inventory_enabled),
    recipeCostingEnabled: Boolean(moduleFlags.recipe_costing_enabled),
    multiSiteOpsEnabled: Boolean(moduleFlags.multi_site_ops_enabled),
    productCount: productCountResult.count ?? 0,
    paymentMethodCount: paymentCountResult.count ?? 0,
    txCount: txCountResult.count ?? 0,
    openSession: Boolean(sessionResult.data),
    subscription:
      subscriptionStatus?.state === "active" ||
      subscriptionStatus?.state === "trialing" ||
      subscriptionStatus?.state === "soft_trial",
  });

  return (
    <div className="flex min-h-[50vh] items-start justify-center p-4 sm:p-8">
      <SetupChecklist
        locale={locale}
        steps={progress.steps}
        doneCount={progress.doneCount}
        totalCount={progress.totalCount}
        percent={progress.percent}
      />
    </div>
  );
}
