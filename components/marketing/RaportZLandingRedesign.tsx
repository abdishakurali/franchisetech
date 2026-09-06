import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import { OwnerDashboardProof, OwnerPosProof, OwnerZReportProof } from "@/components/marketing/OwnerProofScreens";

type Props = {
  signupHref: string;
};

const trustBadges = ["Configurat cu FiscalNet", "TVA 21% / 11% / 5%", "Export Saga", "Funcționează pe telefon"];

const pains = [
  "Închideți casa din memorie și numărați sertarul aproximativ.",
  "Trimiteți contabilului poze cu rapoarte Z pe WhatsApp.",
  "Nu știți dacă toate vânzările au ajuns prin FiscalNet.",
  "Stocul și costul rețetelor trăiesc într-un Excel vechi.",
];

const flow = [
  ["PAS 1", "Vânzare la POS", "Produse, cotă TVA și metodă de plată alese o dată, corect."],
  ["PAS 2", "Trimitere FiscalNet", "Datele vânzării pleacă spre casa fiscală, când integrarea e configurată."],
  ["PAS 3", "Stare bon", "Trimis, în așteptare sau eșuat — vizibil pe loc, cu reîncercare."],
  ["PAS 4", "Raport Z & sertar", "Totaluri pe TVA, metode de plată și diferența de numerar."],
  ["PAS 5", "Contabil", "Export lunar în loc de poze și totaluri reconstruite manual."],
];

const faqs = [
  [
    "Am nevoie de card la înscriere?",
    "Trialul de 15 zile începe după o verificare unică de 1 € a cardului. Nu este un abonament — plata lunară începe numai dacă alegeți un plan după perioada de probă.",
  ],
  [
    "franchisetech generează QR-ul de pe bon?",
    "Nu. QR-ul de pe bonul fiscal este generat de casa de marcat certificată. franchisetech trimite datele vânzării prin FiscalNet, când integrarea este configurată.",
  ],
  [
    "Trebuie să schimb casa de marcat?",
    "Nu promitem asta fără verificare. În proba asistată verificăm fluxul FiscalNet, casa fiscală și ce se poate configura pentru localul dumneavoastră.",
  ],
  [
    "Pot folosi doar pentru raport Z?",
    "Da, dar valoarea reală apare când vânzările, metodele de plată, TVA-ul și sertarul sunt în același flux.",
  ],
];

function PrimaryCta({ signupHref, compact = false }: { signupHref: string; compact?: boolean }) {
  return (
    <div className={compact ? "" : "flex flex-col items-start gap-3 sm:flex-row sm:items-center"}>
      <Link
        href={signupHref}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1747c9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2f8f] sm:w-auto"
      >
        Testați închiderea de zi gratuit <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      <Link
        href="/features/z-report"
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 sm:w-auto"
      >
        Vedeți fluxul unei zile
      </Link>
    </div>
  );
}

function TrialMicrocopy({ dark = false }: { dark?: boolean }) {
  return (
    <p className={`mt-3 text-xs leading-6 ${dark ? "text-white/60" : "text-slate-500"}`}>
      15 zile cu configurare asistată · verificare card 1 € · fără plată lunară în perioada de probă · anulare oricând
    </p>
  );
}

function ZReportCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white text-slate-900 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500">Închidere de zi · 18.08.2026</span>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600" /> Z emis
        </span>
      </div>
      <div className="space-y-3 p-4 font-mono text-sm">
        {[
          ["Bonuri fiscale", "148"],
          ["Total zi", "7.418,50 lei"],
          ["TVA 21%", "1.104,20 lei"],
          ["TVA 11%", "262,80 lei"],
          ["Numerar", "2.980,00 lei"],
          ["Card", "4.438,50 lei"],
        ].map(([label, value], index) => (
          <div key={label} className={index === 2 || index === 4 ? "border-t border-slate-200 pt-3" : ""}>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-950">{value}</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-800">
          <span>Diferență sertar</span>
          <span>-12,00 lei</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50 p-3">
        <span className="rounded-md bg-[#1747c9] px-3 py-2 text-center text-xs font-semibold text-white">Trimite contabilului</span>
        <span className="rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-800">Export Saga</span>
      </div>
    </div>
  );
}

function ReceiptStatusTable() {
  const rows = [
    ["23:04", "BF-000148", "Card", "84,00", "Trimis", "text-emerald-700"],
    ["22:51", "BF-000147", "Numerar", "32,50", "Trimis", "text-emerald-700"],
    ["22:47", "BF-000146", "Card", "119,00", "Eșuat", "text-amber-800"],
    ["22:39", "BF-000145", "Numerar", "18,00", "Trimis", "text-emerald-700"],
    ["22:30", "BF-000144", "Card", "246,50", "În aștept.", "text-slate-500"],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-1 bg-[#101830] px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wide">Bonuri fiscale · astăzi</span>
        <span className="font-mono text-[11px] text-white/60">Cafeneaua Centrală · Casa 1</span>
      </div>
      <div className="hidden grid-cols-[64px_1fr_90px_88px_96px] border-b border-slate-200 bg-slate-50 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <span>Ora</span><span>Bon</span><span>Plată</span><span>Total</span><span>FiscalNet</span>
      </div>
      {rows.map(([time, receipt, payment, total, status, color]) => (
        <div key={receipt} className={`grid gap-2 border-b border-slate-100 px-4 py-3 font-mono text-xs sm:grid-cols-[64px_1fr_90px_88px_96px] ${status === "Eșuat" ? "bg-amber-50" : ""}`}>
          <span>{time}</span>
          <span className="font-medium">{receipt}</span>
          <span>{payment}</span>
          <span>{total}</span>
          <span className={`font-semibold ${color}`}>{status}{status === "Eșuat" ? " ↻" : ""}</span>
        </div>
      ))}
      <div className="flex flex-col gap-2 bg-slate-50 px-4 py-3 font-mono text-xs font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>148 bonuri · 1 eșuat · 1 în așteptare</span>
        <span className="text-[#1747c9]">Rezolvați înainte de Z →</span>
      </div>
    </div>
  );
}

function DisclaimerNote() {
  return (
    <div className="rounded-md border border-[#1747c9]/15 bg-[#eaf0ff] p-4 text-sm leading-6 text-slate-700">
      <p>
        QR-ul de pe bonul fiscal este generat de casa de marcat certificată, nu de franchisetech.
        franchisetech trimite datele vânzării prin FiscalNet, atunci când integrarea este configurată.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Nu înlocuim contabilul, ANAF, furnizorul casei fiscale sau consultanța fiscală. Verificați configurarea împreună cu contabilul.
      </p>
    </div>
  );
}

export function RaportZLandingRedesign({ signupHref }: Props) {
  return (
    <main className="bg-white text-slate-950">
      <section className="bg-[#101830] px-4 pb-14 pt-8 text-white sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.04fr_.96fr] lg:items-start">
          <div>
            <div className="inline-flex rounded border border-white/20 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-white/70">
              Raport Z · Casă de marcat · România
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Raportul Z nu ar trebui să fie o surpriză la 23:40.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              POS în browser, bonuri trimise prin FiscalNet, raport Z și sertarul verificat în același loc.
              Pentru cafenele și restaurante din România, cu 1-3 locații.
            </p>
            <div className="mt-7">
              <PrimaryCta signupHref={signupHref} />
              <TrialMicrocopy dark />
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span key={badge} className="rounded border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[11px] font-medium text-white/75">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <ZReportCard />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
            Vă recunoașteți în una din acestea?
          </h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {pains.map((pain, index) => (
              <div key={pain} className="flex gap-4 bg-white p-5">
                <span className="font-mono text-sm font-semibold text-amber-700">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-sm leading-6 text-slate-700">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf0ff] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#1747c9]">Fluxul unei zile</p>
          <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
            Vânzare → FiscalNet → stare bon → raport Z → contabil
          </h2>
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            {flow.map(([step, title, text]) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="font-mono text-xs font-semibold text-[#1747c9]">{step}</div>
                <h3 className="mt-2 text-sm font-semibold text-[#101830]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <DisclaimerNote />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#1747c9]">Produsul, nu promisiunea</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
              Ecranul pe care îl vedeți la 23:15
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Lista bonurilor zilei cu starea trimiterii. Dacă ceva nu a plecat, îl vedeți aici,
              nu peste trei săptămâni, de la contabil.
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              {["Filtrare pe stare, casier, metodă de plată", "Reîncercare trimitere pentru bonurile eșuate", "Ziua nu se închide fără confirmare dacă există bonuri nerezolvate"].map((item) => (
                <div key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-700" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <OwnerZReportProof />
            </div>
          </div>
          <ReceiptStatusTable />
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#1747c9]">Dovadă vizuală</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
                Interfața reală din aplicație — nu capturi vechi, nu decor.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Casa de vânzare și panoul zilnic, exact cum le vede un proprietar de cafenea.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <OwnerPosProof />
              <OwnerDashboardProof />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
            Întrebări pe care le pun proprietarii înainte să încerce
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-[#101830]">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#101830] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
            <FileText className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">Închideți mâine ziua cu un raport Z pe care îl înțelegeți.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65">
            În proba asistată configurăm produsele, metodele de plată și primul flux de închidere împreună.
          </p>
          <div className="mt-7 flex justify-center">
            <PrimaryCta signupHref={signupHref} compact />
          </div>
          <TrialMicrocopy dark />
        </div>
      </section>

    </main>
  );
}
