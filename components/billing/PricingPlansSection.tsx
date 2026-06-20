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

type Props = {
  variant: "marketing" | "billing";
  market?: BillingMarket;
  loggedIn?: boolean;
  configured?: boolean;
};

function planLabel(planId: string) {
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

export function PricingPlansSection({
  variant,
  market = "IE",
  loggedIn = false,
  configured = false,
}: Props) {
  const monthlyPlans = pricingPlans.filter((plan) => plan.id !== "multi_location");
  const multiPlan = pricingPlans.find((plan) => plan.id === "multi_location");

  return (
    <div className="space-y-12">
      <p className="text-sm text-slate-500">
        Features tailored for <span className="font-medium text-slate-700">{BILLING_MARKET_LABELS[market]}</span>
        {variant === "marketing" ? " — change language in the header to see other regions." : "."}
      </p>
      <div className="grid gap-8 md:grid-cols-2">
        {monthlyPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-8 text-left ${
              plan.highlighted ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"
            }`}
          >
            {plan.highlighted ? (
              <Badge className="absolute right-4 top-4 border-0 bg-blue-600 text-white hover:bg-blue-600">
                Main plan
              </Badge>
            ) : null}
            <p className={`mb-2 text-sm font-semibold uppercase tracking-wide ${plan.highlighted ? "text-blue-700" : "text-slate-500"}`}>
              {planLabel(plan.id)}
            </p>
            <p className="mb-1 text-4xl font-bold text-slate-900">{plan.price}</p>
            <p className="mb-4 text-sm text-slate-500">{plan.cadence.replace("/", "per ")}</p>
            <p className="mb-6 text-sm leading-6 text-slate-600">{planDescriptionForMarket(plan.id, market)}</p>
            <div className="mb-8 space-y-5">
              {getPlanFeatureCategories(plan.id, market).map((category) => (
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
            {variant === "marketing" ? (
              <Link href={`/signup?plan=${plan.id}`}>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Start {planLabel(plan.id)} trial
                </Button>
              </Link>
            ) : (
              <PricingCheckoutButton plan={plan.id} loggedIn={loggedIn} configured={configured} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-950">{connectedPlan.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{connectedPlan.description}</p>
          <p className="mt-6 text-3xl font-bold text-slate-950">{connectedPlan.price}</p>
          <ul className="mt-6 space-y-3">
            {connectedPlan.features.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold text-slate-950">Multi-location</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            For owners with 2+ shops or a second location opening soon.
          </p>
          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-3xl font-bold text-slate-950">
              {multiPlan?.price ?? "€99"}
              <span className="text-base font-normal text-slate-500">/month</span>
            </p>
            <p className="mt-3 text-sm text-slate-600">
              {multiPlan ? planDescriptionForMarket("multi_location", market) : "For businesses running two or more sites."}
            </p>
          </div>
          {multiPlan ? (
            <div className="mt-6 space-y-4">
              {getPlanFeatureCategories("multi_location", market).map((category) => (
                <div key={category.title}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{category.title}</p>
                  <ul className="mt-2 space-y-2">
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
          ) : null}
          {variant === "marketing" ? (
            <Link href="/signup?plan=multi_location" className="mt-6 inline-block w-full">
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Start multi-location trial</Button>
            </Link>
          ) : (
            <div className="mt-6">
              <PricingCheckoutButton plan={"multi_location" as BillingPlan} loggedIn={loggedIn} configured={configured} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
