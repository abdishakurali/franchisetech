"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPlanFeatureCategories,
  planDescriptionForMarket,
  pricingPlans,
  setupOptions,
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

const PLAN_SHORT_NAMES: Record<BillingPlan, string> = {
  starter: "Core",
  core: "Core",
  pro: "Operations",
  operations: "Operations",
  scale: "Scale",
  multi_location: "Multi-location",
};

type Props = {
  variant: "marketing" | "billing";
  market?: BillingMarket;
  loggedIn?: boolean;
  configured?: boolean;
  labels?: PricingLabels;
};

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
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4" aria-label={seeFeatures}>
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
  );
}

export function PricingPlansSection({
  variant,
  market = "RO",
  loggedIn = false,
  configured = false,
  labels,
}: Props) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const l = labels ?? {
    mainPlan: "Most popular",
    seeFeatures: "See all features",
    getStarted: "Get started",
    freeSetupStrip: "Start free. In-app setup included — under an hour to your first sale.",
    setupFreeTitle: "Free in-app setup",
    setupFreeText: "New account → demo products → open till → first sale. Step-by-step guide, no cost.",
    setupTitle: "Assisted setup",
    setupText: "",
    setupFeeNote: "",
    multiTitle: "Multi-location",
    multiText: "For businesses running 2+ locations.",
  };

  const mainPlans = pricingPlans.filter((p) => p.id !== "multi_location");
  const multiPlan = pricingPlans.find((p) => p.id === "multi_location");

  return (
    <div className="space-y-10">
      {variant === "marketing" && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-sm font-medium text-blue-800">
          {l.freeSetupStrip}
        </div>
      )}

      <p className="text-sm text-slate-500">
        Features tailored for <span className="font-medium text-slate-700">{BILLING_MARKET_LABELS[market]}</span>.
      </p>

      {/* Monthly / Annual toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setInterval("month")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            interval === "month"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval("year")}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            interval === "year"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Annual
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            interval === "year" ? "bg-emerald-400 text-emerald-900" : "bg-emerald-100 text-emerald-700"
          }`}>
            Save 20%
          </span>
        </button>
      </div>

      {interval === "year" && (
        <p className="text-center text-sm text-slate-500">
          Billed annually — pay for 10 months and get 12.
        </p>
      )}

      {/* Main plan cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {mainPlans.map((plan) => {
          const displayPrice = interval === "year" ? plan.annualPrice : plan.price;
          const displayCadence = interval === "year" ? plan.annualCadence : plan.cadence;
          const shortName = PLAN_SHORT_NAMES[plan.id];

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 text-left sm:p-8 ${
                plan.highlighted ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                  {l.mainPlan}
                </span>
              )}
              <p className={`text-sm font-semibold uppercase tracking-wide ${plan.highlighted ? "text-blue-700" : "text-slate-500"}`}>
                {shortName}
              </p>
              <p className="mt-2 text-4xl font-bold text-slate-900">{displayPrice}</p>
              <p className="text-sm text-slate-500">{displayCadence}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{planDescriptionForMarket(plan.id, market)}</p>
              <PlanFeaturesAccordion planId={plan.id} market={market} seeFeatures={l.seeFeatures} />
              {variant === "marketing" ? (
                <Link href={`/signup?plan=${plan.id}`} className="mt-6 block">
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
                </Link>
              ) : (
                <div className="mt-6">
                  <PricingCheckoutButton plan={plan.id} loggedIn={loggedIn} configured={configured} interval={interval} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Setup options + Multi-location row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free self-serve setup */}
        <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">{l.setupFreeTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {l.setupFreeText}
          </p>
          {variant === "marketing" && (
            <Link href="/signup?plan=starter" className="mt-6 block">
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
            </Link>
          )}
        </div>

        {/* Assisted setup options */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">{l.setupTitle}</h2>
          {l.setupText ? <p className="mt-2 text-sm leading-6 text-slate-600">{l.setupText}</p> : null}
          <div className="mt-3 space-y-3">
            {setupOptions.map((opt) => (
              <div key={opt.name} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-800">
                  {opt.name} — <span className="text-blue-700">{opt.price}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{opt.description}</p>
              </div>
            ))}
          </div>
          {l.setupFeeNote ? <p className="mt-4 text-xs text-slate-500">{l.setupFeeNote}</p> : null}
        </div>

        {/* Multi-location */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-950">{l.multiTitle}</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">Scale plan required</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {interval === "year" ? multiPlan?.annualPrice ?? "€71" : multiPlan?.price ?? "€89"}
            <span className="text-base font-normal text-slate-500">/additional location/month</span>
          </p>
          {interval === "year" && (
            <p className="mt-1 text-xs text-slate-400">billed annually</p>
          )}
          <p className="mt-3 text-sm text-slate-600">
            {multiPlan ? planDescriptionForMarket("multi_location", market) : l.multiText}
          </p>
          {multiPlan && <PlanFeaturesAccordion planId="multi_location" market={market} seeFeatures={l.seeFeatures} />}
          {variant === "marketing" ? (
            <Link href="/signup?plan=multi_location" className="mt-6 block">
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
            </Link>
          ) : multiPlan ? (
            <div className="mt-6">
              <PricingCheckoutButton plan="multi_location" loggedIn={loggedIn} configured={configured} interval={interval} />
            </div>
          ) : null}
        </div>
      </div>

      {interval === "month" && (
        <p className="text-center text-xs text-slate-400">
          Switch to annual billing and pay for 10 months, get 12 — saving 20%.
        </p>
      )}
    </div>
  );
}
