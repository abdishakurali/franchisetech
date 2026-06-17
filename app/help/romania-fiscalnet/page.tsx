import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Romania FiscalNet Setup Guide — franchisetech",
  description: "How to configure franchisetech for Romanian organisations: FiscalNet fiscal receipts, TVA rates, payment code mapping, and owner go-live checklist.",
  alternates: { canonical: "/help/romania-fiscalnet" },
};

const steps = [
  {
    title: "Who this guide is for",
    body: "This guide is for business owners operating in Romania who want to issue fiscal receipts through FiscalNet via franchisetech. You will need a FiscalNet provider (fiscal printer or cloud fiscal service) and your accountant's sign-off before going live.",
  },
  {
    title: "Enable Romania settings",
    body: "Go to Settings → Business. Set your Currency to RON (lei) and your Country to Romania. This unlocks Romanian TVA rates and the FiscalNet configuration section.",
  },
  {
    title: "Assign TVA rates to products",
    body: "Romanian TVA rates — 19% (standard), 9% (food/hospitality), 5% (reduced), and 0% (exempt) — are pre-loaded. Go to Products, edit each product, and assign the correct TVA rate. Your accountant can confirm which rate applies to each product type.",
  },
  {
    title: "Configure FiscalNet credentials",
    body: "Go to Settings → FiscalNet. Enter your FiscalNet provider credentials (CIF, serial number, and API token) supplied by your fiscal printer or cloud fiscal service provider. Do not use live credentials for test transactions.",
  },
  {
    title: "Review payment type mapping",
    body: "FiscalNet requires a payment type code for every transaction. Payment types mapped for FiscalNet (codes 1–8): 1 = cash, 2 = card, 3 = credit, 4 = tichete masă, 5 = tichete valorice, 6 = voucher, 7 = plată modernă. Review the mapping in Settings → FiscalNet → Payment mapping and adjust if your provider requires a different mapping.",
  },
  {
    title: "Test with your fiscal provider",
    body: "Use the Test fiscal receipt button in Settings → FiscalNet to send a test transaction to your fiscal provider. Confirm the test receipt prints or is logged correctly. Do not go live until your provider and accountant have verified the setup.",
  },
  {
    title: "Daily reconciliation with the Z-report",
    body: "At the end of each trading day, go to Reports → Till closes and run the Z-report. This shows daily totals by payment method and TVA rate. Keep a copy for your records — your accountant or fiscal advisor may need it for periodic filings.",
  },
];

const checklist = [
  "FiscalNet credentials entered and verified",
  "All products assigned the correct TVA rate",
  "Payment type mapping reviewed",
  "Test receipt confirmed with your fiscal provider",
  "Accountant has reviewed the configuration",
  "Backup cash/card process agreed in case of FiscalNet downtime",
];

export default function RomaniaFiscalNetPage() {
  return (
    <MarketingShell>
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-4xl text-sm text-slate-500">
          <Link href="/help" className="hover:text-slate-700">Help &amp; Resources</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-900">Romania &amp; FiscalNet</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">🇷🇴 Romania setup guide</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
            FiscalNet, TVA rates, and fiscal receipts
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Configure franchisetech for your Romanian organisation — from TVA product assignment to FiscalNet go-live.
          </p>

          {/* Disclaimer banner */}
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              franchisetech supports Romanian fiscal receipt workflows through FiscalNet. Businesses remain responsible for their own legal, fiscal, and accountant review. Confirm your setup with a qualified Romanian accountant or fiscal provider before go-live.
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
          <p className="mt-2 text-sm text-slate-600">Complete all of these before taking your first real fiscal sale.</p>
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
            franchisetech supports the fiscal receipt workflow through FiscalNet. It does not:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
            <li>Replace advice from a Romanian accountant, tax advisor, or fiscal printer provider</li>
            <li>Guarantee compliance with specific ANAF or Romanian tax authority requirements</li>
            <li>Manage or configure your fiscal printer hardware or FiscalNet provider account</li>
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
            <Link href="/help/reading-your-z-report" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700">
              Reading your Z-report →
            </Link>
            <Link href="/help/vat-report" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700">
              VAT report →
            </Link>
            <Link href="/help/manage-settings" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700">
              Manage settings →
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
