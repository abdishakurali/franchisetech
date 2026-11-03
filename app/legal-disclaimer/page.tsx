import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";

// Romanian translation of the 1 September 2026 disclaimer. The VAT paragraph
// was corrected: onboarding products get the organisation's default VAT rate,
// so "we never guess a rate" was not accurate.
const updated = "3 noiembrie 2026";

export const metadata: Metadata = {
  title: "Declinarea responsabilității franchisetech",
  description: "Ce face și ce nu face franchisetech în privința obligațiilor fiscale, TVA și FiscalNet.",
  alternates: { canonical: "/legal-disclaimer" },
};

export default function LegalDisclaimerPage() {
  return (
    <ClaudeMarketingShellAuth>
      <main lang="ro" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Declinarea responsabilității</h1>
        <p className="mt-2 text-sm text-slate-500">Ultima actualizare: {updated}</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="font-semibold text-slate-900">Software operațional, nu consultanță contabilă sau juridică</h2>
            <p>
              franchisetech este un software în cloud de POS și control al afacerii pentru cafenelele, restaurantele și
              afacerile din alimentație din România — vânzări, reconcilierea casei, stoc și rapoarte într-un singur loc.
              Nu reprezintă consultanță contabilă, juridică sau fiscală și nici vreo formă de certificare de reglementare.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Responsabilitatea operatorului</h2>
            <p>
              Proprietarii afacerilor rămân pe deplin responsabili pentru respectarea legislației fiscale din România,
              inclusiv Codul Fiscal, cerințele ANAF și obligațiile privind TVA. franchisetech nu preia, nu reduce și nu
              înlocuiește această responsabilitate și nu acționează ca reprezentantul dumneavoastră contabil sau fiscal.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Cote TVA și date fiscale</h2>
            <p>
              Cotele TVA din franchisetech le stabiliți dumneavoastră sau contabilul dumneavoastră. Produsele adăugate la
              configurarea inițială primesc cota TVA implicită setată pentru firmă, pe care o puteți schimba pe fiecare
              produs. Produsele marcate pentru verificarea cotei TVA (Setări → Controlul datelor) nu pot fi vândute până la
              aprobare, tocmai ca o cotă greșită să nu fie aplicată fără să știți. Sunteți responsabil să confirmați că
              fiecare cotă este corectă pentru afacerea dumneavoastră înainte de vânzare.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">FiscalNet și echipamentele fiscale</h2>
            <p>
              Atunci când este activat, franchisetech se conectează la imprimanta sau casa de marcat proprie, compatibilă
              FiscalNet, contractată separat de dumneavoastră, pentru a emite bonurile fiscale cerute de legea din România.
              franchisetech nu este producătorul echipamentului fiscal, nu este ANAF și nu certifică echipamente fiscale.
              Dacă emiterea bonului fiscal eșuează, vânzarea este totuși înregistrată, ca să nu se piardă — dar sunteți
              responsabil să verificați că toate bonurile fiscale necesare au fost efectiv emise.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Fără aviz ANAF</h2>
            <p>
              franchisetech nu este aprobat, avizat sau certificat de Agenția Națională de Administrare Fiscală (ANAF) sau
              de vreo altă autoritate de reglementare din România. Este gândit să funcționeze împreună cu echipamente
              fiscale conforme cerințelor ANAF și cu e-Factura, fără a pretinde vreo aprobare oficială.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Acuratețea înregistrărilor</h2>
            <p>
              Rapoartele și reconcilierea din franchisetech depind de corectitudinea informațiilor introduse de personal
              și configurate de manageri — prețuri, cote TVA, numerar numărat și mișcări de stoc. Sistemul calculează și
              reconciliază pe baza acestor date, dar nu le poate verifica independent.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">Limitarea răspunderii</h2>
            <p>
              În măsura maximă permisă de legea aplicabilă, franchisetech și operatorii săi nu răspund pentru pierderi,
              daune, amenzi sau consecințe de reglementare care decurg din încrederea în înregistrările franchisetech, din
              setări configurate greșit sau din faptul că un echipament fiscal terț nu a emis un bon.
            </p>
          </section>
        </div>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Această pagină este un punct de plecare practic și trebuie revizuită de un jurist sau contabil calificat din
          România, având în vedere că franchisetech are acum clienți plătitori cu integrări fiscale active.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/terms" className="text-blue-600 hover:underline">Termeni și condiții</Link>
          {" · "}
          <Link href="/privacy" className="text-blue-600 hover:underline">Politica de confidențialitate</Link>
        </p>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
