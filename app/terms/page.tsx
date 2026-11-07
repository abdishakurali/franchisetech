import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DATA_CONTROLLER } from "@/lib/legal/controller";
import { ODOO_WARRANTY_DAYS } from "@/lib/marketing/odoo-services";

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

        <section id="odoo" className="mt-10 scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
          <h2 lang="en" className="text-lg font-semibold text-slate-900">Odoo apps and Odoo integration services</h2>
          <p lang="ro" className="text-slate-500">Aplicații Odoo și servicii de integrare Odoo</p>
          <div lang="en" className="mt-3 space-y-2">
            <p>
              <strong>Apps from the Odoo Apps Store.</strong> Our Odoo apps are sold through apps.odoo.com. The purchase is made under the Odoo Apps
              Store terms, and each app is licensed under the licence stated on its store page (OPL-1 for 21 apps, LGPL-3 for the free Block Customers and Products app). Sections
              1 to 9 above apply to the franchisetech software, not to these apps.
            </p>
            <p>
              <strong>Integration services.</strong> Odoo integration, configuration, custom development and support are provided by{" "}
              {DATA_CONTROLLER.legalName} under a written offer that states the scope, the fixed price and the delivery terms. If the offer and these
              terms differ, the offer applies.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Prices and payment.</strong> Prices are in EUR and final; SALUT TECH SRL is not VAT-registered, so no VAT is added. Projects up
                to €500 are invoiced on delivery. Larger projects are invoiced 50% when the offer is accepted and 50% on delivery. Invoices are due
                within 14 days. The monthly support plan is invoiced monthly in advance and can be cancelled before the next month starts.
              </li>
              <li>
                <strong>Acceptance and warranty.</strong> You test the delivered work; we fix defects against the agreed scope free of charge for{" "}
                {ODOO_WARRANTY_DAYS} days after delivery. Changes to the scope are quoted separately.
              </li>
              <li>
                <strong>Your systems and data.</strong> You give us the access needed for the work and keep backups of your Odoo database. When we
                process personal data on your behalf, we sign a data processing agreement (Article 28 GDPR).
              </li>
              <li>
                <strong>Liability.</strong> Our total liability for a project is limited to the amount you paid for that project, except where the
                law does not allow a limit (for example for intent or gross negligence). We are not liable for indirect losses such as lost profit.
              </li>
              <li>
                <strong>Law and courts.</strong> Romanian law applies. Disputes go to the competent courts for the registered office of SALUT TECH
                SRL, unless the law requires otherwise.
              </li>
            </ul>
          </div>
          <div lang="ro" className="mt-4 space-y-2 text-slate-500">
            <p>
              Aplicațiile noastre Odoo se cumpără prin apps.odoo.com, conform termenilor Odoo Apps Store și licenței afișate pe pagina fiecărei aplicații
              (OPL-1 pentru 21 de aplicații, LGPL-3 pentru aplicația gratuită Block Customers and Products). Secțiunile 1–9 de mai sus se aplică software-ului franchisetech, nu acestor
              aplicații.
            </p>
            <p>
              Serviciile de integrare, configurare, dezvoltare la comandă și suport pentru Odoo sunt prestate de {DATA_CONTROLLER.legalName} pe baza
              unei oferte scrise, care stabilește ce se livrează, prețul fix și termenele. Dacă oferta și acești termeni diferă, se aplică oferta.
            </p>
            <p>
              Prețurile sunt în EUR și sunt finale (SALUT TECH SRL nu este plătitoare de TVA). Proiectele de până la €500 se facturează la livrare;
              cele mai mari, 50% la acceptarea ofertei și 50% la livrare, cu plata în 14 zile. Corectăm gratuit defectele față de ofertă timp de{" "}
              {ODOO_WARRANTY_DAYS} de zile de la livrare. Pentru datele personale prelucrate în numele clientului semnăm un acord conform art. 28
              GDPR. Răspunderea noastră totală pentru un proiect este limitată la suma plătită pentru acel proiect, cu excepțiile prevăzute de lege.
              Se aplică legea română; litigiile se soluționează de instanțele competente de la sediul SALUT TECH SRL.
            </p>
          </div>
        </section>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Acești termeni sunt un punct de plecare practic și trebuie revizuiți de un jurist calificat.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/privacy" className="text-blue-600 hover:underline">Politica de confidențialitate</Link>{" · "}<Link href="/cookies" className="text-blue-600 hover:underline">Politica de cookie-uri</Link>{" · "}<Link href="/imprint" className="text-blue-600 hover:underline">Date de identificare</Link>
        </p>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
