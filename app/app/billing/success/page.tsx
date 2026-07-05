import Stripe from "stripe";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { syncStripeCheckoutSession } from "@/lib/billing/stripe-sync";
import { BillingSuccessRefresh } from "@/components/billing/BillingSuccessRefresh";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import type { AppLocale } from "@/lib/app-i18n";

export const metadata = { title: "Subscription Confirmed — franchisetech" };

const copy = {
  en: {
    titleSynced: "Subscription is active",
    titlePending: "Checking payment",
    titleError: "Payment verification failed",
    bodySynced: "Payment was confirmed and access is active.",
    bodyPending: "If payment succeeded, access will activate automatically in a few moments.",
    bodyError: "Payment may have succeeded in Stripe, but we could not sync the subscription. Contact support.",
    receiptTitle: "Payment confirmation",
    receiptBody: "Stripe will email the payment confirmation to the billing email.",
    accountingTitle: "Invoice for accounting",
    accountingBody: "Use this invoice link or PDF for your accounting records.",
    viewInvoice: "View invoice",
    downloadPdf: "Download PDF",
    backToApp: "Back to app",
    viewBilling: "View subscription",
  },
  ro: {
    titleSynced: "Abonamentul este activ",
    titlePending: "Verificăm plata",
    titleError: "Verificarea plății a eșuat",
    bodySynced: "Plata a fost confirmată și accesul este activ.",
    bodyPending: "Dacă plata a reușit, accesul se activează automat în câteva momente.",
    bodyError: "Plata poate fi reușită în Stripe, dar nu am putut sincroniza abonamentul. Contactează suportul.",
    receiptTitle: "Confirmarea plății",
    receiptBody: "Stripe va trimite confirmarea plății pe emailul de facturare.",
    accountingTitle: "Factura pentru contabilitate",
    accountingBody: "Folosește linkul sau PDF-ul facturii pentru evidența contabilă.",
    viewInvoice: "Vezi factura",
    downloadPdf: "Descarcă PDF",
    backToApp: "Înapoi în aplicație",
    viewBilling: "Vezi abonamentul",
  },
} as const;

function titleForState(locale: AppLocale, state: "synced" | "pending" | "error") {
  const c = copy[locale];
  if (state === "synced") return c.titleSynced;
  if (state === "error") return c.titleError;
  return c.titlePending;
}

function bodyForState(locale: AppLocale, state: "synced" | "pending" | "error") {
  const c = copy[locale];
  if (state === "synced") return c.bodySynced;
  if (state === "error") return c.bodyError;
  return c.bodyPending;
}

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  let state: "synced" | "pending" | "error" = "pending";
  let invoiceUrl: string | null = null;
  let invoicePdfUrl: string | null = null;
  let locale: AppLocale = "en";

  if (params.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user
        ? await supabase.from("profiles").select("locale").eq("id", user.id).maybeSingle()
        : { data: null };
      const { data: memberships } = user
        ? await supabase
            .from("organisation_members")
            .select("organisation_id, organisations(country_code)")
            .eq("user_id", user.id)
            .or("status.is.null,status.eq.active")
        : { data: null };
      const firstMembership = memberships?.[0] as
        | { organisations?: { country_code?: string | null } | { country_code?: string | null }[] | null }
        | undefined;
      const joinedOrg = Array.isArray(firstMembership?.organisations)
        ? firstMembership.organisations[0]
        : firstMembership?.organisations;
      const countryCode = joinedOrg?.country_code ?? null;
      locale = getAppLocaleAndText(countryCode, (profile?.locale as string | null) ?? null).locale;

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(params.session_id, {
        expand: ["invoice"],
      });
      const invoice = typeof session.invoice === "object" ? session.invoice as Stripe.Invoice : null;
      invoiceUrl = (invoice as { hosted_invoice_url?: string | null } | null)?.hosted_invoice_url ?? null;
      invoicePdfUrl = (invoice as { invoice_pdf?: string | null } | null)?.invoice_pdf ?? null;
      const sync = await syncStripeCheckoutSession(stripe, params.session_id, {
        allowedUserId: user?.id,
        allowedOrganisationIds: (memberships ?? []).map((m) => m.organisation_id),
      });
      state = sync.synced ? "synced" : "pending";
    } catch (err) {
      console.error("[billing_success] checkout reconciliation failed", err);
      state = "error";
    }
  }

  const Icon = state === "synced" ? CheckCircle2 : state === "error" ? AlertTriangle : Clock;
  const iconClass = state === "synced" ? "bg-emerald-100 text-emerald-600" : state === "error" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600";
  const noticeClass = state === "synced" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : state === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800";
  const c = copy[locale];
  const title = titleForState(locale, state);
  const body = bodyForState(locale, state);

  return (
    <main className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <BillingSuccessRefresh enabled={state === "synced"} />
      <section className="max-w-lg text-center space-y-6" aria-labelledby="billing-success-title" aria-live="polite">
        <div className="flex justify-center">
          <div className={cn("flex h-20 w-20 items-center justify-center rounded-full", iconClass)}>
            <Icon className="h-10 w-10" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 id="billing-success-title" className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-base">
            {body}
          </p>
        </div>

        <div className={cn("rounded-xl border px-6 py-4 text-sm text-left", noticeClass)}>
          <p className="font-semibold">{c.receiptTitle}</p>
          <p className="mt-1">{c.receiptBody}</p>
          {state === "synced" && (invoiceUrl || invoicePdfUrl) && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-white/70 p-4">
              <p className="font-semibold text-emerald-950">{c.accountingTitle}</p>
              <p className="mt-1 text-emerald-900">{c.accountingBody}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {invoiceUrl && (
                <a
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-white focus-visible:ring-2 focus-visible:ring-emerald-600")}
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={c.viewInvoice}
                >
                  {c.viewInvoice}
                </a>
              )}
              {invoicePdfUrl && (
                <a
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-white focus-visible:ring-2 focus-visible:ring-emerald-600")}
                  href={invoicePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={c.downloadPdf}
                >
                  {c.downloadPdf}
                </a>
              )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/app"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "bg-blue-600 hover:bg-blue-500 text-white")}
          >
            {c.backToApp}
          </Link>
          <Link
            href="/app/billing"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {c.viewBilling}
          </Link>
        </div>
      </section>
    </main>
  );
}
