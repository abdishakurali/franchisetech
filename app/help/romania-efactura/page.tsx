import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Romania e-Factura Setup Guide — franchisetech",
  description: "How to connect franchisetech to ANAF/SPV e-Factura: OAuth setup, drafting invoices, XML validation, and submission status tracking.",
  alternates: { canonical: "/help/romania-efactura" },
};

const steps = [
  {
    title: "Who this guide is for",
    body: "This guide is for business owners operating in Romania who need to send B2B or B2G invoices through ANAF's national e-Factura system (SPV). You will need your organisation's CIF and a digital certificate on a USB token (SafeNet, Gemalto, or Oberthur) issued for your company.",
  },
  {
    title: "Enter your CIF in Settings",
    body: "Go to Settings → Fiscal and enter your organisation's CIF (without the RO prefix — franchisetech adds it automatically in the invoice XML). Confirm whether your organisation is VAT-registered.",
  },
  {
    title: "Connect your ANAF/SPV account",
    body: "In Settings → Fiscal, under e-Factura / SPV, insert your USB token into the computer, click \"Autorizează conexiunea ANAF\", select your certificate, and enter your PIN. You'll be redirected back with a \"Conectat ✓\" status once the OAuth handshake completes.",
  },
  {
    title: "Draft an invoice",
    body: "Create an invoice draft with the buyer's CIF, name, address, and line items. franchisetech computes VAT totals automatically from the VAT rates active in your account.",
  },
  {
    title: "Generate and validate the XML",
    body: "franchisetech builds a UBL-format invoice XML from your draft and validates it against ANAF's schema before submission, so structural errors are caught before you send anything to ANAF.",
  },
  {
    title: "Submit to ANAF",
    body: "Once validated, submit the invoice. franchisetech uploads the XML to ANAF's production e-Factura endpoint on your behalf, using your connected ANAF/SPV session. The invoice's status moves from \"draft\" to \"pending\" to \"uploaded\".",
  },
  {
    title: "Track submission status",
    body: "Each invoice keeps its ANAF upload status so you can see whether it's still pending or has been accepted. If ANAF rejects a submission, franchisetech shows the returned error so you can correct and resubmit.",
  },
];

const checklist = [
  "CIF entered and confirmed correct in Settings → Fiscal",
  "Digital certificate (USB token) ready and connected",
  "ANAF/SPV OAuth connection shows \"Conectat ✓\" in Settings",
  "First test invoice validated with no XML errors",
  "Accountant aware invoices are being sent through franchisetech",
];

export default function RomaniaEfacturaPage() {
  return (
    <MarketingShell>
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-4xl text-sm text-slate-500">
          <Link href="/help" className="hover:text-slate-700">Help &amp; Resources</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-900">Romania &amp; e-Factura</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">🇷🇴 Romania setup guide</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            Connecting and using ANAF e-Factura
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Configure franchisetech to send B2B invoices to ANAF&apos;s national e-Factura system (SPV) — from ANAF OAuth connection to submission tracking.
          </p>

          {/* Disclaimer banner */}
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              franchisetech supports the e-Factura submission workflow to ANAF/SPV. Businesses remain responsible for their own legal, fiscal, and accountant review. Confirm your setup and invoicing obligations with a qualified Romanian accountant before relying on this for production invoicing.
            </p>
          </div>

          {/* eFactura vs FiscalNet callout */}
          <div className="mt-4 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">
              <strong>e-Factura and FiscalNet are different, unrelated systems.</strong> e-Factura (this guide) is ANAF&apos;s national electronic invoicing system for B2B/B2G invoices. FiscalNet is the driver that talks to your physical fiscal cash register for POS receipts, X/Z reports, and cash drawer control — see the{" "}
              <Link href="/help/romania-fiscalnet" className="underline hover:text-blue-900">
                FiscalNet setup guide
              </Link>{" "}
              for that. Connecting one does not connect the other.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div className="pt-1">
                <h2 className="font-semibold text-slate-950">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Owner go-live checklist */}
      <section className="border-t border-slate-100 bg-slate-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-slate-950">Owner go-live checklist</h2>
          <p className="mt-2 text-sm text-slate-600">Complete all of these before sending your first real e-Factura invoice.</p>
          <ul className="mt-6 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What franchisetech does not do */}
      <section className="border-t border-slate-100 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-slate-950">What franchisetech does not do</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            franchisetech supports the e-Factura submission workflow to ANAF/SPV. It does not:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
            <li>Replace advice from a Romanian accountant or tax advisor</li>
            <li>Guarantee ANAF will accept every submitted invoice</li>
            <li>Issue or manage your digital certificate or USB token</li>
            <li>File VAT returns or other tax declarations on your behalf</li>
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            If you have questions about what is required for your specific business, consult a qualified Romanian accountant or fiscal advisor.
          </p>
        </div>
      </section>

      {/* Related links */}
      <section className="border-t border-slate-100 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-lg font-semibold text-slate-950">Related guides</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/help/romania-fiscalnet" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700">
              Romania FiscalNet setup →
            </Link>
            <Link href="/app/settings?tab=fiscal" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700">
              Fiscal settings →
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
