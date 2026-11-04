import type { Metadata } from "next";
import Link from "next/link";
import { Confirm } from "@/components/legal/Confirm";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DATA_CONTROLLER } from "@/lib/legal/controller";

export const metadata: Metadata = {
  title: "Politica de cookie-uri / Cookie Policy | franchisetech",
  description: "Ce cookie-uri și ce date stocate în browser folosește franchisetech.ro, de ce și cât timp.",
  alternates: { canonical: "/cookies" },
};

const updated = "4 noiembrie 2026 / 4 November 2026";

type Row = { name: string; who: string; ro: string; en: string; duration: string; kind: "necessary" | "preference" | "analytics" };

// Every row was checked in the code (middleware.ts, lib/**, instrumentation-client.ts,
// app/layout.tsx) and, for the public pages, in a browser on www.franchisetech.ro
// on 2026-11-04. Update this list whenever a new cookie or tracker is added.
const cookies: Row[] = [
  { name: "sb-…-auth-token", who: "franchisetech (Supabase Auth)", ro: "Vă ține autentificat în cont. Apare doar după ce vă conectați.", en: "Keeps you signed in. Only set after you log in.", duration: "până la 400 de zile / up to 400 days", kind: "necessary" },
  { name: "pos_till_open", who: "franchisetech", ro: "Ține minte, în aplicație, că sertarul de casă este deschis.", en: "Remembers in the app that a till session is open.", duration: "1 zi / 1 day", kind: "necessary" },
  { name: "franchisetech_locale", who: "franchisetech", ro: "Limba aleasă pentru site (română sau engleză).", en: "Your site language (Romanian or English).", duration: "1 an / 1 year", kind: "preference" },
  { name: "franchisetech_preferred_plan", who: "franchisetech", ro: "Planul ales pe pagina de prețuri, ca să fie preselectat la înscriere.", en: "The plan you picked on the pricing page, preselected at sign-up.", duration: "7 zile / 7 days", kind: "preference" },
  { name: "franchisetech_acquisition", who: "franchisetech", ro: "Parametrii linkului prin care ați ajuns la înscriere (utm_*, gclid, fbclid, ref), ca să știm ce campanie a adus contul.", en: "The link parameters you arrived with at sign-up (utm_*, gclid, fbclid, ref), so we know which campaign brought the account.", duration: "30 de zile / 30 days", kind: "analytics" },
  { name: "ph_<cheie>_posthog", who: "PostHog (instanța UE / EU instance)", ro: "Un identificator aleator, ca să numărăm vizitele și pașii din formulare și să vedem erorile din pagină.", en: "A random identifier used to count visits and form steps and to see page errors.", duration: "1 an / 1 year", kind: "analytics" },
];

const storage: Row[] = [
  { name: "ph_<cheie>_posthog, …_window_id, …_primary_window_exists", who: "PostHog", ro: "Aceleași date ca cookie-ul PostHog, în localStorage și sessionStorage.", en: "The same data as the PostHog cookie, in localStorage and sessionStorage.", duration: "localStorage: până la ștergere / until cleared; sessionStorage: până închideți fila / until the tab closes", kind: "analytics" },
  { name: "datafast_session_id, datafast_pageview_state", who: "DataFast (datafa.st)", ro: "Statistici de vizite fără cookie-uri: un identificator de sesiune în sessionStorage.", en: "Cookieless visit statistics: a session identifier in sessionStorage.", duration: "până închideți fila / until the tab closes", kind: "analytics" },
  { name: "franchisetech*", who: "franchisetech", ro: "În aplicație: limba, coșul și vânzările POS nesincronizate, ciorna de configurare, mesaje închise.", en: "In the app: language, POS cart and unsynced sales, setup draft, dismissed hints.", duration: "până la ștergere / until cleared", kind: "necessary" },
];

const kindLabel = {
  necessary: "Strict necesar / Strictly necessary",
  preference: "Preferințe / Preferences",
  analytics: "Statistici / Analytics",
};

function Table({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[640px] text-left text-xs leading-5">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Nume / Name</th>
            <th scope="col" className="px-3 py-2 font-semibold">Scop / Purpose</th>
            <th scope="col" className="px-3 py-2 font-semibold">Tip / Type</th>
            <th scope="col" className="px-3 py-2 font-semibold">Durată / Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-700">
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="px-3 py-2 align-top"><code className="break-all font-mono text-slate-900">{row.name}</code><span className="block text-slate-500">{row.who}</span></td>
              <td className="px-3 py-2 align-top"><span lang="ro">{row.ro}</span><span lang="en" className="block text-slate-500">{row.en}</span></td>
              <td className="px-3 py-2 align-top">{kindLabel[row.kind]}</td>
              <td className="px-3 py-2 align-top">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <ClaudeMarketingShellAuth>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Politica de cookie-uri</h1>
        <p lang="en" className="mt-1 text-lg text-slate-500">Cookie Policy</p>
        <p className="mt-2 text-sm text-slate-500">Ultima actualizare / Last updated: {updated}</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="font-semibold text-slate-900">1. Cine folosește cookie-urile / Who sets them</h2>
            <p lang="ro">
              Site-ul {DATA_CONTROLLER.website} și aplicația franchisetech sunt operate de {DATA_CONTROLLER.legalName}, {DATA_CONTROLLER.registrationNumber},{" "}
              {DATA_CONTROLLER.registeredAddress}. Un cookie este un fișier mic pe care site-ul îl salvează în browser. Mai jos sunt toate cookie-urile și
              datele din browser pe care le folosim, cu scopul și durata lor.
            </p>
            <p lang="en" className="text-slate-500">
              {DATA_CONTROLLER.website} and the franchisetech app are operated by {DATA_CONTROLLER.legalName}. A cookie is a small file a website saves
              in your browser. Below is every cookie and item of browser storage we use, with its purpose and how long it lasts.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">2. Cookie-uri / Cookies</h2>
            <Table rows={cookies} />
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">3. Date stocate în browser (localStorage, sessionStorage) / Browser storage</h2>
            <Table rows={storage} />
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">4. Ce nu folosim / What we do not use</h2>
            <p lang="ro">
              Nu folosim cookie-uri de publicitate și nu încărcăm pixeli Facebook sau Google Ads. Google Analytics nu este activ pe site. Videoclipurile
              YouTube din pagini se încarcă de pe youtube-nocookie.com doar după ce apăsați pe ele; din acel moment YouTube (Google) poate stoca date în
              browser conform politicii sale. Plata se face pe pagina Stripe (checkout.stripe.com), unde se aplică politica Stripe.
            </p>
            <p lang="en" className="text-slate-500">
              We use no advertising cookies and load no Facebook or Google Ads pixels. Google Analytics is not active on the site. YouTube videos load from
              youtube-nocookie.com only after you click them; from then on YouTube (Google) may store data under its own policy. Payment happens on
              Stripe&rsquo;s page (checkout.stripe.com), where Stripe&rsquo;s policy applies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">5. Consimțământ și control / Consent and control</h2>
            <p lang="ro">
              Cookie-urile strict necesare nu au nevoie de consimțământ. Pentru cookie-urile de statistici (PostHog și franchisetech_acquisition){" "}
              <Confirm>
                Owner decision needed: the site has no consent banner today, so these are set on the first visit. Romanian Law 506/2004 (art. 4)
                requires prior consent for cookies that are not strictly necessary. Either add a consent banner or switch PostHog to cookieless mode,
                then rewrite this paragraph.
              </Confirm>
            </p>
            <p lang="ro" className="mt-2">
              Puteți șterge sau bloca oricând cookie-urile din setările browserului. Dacă blocați cookie-urile strict necesare, autentificarea în aplicație
              nu va funcționa.
            </p>
            <p lang="en" className="mt-2 text-slate-500">
              Strictly necessary cookies do not need consent. You can delete or block cookies at any time in your browser settings; if you block the strictly
              necessary ones, signing in to the app will not work.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">6. Contact</h2>
            <p>
              <a className="text-blue-600 hover:underline" href={`mailto:${DATA_CONTROLLER.contactEmail}`}>{DATA_CONTROLLER.contactEmail}</a>.{" "}
              <span lang="ro">Detalii despre datele personale găsiți în </span>
              <Link href="/privacy" className="text-blue-600 hover:underline">Politica de confidențialitate / Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </ClaudeMarketingShellAuth>
  );
}
