export const dynamic = "force-dynamic";

import Stripe from "stripe";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { startTrialAfterCardVerification } from "@/lib/billing/verification";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Verificare card — franchisetech" };

const copy = {
  ro: {
    titlePending: "Verificăm plata…",
    bodyPending:
      "Dacă plata a reușit, trialul pornește automat în câteva momente. Reîncarcă pagina sau revino la verificare.",
    titleError: "Verificarea nu a putut fi confirmată",
    bodyError:
      "Plata poate fi reușită în Stripe, dar nu am putut confirma verificarea. Încearcă din nou sau contactează suportul.",
    retry: "Înapoi la verificare",
  },
  en: {
    titlePending: "Checking payment…",
    bodyPending:
      "If the payment succeeded, your trial starts automatically in a few moments. Reload this page or go back to verification.",
    titleError: "Verification could not be confirmed",
    bodyError:
      "The payment may have succeeded in Stripe, but we could not confirm the verification. Try again or contact support.",
    retry: "Back to verification",
  },
} as const;

export default async function VerifyCardSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("organisation_members")
    .select("organisation_id, organisations(country_code)")
    .eq("user_id", user.id)
    .or("status.is.null,status.eq.active");

  const memberOrgIds = (memberships ?? []).map((m) => m.organisation_id);
  const firstMembership = memberships?.[0] as
    | { organisations?: { country_code?: string | null } | { country_code?: string | null }[] | null }
    | undefined;
  const joinedOrg = Array.isArray(firstMembership?.organisations)
    ? firstMembership.organisations[0]
    : firstMembership?.organisations;
  const t = joinedOrg?.country_code === "RO" ? copy.ro : copy.en;

  let state: "pending" | "error" = "pending";
  let verified = false;

  if (params.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(params.session_id);
      const orgId = session.metadata?.organisation_id ?? session.client_reference_id;

      const isCardVerification =
        session.mode === "payment" && session.metadata?.purpose === "card_verification";
      const belongsToUser = Boolean(orgId && memberOrgIds.includes(orgId));

      if (isCardVerification && belongsToUser && session.payment_status === "paid" && orgId) {
        const result = await startTrialAfterCardVerification({
          organisationId: orgId,
          paymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          actor: { userId: user.id, email: user.email ?? null },
        });
        verified = result.started || result.alreadyStarted;
      } else if (isCardVerification && belongsToUser) {
        state = "pending"; // payment not settled yet — webhook will start the trial
      } else {
        state = "error";
      }
    } catch (err) {
      console.error("[verify_card_success] confirmation failed", err);
      state = "error";
    }
  } else {
    state = "error";
  }

  if (verified) {
    redirect("/app/pos?welcome=1");
  }

  const Icon = state === "error" ? AlertTriangle : Clock;
  const iconClass = state === "error" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 py-10">
      <section className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="flex justify-center">
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", iconClass)}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">
            {state === "error" ? t.titleError : t.titlePending}
          </h1>
          <p className="text-sm text-slate-500">{state === "error" ? t.bodyError : t.bodyPending}</p>
        </div>
        <Link
          href="/onboarding/verify-card"
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full bg-blue-600 text-white hover:bg-blue-500")}
        >
          {t.retry}
        </Link>
      </section>
    </main>
  );
}
