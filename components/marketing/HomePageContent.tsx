"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BadgeCheck, BookCheck, ShoppingBasket } from "lucide-react";
import { Faq, Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";
import { marketingCtaOnDark, marketingCtaSecondaryOnDark, marketingHeading, marketingHeroBg, marketingHeroRadial, marketingSubtext } from "@/lib/marketing/tokens";
import { pricingPlans } from "@/lib/billing/plans";
import { PRIMARY_INDUSTRY_NAV } from "@/lib/marketing/industry-verticals";

// Homepage teaser cards — Core and Operations only, matching /pricing's own
// lead plans (lib/billing/plans.ts is the single source of truth for names
// and prices; Multi-location isn't a standalone teaser price — it's a
// per-location add-on that requires a Scale base plan, so it links to
// /pricing instead of getting a fabricated headline number here).
const HOME_PLAN_IDS = ["starter", "pro"] as const;
const HOME_PLAN_SHORT_NAME: Record<string, string> = { starter: "Core", pro: "Operations" };
const HOME_PLAN_TEXT_RO: Record<string, string> = {
  starter: "POS, produse și raport Z prin FiscalNet.",
  pro: "Adaugă stoc, achiziții, rețete și marje.",
};
const HOME_PLAN_TEXT_EN: Record<string, string> = {
  starter: "POS, products, and Z report via FiscalNet.",
  pro: "Adds stock, purchasing, recipes, and margins.",
};

// Facts only — no fabricated stats (support-response SLA, "no contract"
// without checking, fake logos). "Fără contract pe termen fix" is checked
// against lib/billing/subscription.ts's cancel_at_period_end field before
// use — a real month-to-month subscription, not an invented claim.
const MARQUEE_FACTS_RO = ["BON FISCAL PRIN FISCALNET", "TVA PE PRODUS, NU PRESUPUSĂ", "RAPORT Z AUTOMAT", "CMP ȘI MARJĂ REALĂ", "STOC CU ALERTE", "CONFORM ANAF / E-FACTURA"];
const MARQUEE_FACTS_EN = ["FISCAL RECEIPT VIA FISCALNET", "PER-PRODUCT VAT, NOT GUESSED", "AUTOMATIC Z REPORT", "REAL WEIGHTED COST & MARGIN", "STOCK WITH ALERTS", "ANAF / E-FACTURA COMPLIANT"];

const RO_FAQ = [
  { question: "Pentru cine este franchisetech?", answer: "Pentru cafenele, restaurante mici, takeaway, brutării și patiserii cu 1–3 locații, care vor să înlocuiască Excel, WhatsApp și rapoartele dispersate." },
  { question: "Cum începe perioada de probă?", answer: "Trialul asistat durează 15 zile și începe după o verificare unică de 1 € prin Stripe. Cardul este salvat pentru conversie, iar verificarea nu este abonament." },
  { question: "Înlocuiește casa de marcat?", answer: "Nu. franchisetech lucrează cu FiscalNet configurat local și cu echipament fiscal compatibil. FiscalNet și hardware-ul se contractează separat." },
  { question: "Cum se stabilește TVA pe produs?", answer: "Fiecare produs are o cotă TVA setată explicit din catalogul de cote al contului (21% / 11% / 0%), configurabilă din Setări. Nu presupunem noi cota — o setați dumneavoastră sau contabilul, o dată, la fiecare produs." },
  { question: "Cât costă?", answer: "Starter costă 49 €/lună, Pro 79 €/lună, Scale 109 €/lună, iar Multi-locație 89 €/locație suplimentară/lună (necesită Scale)." },
] as const;

const EN_FAQ = [
  { question: "Who is franchisetech for?", answer: "Romanian cafés, small restaurants, takeaway, bakeries, and patisseries with 1–3 locations." },
  { question: "How does the trial start?", answer: "The assisted 15-day trial starts after a one-time €1 Stripe card verification. The verification is not a subscription." },
  { question: "Does it replace the fiscal register?", answer: "No. franchisetech works with locally configured FiscalNet and compatible fiscal hardware, contracted separately." },
  { question: "How is VAT set per product?", answer: "Each product has a VAT rate set explicitly from your account's rate catalogue (21% / 11% / 0%), configurable in Settings. We do not guess the rate — you or your accountant set it, once, per product." },
  { question: "How much does it cost?", answer: "Starter is €49/month, Pro €79/month, Scale €109/month, and Multi-location €89/additional location/month (requires Scale)." },
] as const;

export function HomePageContentTop() {
  const { locale } = useMarketingLocaleContext();
  const isRo = locale === "ro";
  const marqueeFacts = isRo ? MARQUEE_FACTS_RO : MARQUEE_FACTS_EN;

  useEffect(() => {
    captureClientEvent("landing_page_view", { locale, page: "homepage_single_truth" });
  }, [locale]);

  return (
    <section className={`relative overflow-hidden ${marketingHeroBg} ${marketingHeroRadial} px-4 pb-0 pt-16 sm:px-6 lg:px-8 lg:pt-24`}>
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <p className="inline-block rounded-full border border-[#5B9CFF]/35 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#5B9CFF]">{isRo ? "Pentru cafenele și restaurante mici din România" : "For Romanian cafés and small restaurants"}</p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAF8F4] sm:text-6xl">{isRo ? "Închideți ziua cu cifre care se leagă." : "Close the day with numbers that reconcile."}</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#FAF8F4]/72 sm:text-lg">{isRo ? "Bonuri fiscale prin FiscalNet, numerar, achiziții, costuri și stoc într-un singur registru operațional — nu în Excel, WhatsApp și casa de marcat separat." : "FiscalNet fiscal receipts, cash, purchasing, costs, and stock in one operational ledger — not spread across Excel, WhatsApp, and a separate till."}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup?plan=starter" className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-6 text-sm font-semibold ${marketingCtaOnDark}`} onClick={() => captureClientEvent("cta_clicked", { location: "homepage_hero", destination: "/signup?plan=starter" })}>
                {isRo ? "Începe trialul asistat" : "Start the assisted trial"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#adevar-unic" className={`inline-flex min-h-12 items-center justify-center rounded-[10px] px-6 text-sm font-semibold ${marketingCtaSecondaryOnDark}`}>{isRo ? "Vedeți cum se leagă datele" : "See how the data connects"}</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2 font-mono text-xs text-[#FAF8F4]/50">
              <span>{isRo ? "TRIAL ASISTAT, 15 ZILE" : "ASSISTED TRIAL, 15 DAYS"}</span>
              <span>{isRo ? "FĂRĂ CONTRACT PE TERMEN FIX" : "NO FIXED-TERM CONTRACT"}</span>
              <span>{isRo ? "CONFORM ANAF / FISCALNET" : "ANAF / FISCALNET COMPLIANT"}</span>
            </div>
          </div>
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/14 bg-white/[0.04]">
              <Image src="/showcase/reports-dashboard.png" alt={isRo ? "Panoul franchisetech — vânzări, numerar în casă și rapoarte" : "The franchisetech dashboard — sales, cash on hand, and reports"} width={2680} height={1470} sizes="(min-width: 1024px) 45vw, 100vw" className="h-auto w-full" priority />
            </div>
            <p className="mt-3 text-center text-xs text-[#FAF8F4]/45">{isRo ? "Panoul zilnic — chiar din franchisetech." : "The daily dashboard — straight from franchisetech."}</p>
          </div>
        </div>
        <div className="mt-14 overflow-hidden border-t border-white/12 py-6">
          <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-14 font-mono text-xs tracking-[0.08em] text-[#FAF8F4]/38">
            {[...marqueeFacts, ...marqueeFacts].map((fact, i) => (
              <span key={i}>{fact}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{"@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}"}</style>
    </section>
  );
}

export function HomePageContentBottom() {
  const { locale } = useMarketingLocaleContext();
  const isRo = locale === "ro";
  const products = [
    { tag: isRo ? "REGISTRU 01" : "LEDGER 01", icon: ShoppingBasket, title: isRo ? "Vânzare" : "Sales", text: isRo ? "Bon, plată și sertar dintr-o singură înregistrare, cu FiscalNet la fiecare vânzare." : "Receipt, payment, and drawer from one record, with FiscalNet on every sale." },
    { tag: isRo ? "REGISTRU 02" : "LEDGER 02", icon: BookCheck, title: isRo ? "Gestiune" : "Stock", text: isRo ? "CMP actualizat din NIR, rețete cu cost salvat la vânzare, marjă netă vizibilă." : "Weighted cost from goods receipts, recipes with cost captured at sale, visible net margin." },
    { tag: isRo ? "REGISTRU 03" : "LEDGER 03", icon: BadgeCheck, title: isRo ? "Conformitate" : "Compliance", text: isRo ? "Raport Z generat automat la închidere, cu TVA pe cotă și diferența de numerar." : "Z report generated automatically at close, with VAT by rate and the cash variance." },
  ];

  const benefits = [
    { n: "01", title: isRo ? "Nu afli la final de lună" : "Not a month-end surprise", text: isRo ? "Raportul Z arată vânzări nete, TVA pe cotă și numerar, generat la fiecare închidere." : "The Z report shows net sales, VAT by rate, and cash, generated at every close." },
    { n: "02", title: isRo ? "Preț fără cost nu e profit" : "Price without cost isn't profit", text: isRo ? "NIR-urile actualizează CMP; rețetele consumă costul salvat la momentul vânzării." : "Goods receipts update weighted cost; recipes consume the cost captured at sale time." },
    { n: "03", title: isRo ? "Stoc care avertizează" : "Stock that warns you", text: isRo ? "Prag de reaprovizionare și diferențe de registru apar ca excepții, nu surprize." : "Reorder thresholds and ledger variances appear as exceptions, not surprises." },
    { n: "04", title: isRo ? "TVA pe produs, nu presupusă" : "Per-product VAT, not guessed", text: isRo ? "Fiecare produs are o cotă setată explicit — 21%, 11% sau 0% — nu o presupunem noi." : "Each product has an explicit rate — 21%, 11%, or 0% — we never guess it." },
    { n: "05", title: isRo ? "O singură sursă de adevăr" : "One source of truth", text: isRo ? "Panoul, raportul Z și rapoartele de stoc citesc din aceleași date de vânzare." : "The dashboard, Z report, and stock reports read from the same sale data." },
    { n: "06", title: isRo ? "Pornești cu datele tale" : "Start with your data", text: isRo ? "Produse, TVA, casă și stoc verificate înainte de prima zi live — nu un demo gol." : "Products, VAT, till, and stock verified before the first live day — not an empty demo." },
  ];

  const integrations = [
    { name: "FiscalNet", kind: isRo ? "Bon fiscal, configurat local" : "Fiscal receipt, configured locally" },
    { name: "ANAF", kind: isRo ? "Evidențe pregătite pentru control" : "Records ready for inspection" },
    { name: "e-Factura", kind: isRo ? "Facturare conformă" : "Compliant invoicing" },
  ];

  return (
    <>
      {/* "Pentru cine" — real industry pages, not filler pills */}
      <Section>
        <p className={`mb-5 ${marketingHeading} !text-xl !leading-none sm:!text-xl`}>{isRo ? "Construit pentru domeniul tău" : "Built for your business"}</p>
        <div className="flex flex-wrap gap-2.5">
          {PRIMARY_INDUSTRY_NAV.map((item) => (
            <Link key={item.slug} href={item.path} className="rounded-full border border-[#DFDCD2] bg-white px-4 py-2.5 text-sm font-medium text-[#0D0F0E] transition hover:border-[#0D0F0E]">
              {isRo ? item.labelRo : item.labelEn}
            </Link>
          ))}
        </div>
      </Section>

      {/* Three ledger modules */}
      <Section id="produse">
        <div className="grid gap-8 lg:grid-cols-3">
          {products.map(({ tag, icon: Icon, title, text }) => (
            <div key={tag} className="overflow-hidden rounded-2xl border border-[#DFDCD2] bg-white">
              <div className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F3F0E8] text-[#165DFC]"><Icon className="h-5 w-5" aria-hidden /></span>
                <span className="mt-5 block font-mono text-xs tracking-[0.1em] text-[#165DFC]">{tag}</span>
                <h3 className="mt-2 text-xl font-semibold text-[#0D0F0E]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5B5D57]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Dark benefits band */}
      <Section id="adevar-unic" tone="navy">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>{isRo ? "O singură sursă" : "One source"}</SectionLabel>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#FAF8F4] sm:text-4xl">{isRo ? "Un registru, nu cinci fișiere Excel." : "One ledger, not five spreadsheets."}</h2>
          </div>
          <Link href="/signup?plan=starter" className={`inline-flex min-h-12 flex-none items-center justify-center gap-2 rounded-[10px] px-6 text-sm font-semibold ${marketingCtaOnDark}`}>
            {isRo ? "Începe trialul asistat" : "Start the assisted trial"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/14 bg-white/14 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.n} className="bg-[#0D0F0E] p-6">
              <span className="font-mono text-xs text-[#5B9CFF]">{b.n}</span>
              <h3 className="mt-3 text-[1.05rem] font-semibold leading-snug tracking-tight text-[#FAF8F4]">{b.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#FAF8F4]/64">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials — clearly marked placeholder, no fabricated quotes. The
          testimonials table has zero published rows today; real quotes replace
          this the moment any exist. */}
      <Section>
        <SectionLabel>{isRo ? "Povești de succes" : "Success stories"}</SectionLabel>
        <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "În curs de colectare." : "Being collected."}</h2>
        <p className={`mt-3 max-w-xl ${marketingSubtext}`}>{isRo ? "Acest spațiu se completează cu testimoniale reale, verificate — nu cu exemple inventate." : "This space fills in with real, verified testimonials — not invented examples."}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-dashed border-[#DFDCD2] p-6">
              <div className="h-10 w-10 rounded-[10px] bg-[#F3F0E8]" />
              <p className="mt-4 text-[#8F8F86]">{isRo ? "Testimonial real în curs de colectare." : "Real testimonial being collected."}</p>
              <p className="mt-3 text-xs text-[#8F8F86]">{isRo ? "— loc rezervat pentru un client real" : "— reserved for a real customer"}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Compliance connections — only verifiably real, customer-facing ones */}
      <Section id="conformitate" tone="slate">
        <div className="text-center">
          <SectionLabel>{isRo ? "Conformitate" : "Compliance"}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Conectat direct la infrastructura fiscală românească." : "Connected directly to Romanian fiscal infrastructure."}</h2>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {integrations.map((it) => (
            <div key={it.name} className="flex items-center gap-3 rounded-2xl border border-[#DFDCD2] bg-white px-5 py-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[9px] bg-[#F3F0E8] text-[#165DFC]"><BadgeCheck className="h-4.5 w-4.5" aria-hidden /></span>
              <div>
                <div className="text-sm font-semibold text-[#0D0F0E]">{it.name}</div>
                <div className="text-xs text-[#8F8F86]">{it.kind}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Hardware — compatibility, not a shop. franchisetech doesn't sell
          hardware (pricing FAQ: "hardware-ul... se plătesc separat") — this
          states what's required and that it's BYO/third-party, not a
          fabricated product catalog. */}
      <Section id="hardware">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionLabel>Hardware</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Compatibil cu dispozitivele pe care le ai deja." : "Compatible with the devices you already have."}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{isRo ? "Ai nevoie de un dispozitiv cu ecran și o casă de marcat fiscală compatibilă. Restul se conectează prin rețeaua locală — fără server local, fără cabluri suplimentare." : "You need a screen device and a compatible fiscal cash register. Everything else connects over your local network — no local server, no extra cabling."}</p>
            <p className="mt-4 text-xs text-[#8F8F86]">{isRo ? "Hardware-ul se contractează separat, de la furnizorul tău — franchisetech nu vinde echipamente." : "Hardware is contracted separately, from your own supplier — franchisetech doesn't sell equipment."}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#DFDCD2] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#0D0F0E]">{isRo ? "Dispozitiv de vânzare" : "Sale device"}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{isRo ? "Funcționează pe Android și iOS din browser — nimic de instalat din magazin de aplicații." : "Works on Android and iOS from the browser — nothing to install from an app store."}</p>
            </div>
            <div className="rounded-2xl border border-[#DFDCD2] bg-white p-5">
              <h3 className="text-sm font-semibold text-[#0D0F0E]">{isRo ? "Casă de marcat" : "Fiscal register"}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{isRo ? "Compatibilă FiscalNet, configurată local de furnizorul tău." : "FiscalNet-compatible, configured locally by your own supplier."}</p>
            </div>
            <div className="rounded-2xl border border-[#DFDCD2] bg-white p-5 sm:col-span-2">
              <h3 className="text-sm font-semibold text-[#0D0F0E]">{isRo ? "Fără server local" : "No local server"}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5B5D57]">{isRo ? "Datele sunt în cloud — nimic de întreținut în locație." : "Data lives in the cloud — nothing to maintain on site."}</p>
            </div>
          </div>
        </div>

        {/* Real brands FiscalNet itself lists as supported (driverfiscal.ro/echipamente-implementate/,
            checked 2026-09-06) — names only, not logos: we don't have licensed
            logo assets for third-party hardware brands to host here. */}
        <div className="mt-10 border-t border-[#DFDCD2] pt-8">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#8F8F86]">{isRo ? "Case de marcat și imprimante fiscale compatibile prin FiscalNet" : "Fiscal registers and printers compatible via FiscalNet"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Datecs", "Daisy", "Custom", "Orgtech", "Partner", "Posiflex", "Sam4S", "Tremol", "Incotex"].map((brand) => (
              <span key={brand} className="rounded-full border border-[#DFDCD2] bg-white px-3.5 py-1.5 text-sm font-medium text-[#0D0F0E]">{brand}</span>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#8F8F86]">{isRo ? "Lista completă de modele pe driverfiscal.ro. Verificați compatibilitatea exactă a modelului dumneavoastră cu furnizorul de hardware fiscal înainte de cumpărare." : "Full model list at driverfiscal.ro. Confirm your exact model's compatibility with your fiscal hardware supplier before buying."}</p>
        </div>
      </Section>

      <Section id="preturi">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>{isRo ? "Prețuri" : "Pricing"}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Alegeți după operațiunile pe care trebuie să le controlați." : "Choose based on the operations you need to control."}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {HOME_PLAN_IDS.map((id) => {
              const p = pricingPlans.find((plan) => plan.id === id)!;
              const price = Math.round(p.amountCents / 100);
              return (
                <div key={id} className={`rounded-2xl border p-6 ${id === "pro" ? "border-2 border-[#165DFC]" : "border-[#DFDCD2]"} bg-white`}>
                  <h3 className="font-semibold text-[#0D0F0E]">{HOME_PLAN_SHORT_NAME[id]}</h3>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#0D0F0E]">{price} €<span className="font-sans text-sm font-normal text-[#8F8F86]">/{isRo ? "lună" : "month"}</span></p>
                  <p className="mt-3 text-sm leading-6 text-[#5B5D57]">{isRo ? HOME_PLAN_TEXT_RO[id] : HOME_PLAN_TEXT_EN[id]}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-[#5B5D57]">
            {isRo ? "Rulați pe două sau mai multe locații? " : "Running two or more locations? "}
            <Link href="/pricing" className="font-medium text-[#165DFC] hover:underline">{isRo ? "Vedeți Scale și Multi-locație →" : "See Scale and Multi-location →"}</Link>
          </p>
          <p className="mt-4 text-xs text-[#8F8F86]">{isRo ? "Prețurile sunt fără TVA. FiscalNet, hardware-ul și serviciile terțe se plătesc separat." : "Prices exclude VAT. FiscalNet, hardware, and third-party services are separate."}</p>
        </div>
      </Section>

      <Section tone="slate">
        <div className="max-w-xl"><SectionLabel>{isRo ? "Întrebări directe" : "Direct questions"}</SectionLabel><h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Ce trebuie clarificat înainte să începi" : "What to clarify before starting"}</h2></div>
        <div className="mt-8 max-w-5xl"><Faq items={isRo ? RO_FAQ : EN_FAQ} layout="grid-2" /></div>
      </Section>

      <Section id="incepe" tone="navy">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="font-mono text-xs uppercase text-[#FAF8F4]/60">{isRo ? "Următorul pas" : "Next step"}</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#FAF8F4] sm:text-4xl">{isRo ? "Pornești cu datele tale, nu cu un demo gol." : "Start with your data, not an empty demo."}</h2><p className="mt-3 max-w-xl text-base text-[#FAF8F4]/70">{isRo ? "Verificăm produsele, TVA-ul, casa și stocul înainte de prima zi live." : "We verify products, VAT, till, and stock before the first live day."}</p></div>
          <Link href="/signup?plan=starter" className={`inline-flex min-h-12 flex-none items-center justify-center gap-2 rounded-[10px] px-6 text-sm font-semibold ${marketingCtaOnDark}`}>{isRo ? "Începe trialul asistat" : "Start the assisted trial"} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </Section>
    </>
  );
}
