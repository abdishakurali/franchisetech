import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const updated = "1 September 2026";

export default function LegalDisclaimerPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Legal Disclaimer</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="font-semibold text-slate-900">Operational software, not accounting or legal advice</h2>
            <p>
              franchisetech is cloud POS and business-control software for Romanian cafés, restaurants, and food
              businesses — sales, cash reconciliation, stock, and reporting in one workspace. It does not constitute
              accounting advice, legal advice, tax advice, or regulatory certification of any kind.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Operator responsibility</h2>
            <p>
              Business owners remain fully responsible for compliance with applicable Romanian fiscal and tax law,
              including Codul Fiscal, ANAF requirements, and VAT (TVA) obligations. franchisetech does not transfer,
              reduce, or replace this responsibility, and does not act as your accountant or tax representative.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">VAT rates and fiscal data</h2>
            <p>
              VAT rates in franchisetech are configured explicitly, by you or your accountant, per product. We do not
              infer or guess a rate. New or ambiguous products are held in a review queue (Settings → Data controls)
              until approved, precisely so an incorrect rate is never applied silently. You are responsible for
              confirming rates are correct for your business before selling.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">FiscalNet and fiscal hardware</h2>
            <p>
              Where enabled, franchisetech connects to your own, separately contracted FiscalNet-compatible fiscal
              printer to issue fiscal receipts as required by Romanian law. franchisetech is not the fiscal device
              manufacturer, is not ANAF, and does not certify fiscal hardware. If fiscal receipt delivery fails, the
              underlying sale is still recorded so it is never lost — but you are responsible for verifying that all
              required fiscal receipts have in fact been issued.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Not endorsed by ANAF</h2>
            <p>
              franchisetech is not approved, endorsed, or certified by the Agenția Națională de Administrare Fiscală
              (ANAF) or any other Romanian regulatory body. It is designed to work alongside ANAF-compliant fiscal
              hardware and e-Factura but makes no claim of official approval.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Accuracy of records</h2>
            <p>
              franchisetech&apos;s reports and reconciliation depend on the accuracy of information entered by staff
              and configured by managers — prices, VAT rates, cash counts, and stock movements. The system calculates
              and reconciles based on that input but cannot independently verify it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Limitation of liability</h2>
            <p>
              To the fullest extent permitted by applicable law, franchisetech and its operators accept no liability
              for any loss, damage, fine, or regulatory consequence arising from reliance on franchisetech records,
              misconfigured settings, or a third-party fiscal device&apos;s failure to issue a receipt.
            </p>
          </section>
        </div>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This page is a practical starting point and should be reviewed by a qualified Romanian legal or accounting
          professional given franchisetech now serves paying customers on live fiscal integrations.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          {" · "}
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </p>
      </main>
    </MarketingShell>
  );
}
