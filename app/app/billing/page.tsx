import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { isBillingConfigured } from "@/lib/billing/plans";
import { PricingCards } from "@/components/app/PricingCards";
import { BillingPortalButton } from "@/components/app/BillingPortalButton";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

function statusColor(state: string) {
  if (state === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (state === "trialing" || state === "soft_trial") return "bg-blue-50 text-blue-700 border-blue-200";
  if (state === "past_due" || state === "canceled") return "bg-red-50 text-red-700 border-red-200";
  if (state === "incomplete") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function StatusIcon({ state }: { state: string }) {
  if (state === "active") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (state === "past_due" || state === "canceled") return <AlertCircle className="h-5 w-5 text-red-600" />;
  if (state === "incomplete") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Clock className="h-5 w-5 text-blue-600" />;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; checkout?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const { data: membership } = user
    ? await supabase.from("organisation_members").select("organisation_id").eq("user_id", user.id).limit(1).maybeSingle()
    : { data: null };

  const sub = membership ? await getSubscriptionStatus(membership.organisation_id) : null;
  const configured = isBillingConfigured();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-950">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your plan and payment details.</p>
      </div>

      {/* Trial-expired gate notice */}
      {params.reason === "trial_expired" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <p className="font-semibold">Your free trial has ended.</p>
          <p className="mt-0.5 opacity-80">
            Choose a plan below to continue using FranchiseTech. Your data is safe.
          </p>
        </div>
      )}

      {/* Checkout success notice */}
      {params.checkout === "success" && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <p className="font-semibold">🎉 Subscription activated!</p>
          <p className="mt-0.5 opacity-80">Your plan is now active. Thank you for subscribing.</p>
        </div>
      )}

      {sub && (
        <div className={`mb-8 rounded-2xl border p-6 ${statusColor(sub.state)}`}>
          <div className="flex items-start gap-3">
            <StatusIcon state={sub.state} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">{sub.label}</p>
              {sub.state === "trialing" && sub.trialDaysLeft != null && (
                <p className="mt-0.5 text-sm opacity-80">
                  {sub.trialDaysLeft} day{sub.trialDaysLeft === 1 ? "" : "s"} remaining on your trial.
                  {sub.stripeTrialEnd && ` Trial ends ${new Date(sub.stripeTrialEnd).toLocaleDateString("en-IE")}.`}
                </p>
              )}
              {sub.state === "soft_trial" && sub.trialDaysLeft != null && (
                <p className="mt-0.5 text-sm opacity-80">
                  {sub.trialDaysLeft} day{sub.trialDaysLeft === 1 ? "" : "s"} remaining. Choose a plan below to continue after your trial.
                </p>
              )}
              {sub.state === "active" && sub.periodEnd && (
                <p className="mt-0.5 text-sm opacity-80">
                  {sub.cancelAtPeriodEnd
                    ? `Cancels on ${new Date(sub.periodEnd).toLocaleDateString("en-IE")}.`
                    : `Next billing date: ${new Date(sub.periodEnd).toLocaleDateString("en-IE")}.`}
                </p>
              )}
              {sub.state === "past_due" && (
                <p className="mt-0.5 text-sm opacity-80">
                  Your last payment failed. Update your payment details to continue.
                </p>
              )}
              {sub.state === "canceled" && (
                <p className="mt-0.5 text-sm opacity-80">
                  Your subscription has ended. Choose a plan below to resubscribe.
                </p>
              )}
              {sub.state === "incomplete" && (
                <p className="mt-0.5 text-sm opacity-80">
                  Your checkout was not completed. Start a new checkout below to activate your plan.
                </p>
              )}
              {sub.plan && sub.state !== "incomplete" && (
                <p className="mt-1 text-xs font-medium opacity-70 uppercase tracking-wide">Plan: {sub.plan}</p>
              )}
            </div>
            {sub.stripeCustomerId && (
              <div className="shrink-0">
                <BillingPortalButton />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show pricing when: no sub at all, OR sub is incomplete/canceled (needs re-subscribe) */}
      {(!sub?.stripeSubscriptionId || sub.state === "incomplete" || sub.state === "canceled") && configured && (
        <div className="mb-8">
          <p className="mb-4 text-sm font-medium text-slate-700">
            {sub?.state === "canceled"
              ? "Resubscribe to restore access:"
              : sub?.state === "incomplete"
                ? "Complete your subscription:"
                : "Choose a plan to get started:"}
          </p>
          <PricingCards loggedIn={Boolean(user)} configured={configured} />
        </div>
      )}

      {sub?.stripeSubscriptionId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Subscription details</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Plan</dt>
              <dd className="mt-0.5 font-medium capitalize">{sub.plan ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Status</dt>
              <dd className="mt-0.5 font-medium capitalize">{sub.state.replace("_", " ")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">
                {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"}
              </dt>
              <dd className="mt-0.5 font-medium">
                {sub.periodEnd ? new Date(sub.periodEnd).toLocaleDateString("en-IE") : "—"}
              </dd>
            </div>
            {sub.creditMonths > 0 && (
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">Referral credit</dt>
                <dd className="mt-0.5 font-medium text-blue-700">
                  {sub.creditMonths} free month{sub.creditMonths === 1 ? "" : "s"} pending
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
