import Link from "next/link";
import { ArrowRight, Check, Clock, X } from "lucide-react";

type Props = {
  signupHref: string;
};

/**
 * Landing page for the "raport X casă de marcat" keyword (app/lp/raport-x-casa-de-marcat).
 *
 * The search intent here is mostly informational — people want to know what an X
 * report is and how it differs from a Z report — so the comparison table is the
 * centre of the page and the secondary CTA is the article, not a second buy button.
 * Claims are limited to what the product actually does: a running session total
 * (pos_sessions.expected_cash) plus the fiscal X command through FiscalNet when
 * that integration is configured.
 */

const trustBadges = [
  "Nu resetează totalurile zilei",
  "Oricâte rapoarte X pe zi",
  "TVA 21% / 11% / 5%",
  "Funcționează pe telefon",
];

const moments = [
  [
    "La schimbul de tură",
    "Casierul care pleacă și cel care intră văd aceeași sumă. Diferența se notează pe loc, cât timp amândoi sunt încă în local.",
  ],
  [
    "Înainte de o depunere la bancă",
    "Scoateți numerar din sertar știind exact cât ar trebui să fie acolo, nu pe baza unei estimări.",
  ],
  [
    "La un control de casă la prânz",
    "Vedeți cum stă ziua fără să închideți ziua. Verificarea nu are nicio consecință asupra contorului zilei.",
  ],
  [
    "Când bănuiți o lipsă",
    "Comparați numerarul numărat cu cel așteptat imediat, nu peste trei zile, când nimeni nu mai știe din ce tură venea diferența.",
  ],
];

const comparison: [string, string, string][] = [
  ["Când îl folosiți", "Oricând în timpul zilei", "O singură dată, la finalul zilei de lucru"],
  ["Resetează totalurile", "Nu", "Da — încheie ziua fiscal"],
  ["De câte ori pe zi", "De câte ori aveți nevoie", "O dată"],
  [
    "La ce folosește",
    "Schimb de tură, control de numerar, depunere parțială",
    "Închiderea fiscală a zilei și predarea către contabil",
  ],
  ["Rol", "Raport de citire — informativ", "Documentul de închidere a zilei"],
];

const faqs = [
  [
    "Raportul X închide ziua?",
    "Nu. Raportul X este o citire a totalurilor curente. Nu resetează contoarele și nu încheie ziua fiscal — asta face doar raportul Z.",
  ],
  [
    "De câte ori pot da raport X într-o zi?",
    "De câte ori aveți nevoie. Un raport X la fiecare schimb de tură și încă unul înainte de o depunere de numerar este un tipar normal.",
  ],
  [
    "Ce se întâmplă dacă dau Z în loc de X la prânz?",
    "Închideți ziua fiscal mai devreme decât trebuie, în timp ce localul rămâne deschis. Exact greșeala pe care raportul X o previne.",
  ],
  [
    "Trebuie să schimb casa de marcat?",
    "Nu promitem asta fără verificare. În proba asistată verificăm împreună fluxul driverului fiscal, casa fiscală și ce se poate configura pentru localul dumneavoastră.",
  ],
  [
    "Am nevoie de card la înscriere?",
    "Planul Free e disponibil de la crearea contului, fără card, și nu expiră. Plata lunară începe numai dacă alegeți un plan plătit.",
  ],
  [
    "Merge pe telefon?",
    "Da. Raportul X se poate deschide de pe telefon, ceea ce contează când verificați casa fără să fiți în spatele tejghelei.",
  ],
];

function PrimaryCta({ signupHref, centered = false }: { signupHref: string; centered?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row ${
        centered ? "sm:justify-center" : "sm:items-center"
      }`}
    >
      <Link
        href={signupHref}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1747c9] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f2f8f] sm:w-auto sm:py-3"
      >
        Creați cont gratuit <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      <Link
        href="/blog/raport-x-vs-raport-z-diferenta"
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 sm:w-auto sm:py-3"
      >
        Raport X vs. raport Z
      </Link>
    </div>
  );
}

function TrialMicrocopy({ dark = false }: { dark?: boolean }) {
  return (
    <p className={`mt-3 text-xs leading-6 ${dark ? "text-white/60" : "text-slate-500"}`}>
      fără card necesar · gratuit pentru totdeauna · upgrade oricând · anulare oricând
    </p>
  );
}

/** Interim reading of the open till session — the screen this page is actually about. */
function XReportCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white text-slate-900 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Raport X · citire 14:20
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold text-[#1747c9]">
          <Clock className="h-3 w-3" aria-hidden /> Ziua e deschisă
        </span>
      </div>
      <div className="space-y-3 p-4 font-mono text-sm">
        {[
          ["Bonuri până acum", "62"],
          ["Total până acum", "3.140,50 lei"],
          ["TVA 21%", "462,10 lei"],
          ["TVA 11%", "118,40 lei"],
          ["Numerar așteptat", "1.280,00 lei"],
          ["Card", "1.860,50 lei"],
        ].map(([label, value], index) => (
          <div key={label} className={index === 2 || index === 4 ? "border-t border-slate-200 pt-3" : ""}>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">{label}</span>
              <span className="font-medium text-slate-950">{value}</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between rounded-md border border-[#1747c9]/20 bg-[#eaf0ff] px-3 py-2 font-semibold text-[#0f2f8f]">
          <span>Totalurile zilei</span>
          <span>nu se resetează</span>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 p-3">
        <span className="block rounded-md bg-[#1747c9] px-3 py-2 text-center text-xs font-semibold text-white">
          Predă tura
        </span>
      </div>
    </div>
  );
}

/**
 * Shift handover panel, drawn rather than screenshotted.
 *
 * The existing /marketing/live/reports.png capture is English, in EUR, and shows a 9%
 * VAT line — a rate Romania no longer uses — so it is deliberately not reused here.
 * Romanian test data with the current 21% / 11% rates is the honest stand-in until
 * a clean Romanian screenshot exists.
 */
function ShiftHandoverCard() {
  // 190,00 fond de casă + 1.130,00 vânzări numerar − 40,00 retururi = 1.280,00 așteptat
  const rows: [string, string, string][] = [
    ["Tura 1 · 07:00-14:20", "Ana", ""],
    ["Fond de casă la deschidere", "", "190,00 lei"],
    ["Vânzări numerar", "", "+ 1.130,00 lei"],
    ["Retururi", "", "− 40,00 lei"],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-1 bg-[#101830] px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wide">
          Predare tură · astăzi
        </span>
        <span className="font-mono text-[11px] text-white/60">Cafeneaua Centrală · Casa 1</span>
      </div>
      <div className="space-y-3 p-4 font-mono text-sm">
        {rows.map(([label, who, value], index) => (
          <div
            key={label}
            className={`flex items-baseline justify-between gap-4 ${
              index === 0 ? "border-b border-slate-200 pb-3" : ""
            }`}
          >
            <span className={index === 0 ? "font-semibold text-slate-950" : "text-slate-500"}>
              {label}
              {who ? <span className="ml-2 text-slate-400">· {who}</span> : null}
            </span>
            <span className="shrink-0 font-medium text-slate-950">{value}</span>
          </div>
        ))}
        <div className="flex justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900">
          <span>Numerar așteptat</span>
          <span>1.280,00 lei</span>
        </div>
        <div className="flex justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-800">
          <span>Numărat de Ana</span>
          <span>1.280,00 lei</span>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs font-medium text-slate-500">
        Fără diferență · tura 2 începe cu 1.280,00 lei
      </div>
    </div>
  );
}

function DisclaimerNote() {
  return (
    <div className="rounded-md border border-[#1747c9]/15 bg-[#eaf0ff] p-4 text-sm leading-6 text-slate-700">
      <p>
        Raportul X fiscal este emis de casa de marcat certificată. franchisetech trimite comanda
        prin driverul fiscal local — folosim driverul FiscalNet
        (<a href="https://driverfiscal.ro/" target="_blank" rel="noopener noreferrer" className="underline">driverfiscal.ro</a>),
        atunci când integrarea este configurată — și ține în paralel totalurile turei
        deschise.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Nu înlocuim contabilul, ANAF, furnizorul casei fiscale sau consultanța fiscală. Verificați
        configurarea împreună cu contabilul dumneavoastră.
      </p>
    </div>
  );
}

export function RaportXLandingRedesign({ signupHref }: Props) {
  return (
    <main className="bg-white text-slate-950">
      <section className="bg-[#101830] px-4 pb-14 pt-8 text-white sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.04fr_.96fr] lg:items-start">
          <div>
            <div className="inline-flex rounded border border-white/20 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-white/70">
              Raport X · Casă de marcat · România
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Raport X: vedeți casa acum, fără să închideți ziua.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Vânzările, numerarul și TVA-ul de până în acest moment — la schimbul de tură sau
              înainte de o depunere. Raportul X nu resetează nimic și nu încheie ziua.
            </p>
            <div className="mt-7">
              <PrimaryCta signupHref={signupHref} />
              <TrialMicrocopy dark />
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[11px] font-medium text-white/75"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <XReportCard />
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#1747c9]">
            Pe scurt
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
            Ce este raportul X
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Raportul X — numit și raport intermediar sau raport de citire — arată totalurile curente
            ale turei: vânzările de până acum, defalcarea numerar/card și TVA-ul colectat. Nu
            resetează și nu închide nimic, așa că îl puteți genera de câte ori vreți, la orice oră,
            fără consecințe asupra zilei fiscale.
          </p>
        </div>
      </section>

      <section className="bg-[#eaf0ff] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#1747c9]">
            Diferența care contează
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
            Raport X vs. raport Z
          </h2>

          {/* Mobile: stacked cards. Desktop: table. Most of this traffic is on a phone. */}
          <div className="mt-7 space-y-3 md:hidden">
            {comparison.map(([label, x, z]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <div className="mt-3 flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1747c9]" aria-hidden />
                  <p className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-[#101830]">Raport X: </span>
                    {x}
                  </p>
                </div>
                <div className="mt-2 flex gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <p className="text-sm leading-6 text-slate-600">
                    <span className="font-semibold text-[#101830]">Raport Z: </span>
                    {z}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <span />
              <span className="text-[#1747c9]">Raport X</span>
              <span>Raport Z</span>
            </div>
            {comparison.map(([label, x, z]) => (
              <div
                key={label}
                className="grid grid-cols-[1fr_1fr_1fr] gap-4 border-b border-slate-100 px-5 py-4 text-sm leading-6 last:border-b-0"
              >
                <span className="font-semibold text-[#101830]">{label}</span>
                <span className="text-slate-700">{x}</span>
                <span className="text-slate-600">{z}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <DisclaimerNote />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
            Momentele în care un raport X vă scutește de o discuție neplăcută
          </h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {moments.map(([title, text], index) => (
              <div key={title} className="bg-white p-5">
                <span className="font-mono text-sm font-semibold text-[#1747c9]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-[#101830]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wide text-[#1747c9]">
              Produsul, nu promisiunea
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#101830] sm:text-3xl">
              Numerarul așteptat se calculează singur, tura după tură
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              De la deschiderea turei, fiecare vânzare, retur și mișcare de numerar actualizează
              suma care ar trebui să fie în sertar. Raportul X o arată oricând, iar la închidere
              diferența apare direct în raportul Z.
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                "Numerar așteptat actualizat la fiecare vânzare și retur",
                "Defalcare numerar / card / TVA pentru tura deschisă",
                "Diferența de sertar se vede la închidere, nu peste trei săptămâni",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <ShiftHandoverCard />
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
            <Clock className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            Predați următoarea tură cu o cifră, nu cu o estimare.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65">
            În proba asistată configurăm produsele, metodele de plată și primul schimb de tură
            împreună.
          </p>
          <div className="mt-7">
            <PrimaryCta signupHref={signupHref} centered />
          </div>
          <TrialMicrocopy dark />
        </div>
      </section>
    </main>
  );
}
