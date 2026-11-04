import Link from "next/link";
import { Confirm } from "@/components/legal/Confirm";
import { OdooEnquiryForm } from "@/components/marketing/OdooEnquiryForm";
import { DATA_CONTROLLER } from "@/lib/legal/controller";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/marketing/contact-info";
import { ODOO_APPS, ODOO_TOTAL_TESTS, ODOO_VERSIONS, odooStoreUrl, type OdooAppGroup } from "@/lib/marketing/odoo-apps";

type Locale = "en" | "ro";

const EMAIL = "info@franchisetech.ro";

const copy = {
  en: {
    switchLabel: "Română",
    switchHref: "/odoo/ro",
    eyebrow: "Odoo services",
    title: "Odoo integration for European companies",
    lead: "We connect Odoo to the systems your business already runs on: online stores, reporting, supplier bills, point of sale and fiscal printers. We build on our own published Odoo apps, so most projects start from tested code, not from a blank page.",
    ctaPrimary: "Describe your project",
    ctaSecondary: "See our apps",
    whoTitle: "Who we are",
    who: (
      <>
        <strong>SALUT TECH SRL</strong>{" "}is a Romanian software company. We build and maintain Odoo apps published under the author name
        &ldquo;Abdishakur Ali&rdquo; on the official Odoo Apps Store, and we also run franchisetech, a point-of-sale and back-office product for
        small food businesses. You deal directly with the people who write the code.
      </>
    ),
    whatTitle: "What we integrate",
    what: [
      ["Shopify", "Products, orders, customers, stock, fulfilment, refunds, markets and CRM, kept in sync with Odoo."],
      ["WooCommerce", "Orders and products from WooCommerce into Odoo, and stock from Odoo back to the store."],
      ["Power BI", "A refreshable Excel and Power BI data feed from Odoo, without exporting by hand."],
      ["AI bill OCR", "Supplier bills read from PDF or photo into draft Odoo vendor bills for review."],
      ["POS and fiscal printers", "Odoo Point of Sale printing Romanian fiscal receipts, refunds and X/Z reports through the FiscalNet driver."],
      ["Access control", "Field-level access rights in Odoo: who can see or edit which fields."],
    ],
    proofTitle: "Proof: 22 published Odoo apps",
    proof: (n: number) => (
      <>
        All 22 apps are live on apps.odoo.com for Odoo {ODOO_VERSIONS.map((v) => v.replace(".0", "")).join(", ")} (110 listings). Their source
        contains <strong>{n} automated test cases</strong>. The Shopify connector suite runs its tests on every change; its last full run on
        31 October 2026 passed 424 tests with 0 failures on Odoo 20.
      </>
    ),
    proofNote: "Links open the Odoo 19 listing; each page has a version selector for 16 to 20. Test counts are the test cases in each module, counted on 4 November 2026.",
    colApp: "App",
    colArea: "Area",
    colTests: "Tests",
    groups: { shopify: "Shopify", woocommerce: "WooCommerce", reporting: "Reporting", finance: "Finance", inventory: "Inventory", pos: "POS", access: "Access control" },
    howTitle: "How we work",
    howIntro: "Fixed price, agreed in writing before work starts. You know the cost and the scope in advance.",
    packages: [
      ["Integration review", "We look at your Odoo version, hosting and the systems to connect, and send a written scope with a fixed price.", "Price: "],
      ["Standard connector setup", "Install and configure one of our apps on your Odoo, map your data and run a test sync with you.", "Price: "],
      ["Custom integration", "New connector or changes to an existing one, delivered as an Odoo module with tests.", "Price: "],
      ["Support and updates", "Fixes and version upgrades for what we built for you.", "Price: "],
    ],
    priceTodo: "fixed price per package",
    responseTodo: "We reply to every enquiry within one working day.",
    contactTitle: "Contact",
    contactLead: "Tell us your Odoo version and what you need to connect. We answer in English or Romanian.",
    email: "Email",
    phone: "Phone",
    company: "Company details",
    legal: "Legal",
  },
  ro: {
    switchLabel: "English",
    switchHref: "/odoo",
    eyebrow: "Servicii Odoo",
    title: "Integrare Odoo pentru companii din Europa",
    lead: "Conectăm Odoo la sistemele pe care firma dumneavoastră le folosește deja: magazine online, raportare, facturi de la furnizori, punct de vânzare și case de marcat fiscale. Pornim de la aplicațiile Odoo pe care le-am publicat, așa că majoritatea proiectelor încep de la cod testat, nu de la zero.",
    ctaPrimary: "Descrieți proiectul",
    ctaSecondary: "Vedeți aplicațiile",
    whoTitle: "Cine suntem",
    who: (
      <>
        <strong>SALUT TECH SRL</strong>{" "}este o firmă românească de software. Dezvoltăm și întreținem aplicații Odoo publicate sub numele de autor
        &ldquo;Abdishakur Ali&rdquo; în Odoo Apps Store oficial și operăm franchisetech, un produs de POS și gestiune pentru afaceri mici din
        alimentație. Discutați direct cu oamenii care scriu codul.
      </>
    ),
    whatTitle: "Ce integrăm",
    what: [
      ["Shopify", "Produse, comenzi, clienți, stoc, livrări, rambursări, piețe și CRM, sincronizate cu Odoo."],
      ["WooCommerce", "Comenzi și produse din WooCommerce în Odoo, iar stocul din Odoo înapoi în magazin."],
      ["Power BI", "Un flux de date din Odoo pentru Excel și Power BI, actualizabil, fără exporturi manuale."],
      ["OCR cu AI pentru facturi", "Facturile furnizorilor, citite din PDF sau fotografie, devin facturi de furnizor în Odoo, în stare de ciornă, pentru verificare."],
      ["POS și case de marcat fiscale", "Odoo Point of Sale care tipărește bonuri fiscale, retururi și rapoarte X/Z prin driverul FiscalNet."],
      ["Controlul accesului", "Drepturi de acces la nivel de câmp în Odoo: cine vede sau modifică fiecare câmp."],
    ],
    proofTitle: "Dovada: 22 de aplicații Odoo publicate",
    proof: (n: number) => (
      <>
        Toate cele 22 de aplicații sunt publicate pe apps.odoo.com pentru Odoo {ODOO_VERSIONS.map((v) => v.replace(".0", "")).join(", ")} (110
        pagini). Codul lor conține <strong>{n} de teste automate</strong>. Suita de conectori Shopify își rulează testele la fiecare modificare;
        ultima rulare completă, din 31 octombrie 2026, a trecut 424 de teste fără nicio eroare pe Odoo 20.
      </>
    ),
    proofNote: "Linkurile deschid pagina pentru Odoo 19; fiecare pagină are un selector pentru versiunile 16–20. Testele sunt numărate în fiecare modul la 4 noiembrie 2026.",
    colApp: "Aplicație",
    colArea: "Domeniu",
    colTests: "Teste",
    groups: { shopify: "Shopify", woocommerce: "WooCommerce", reporting: "Raportare", finance: "Financiar", inventory: "Stocuri", pos: "POS", access: "Controlul accesului" },
    howTitle: "Cum lucrăm",
    howIntro: "Preț fix, stabilit în scris înainte de începerea lucrului. Știți dinainte costul și ce se livrează.",
    packages: [
      ["Analiza integrării", "Verificăm versiunea Odoo, găzduirea și sistemele de conectat și trimitem în scris ce facem și prețul fix.", "Preț: "],
      ["Configurarea unui conector standard", "Instalăm și configurăm una dintre aplicațiile noastre în Odoo-ul dumneavoastră, potrivim datele și facem împreună o sincronizare de test.", "Preț: "],
      ["Integrare la comandă", "Conector nou sau modificări la unul existent, livrate ca modul Odoo cu teste.", "Preț: "],
      ["Suport și actualizări", "Corecturi și migrări de versiune pentru ce am construit pentru dumneavoastră.", "Preț: "],
    ],
    priceTodo: "preț fix pe pachet",
    responseTodo: "Răspundem la fiecare cerere în cel mult o zi lucrătoare.",
    contactTitle: "Contact",
    contactLead: "Spuneți-ne versiunea de Odoo și ce trebuie conectat. Răspundem în română sau în engleză.",
    email: "Email",
    phone: "Telefon",
    company: "Date de identificare",
    legal: "Informații legale",
  },
} as const;

const GROUP_ORDER: OdooAppGroup[] = ["shopify", "woocommerce", "reporting", "finance", "inventory", "pos", "access"];

export function OdooServicesPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const apps = [...ODOO_APPS].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
  const h2 = "font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl";
  const body = "text-base leading-7 text-[#5B5D57]";

  return (
    <div lang={locale} className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">{t.eyebrow}</p>
          <Link href={t.switchHref} hrefLang={locale === "en" ? "ro" : "en"} className="text-sm font-medium text-[#0D0F0E] underline underline-offset-2">
            {t.switchLabel}
          </Link>
        </div>
        <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0D0F0E] sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5B5D57]">{t.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#contact" className="inline-flex min-h-12 items-center rounded-md bg-[#0D0F0E] px-5 text-sm font-semibold text-white">{t.ctaPrimary}</a>
          <a href="#apps" className="inline-flex min-h-12 items-center rounded-md border border-[#0D0F0E]/20 px-5 text-sm font-semibold text-[#0D0F0E]">{t.ctaSecondary}</a>
        </div>

        <section className="mt-16">
          <h2 className={h2}>{t.whoTitle}</h2>
          <p className={`mt-4 max-w-3xl ${body}`}>{t.who}</p>
        </section>

        <section className="mt-16">
          <h2 className={h2}>{t.whatTitle}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.what.map(([name, text]) => (
              <li key={name} className="rounded-lg border border-[#0D0F0E]/10 bg-white p-5">
                <h3 className="font-semibold text-[#0D0F0E]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="apps" className="mt-16 scroll-mt-24">
          <h2 className={h2}>{t.proofTitle}</h2>
          <p className={`mt-4 max-w-3xl ${body}`}>{t.proof(ODOO_TOTAL_TESTS)}</p>
          <div className="mt-6 overflow-x-auto rounded-lg border border-[#0D0F0E]/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0D0F0E]/[0.03] text-xs uppercase tracking-wide text-[#5B5D57]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">{t.colApp}</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">{t.colArea}</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">{t.colTests}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0D0F0E]/10">
                {apps.map((app) => (
                  <tr key={app.tech}>
                    <td className="px-4 py-3">
                      <a href={odooStoreUrl(app.tech)} target="_blank" rel="noopener noreferrer" className="font-medium text-[#165DFC] underline-offset-2 hover:underline">{app.name}</a>
                      <span className="block text-xs text-[#8F8F86] sm:hidden">{t.groups[app.group]}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-[#5B5D57] sm:table-cell">{t.groups[app.group]}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#0D0F0E]">{app.tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#8F8F86]">{t.proofNote}</p>
        </section>

        <section className="mt-16">
          <h2 className={h2}>{t.howTitle}</h2>
          <p className={`mt-4 max-w-3xl ${body}`}>{t.howIntro}</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {t.packages.map(([name, text, price], index) => (
              <li key={name} className="rounded-lg border border-[#0D0F0E]/10 bg-white p-5">
                <p className="font-mono text-xs text-[#8F8F86]">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-semibold text-[#0D0F0E]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{text}</p>
                <p className="mt-3 text-sm text-[#0D0F0E]">{price}<Confirm>{t.priceTodo}</Confirm></p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-[#5B5D57]"><Confirm>{t.responseTodo}</Confirm></p>
        </section>

        <section id="contact" className="mt-16 scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <h2 className={h2}>{t.contactTitle}</h2>
              <p className={`mt-4 ${body}`}>{t.contactLead}</p>
              <p className="mt-5 text-sm text-[#5B5D57]">
                {t.email}: <a href={`mailto:${EMAIL}`} className="font-medium text-[#0D0F0E] underline underline-offset-2">{EMAIL}</a>
              </p>
              <p className="mt-2 text-sm text-[#5B5D57]">
                {t.phone}: <a href={SUPPORT_PHONE_TEL} className="font-medium text-[#0D0F0E] underline underline-offset-2">{SUPPORT_PHONE_DISPLAY}</a>
              </p>
              <p className="mt-6 text-sm leading-6 text-[#8F8F86]">
                {DATA_CONTROLLER.legalName} · {DATA_CONTROLLER.registrationNumber}
                <br />
                {DATA_CONTROLLER.registeredAddress}, Romania
              </p>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link href="/imprint" className="text-[#0D0F0E] underline underline-offset-2">{t.company}</Link>
                <Link href="/privacy#odoo" className="text-[#0D0F0E] underline underline-offset-2">{locale === "en" ? "Privacy" : "Confidențialitate"}</Link>
                <Link href="/terms#odoo" className="text-[#0D0F0E] underline underline-offset-2">{locale === "en" ? "Terms" : "Termeni"}</Link>
                <Link href="/cookies" className="text-[#0D0F0E] underline underline-offset-2">Cookies</Link>
              </p>
            </div>
            <OdooEnquiryForm locale={locale} />
          </div>
        </section>
      </div>
    </div>
  );
}
