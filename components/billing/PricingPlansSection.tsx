import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  connectedPlan,
  getPlanFeatureCategories,
  planDescriptionForMarket,
  pricingPlans,
  type BillingPlan,
} from "@/lib/billing/plans";
import { BILLING_MARKET_LABELS, type BillingMarket } from "@/lib/billing/market";
import { PricingCheckoutButton } from "@/components/app/PricingCheckoutButton";

type PricingLabels = {
  mainPlan: string;
  seeFeatures: string;
  getStarted: string;
  freeSetupStrip: string;
  setupFreeTitle: string;
  setupFreeText: string;
  setupTitle: string;
  setupText: string;
  setupFeeNote: string;
  multiTitle: string;
  multiText: string;
};

type Props = {
  variant: "marketing" | "billing";
  market?: BillingMarket;
  loggedIn?: boolean;
  configured?: boolean;
  labels?: PricingLabels;
};

function planLabel(planId: string) {
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

function PlanFeaturesAccordion({
  planId,
  market,
  seeFeatures,
}: {
  planId: BillingPlan;
  market: BillingMarket;
  seeFeatures: string;
}) {
  const categories = getPlanFeatureCategories(planId, market);
  return (
    <details className="group mt-4">
      <summary className="cursor-pointer list-none text-sm font-medium text-blue-600 hover:underline [&::-webkit-details-marker]:hidden">
        {seeFeatures}
      </summary>
      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        {categories.map((category) => (
          <div key={category.title}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{category.title}</p>
            <ul className="space-y-2">
              {category.items.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

export function PricingPlansSection({
  variant,
  market = "IE",
  loggedIn = false,
  configured = false,
  labels,
}: Props) {
  const monthlyPlans = pricingPlans.filter((plan) => plan.id !== "multi_location");
  const multiPlan = pricingPlans.find((plan) => plan.id === "multi_location");
  const l = labels ?? {
    mainPlan: "Main plan",
    seeFeatures: "See all features",
    getStarted: "Get started",
    freeSetupStrip: "Start free. In-app setup included — under an hour to your first sale.",
    setupFreeTitle: "Free in-app setup",
    setupFreeText: "New account → demo products → open till → first sale. Step-by-step guide, no cost.",
    setupTitle: "Optional premium setup",
    setupText: "For large catalogs, multi-site, or FiscalNet — we configure everything for you.",
    setupFeeNote: `Optional premium setup ${connectedPlan.price} one-time.`,
    multiTitle: "Multi-location",
    multiText: "For owners with 2+ shops or a second location opening soon.",
  };

  return (
    <div className="space-y-10">
      {variant === "marketing" ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-sm font-medium text-blue-800">
          {l.freeSetupStrip}
        </div>
      ) : null}

      {variant === "marketing" ? (
        <p className="text-sm text-slate-500">
          Features tailored for <span className="font-medium text-slate-700">{BILLING_MARKET_LABELS[market]}</span>.
        </p>
      ) : (
        <p className="text-sm text-slate-500">
          Features tailored for <span className="font-medium text-slate-700">{BILLING_MARKET_LABELS[market]}</span>.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {monthlyPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 text-left sm:p-8 ${
              plan.highlighted ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-white"
            }`}
          >
            {plan.id === "pro" && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                Recomandat
              </span>
            )}
            {plan.highlighted ? (
              <Badge className="absolute right-4 top-4 border-0 bg-blue-600 text-white hover:bg-blue-600">
                {l.mainPlan}
              </Badge>
            ) : null}
            <p className={`text-sm font-semibold uppercase tracking-wide ${plan.highlighted ? "text-blue-700" : "text-slate-500"}`}>
              {planLabel(plan.id)}
            </p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{plan.price}</p>
            <p className="text-sm text-slate-500">{plan.cadence.replace("/", "per ")}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{planDescriptionForMarket(plan.id, market)}</p>
            <PlanFeaturesAccordion planId={plan.id} market={market} seeFeatures={l.seeFeatures} />
            {variant === "marketing" ? (
              <Link href={`/signup?plan=${plan.id}`} className="mt-6 block">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
              </Link>
            ) : (
              <div className="mt-6">
                <PricingCheckoutButton plan={plan.id} loggedIn={loggedIn} configured={configured} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">{l.setupFreeTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{l.setupFreeText}</p>
          {variant === "marketing" ? (
            <Link href="/signup?plan=starter" className="mt-6 block">
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
            </Link>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">{l.setupTitle}</h2>
          <p className="mt-2 text-3xl font-bold text-slate-950">{connectedPlan.price}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{l.setupText}</p>
          <p className="mt-4 text-xs text-slate-500">{l.setupFeeNote.replace("{price}", connectedPlan.price)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">{l.multiTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{l.multiText}</p>
          <p className="mt-4 text-3xl font-bold text-slate-950">
            {multiPlan?.price ?? "€99"}
            <span className="text-base font-normal text-slate-500">/month</span>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {multiPlan ? planDescriptionForMarket("multi_location", market) : l.multiText}
          </p>
          {multiPlan ? (
            <PlanFeaturesAccordion planId="multi_location" market={market} seeFeatures={l.seeFeatures} />
          ) : null}
          {variant === "marketing" ? (
            <Link href="/signup?plan=multi_location" className="mt-6 block">
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
            </Link>
          ) : multiPlan ? (
            <div className="mt-6">
              <PricingCheckoutButton plan={"multi_location" as BillingPlan} loggedIn={loggedIn} configured={configured} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
