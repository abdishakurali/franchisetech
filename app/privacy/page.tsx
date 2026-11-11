import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DATA_CONTROLLER, DEMO_LEAD_PROCESSORS, DEMO_LEAD_RETENTION_MONTHS } from "@/lib/legal/controller";

// Romanian translation of the 3 June 2026 policy; the substance is unchanged.
const updated = "4 noiembrie 2026";

export const metadata: Metadata = {
  title: { absolute: "Politica de confidențialitate franchisetech" },
  description: "Ce date prelucrează franchisetech, de ce, cât timp și ce drepturi aveți.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ClaudeMarketingShellAuth>
      <main lang="ro" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Politica de confidențialitate</h1>
        <p className="mt-2 text-sm text-slate-500">Ultima actualizare: {updated} (secțiunea 5 actualizată la 4 noiembrie 2026; restul conținutului este cel din 3 iunie 2026)</p>

        <section id="odoo" lang="en" className="mt-8 scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">Odoo services enquiries (English)</h2>
          <p className="mt-1 text-xs text-slate-500">Updated 4 November 2026. Notă de informare în limba română mai jos.</p>
          <p className="mt-3">
            <strong>Controller:</strong> {DATA_CONTROLLER.legalName}, {DATA_CONTROLLER.registrationNumber}, {DATA_CONTROLLER.registeredAddress}, Romania,{" "}
            <a className="text-blue-600 hover:underline" href={`mailto:${DATA_CONTROLLER.contactEmail}`}>{DATA_CONTROLLER.contactEmail}</a>.
          </p>
          <p className="mt-2">
            <strong>What we collect:</strong> the email address or phone number you enter, and optionally your name, company, country and project
            description. If you write to us by email, we receive whatever your email contains.
          </p>
          <p className="mt-2">
            <strong>Why and on what basis:</strong> to answer your enquiry and prepare an offer at your request, Article 6(1)(b) GDPR (steps before a
            contract). We count form visits and submissions without your name, email or phone, and limit repeated submissions per IP address, on the
            basis of our legitimate interest, Article 6(1)(f) GDPR. We do not use your details for newsletters and we do not sell them.
          </p>
          <p className="mt-2">
            <strong>Where it goes:</strong> the form is processed on Vercel and sent as an email through Resend (a US provider) to our Zoho Mail inbox
            (EU data centre). It is not stored in a database by the form. Analytics events go to PostHog&rsquo;s EU instance and use a one-way hash in
            place of your IP and contact details. For transfers outside the EEA we rely on the safeguards in Chapter V GDPR set out in the
            provider&rsquo;s data processing terms.
          </p>
          <p className="mt-2">
            <strong>How long:</strong> we keep enquiries that do not lead to a contract for up to {DEMO_LEAD_RETENTION_MONTHS} months, then
            delete them; if you become a client, for the duration of the contract and the periods required by Romanian accounting law.
          </p>
          <p className="mt-2">
            <strong>Your rights:</strong> access, rectification, erasure, restriction, objection and portability. Write to{" "}
            {DATA_CONTROLLER.contactEmail}; we reply within one month. You can also complain to the Romanian supervisory authority, ANSPDCP (
            <a className="text-blue-600 hover:underline" href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">dataprotection.ro</a>
            ), or to the authority in your own EU country. Cookies are explained in the <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
          </p>
          <h3 lang="ro" className="mt-4 font-semibold text-slate-900">Pe scurt, în română</h3>
          <p lang="ro">
            Datele din formularul de pe pagina <Link href="/odoo/ro" className="text-blue-600 hover:underline">Servicii Odoo</Link> (email sau telefon
            și, opțional, nume, firmă, țară, descrierea proiectului) le folosim doar ca să vă răspundem și să vă trimitem o ofertă (art. 6 alin. (1) lit.
            b) GDPR). Formularul trimite un email prin Resend către căsuța noastră Zoho Mail și nu salvează datele într-o bază de date. Drepturile și
            durata de păstrare sunt cele de mai jos.
          </p>
        </section>

        <section id="cereri-demo" lang="ro" className="mt-8 scroll-mt-24 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">Notă de informare: cereri de demonstrație și formulare de contact</h2>
          <p className="mt-1 text-xs text-slate-500">Actualizată la 27 octombrie 2026</p>

          <h3 className="mt-4 font-semibold text-slate-900">Cine prelucrează datele</h3>
          <p>
            {DATA_CONTROLLER.legalName
              ? `${DATA_CONTROLLER.legalName}${DATA_CONTROLLER.registrationNumber ? `, ${DATA_CONTROLLER.registrationNumber}` : ""}${DATA_CONTROLLER.registeredAddress ? `, ${DATA_CONTROLLER.registeredAddress}` : ""}, care operează ${DATA_CONTROLLER.website}`
              : `Operatorul site-ului ${DATA_CONTROLLER.website} (${DATA_CONTROLLER.brand})`}
            . Ne puteți scrie oricând la{" "}
            <a className="text-blue-600 hover:underline" href={`mailto:${DATA_CONTROLLER.contactEmail}`}>{DATA_CONTROLLER.contactEmail}</a>.
          </p>

          <h3 className="mt-4 font-semibold text-slate-900">Ce date colectăm</h3>
          <ul className="list-disc pl-5">
            <li>Numele afacerii, numele dumneavoastră, adresa de email și, opțional, numărul de telefon</li>
            <li>Tipul afacerii, numărul de locații și, opțional, mesajul trimis</li>
            <li>De unde ați ajuns la formular: articolul și butonul pe care l-ați apăsat, eventualii parametri UTM ai linkului</li>
            <li>O amprentă criptografică (hash) a adresei IP, nu adresa IP în clar, folosită doar pentru a limita trimiterile abuzive</li>
          </ul>

          <h3 className="mt-4 font-semibold text-slate-900">De ce și pe ce temei</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>Ca să vă răspundem și să organizăm demonstrația cerută</strong>: prelucrarea este necesară pentru demersuri făcute la cererea
              dumneavoastră înainte de un eventual contract (art. 6 alin. (1) lit. b) GDPR). Din acest motiv nu vă cerem un consimțământ separat.
            </li>
            <li>
              <strong>Ca să protejăm formularul de abuzuri</strong> (amprenta IP, limitarea numărului de cereri) și{" "}
              <strong>ca să vedem ce pagini aduc cereri</strong>, fără nume, email sau telefon în statistici: interesul nostru legitim
              (art. 6 alin. (1) lit. f) GDPR).
            </li>
            <li>Nu folosim aceste date pentru newslettere sau marketing și nu le vindem.</li>
          </ul>

          <h3 className="mt-4 font-semibold text-slate-900">Cine le mai prelucrează</h3>
          <ul className="list-disc pl-5">
            {DEMO_LEAD_PROCESSORS.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>: {p.role}; {p.location}.
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Notificarea prin email trece printr-un furnizor din SUA. Pentru transferuri în afara Spațiului Economic European ne bazăm pe garanțiile
            prevăzute de capitolul V din GDPR, conform termenilor de prelucrare a datelor ai furnizorului. Detaliile le puteți cere la adresa de mai sus.
          </p>

          <h3 className="mt-4 font-semibold text-slate-900">Cât timp le păstrăm</h3>
          <p>
            Cât timp discutăm despre demonstrație și, dacă deveniți client, pe durata relației contractuale. Dacă nu deveniți client, ștergem cererea
            după cel mult {DEMO_LEAD_RETENTION_MONTHS} de luni. Cererile marcate ca spam sau test pot fi șterse oricând. Le puteți cere ștergerea mai
            devreme, oricând.
          </p>

          <h3 className="mt-4 font-semibold text-slate-900">Drepturile dumneavoastră</h3>
          <p>
            Aveți dreptul de acces, de rectificare, de ștergere, de restricționare a prelucrării, de opoziție (pentru prelucrările bazate pe interesul
            legitim) și, unde se aplică, dreptul la portabilitatea datelor. Ne scrieți la{" "}
            <a className="text-blue-600 hover:underline" href={`mailto:${DATA_CONTROLLER.contactEmail}`}>{DATA_CONTROLLER.contactEmail}</a> și răspundem
            în cel mult o lună. Puteți depune și o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
            (ANSPDCP),{" "}
            <a className="text-blue-600 hover:underline" href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">dataprotection.ro</a>.
          </p>
        </section>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section><h2 className="font-semibold text-slate-900">1. Cine suntem</h2><p>franchisetech este un software în cloud de POS și control al afacerii pentru cafenele, restaurante și alte afaceri din alimentație.</p></section>
          <section><h2 className="font-semibold text-slate-900">2. Ce date colectăm</h2><p>Putem colecta date de cont, precum numele, adresa de email și rolul; date despre afacere, precum denumirea și tipul afacerii; înregistrări operaționale, precum vânzările din POS, stocul, achizițiile, verificările de siguranță alimentară și rapoartele, dacă sunt folosite; date tehnice, precum adresa IP, informații despre browser și dispozitiv, jurnale, cookie-uri și date de sesiune; precum și mesajele trimise către suport, dacă ne contactați.</p></section>
          <section><h2 className="font-semibold text-slate-900">3. Cum folosim datele</h2><p>Folosim datele pentru a crea și administra conturile, pentru a furniza serviciul franchisetech, pentru a stoca și afișa înregistrările afacerii, pentru a îmbunătăți fiabilitatea și experiența de utilizare, pentru a depana și securiza serviciul și pentru a vă transmite informări legate de serviciu.</p></section>
          <section><h2 className="font-semibold text-slate-900">4. Temeiul legal</h2><p>Acolo unde se aplică GDPR, temeiurile noastre legale pot include executarea contractului sau furnizarea serviciului, interesul legitim de a securiza și îmbunătăți serviciul, obligațiile legale, acolo unde este cazul, și consimțământul, acolo unde este necesar.</p></section>
          <section><h2 className="font-semibold text-slate-900">5. Cu cine împărtășim datele</h2><p>Folosim acești furnizori: Vercel (găzduirea site-ului și a aplicației), Supabase (bază de date și autentificare, regiunea UE), Stripe (plăți și abonamente), Resend și Loops (emailuri tranzacționale și despre cont), Zoho Mail (căsuța info@franchisetech.ro), PostHog (statistici de utilizare și erori, instanța UE) și DataFast (statistici de vizite fără cookie-uri). Transmitem date autorităților doar dacă legea o cere. Lista cookie-urilor este în <Link href="/cookies" className="text-blue-600 hover:underline">Politica de cookie-uri</Link>.</p></section>
          <section><h2 className="font-semibold text-slate-900">6. Cât timp păstrăm datele</h2><p>Păstrăm datele de cont și înregistrările operaționale cât timp contul este activ sau cât este necesar pentru furnizarea serviciului, cu excepția cazului în care se cere ștergerea lor sau se aplică o obligație legală ori operațională de păstrare.</p></section>
          <section><h2 className="font-semibold text-slate-900">7. Drepturile dumneavoastră</h2><p>Puteți avea dreptul de acces, de rectificare, de ștergere, de restricționare, de opoziție, la portabilitate, de retragere a consimțământului, acolo unde este cazul, și dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).</p></section>
          <section><h2 className="font-semibold text-slate-900">8. Securitate</h2><p>Folosim măsuri de securitate rezonabile pentru a proteja serviciul și datele. Niciun serviciu online nu poate garanta securitate perfectă.</p></section>
          <section><h2 className="font-semibold text-slate-900">9. Transferuri internaționale</h2><p>Furnizorii de cloud pot prelucra date în afara României sau a UE. Acolo unde este necesar, se pot folosi garanții adecvate.</p></section>
          <section><h2 className="font-semibold text-slate-900">10. Contact</h2><p>Ne puteți scrie la <a className="text-blue-600 hover:underline" href="mailto:info@franchisetech.ro">info@franchisetech.ro</a>.</p>{DATA_CONTROLLER.legalName ? <p className="mt-2">Operatorul datelor este {DATA_CONTROLLER.legalName}, {DATA_CONTROLLER.registrationNumber}, {DATA_CONTROLLER.registeredAddress}.</p> : null}</section>
          <section><h2 className="font-semibold text-slate-900">11. Modificări ale politicii</h2><p>Putem actualiza această politică; în acest caz modificăm data ultimei actualizări.</p></section>
        </div>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Această politică este un punct de plecare practic și trebuie revizuită de un jurist calificat.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/terms" className="text-blue-600 hover:underline">Termeni și condiții</Link>{" · "}<Link href="/cookies" className="text-blue-600 hover:underline">Politica de cookie-uri</Link>{" · "}<Link href="/imprint" className="text-blue-600 hover:underline">Date de identificare</Link>
        </p>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
