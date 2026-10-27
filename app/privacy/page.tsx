import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DATA_CONTROLLER, DEMO_LEAD_PROCESSORS, DEMO_LEAD_RETENTION_MONTHS } from "@/lib/legal/controller";

const updated = "3 June 2026";

export default function PrivacyPage() {
  return (
    <ClaudeMarketingShellAuth>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>

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
          <section><h2 className="font-semibold text-slate-900">1. Who we are</h2><p>franchisetech is cloud POS and business control software for cafes, restaurants, and food businesses.</p></section>
          <section><h2 className="font-semibold text-slate-900">2. What data we collect</h2><p>We may collect account information such as name, email, and role; business information such as business name and business type; operational records such as POS sales, stock, purchases, food-safety checks, and reports if used; technical information such as IP address, browser/device information, logs, cookies and session data; and support communications if users contact us.</p></section>
          <section><h2 className="font-semibold text-slate-900">3. How we use data</h2><p>We use data to create and manage accounts, provide the franchisetech service, store and display business records, improve reliability and user experience, troubleshoot and secure the service, and communicate service-related updates.</p></section>
          <section><h2 className="font-semibold text-slate-900">4. Legal basis</h2><p>Where GDPR applies, our legal bases may include contract or service provision, legitimate interests in securing and improving the service, legal obligations where applicable, and consent where required.</p></section>
          <section><h2 className="font-semibold text-slate-900">5. Who we share data with</h2><p>We may share data with hosting, database, and authentication providers such as Supabase; infrastructure providers such as hosting, CDN, or server providers; email providers for transactional messages; analytics or support providers if added later; and authorities if legally required.</p></section>
          <section><h2 className="font-semibold text-slate-900">6. How long we keep data</h2><p>We keep account and operational records while the account is active or as needed to provide the service, unless deletion is requested or legal or operational retention applies.</p></section>
          <section><h2 className="font-semibold text-slate-900">7. Your rights</h2><p>You may have rights to access, correction, deletion, restriction, objection, portability, withdrawal of consent where applicable, and to complain to the Romanian National Supervisory Authority for Personal Data Processing (ANSPDCP).</p></section>
          <section><h2 className="font-semibold text-slate-900">8. Security</h2><p>We use reasonable security measures to protect the service and data. No internet service can guarantee perfect security.</p></section>
          <section><h2 className="font-semibold text-slate-900">9. International transfers</h2><p>Cloud providers may process data outside Romania or the EU. Safeguards may be used where required.</p></section>
          <section><h2 className="font-semibold text-slate-900">10. Contact</h2><p>Contact us at <a className="text-blue-600 hover:underline" href="mailto:info@franchisetech.ro">info@franchisetech.ro</a>.</p></section>
          <section><h2 className="font-semibold text-slate-900">11. Changes</h2><p>We may update this policy and change the last updated date.</p></section>
        </div>

        <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This policy is a practical starting point and should be reviewed by a qualified legal professional before paid customer use.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
        </p>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
