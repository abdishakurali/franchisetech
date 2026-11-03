import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DATA_CONTROLLER } from "@/lib/legal/controller";

// Romanian translation of the 3 June 2026 terms; the substance is unchanged.
const updated = "3 noiembrie 2026";

export const metadata: Metadata = {
  title: "Termeni și condiții franchisetech",
  description: "Termenii de utilizare ai serviciului franchisetech, operat de SALUT TECH SRL.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ClaudeMarketingShellAuth>
      <main lang="ro" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Termeni și condiții</h1>
        <p className="mt-2 text-sm text-slate-500">Ultima actualizare: {updated} (traducere în limba română; conținutul este cel din 3 iunie 2026)</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section><h2 className="font-semibold text-slate-900">1. Despre franchisetech</h2><p>franchisetech oferă, în cloud, POS, gestiune de stoc, achiziții, rețete, rapoarte și, opțional, evidența siguranței alimentare pentru afacerile din alimentație.</p></section>
          <section><h2 className="font-semibold text-slate-900">2. Ce include serviciul</h2><p>franchisetech este un produs software care se poate schimba pe măsură ce funcțiile sunt adăugate, îmbunătățite, suspendate sau eliminate. Fluxurile fiscale specifice fiecărei țări trebuie configurate corect de client și de consultanții săi.</p></section>
          <section><h2 className="font-semibold text-slate-900">3. Nu este consultanță juridică sau de reglementare</h2><p>franchisetech ajută la ținerea evidențelor și la controlul operațional. Nu garantează conformitatea, nu înlocuiește îndrumările oficiale și nu preia responsabilitatea operatorului din domeniul alimentar.</p></section>
          <section><h2 className="font-semibold text-slate-900">4. Conturi</h2><p>Utilizatorii trebuie să furnizeze date corecte pentru cont și să își păstreze în siguranță datele de autentificare. Sunteți responsabil pentru activitatea din contul dumneavoastră.</p></section>
          <section><h2 className="font-semibold text-slate-900">5. Responsabilitățile clientului</h2><p>Clientul este responsabil să verifice înregistrările, să se asigure că personalul folosește corect sistemul, să respecte legislația alimentară și îndrumările oficiale, să mențină proceduri potrivite de siguranță alimentară, să verifice acuratețea dispozitivelor acolo unde este cazul și să decidă ce măsuri ia atunci când apar probleme operaționale.</p></section>
          <section><h2 className="font-semibold text-slate-900">6. Utilizare acceptabilă</h2><p>Nu aveți voie să folosiți abuziv serviciul, să îl folosiți pentru activități ilegale, să încercați să accesați alte conturi, să perturbați serviciul, să încărcați conținut rău intenționat sau să încălcați drepturile altora.</p></section>
          <section><h2 className="font-semibold text-slate-900">7. Disponibilitate și modificări</h2><p>Ne străduim să păstrăm serviciul disponibil, dar nu garantăm acces neîntrerupt. Putem actualiza, suspenda sau modifica serviciul atunci când este necesar.</p></section>
          <section><h2 className="font-semibold text-slate-900">8. Date și înregistrări</h2><p>franchisetech stochează înregistrările introduse de utilizatori. Clientul rămâne responsabil să verifice că înregistrările sunt corecte, complete și potrivite nevoilor sale operaționale și legale.</p></section>
          <section><h2 className="font-semibold text-slate-900">9. Răspundere</h2><p>În măsura maximă permisă de lege, franchisetech nu răspunde pentru pierderi indirecte, verificări omise, date incorecte introduse de utilizatori, decizii privind siguranța alimentară sau consecințe de reglementare.</p></section>
          <section><h2 className="font-semibold text-slate-900">10. Contact</h2><p>Ne puteți scrie la <a className="text-blue-600 hover:underline" href="mailto:info@franchisetech.ro">info@franchisetech.ro</a>.</p>{DATA_CONTROLLER.legalName ? <p className="mt-2">franchisetech este operat de {DATA_CONTROLLER.legalName}, {DATA_CONTROLLER.registrationNumber}, {DATA_CONTROLLER.registeredAddress}.</p> : null}</section>
          <section><h2 className="font-semibold text-slate-900">11. Modificări ale termenilor</h2><p>Putem actualiza acești termeni; în acest caz modificăm data ultimei actualizări.</p></section>
        </div>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Acești termeni sunt un punct de plecare practic și trebuie revizuiți de un jurist calificat.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/privacy" className="text-blue-600 hover:underline">Politica de confidențialitate</Link>
        </p>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
