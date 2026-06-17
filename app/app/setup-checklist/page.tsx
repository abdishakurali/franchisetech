import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";

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
    { data: openSession },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("organisations").select("name,currency_code,currency_symbol").eq("id", orgId).maybeSingle(),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).eq("available_in_pos", true),
    supabase.from("payment_methods").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true).eq("is_ingredient", true),
    supabase.from("suppliers").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("purchases").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("organisation_id", orgId),
    supabase.from("pos_transactions").select("*", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "completed"),
    supabase.from("pos_sessions").select("id,status").eq("organisation_id", orgId).eq("status", "open").limit(1).maybeSingle(),
    supabase.from("billing_subscriptions").select("id,status,plan").eq("organisation_id", orgId).in("status", ["trialing", "active"]).limit(1).maybeSingle(),
  ]);

  const firstSaleSteps = [
    { done: Boolean(org?.name), title: "Add business details", text: "Confirm your business name, country, currency, and receipt details.", href: "/app/settings", label: "Open settings", status: org?.name ? "Business created" : "Missing details" },
    { done: (productCount ?? 0) > 0, title: "Add products and categories", text: "Add the first items you sell. You only need a few products to start.", href: "/app/products/new", label: "Add product", status: `${productCount ?? 0} products` },
    { done: (paymentMethodCount ?? 0) > 0, title: "Set payment methods", text: "Keep Cash and Card ready so every sale records the right payment type.", href: "/app/settings", label: "Open settings", status: `${paymentMethodCount ?? 0} methods` },
    { done: !!openSession, title: "Open till", text: "Enter the cash float before you start selling.", href: "/app/pos", label: "Open POS", status: openSession ? "Till open" : "Till closed" },
    { done: (txCount ?? 0) > 0, title: "Make first sale", text: "Run one real or test sale so the dashboard and reports have live data.", href: "/app/pos", label: "Go to POS", status: `${txCount ?? 0} sales` },
    { done: (txCount ?? 0) > 0, title: "Check daily report", text: "Review sales, cash/card totals, and top products after the first sale.", href: "/app/reports", label: "View reports" },
    { done: Boolean(subscription), title: "Choose plan", text: "Pick Starter or Pro before the trial ends. Setup support is handled separately.", href: "/app/billing", label: "Choose plan", status: subscription?.plan ? `${subscription.plan} ${subscription.status}` : "Trial only" },
  ];

  const advancedSteps = [
    { done: (ingredientCount ?? 0) > 0, title: "Add ingredients", text: "Add stock items you buy and use in recipes.", href: "/app/products/import-ingredients", label: "Add ingredients", status: `${ingredientCount ?? 0} ingredients` },
    { done: (supplierCount ?? 0) > 0, title: "Add suppliers", text: "Record who you buy stock from.", href: "/app/suppliers/new", label: "Add supplier", status: `${supplierCount ?? 0} suppliers` },
    { done: (purchaseCount ?? 0) > 0, title: "Record purchase", text: "Log a delivery to increase stock and track costs.", href: "/app/purchases/new", label: "Record purchase", status: `${purchaseCount ?? 0} purchases` },
    { done: (recipeCount ?? 0) > 0, title: "Create recipes", text: "Connect products to ingredients to see cost, margin, and stock coverage.", href: "/app/recipes/new", label: "Create recipe", status: `${recipeCount ?? 0} recipes` },
  ];
  const doneCount = firstSaleSteps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Setup guide</h1>
        <p className="mt-1 text-sm text-slate-500">Start with products, payments, the till, one sale, and one report. Stock and recipes can wait.</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/help/first-15-minutes-checklist" className="text-blue-600 hover:underline">First 15 minutes checklist</Link>
          <Link href="/help/staff-cashier-checklist" className="text-blue-600 hover:underline">Staff checklist</Link>
          <a href="mailto:info@franchisetech.ro?subject=Setup help" className="text-blue-600 hover:underline">Need help?</a>
        </div>
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{doneCount} of {firstSaleSteps.length} done</span><span className="font-bold text-blue-700">{Math.round((doneCount / firstSaleSteps.length) * 100)}%</span></div>
          <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${(doneCount / firstSaleSteps.length) * 100}%` }} /></div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {firstSaleSteps.map((step, index) => <Step key={step.title} num={index + 1} {...step} />)}
      </div>
      <div className="space-y-3 pt-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Improve margins and stock control</h2>
          <p className="mt-1 text-sm text-slate-500">Use these after the till is working. They are optional during the first trial setup.</p>
        </div>
        {advancedSteps.map((step, index) => <Step key={step.title} num={index + 1} {...step} />)}
      </div>
    </div>
  );
}
