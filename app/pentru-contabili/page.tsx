import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, FileSpreadsheet, ShieldCheck, Warehouse } from "lucide-react";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { JsonLd } from "@/components/marketing/JsonLd";
import { SITE_URL } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "Portal gratuit pentru contabili",
  description:
    "SAF-T D406 generat automat, export SAGA și acces gratuit, doar pentru citire, la datele clienților dvs. din HoReCa. Program de parteneriat cu comision recurent.",
  alternates: { canonical: `${SITE_URL}/pentru-contabili` },
  openGraph: {
    title: "Portal gratuit pentru contabili",
    description: "SAF-T D406 automat, export SAGA și portal dedicat pentru clienții dvs. din HoReCa.",
    url: `${SITE_URL}/pentru-contabili`,
  },
};

const STATS = [
  { value: "2–4h", label: "pierdute lunar per client HoReCa cu centralizarea manuală a stocurilor" },
  { value: "12×", label: "termene de depunere D406 pe an, pentru fiecare client obligat la raportare" },
  { value: "0", label: "case de marcat sau POS-uri generice care produc XML complet conform ANAF" },
];

const FEATURES = [
  {
    icon: FileCheck2,
    title: "SAF-T D406 automat",
    body: "Fișierul de mișcări de stoc se generează direct din datele de gestiune ale clientului — recepții, vânzări, consumuri, ajustări, retururi și sold inițial — în structura MovementOfGoods cerută de ANAF.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export SAGA",
    body: "Balanțe și jurnale de vânzări în format XML compatibil Saga C, gata de import, fără reintroducere manuală a bonurilor sau facturilor.",
  },
  {
    icon: ShieldCheck,
    title: "Portal dedicat contabilului",
    body: "Autentificare separată, acces doar pentru citire, la toate firmele pe care le gestionați — fără parole partajate cu clientul și fără date trimise pe WhatsApp.",
  },
  {
    icon: Warehouse,
    title: "NIR-uri și stocuri live",
    body: "Recepțiile, notele de intrare-recepție și stocul curent sunt actualizate în timp real din POS-ul clientului, nu reconstituite la sfârșit de lună dintr-un caiet.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Clientul se înscrie pe franchisetech",
    body: "Proprietarul HoReCa își creează cont — planul Free e permanent gratuit, fără card. Dvs. primiți linkul de recomandare, distinct de contul clientului.",
  },
  {
    n: "2",
    title: "Primiți acces la portal",
    body: "Odată ce clientul devine abonat plătitor, contul dvs. de contabil primește automat acces gratuit, doar pentru citire, la firma lui — fără cerere separată către proprietar.",
  },
  {
    n: "3",
    title: "La final de lună — descărcați SAF-T și SAGA",
    body: "Alegeți perioada din portal și descărcați direct fișierele D406 și SAGA, gata pentru depunere sau import.",
  },
];

const XML_SNIPPET = `<SourceDocuments>
  <MovementOfGoods>
    <StockMovement>
      <MovementReference>20260925-AR-1</MovementReference>
      <MovementDate>2026-09-25</MovementDate>
      <MovementType>AR</MovementType>
      <StockMovementLine>
        <LineNumber>1</LineNumber>
        <AccountID>371</AccountID>
        <SupplierID>SC_FURNIZOR_SRL</SupplierID>
        <ProductCode>CAFEA-BOABE-1KG</ProductCode>
        <Quantity>10.000</Quantity>
        <UnitOfMeasure>KG</UnitOfMeasure>
        <UOMToUOMPhysicalStockConversionFactor>1</UOMToUOMPhysicalStockConversionFactor>
        <MovementSubType>AR</MovementSubType>
        <MovementComments>NIR 2026-0148</MovementComments>
      </StockMovementLine>
    </StockMovement>
  </MovementOfGoods>
</SourceDocuments>`;

export default function PentruContabiliPage() {
  return (
    <ClaudeMarketingShellAuth>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Portal contabil HoReCa",
          provider: { "@type": "Organization", name: "franchisetech", url: SITE_URL },
          areaServed: "RO",
          description: "SAF-T D406 automat, export SAGA și portal gratuit pentru contabili care gestionează clienți HoReCa.",
        }}
      />

      <div className="bg-[#0B1D33]">
        {/* Hero */}
        <section className="border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9A94E]">Pentru contabili</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white sm:text-5xl">
              Portalul contabilului pentru clienții dvs. din HoReCa
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              SAF-T D406 generat automat, export SAGA gata de import și acces gratuit, doar pentru citire, la datele
              fiecărui client — fără centralizare manuală, fără fișiere trimise pe email.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/accountant-partners"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#D9A94E] px-6 py-3 text-sm font-semibold text-[#0B1D33] transition hover:bg-[#c99a3f] sm:w-auto"
              >
                Înscrie-te ca partener <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 sm:w-auto"
              >
                Vezi planurile pentru clienți
              </Link>
            </div>
          </div>
        </section>

        {/* Problem stats */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#D9A94E]">{stat.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* What you get */}
      <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[#0B1D33] sm:text-3xl">
            Ce primiți
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <feature.icon className="h-6 w-6 text-[#0B1D33]" strokeWidth={1.75} />
                <h3 className="mt-3 text-base font-bold text-[#0B1D33]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical trust — real XML structure */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0B1D33]">
              Structură XML reală, nu o promisiune
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" /> Valid ANAF
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Extras dintr-un fișier generat pentru o recepție de marfă (NIR), în structura{" "}
            <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">SourceDocuments &gt; MovementOfGoods</code>{" "}
            cerută de schema oficială D406.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-lg border border-slate-800 bg-[#0B1D33] p-5 text-xs leading-6 text-slate-200">
            <code>{XML_SNIPPET}</code>
          </pre>
          <p className="mt-3 text-xs text-slate-500">
            Generat conform schemei ANAF D406 — confirmați obligația de depunere și validați rezultatul împreună cu
            contabilul înainte de a-l depune.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[#0B1D33] sm:text-3xl">
            Cum funcționează
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="text-center sm:text-left">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1D33] font-[family-name:var(--font-display)] text-sm font-bold text-[#D9A94E]">
                  {step.n}
                </span>
                <h3 className="mt-3 text-base font-bold text-[#0B1D33]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner program */}
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 text-center sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#0B1D33] sm:text-3xl">
            Comision recurent, nu doar acces gratuit
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Primiți <span className="font-bold text-[#0B1D33]">15€/lună</span> pentru fiecare client pe care îl
            recomandați și care devine abonat plătitor — cât timp rămâne activ.
          </p>
          <div className="mx-auto mt-6 max-w-xs rounded-lg border border-dashed border-[#D9A94E] bg-[#0B1D33]/5 p-5">
            <p className="text-sm text-slate-600">Exemplu — 5 clienți activi</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[#0B1D33]">75€/lună</p>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Comisioanele sunt generate lunar și marcate „în așteptare&rdquo;. Plata către dvs. se face manual, prin
            transfer bancar — nu există plăți automate din platformă.
          </p>
          <Link
            href="/accountant-partners"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-[#0B1D33] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0B1D33]/90"
          >
            Înscrie-te ca partener <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </ClaudeMarketingShellAuth>
  );
}
