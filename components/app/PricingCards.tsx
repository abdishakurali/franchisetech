import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { pricingPlans, connectedPlan } from "@/lib/billing/plans";
import { PricingCheckoutButton } from "@/components/app/PricingCheckoutButton";

export function PricingCards({ loggedIn, configured }: { loggedIn: boolean; configured: boolean }) {
  const activePlans = pricingPlans.filter((plan) => plan.id !== "multi_location");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {activePlans.map((plan) => (
        <div
          key={plan.id}
          className={`rounded-2xl border bg-white p-6 shadow-sm ${plan.highlighted ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
            </div>
            {plan.highlighted && <Badge className="bg-blue-600 text-white hover:bg-blue-600">Popular</Badge>}
          </div>
          <div className="mb-5 flex items-end gap-1">
            <span className="text-4xl font-bold text-slate-950">{plan.price}</span>
            <span className="pb-1 text-sm text-slate-500">{plan.cadence}</span>
          </div>
          <ul className="mb-6 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                {feature}
              </li>
            ))}
          </ul>
          <PricingCheckoutButton plan={plan.id} loggedIn={loggedIn} configured={configured} />
        </div>
      ))}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950">{connectedPlan.name}</h3>
        <p className="mt-2 text-sm text-slate-600">{connectedPlan.description}</p>
        <p className="my-6 text-3xl font-bold text-slate-950">{connectedPlan.price}</p>
        <ul className="space-y-3">
          {connectedPlan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
