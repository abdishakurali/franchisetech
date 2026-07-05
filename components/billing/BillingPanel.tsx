import Stripe from "stripe";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { BillingPortalButton } from "@/components/app/BillingPortalButton";
import { PricingPlansSection } from "@/components/billing/PricingPlansSection";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import type { AppLocale } from "@/lib/app-i18n";
import { marketFromCountryCode } from "@/lib/billing/market";
import { isBillingConfigured } from "@/lib/billing/plans";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { effectivePlanLabel } from "@/lib/business-modules";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type BillingSearchParams = { reason?: string; checkout?: string };

function statusColor(state: string) {
  if (state === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (state === "trialing" || state === "soft_trial") return "bg-blue-50 text-blue-700 border-blue-200";
  if (state === "past_due" || state === "past_due_expired" || state === "canceled") return "bg-red-50 text-red-700 border-red-200";
  if (state === "incomplete") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function formatDate(locale: AppLocale, iso: string) {
  return new Date(iso).toLocaleDateString(locale === "ro" ? "ro-RO" : "en-IE");
}

function trialText(locale: AppLocale, days: number | null) {
  if (locale === "ro") {
    if (days === null) return "Perioada de probă este activă.";
    if (days === 1) return "Mai ai 1 zi de probă.";
    return `Mai ai ${days} zile de probă.`;
  }
  if (days === null) return "Your trial is active.";
  if (days === 1) return "You have 1 trial day left.";
  return `You have ${days} trial days left.`;
}

function statusLabel(locale: AppLocale, state: string) {
  const ro: Record<string, string> = {
    active: "Activ",
    trialing: "Trial Stripe",
    soft_trial: "Trial gratuit",
    past_due: "Plată eșuată",
    past_due_expired: "Plată restantă",
    canceled: "Anulat",
    incomplete: "Checkout nefinalizat",
    none: "Fără plan activ",
  };
  const en: Record<string, string> = {
    active: "Active",
    trialing: "Stripe trial",
    soft_trial: "Free trial",
    past_due: "Payment failed",
    past_due_expired: "Payment overdue",
    canceled: "Canceled",
    incomplete: "Checkout incomplete",
    none: "No active plan",
  };
  return (locale === "ro" ? ro : en)[state] ?? state;
}

const copy = {
  en: {
    title: "Billing",
    subtitle: "Manage your plan and payment details.",
    trialExpiredTitle: "Your trial has ended.",
    trialExpiredDesc: "Choose a plan to continue using FranchiseTech. Your data stays saved.",
    pastDueTitle: "Payment required to restore access.",
    pastDueDesc: "Update your payment method or choose a plan below.",
    successTitle: "Subscription activated.",
    successDesc: "Your plan is active. Thank you.",
    checkoutErrorTitle: "Checkout did not start.",
    checkoutErrorDesc: "Try again or contact support if the problem continues.",
    setupTitle: "Stripe setup is incomplete.",
    setupDesc: "Plans are visible, but checkout is disabled until Stripe prices are configured.",
    trialContinue: "You can choose a plan now so access continues without interruption.",
    graceEnded: "Your grace period has ended. Update payment or start a new subscription.",
    cancelsOn: (date: string) => `Cancels on ${date}.`,
    nextBilling: (date: string) => `Next billing date: ${date}.`,
    paymentFailed: "Your last payment failed. Update your payment details to continue.",
    canceled: "Your subscription has ended. Choose a plan below to resubscribe.",
    incomplete: "Checkout was not completed. Start a new checkout to activate your plan.",
    details: "Subscription details",
    billingHistory: "Billing history",
    billingHistoryDesc: "Paid invoices from Stripe for accounting records.",
    noInvoices: "No paid invoices yet.",
    invoiceDate: "Date",
    invoiceAmount: "Amount",
    invoiceStatus: "Status",
    invoicePaid: "Paid",
    viewInvoice: "View invoice",
    downloadPdf: "Download PDF",
    cancels: "Cancels",
    renews: "Renews",
    referralCredit: "Referral credit",
    creditMonths: (n: number) => `${n} free month${n === 1 ? "" : "s"} pending`,
  },
  ro: {
    title: "Facturare",
    subtitle: "Gestionează planul și detaliile de plată.",
    trialExpiredTitle: "Perioada de probă s-a încheiat.",
    trialExpiredDesc: "Alege un plan ca să continui să folosești FranchiseTech. Datele tale rămân salvate.",
    pastDueTitle: "Este necesară plata pentru a restabili accesul.",
    pastDueDesc: "Actualizează metoda de plată sau alege un plan de mai jos.",
    successTitle: "Abonamentul a fost activat.",
    successDesc: "Planul tău este activ. Mulțumim.",
    checkoutErrorTitle: "Checkout-ul nu a pornit.",
    checkoutErrorDesc: "Încearcă din nou sau contactează suportul dacă problema continuă.",
    setupTitle: "Configurarea Stripe este incompletă.",
    setupDesc: "Planurile sunt vizibile, dar checkout-ul este dezactivat până când prețurile Stripe sunt configurate.",
    trialContinue: "Poți alege un plan acum ca accesul să continue fără întrerupere.",
    graceEnded: "Perioada de grație s-a încheiat. Actualizează plata sau pornește un abonament nou.",
    cancelsOn: (date: string) => `Se anulează pe ${date}.`,
    nextBilling: (date: string) => `Următoarea plată: ${date}.`,
    paymentFailed: "Ultima plată a eșuat. Actualizează detaliile de plată ca să continui.",
    canceled: "Abonamentul s-a încheiat. Alege un plan de mai jos ca să reîncepi.",
    incomplete: "Checkout-ul nu a fost finalizat. Pornește un checkout nou ca să activezi planul.",
    details: "Detalii abonament",
    billingHistory: "Istoric facturare",
    billingHistoryDesc: "Facturi plătite din Stripe pentru evidența contabilă.",
    noInvoices: "Nu există încă facturi plătite.",
    invoiceDate: "Dată",
    invoiceAmount: "Sumă",
    invoiceStatus: "Status",
    invoicePaid: "Plătită",
    viewInvoice: "Vezi factura",
    downloadPdf: "Descarcă PDF",
    cancels: "Se anulează",
    renews: "Reînnoire",
    referralCredit: "Credit recomandare",
    creditMonths: (n: number) => n === 1 ? "1 lună gratuită în așteptare" : `${n} luni gratuite în așteptare`,
  },
} as const;

type BillingInvoiceRow = {
  id: string;
  created: string;
  amount: string;
  hostedUrl: string | null;
  pdfUrl: string | null;
};

function formatInvoiceAmount(locale: AppLocale, amountCents: number, currency: string | null | undefined) {
  return new Intl.NumberFormat(locale === "ro" ? "ro-RO" : "en-IE", {
    style: "currency",
    currency: (currency ?? "eur").toUpperCase(),
  }).format(amountCents / 100);
}

async function listPaidInvoices(customerId: string | null, locale: AppLocale): Promise<BillingInvoiceRow[]> {
  if (!customerId || !process.env.STRIPE_SECRET_KEY) return [];
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const invoices = await stripe.invoices.list({ customer: customerId, status: "paid", limit: 12 });
    return invoices.data.map((invoice) => ({
      id: invoice.id,
      created: new Date(invoice.created * 1000).toISOString(),
      amount: formatInvoiceAmount(locale, invoice.amount_paid ?? invoice.total ?? 0, invoice.currency),
      hostedUrl: invoice.hosted_invoice_url ?? null,
      pdfUrl: invoice.invoice_pdf ?? null,
    }));
  } catch (error) {
    console.error("[billing] invoice history fetch failed", error);
    return [];
  }
}

function StatusIcon({ state }: { state: string }) {
  if (state === "active") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (state === "past_due" || state === "past_due_expired" || state === "canceled") return <AlertCircle className="h-5 w-5 text-red-600" />;
  if (state === "incomplete") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Clock className="h-5 w-5 text-blue-600" />;
}

export async function BillingPanel({
  searchParams = {},
  organisationId,
  countryCode,
  profileLocale,
  className,
}: {
  searchParams?: BillingSearchParams;
  organisationId?: string;
  countryCode?: string | null;
  profileLocale?: string | null;
  className?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user && !profileLocale
    ? await supabase.from("profiles").select("locale").eq("id", user.id).maybeSingle()
    : { data: null };

  const { data: membership } = user && !organisationId
    ? await supabase
        .from("organisation_members")
        .select("organisation_id")
        .eq("user_id", user.id)
        .or("status.is.null,status.eq.active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const resolvedOrganisationId = organisationId ?? membership?.organisation_id ?? null;
  const { data: orgRow } = resolvedOrganisationId && !countryCode
    ? await supabase.from("organisations").select("country_code").eq("id", resolvedOrganisationId).maybeSingle()
    : { data: null };

  const resolvedCountryCode = countryCode ?? orgRow?.country_code ?? null;
  const resolvedProfileLocale = profileLocale ?? (profile?.locale as string | null) ?? null;
  const billingMarket = marketFromCountryCode(resolvedCountryCode);
  const { locale } = getAppLocaleAndText(resolvedCountryCode, resolvedProfileLocale);
  const c = copy[locale];
  const sub = resolvedOrganisationId ? await getSubscriptionStatus(resolvedOrganisationId) : null;
  const configured = isBillingConfigured();
  const needsPlan = !sub || ["none", "past_due_expired", "incomplete", "canceled"].includes(sub.state);
  const canChoosePlan = needsPlan || sub?.state === "soft_trial" || sub?.state === "trialing";
  const paidInvoices = await listPaidInvoices(sub?.stripeCustomerId ?? null, locale);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{c.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
      </div>

      {searchParams.reason === "trial_expired" && needsPlan && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <p className="font-semibold">{c.trialExpiredTitle}</p>
          <p className="mt-0.5 opacity-80">{c.trialExpiredDesc}</p>
        </div>
      )}

      {searchParams.reason === "past_due_expired" && needsPlan && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">{c.pastDueTitle}</p>
          <p className="mt-0.5 opacity-80">{c.pastDueDesc}</p>
        </div>
      )}

      {searchParams.checkout === "success" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <p className="font-semibold">{c.successTitle}</p>
          <p className="mt-0.5 opacity-80">{c.successDesc}</p>
        </div>
      )}

      {searchParams.checkout === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">{c.checkoutErrorTitle}</p>
          <p className="mt-0.5 opacity-80">{c.checkoutErrorDesc}</p>
        </div>
      )}

      {!configured && needsPlan && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">{c.setupTitle}</p>
          <p className="mt-0.5 opacity-80">{c.setupDesc}</p>
        </div>
      )}

      {sub && (
        <div className={`rounded-2xl border p-5 sm:p-6 ${statusColor(sub.state)}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-1 gap-3">
              <StatusIcon state={sub.state} />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{statusLabel(locale, sub.state)}</p>
                {(sub.state === "soft_trial" || sub.state === "trialing") && (
                  <p className="mt-0.5 text-sm opacity-80">{trialText(locale, sub.trialDaysLeft)} {c.trialContinue}</p>
                )}
                {sub.state === "past_due_expired" && <p className="mt-0.5 text-sm opacity-80">{c.graceEnded}</p>}
                {sub.state === "active" && sub.periodEnd && (
                  <p className="mt-0.5 text-sm opacity-80">
                    {sub.cancelAtPeriodEnd ? c.cancelsOn(formatDate(locale, sub.periodEnd)) : c.nextBilling(formatDate(locale, sub.periodEnd))}
                  </p>
                )}
                {sub.state === "past_due" && <p className="mt-0.5 text-sm opacity-80">{c.paymentFailed}</p>}
                {sub.state === "canceled" && <p className="mt-0.5 text-sm opacity-80">{c.canceled}</p>}
                {sub.state === "incomplete" && <p className="mt-0.5 text-sm opacity-80">{c.incomplete}</p>}
                {sub.plan && sub.state !== "incomplete" && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide opacity-70">
                    Plan: {effectivePlanLabel(sub.plan as Parameters<typeof effectivePlanLabel>[0])}
                  </p>
                )}
              </div>
            </div>
            {sub.stripeCustomerId && <BillingPortalButton />}
          </div>
        </div>
      )}

      {canChoosePlan && (
        <PricingPlansSection variant="billing" market={billingMarket} loggedIn={Boolean(user)} configured={configured} locale={locale} />
      )}

      {sub && !needsPlan && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">{c.details}</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">Plan</dt>
                <dd className="mt-0.5 font-medium">{sub.plan ? effectivePlanLabel(sub.plan as Parameters<typeof effectivePlanLabel>[0]) : "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">Status</dt>
                <dd className="mt-0.5 font-medium">{statusLabel(locale, sub.state)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-400">{sub.cancelAtPeriodEnd ? c.cancels : c.renews}</dt>
                <dd className="mt-0.5 font-medium">{sub.periodEnd ? formatDate(locale, sub.periodEnd) : "-"}</dd>
              </div>
              {sub.creditMonths > 0 && (
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-400">{c.referralCredit}</dt>
                  <dd className="mt-0.5 font-medium text-blue-700">{c.creditMonths(sub.creditMonths)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-700">{c.billingHistory}</h2>
              <p className="mt-1 text-xs text-slate-500">{c.billingHistoryDesc}</p>
            </div>
            {paidInvoices.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-2 pr-4">{c.invoiceDate}</th>
                      <th className="py-2 pr-4">{c.invoiceAmount}</th>
                      <th className="py-2 pr-4">{c.invoiceStatus}</th>
                      <th className="py-2 text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paidInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="py-3 pr-4 text-slate-700">{formatDate(locale, invoice.created)}</td>
                        <td className="py-3 pr-4 font-medium text-slate-900">{invoice.amount}</td>
                        <td className="py-3 pr-4 text-emerald-700">{c.invoicePaid}</td>
                        <td className="py-3">
                          <div className="flex justify-end gap-3">
                            {invoice.hostedUrl && (
                              <a href={invoice.hostedUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                                {c.viewInvoice}
                              </a>
                            )}
                            {invoice.pdfUrl && (
                              <a href={invoice.pdfUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                                {c.downloadPdf}
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">{c.noInvoices}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
