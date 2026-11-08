import Link from "next/link";
import { Check } from "lucide-react";
import { OdooEnquiryForm } from "@/components/marketing/OdooEnquiryForm";
import { DATA_CONTROLLER } from "@/lib/legal/controller";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/marketing/contact-info";
import { ODOO_APPS, ODOO_TOTAL_TESTS, ODOO_VERSIONS, odooStoreUrl, type OdooAppGroup } from "@/lib/marketing/odoo-apps";
import { ODOO_PACKAGES, ODOO_HOURLY_EUR, ODOO_REPLY_HOURS } from "@/lib/marketing/odoo-services";

type Locale = "en" | "ro";

const EMAIL = "info@franchisetech.ro";
const versions = ODOO_VERSIONS.map((v) => v.replace(".0", ""));

const copy = {
  en: {
    switchLabel: "Română",
    switchHref: "/odoo/ro",
    eyebrow: "Odoo services · SALUT TECH SRL",
    title: "Odoo integration for European companies",
    lead: "We connect Odoo to the systems your business already runs on: online stores, reporting, supplier bills, point of sale and fiscal printers. We build on our own published Odoo apps, so most projects start from tested code, not from a blank page.",
    ctaPrimary: "Get a free fixed-price quote",
    ctaSecondary: "See our 22 apps",
    ctaDemos: "Watch the demos",
    stats: [
      ["22", "Odoo apps on apps.odoo.com"],
      [`${versions[0]}–${versions[versions.length - 1]}`, "Odoo versions supported"],
      [String(ODOO_TOTAL_TESTS), "automated test cases"],
      [`${ODOO_REPLY_HOURS} h`, "reply time on working days"],
    ],
    whoTitle: "Who we are",
    who: (
      <>
        <strong>SALUT TECH SRL</strong>{" "}is a software company registered in Romania, in the EU. We build and maintain the Odoo apps
        published under the author name &ldquo;Abdishakur Ali&rdquo; on the official Odoo Apps Store, and we also run franchisetech, a
        point-of-sale and back-office product for small food businesses. You deal directly with the people who write the code.
      </>
    ),
    whyTitle: "What you get from a company, not a freelancer",
    why: [
      "A written offer with scope and a fixed price before any work starts",
      "An invoice from an EU company (SALUT TECH SRL, CUI 49702253); prices are final, no VAT is added",
      "Code delivered as a proper Odoo module, with automated tests",
      "30 days of free fixes after delivery",
      "A data processing agreement when we work with your data",
      `A reply within ${ODOO_REPLY_HOURS} working hours, in English or Romanian`,
    ],
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
    proof: (
      <>
        All 22 apps are live on apps.odoo.com for Odoo {versions.join(", ")} (110 listings). Their source contains{" "}
        <strong>{ODOO_TOTAL_TESTS} automated test cases</strong>. The Shopify connector suite runs its tests on every change; its last full
        run on 31 October 2026 passed 424 tests with 0 failures on Odoo 20.
      </>
    ),
    proofNote: "Links open the Odoo 19 listing; each page has a version selector for 16 to 20. Test counts are the test cases in each module, counted on 4 November 2026.",
    colApp: "App",
    colArea: "Area",
    colTests: "Tests",
    groups: { shopify: "Shopify", woocommerce: "WooCommerce", reporting: "Reporting", finance: "Finance", inventory: "Inventory", pos: "POS", access: "Access control" },
    pricingTitle: "Fixed prices",
    pricingIntro: "Every project starts with a free review and a written fixed price. Prices are in EUR and final: SALUT TECH SRL is not VAT-registered, so no VAT is added.",
    from: "from",
    free: "Free",
    perMonth: "/ month",
    hourly: `Small changes outside a package: €${ODOO_HOURLY_EUR} per hour, always quoted before we start. App licences are bought separately on the Odoo Apps Store.`,
    popular: "Most requested",
    faqTitle: "Questions",
    faq: [
      ["Which Odoo editions do you work with?", "Community and Enterprise, self-hosted or on Odoo.sh, versions 16 to 20. Odoo Online (the standard SaaS plan) does not allow custom modules, so integrations there need Odoo.sh or a self-hosted server."],
      ["How fast do you reply?", `Within ${ODOO_REPLY_HOURS} working hours, and always within one working day.`],
      ["Do you work outside Romania?", "Yes. We work remotely with companies anywhere in the EU and answer in English or Romanian."],
      ["Who owns the code?", "Custom work we build for you is delivered to you as an Odoo module. Our published apps stay under their Odoo Apps Store licence."],
    ],
    contactTitle: "Contact",
    contactLead: "Tell us your Odoo version and what you need to connect. You get a written fixed-price quote, free.",
    email: "Email",
    phone: "Phone",
    company: "Company details",
    privacy: "Privacy",
    terms: "Terms",
  },
  ro: {
    switchLabel: "English",
    switchHref: "/odoo",
    eyebrow: "Servicii Odoo · SALUT TECH SRL",
    title: "Integrare Odoo pentru companii din Europa",
    lead: "Conectăm Odoo la sistemele pe care firma dumneavoastră le folosește deja: magazine online, raportare, facturi de la furnizori, punct de vânzare și case de marcat fiscale. Pornim de la aplicațiile Odoo pe care le-am publicat, așa că majoritatea proiectelor încep de la cod testat, nu de la zero.",
    ctaPrimary: "Cereți o ofertă gratuită la preț fix",
    ctaSecondary: "Vedeți cele 22 de aplicații",
    ctaDemos: "Vedeți demonstrațiile video (în engleză)",
    stats: [
      ["22", "aplicații Odoo pe apps.odoo.com"],
      [`${versions[0]}–${versions[versions.length - 1]}`, "versiuni Odoo suportate"],
      [String(ODOO_TOTAL_TESTS), "teste automate"],
      [`${ODOO_REPLY_HOURS} h`, "timp de răspuns în zilele lucrătoare"],
    ],
    whoTitle: "Cine suntem",
    who: (
      <>
        <strong>SALUT TECH SRL</strong>{" "}este o firmă de software înregistrată în România, în UE. Dezvoltăm și întreținem aplicațiile Odoo
        publicate sub numele de autor &ldquo;Abdishakur Ali&rdquo; în Odoo Apps Store oficial și operăm franchisetech, un produs de POS și
        gestiune pentru afaceri mici din alimentație. Discutați direct cu oamenii care scriu codul.
      </>
    ),
    whyTitle: "Ce primiți de la o firmă, nu de la un freelancer",
    why: [
      "Ofertă scrisă, cu ce se livrează și preț fix, înainte de începerea lucrului",
      "Factură de la o firmă din UE (SALUT TECH SRL, CUI 49702253); prețurile sunt finale, fără TVA adăugat",
      "Cod livrat ca modul Odoo, cu teste automate",
      "30 de zile de corecturi gratuite după livrare",
      "Acord de prelucrare a datelor când lucrăm cu datele dumneavoastră",
      `Răspuns în cel mult ${ODOO_REPLY_HOURS} ore lucrătoare, în română sau engleză`,
    ],
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
    proof: (
      <>
        Toate cele 22 de aplicații sunt publicate pe apps.odoo.com pentru Odoo {versions.join(", ")} (110 pagini). Codul lor conține{" "}
        <strong>{ODOO_TOTAL_TESTS} de teste automate</strong>. Suita de conectori Shopify își rulează testele la fiecare modificare; ultima
        rulare completă, din 31 octombrie 2026, a trecut 424 de teste fără nicio eroare pe Odoo 20.
      </>
    ),
    proofNote: "Linkurile deschid pagina pentru Odoo 19; fiecare pagină are un selector pentru versiunile 16–20. Testele sunt numărate în fiecare modul la 4 noiembrie 2026.",
    colApp: "Aplicație",
    colArea: "Domeniu",
    colTests: "Teste",
    groups: { shopify: "Shopify", woocommerce: "WooCommerce", reporting: "Raportare", finance: "Financiar", inventory: "Stocuri", pos: "POS", access: "Controlul accesului" },
    pricingTitle: "Prețuri fixe",
    pricingIntro: "Fiecare proiect începe cu o analiză gratuită și un preț fix, în scris. Prețurile sunt în EUR și sunt finale: SALUT TECH SRL nu este plătitoare de TVA.",
    from: "de la",
    free: "Gratuit",
    perMonth: "/ lună",
    hourly: `Modificări mici în afara pachetelor: €${ODOO_HOURLY_EUR} pe oră, cu estimare înainte de începere. Licențele aplicațiilor se cumpără separat din Odoo Apps Store.`,
    popular: "Cel mai cerut",
    faqTitle: "Întrebări",
    faq: [
      ["Cu ce ediții Odoo lucrați?", "Community și Enterprise, pe server propriu sau pe Odoo.sh, versiunile 16–20. Odoo Online (planul SaaS standard) nu permite module proprii, așa că integrările acolo cer Odoo.sh sau un server propriu."],
      ["Cât de repede răspundeți?", `În cel mult ${ODOO_REPLY_HOURS} ore lucrătoare și întotdeauna în cel mult o zi lucrătoare.`],
      ["Lucrați și în afara României?", "Da. Lucrăm de la distanță cu firme din toată UE și răspundem în română sau engleză."],
      ["Al cui este codul?", "Ce construim la comandă vă livrăm ca modul Odoo. Aplicațiile noastre publicate rămân sub licența lor din Odoo Apps Store."],
    ],
    contactTitle: "Contact",
    contactLead: "Spuneți-ne versiunea de Odoo și ce trebuie conectat. Primiți gratuit o ofertă scrisă, la preț fix.",
    email: "Email",
    phone: "Telefon",
    company: "Date de identificare",
    privacy: "Confidențialitate",
    terms: "Termeni",
  },
} as const;

const GROUP_ORDER: OdooAppGroup[] = ["shopify", "woocommerce", "reporting", "finance", "inventory", "pos", "access"];

export function OdooServicesPage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const apps = [...ODOO_APPS].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
  const h2 = "font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl";
  const body = "text-base leading-7 text-[#5B5D57]";
  const card = "rounded-lg border border-[#0D0F0E]/10 bg-white p-5";

  return (
    <div lang={locale} className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">{t.eyebrow}</p>
          <Link href={t.switchHref} hrefLang={locale === "en" ? "ro" : "en"} className="shrink-0 text-sm font-medium text-[#0D0F0E] underline underline-offset-2">
            {t.switchLabel}
          </Link>
        </div>
        <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0D0F0E] sm:text-5xl">{t.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5B5D57]">{t.lead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#contact" className="inline-flex min-h-12 items-center rounded-md bg-[#0D0F0E] px-5 text-sm font-semibold text-white">{t.ctaPrimary}</a>
          <a href="#apps" className="inline-flex min-h-12 items-center rounded-md border border-[#0D0F0E]/20 bg-white px-5 text-sm font-semibold text-[#0D0F0E]">{t.ctaSecondary}</a>
          <Link href="/odoo/demos" hrefLang="en" className="inline-flex min-h-12 items-center rounded-md border border-[#0D0F0E]/20 bg-white px-5 text-sm font-semibold text-[#0D0F0E]">{t.ctaDemos}</Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#0D0F0E]/10 bg-[#0D0F0E]/10 lg:grid-cols-4">
          {t.stats.map(([value, label]) => (
            <div key={label} className="bg-white px-5 py-4">
              <dt className="sr-only">{label}</dt>
              <dd className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#0D0F0E]">{value}</dd>
              <dd className="mt-1 text-xs leading-5 text-[#5B5D57]">{label}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className={h2}>{t.whoTitle}</h2>
            <p className={`mt-4 ${body}`}>{t.who}</p>
          </div>
          <div>
            <h2 className={h2}>{t.whyTitle}</h2>
            <ul className="mt-4 space-y-2">
              {t.why.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-[#2b2b28]">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#165DFC]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className={h2}>{t.whatTitle}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.what.map(([name, text]) => (
              <li key={name} className={card}>
                <h3 className="font-semibold text-[#0D0F0E]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="pricing" className="mt-16 scroll-mt-24">
          <h2 className={h2}>{t.pricingTitle}</h2>
          <p className={`mt-4 max-w-3xl ${body}`}>{t.pricingIntro}</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ODOO_PACKAGES.map((pkg) => {
              const text = pkg[locale];
              const featured = pkg.id === "setup";
              return (
                <li key={pkg.id} className={`relative flex flex-col rounded-lg border bg-white p-5 ${featured ? "border-[#165DFC] shadow-[0_6px_24px_rgba(22,93,252,0.12)]" : "border-[#0D0F0E]/10"}`}>
                  {featured ? <span className="absolute -top-3 left-5 rounded-full bg-[#165DFC] px-2.5 py-0.5 text-xs font-semibold text-white">{t.popular}</span> : null}
                  <h3 className="font-semibold text-[#0D0F0E]">{text.name}</h3>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#0D0F0E]">
                    {pkg.priceEur === 0 ? t.free : <>{pkg.from ? <span className="mr-1 align-middle text-sm font-normal text-[#5B5D57]">{t.from}</span> : null}€{pkg.priceEur}</>}
                    {pkg.monthly ? <span className="ml-1 text-sm font-normal text-[#5B5D57]">{t.perMonth}</span> : null}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{text.summary}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-[#0D0F0E]/10 pt-4">
                    {text.includes.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-5 text-[#2b2b28]">
                        <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#165DFC]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-sm leading-6 text-[#5B5D57]">{t.hourly}</p>
        </section>

        <section id="apps" className="mt-16 scroll-mt-24">
          <h2 className={h2}>{t.proofTitle}</h2>
          <p className={`mt-4 max-w-3xl ${body}`}>{t.proof}</p>
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
          <h2 className={h2}>{t.faqTitle}</h2>
          <div className="mt-6 divide-y divide-[#0D0F0E]/10 rounded-lg border border-[#0D0F0E]/10 bg-white">
            {t.faq.map(([q, a]) => (
              <details key={q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-[#0D0F0E] marker:hidden">
                  <span className="mr-2 inline-block text-[#165DFC] transition group-open:rotate-45">+</span>{q}
                </summary>
                <p className="mt-2 pl-5 text-sm leading-6 text-[#5B5D57]">{a}</p>
              </details>
            ))}
          </div>
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
                <Link href="/privacy#odoo" className="text-[#0D0F0E] underline underline-offset-2">{t.privacy}</Link>
                <Link href="/terms#odoo" className="text-[#0D0F0E] underline underline-offset-2">{t.terms}</Link>
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
