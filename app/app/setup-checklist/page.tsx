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

function Step({ done, num, title, text, href, label, status }: { done: boolean; num: number; title: string; text: string; href: string; label: string; status?: string }) {
  return (
    <div className={`flex items-start gap-4 rounded-xl border p-4 ${done ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
      <div className="mt-0.5">{done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-slate-300" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Step {num}</span>
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

export default async function SetupChecklistPage() {
  const { supabase, orgId } = await getKitchenOpsContext();
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Setup guide</h1>
        <p className="mt-1 text-sm text-slate-500">
          {profile === "simple"
            ? "Start with products, payments, the till, one sale, and one report. Stock and recipes can wait."
            : profile === "multi_site"
              ? "Set up each location, then run sales and reporting across sites."
              : "POS first, then stock and recipes as part of your core path."}
        </p>
        <Badge variant="secondary" className="mt-2">
          {BUSINESS_PROFILE_LABELS[profile]}
        </Badge>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/help/first-15-minutes-checklist" className="text-blue-600 hover:underline">First 15 minutes checklist</Link>
          <Link href="/help/staff-cashier-checklist" className="text-blue-600 hover:underline">Staff checklist</Link>
          <a href="mailto:info@franchisetech.ro?subject=Setup help" className="text-blue-600 hover:underline">Need help?</a>
        </div>
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{progress.doneCount} of {progress.totalCount} done</span><span className="font-bold text-blue-700">{progress.percent}%</span></div>
          <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress.percent}%` }} /></div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {coreSteps.map((step, index) => <Step key={step.id} num={index + 1} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />)}
      </div>
      {multiSiteSteps.length > 0 ? (
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Multi-site setup</h2>
            <p className="mt-1 text-sm text-slate-500">Add each branch before rolling out POS everywhere.</p>
          </div>
          {multiSiteSteps.map((step, index) => <Step key={step.id} num={index + 1} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />)}
        </div>
      ) : null}
      {showAdvanced ? (
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Stock, purchases &amp; recipes</h2>
            <p className="mt-1 text-sm text-slate-500">
              {profile === "standard" || profile === "multi_site"
                ? "These steps are part of your setup path — not optional extras."
                : "Improve margins and stock control after the till is working."}
            </p>
          </div>
          {advancedSteps.map((step, index) => <Step key={step.id} num={index + 1} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />)}
        </div>
      ) : showInventoryPrompt ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-semibold text-slate-950">Ready to track stock?</p>
              <p className="text-sm text-slate-500">Enable inventory and recipe modules when you want purchases and margins.</p>
            </div>
            <form action={enableInventoryFromSetup}>
              <Button type="submit" variant="outline">Enable stock tracking</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      {billingSteps.length > 0 ? (
        <div className="space-y-3 pt-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Billing</h2>
            <p className="mt-1 text-sm text-slate-500">Optional until your assisted trial ends — subscribe when you are ready.</p>
          </div>
          {billingSteps.map((step, index) => (
            <Step key={step.id} num={index + 1} done={step.done} title={step.title} text={step.text} href={step.href} label={step.label} status={step.status} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
