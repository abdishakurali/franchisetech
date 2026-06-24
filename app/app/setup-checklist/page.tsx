import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { computeSetupProgress } from "@/lib/setup-progress";
import { normaliseBusinessProfile, BUSINESS_PROFILE_LABELS } from "@/lib/business-profile";
import { enableInventoryFromSetup } from "@/app/actions/kitchenops";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { isModuleEnabled } from "@/lib/business-modules";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

function Step({ done, title, text, href, label, status, stepLabel }: { done: boolean; title: string; text: string; href: string; label: string; status?: string; stepLabel: string }) {
  return (
    <div className={`flex items-start gap-4 rounded-xl border p-4 ${done ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
      <div className="mt-0.5">{done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-slate-300" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">{stepLabel}</span>
          {status && <Badge variant="secondary" className="text-[10px]">{status}</Badge>}
        </div>
        <p className="mt-0.5 font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">
        {label} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default async function SetupChecklistPage({ searchParams }: { searchParams?: Promise<{ welcome?: string }> }) {
  const params = await searchParams;
  const isWelcome = params?.welcome === "1";
  const { countryCode, profileLocale, supabase, orgId } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const [
    { data: org },
    { count: productCount },
    { count: paymentMethodCount },
    { count: ingredientCount },
    { count: supplierCount },
    { count: purchaseCount },
    { count: recipeCount },
    { count: txCount },
    { count: siteCount },
    { data: openSession },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("organisations").select("name,country,currency_code").eq("id", orgId).maybeSingle(),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).eq("available_in_pos", true),
    supabase.from("payment_methods").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).eq("is_ingredient", true),
    supabase.from("suppliers").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("purchases").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("pos_transactions").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "completed"),
    supabase.from("sites").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("pos_sessions").select("id,status").eq("organisation_id", orgId).eq("status", "open").limit(1).maybeSingle(),
    supabase.from("billing_subscriptions").select("id,status,plan").eq("organisation_id", orgId).in("status", ["trialing", "active"]).limit(1).maybeSingle(),
  ]);

  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const profile = normaliseBusinessProfile(moduleFlags.business_profile);
  const progress = computeSetupProgress({
    orgName: org?.name,
    country: org?.country,
    currencyCode: org?.currency_code,
    businessProfile: profile,
    inventoryEnabled: isModuleEnabled(moduleFlags, "inventory"),
    recipeCostingEnabled: isModuleEnabled(moduleFlags, "recipe_costing"),
    multiSiteOpsEnabled: isModuleEnabled(moduleFlags, "multi_site"),
    productCount: productCount ?? 0,
    paymentMethodCount: paymentMethodCount ?? 0,
    txCount: txCount ?? 0,
    openSession: Boolean(openSession),
    subscription: Boolean(subscription),
    siteCount: siteCount ?? 0,
    ingredientCount: ingredientCount ?? 0,
    supplierCount: supplierCount ?? 0,
    purchaseCount: purchaseCount ?? 0,
    recipeCount: recipeCount ?? 0,
  });

  const coreSteps = progress.steps.filter((s) => s.section === "core");
  const billingSteps = progress.steps.filter((s) => s.section === "billing");
  const multiSiteSteps = progress.steps.filter((s) => s.section === "multi_site");
  const advancedSteps = progress.steps.filter((s) => s.section === "advanced");
  const showAdvanced = advancedSteps.length > 0;
  const showInventoryPrompt = !showAdvanced && profile === "simple";

  const profileSubtitle =
    profile === "simple"
      ? t.setupChecklist.subtitleSimple
      : profile === "multi_site"
        ? t.setupChecklist.subtitleMultiSite
        : t.setupChecklist.subtitleStandard;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {isWelcome && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">Bun venit la franchisetech!</p>
          <p className="mt-1">Casa ta este deschisă. Urmează pașii de mai jos — în 15 minute ești operațional.</p>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">{t.setupChecklist.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{profileSubtitle}</p>
        <Badge variant="secondary" className="mt-2">
          {BUSINESS_PROFILE_LABELS[profile]}
        </Badge>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/help/first-15-minutes-checklist" className="text-blue-600 hover:underline">{t.setupChecklist.first15}</Link>
          <Link href="/help/staff-cashier-checklist" className="text-blue-600 hover:underline">{t.setupChecklist.staffChecklist}</Link>
          <a href="mailto:info@franchisetech.ro?subject=Setup help" className="text-blue-600 hover:underline">{t.setupChecklist.needHelp}</a>
        </div>
      </div>
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {t.setupChecklist.speedBanner}
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{t.setupChecklist.progress(progress.doneCount, progress.totalCount)}</span><span className="font-bold text-blue-700">{progress.percent}%</span></div>
          <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress.percent}%` }} /></div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {coreSteps.map((step, index) => <Step key={step.id} stepLabel={t.setupChecklist.step(index + 1)} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />)}
      </div>
      {multiSiteSteps.length > 0 ? (
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{t.setupChecklist.multiSiteTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.setupChecklist.multiSiteDesc}</p>
          </div>
          {multiSiteSteps.map((step, index) => <Step key={step.id} stepLabel={t.setupChecklist.step(index + 1)} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />)}
        </div>
      ) : null}
      {showAdvanced ? (
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{t.setupChecklist.advancedTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {profile === "standard" || profile === "multi_site"
                ? t.setupChecklist.advancedStandard
                : t.setupChecklist.advancedOptional}
            </p>
          </div>
          {advancedSteps.map((step, index) => <Step key={step.id} stepLabel={t.setupChecklist.step(index + 1)} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />)}
        </div>
      ) : showInventoryPrompt ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-semibold text-slate-950">{t.setupChecklist.readyStock}</p>
              <p className="text-sm text-slate-500">{t.setupChecklist.readyStockDesc}</p>
            </div>
            <form action={enableInventoryFromSetup}>
              <Button type="submit" variant="outline">{t.setupChecklist.enableStock}</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      {billingSteps.length > 0 ? (
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{t.setupChecklist.billingTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.setupChecklist.billingDesc}</p>
          </div>
          {billingSteps.map((step, index) => (
            <Step key={step.id} stepLabel={t.setupChecklist.step(index + 1)} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
