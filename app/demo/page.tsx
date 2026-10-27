import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check } from "lucide-react";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { DemoRequestForm } from "@/components/marketing/DemoRequestForm";
import { JsonLd } from "@/components/marketing/JsonLd";
import { pricingPlans } from "@/lib/billing/plans";
import { TRIAL_DAYS } from "@/lib/billing/trial";
import { SITE_URL } from "@/lib/marketing/seo";

const TITLE = "Demonstrație gratuită pentru cafenele și restaurante";
const DESCRIPTION =
  "Vezi cum funcționează FranchiseTech în cafeneaua ta: vânzare, bon fiscal prin casa de marcat, stoc scăzut din rețete, NIR și raportul zilei. Solicită o demonstrație gratuită.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/demo` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/demo`, type: "website", images: ["/marketing/live/dashboard.png"] },
};

const pro = pricingPlans.find((p) => p.id === "growth");
const multi = pricingPlans.find((p) => p.id === "team");

/**
 * Every step is something the product does today. Media is real: the recorded
 * sale and the in-store clip, plus screenshots from a working account. Steps
 * without a clean screenshot say so in text rather than showing a mock.
 */
const steps: Array<{ title: string; text: string; image?: { src: string; alt: string } }> = [
  {
    title: "1. Comanda și plata",
    text: "Casierul apasă produsele, vede bonul curent și încasează numerar, card sau plată împărțită. Clipul de mai sus arată o vânzare reală, de la produs la plată.",
  },
  {
    title: "2. Bonul fiscal, prin casa de marcat",
    text: "FranchiseTech trimite produsele, TVA-ul și metoda de plată către casa de marcat certificată, prin driverul fiscal instalat pe calculatorul de la casă. Bonul (inclusiv codul QR, acolo unde e cerut) îl emite casa de marcat. Tu vezi pe panou dacă un bon a rămas netrimis.",
    image: { src: "/marketing/live/dashboard.png", alt: "Panoul zilei în FranchiseTech: vânzări, încasări pe metode de plată și alertă pentru un bon fiscal netrimis" },
  },
  {
    title: "3. Stocul scade din rețete",
    text: "Fiecare vânzare scade automat ingredientele din rețetă: cafeaua, laptele, paharul. Vezi ce e sub minim înainte să rămâi fără.",
    image: { src: "/marketing/live/stock.png", alt: "Lista de stoc în FranchiseTech, cu stoc minim, status și butonul Recepție marfă" },
  },
  {
    title: "4. Costul real al fiecărei rețete",
    text: "Costul pe porție se calculează din prețurile de achiziție ale ingredientelor, iar marja se vede lângă prețul de vânzare. În demonstrație îți arătăm calculul pe o rețetă din meniul tău.",
  },
  {
    title: "5. NIR și achiziții",
    text: "Marfa primită de la furnizor se înregistrează ca recepție, cu număr NIR, și intră direct în stoc. Exportul pentru contabil pleacă din aceleași date, fără retastare.",
  },
  {
    title: "6. Raportul zilei",
    text: "La închidere vezi vânzările, încasările pe numerar și card, numerarul așteptat și diferența față de ce ai numărat. Rapoartele de stoc, achiziții și marje sunt în același loc.",
    image: { src: "/marketing/live/reports.png", alt: "Rapoartele FranchiseTech: vânzări, închidere casă, stoc, achiziții și marje" },
  },
];

const faqs: Array<[string, string]> = [
  [
    "De ce echipamente am nevoie?",
    "Un calculator sau o tabletă cu browser pentru POS. Pentru bonuri fiscale ai nevoie de o casă de marcat sau o imprimantă fiscală certificată, compatibilă cu driverul fiscal (de exemplu Datecs DP25, DP150 sau FP700), și de driverul instalat pe calculatorul de la casă. Confirmă modelul exact și firmware-ul cu furnizorul tău; în demonstrație verificăm împreună configurația ta.",
  ],
  [
    "FranchiseTech emite bonul fiscal sau codul QR?",
    "Nu. Bonul fiscal și codul QR sunt emise de casa de marcat certificată. FranchiseTech trimite datele vânzării către ea prin driverul fiscal și îți arată dacă bonul a fost emis sau a eșuat. Sertarul de bani se deschide de la casa de marcat, ca până acum.",
  ],
  [
    "Cum decurge configurarea?",
    "Configurarea e ghidată în aplicație: adaugi produsele din ce ai acum (Excel sau alt POS), metodele de plată și rețetele, apoi deschizi casa. Dacă vrei, în demonstrație pornim de la meniul tău.",
  ],
  [
    "Cât costă?",
    `Pro costă ${pro?.price ?? "€49"} pe locație pe lună (${pro?.annualPrice ?? "€39"}/lună la plata anuală), fără TVA. Multi costă ${multi?.price ?? "€79"} pe locație pe lună (${multi?.annualPrice ?? "€63"}/lună anual) plus €29 pentru fiecare locație suplimentară. Driverul fiscal și echipamentele se plătesc separat. Fără contract pe termen lung.`,
  ],
  [
    "Există o perioadă de probă?",
    `Da: ${TRIAL_DAYS} zile cu toate funcțiile Pro, fără card. După aceea poți vinde și emite bonuri fiscale în continuare; stocul, rețetele, rapoartele contabile și produsele noi necesită abonament.`,
  ],
  [
    "Ce se întâmplă după ce trimit formularul?",
    "Te contactăm în maximum o zi lucrătoare ca să stabilim o oră pentru demonstrație, online. Nu e nicio obligație de cumpărare.",
  ],
];

export default function DemoPage() {
  return (
    <ClaudeMarketingShellAuth>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Demonstrație", item: `${SITE_URL}/demo` },
          ],
        }}
      />

      <main>
        {/* Hero */}
        <section className="px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">Demonstrație gratuită</p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[#0D0F0E] sm:text-5xl">
                Vezi cum funcționează FranchiseTech în cafeneaua ta
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#5B5D57]">
                Gestionează vânzările, stocurile, rețetele și costurile într-un singur sistem POS.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#formular" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0D0F0E] px-6 text-base font-semibold text-white hover:bg-[#165DFC]">
                  Solicită o demonstrație gratuită <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <Link href="/signup?plan=growth" className="inline-flex h-12 items-center justify-center rounded-md border border-[#D9D8D0] bg-white px-6 text-base font-medium text-[#0D0F0E] hover:border-[#165DFC]">
                  Sau încearcă {TRIAL_DAYS} zile, fără card
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#E7E6DF] bg-black shadow-sm">
              <video controls playsInline preload="metadata" poster="/marketing/live/dashboard.png" className="aspect-video w-full" aria-label="Demonstrație înregistrată: o vânzare în FranchiseTech">
                <source src="/showcase/product-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-y border-[#E7E6DF] bg-[#F7F6F1] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl">Pentru cine este</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Cafenele și baruri", "Care vor să știe cât costă fiecare cafea și cât lapte, cafea și pahare mai au, fără Excel."],
                ["Restaurante și takeaway", "Care vând din rețete, primesc marfă de la mai mulți furnizori și vor raportul zilei într-un singur loc."],
                ["Afaceri cu 1–3 locații", "Care vor aceeași evidență în fiecare locație și o imagine comună a vânzărilor și stocului."],
              ].map(([title, text]) => (
                <li key={title} className="rounded-xl border border-[#E7E6DF] bg-white p-5">
                  <h3 className="font-semibold text-[#0D0F0E]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Workflow */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl">O zi într-o cafenea, în FranchiseTech</h2>
            <p className="mt-3 max-w-2xl text-[#5B5D57]">Ecranele de mai jos sunt din aplicație, nu machete. În demonstrație parcurgem același traseu cu produsele tale.</p>
            <div className="mt-8 space-y-10">
              {steps.map((step) => (
                <article key={step.title} className={step.image ? "grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center" : "max-w-3xl"}>
                  <div>
                    <h3 className="text-lg font-semibold text-[#0D0F0E]">{step.title}</h3>
                    <p className="mt-2 leading-7 text-[#5B5D57]">{step.text}</p>
                  </div>
                  {step.image ? (
                    <Image src={step.image.src} alt={step.image.alt} width={1440} height={900} sizes="(min-width: 1024px) 680px, 100vw" className="rounded-xl border border-[#E7E6DF] shadow-sm" />
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Customer proof */}
        <section className="bg-[#0D0F0E] px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9DB8FF]">Folosit într-un local real</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">Dolce Nera, Cluj-Napoca</h2>
              <p className="mt-3 leading-7 text-white/80">
                O cafenea cu o casă, 238 de produse și 115 rețete întreținute zilnic în FranchiseTech. Clipul arată platforma la punctul de vânzare, în timpul programului.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div><dt className="text-sm text-white/60">bonuri procesate</dt><dd className="text-2xl font-semibold">3.800+</dd></div>
                <div><dt className="text-sm text-white/60">mișcări de stoc urmărite</dt><dd className="text-2xl font-semibold">9.500+</dd></div>
              </dl>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <video controls playsInline preload="metadata" poster="/marketing/product-proof/pos-in-cafe-poster.jpg" className="aspect-video w-full" aria-label="FranchiseTech folosit la Dolce Nera">
                <source src="/marketing/product-proof/pos-in-cafe.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl">Preț clar, fără surprize</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border-2 border-[#0D0F0E] p-6">
                <h3 className="text-lg font-semibold">Pro · o locație</h3>
                <p className="mt-2 text-3xl font-semibold">{pro?.price ?? "€49"}<span className="text-base font-normal text-[#5B5D57]"> / locație / lună</span></p>
                <p className="text-sm text-[#5B5D57]">sau {pro?.annualPrice ?? "€39"}/lună la plata anuală</p>
                <ul className="mt-4 space-y-2 text-sm text-[#3B3D38]">
                  {["POS și produse nelimitate", "Stoc, NIR și achiziții", "Rețete cu cost și marjă", "Export pentru contabil"].map((item) => (
                    <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#165DFC]" aria-hidden />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[#E7E6DF] p-6">
                <h3 className="text-lg font-semibold">Multi · mai multe locații</h3>
                <p className="mt-2 text-3xl font-semibold">{multi?.price ?? "€79"}<span className="text-base font-normal text-[#5B5D57]"> / locație / lună</span></p>
                <p className="text-sm text-[#5B5D57]">sau {multi?.annualPrice ?? "€63"}/lună anual, + €29 pentru fiecare locație suplimentară</p>
                <ul className="mt-4 space-y-2 text-sm text-[#3B3D38]">
                  {["Tot ce include Pro", "Raportare centrală", "Comutare între locații", "Suport prioritar"].map((item) => (
                    <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#165DFC]" aria-hidden />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm text-[#5B5D57]">
              Prețurile nu includ TVA. Driverul fiscal și echipamentele se plătesc separat. {TRIAL_DAYS} zile de probă Pro, fără card.{" "}
              <Link href="/pricing" className="font-medium text-[#165DFC] underline">Vezi toate detaliile de preț</Link>
            </p>
          </div>
        </section>

        {/* FAQ + form */}
        <section id="formular" className="scroll-mt-20 border-t border-[#E7E6DF] bg-[#F7F6F1] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl">Întrebări frecvente</h2>
              <div className="mt-6 divide-y divide-[#E7E6DF] rounded-xl border border-[#E7E6DF] bg-white">
                {faqs.map(([q, a]) => (
                  <details key={q} className="group p-4">
                    <summary className="cursor-pointer list-none font-medium text-[#0D0F0E] marker:hidden">{q}</summary>
                    <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl">Solicită o demonstrație gratuită</h2>
              <p className="mt-2 mb-6 text-[#5B5D57]">Spune-ne câteva lucruri despre afacere și te contactăm ca să stabilim o oră.</p>
              <Suspense fallback={null}>
                <DemoRequestForm />
              </Suspense>
              <p className="mt-4 text-xs leading-5 text-[#8F8F86]">
                Folosim datele din formular doar ca să te contactăm despre demonstrație. Le păstrăm cel mult 24 de luni dacă nu devii client și nu le trimitem în scopuri de marketing către terți.
                Poți cere oricând ștergerea lor la info@franchisetech.ro.
              </p>
            </div>
          </div>
        </section>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
