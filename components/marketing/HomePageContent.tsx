"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BellRing, BookCheck, Check, ShoppingBasket } from "lucide-react";
import { Faq, Section, SectionLabel } from "@/components/marketing/MarketingShell.primitives";
import { OwnerDashboardProof, OwnerRecipeProof, OwnerStockProof, OwnerZReportProof } from "@/components/marketing/OwnerProofScreens";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";
import { marketingCtaPrimary, marketingHeading, marketingSubtext } from "@/lib/marketing/tokens";
import { pricingPlans } from "@/lib/billing/plans";

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

const RO_FAQ = [
  { question: "Pentru cine este franchisetech?", answer: "Pentru cafenele, restaurante mici, takeaway, brutării și patiserii cu 1–3 locații, care vor să înlocuiască Excel, WhatsApp și rapoartele dispersate." },
  { question: "Cum începe perioada de probă?", answer: "Trialul asistat durează 15 zile și începe după o verificare unică de 1 € prin Stripe. Cardul este salvat pentru conversie, iar verificarea nu este abonament." },
  { question: "Înlocuiește casa de marcat?", answer: "Nu. franchisetech lucrează cu FiscalNet configurat local și cu echipament fiscal compatibil. FiscalNet și hardware-ul se contractează separat." },
  { question: "Cum se stabilește TVA pe produs?", answer: "Fiecare produs are o cotă TVA setată explicit din catalogul de cote al contului (21% / 11% / 0%), configurabilă din Setări. Nu presupunem noi cota — o setați dumneavoastră sau contabilul, o dată, la fiecare produs." },
  { question: "Cât costă?", answer: "Starter costă 49 €/lună, Pro 79 €/lună, iar multi-locație 99 €/locație/lună. Configurarea asistată extinsă costă 199 € o singură dată." },
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

  useEffect(() => {
    captureClientEvent("landing_page_view", { locale, page: "homepage_single_truth" });
  }, [locale]);

  return (
    <section className="overflow-hidden border-b border-[#DDE3EB] bg-[#EDF2F7]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p className="font-mono text-xs font-semibold uppercase text-[#0B47CC]">{isRo ? "Pentru cafenele și restaurante mici din România" : "For Romanian cafés and small restaurants"}</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-[-0.02em] text-[#0B1020] sm:text-6xl">{isRo ? "franchisetech: închideți ziua cu cifre care se leagă." : "franchisetech: close the day with numbers that reconcile."}</h1>
          <p className={`mt-6 max-w-xl ${marketingSubtext}`}>{isRo ? "Bonuri fiscale prin FiscalNet, numerar, achiziții, costuri și stoc într-un singur registru operațional — nu în Excel, WhatsApp și casa de marcat separat." : "FiscalNet fiscal receipts, cash, purchasing, costs, and stock in one operational ledger — not spread across Excel, WhatsApp, and a separate till."}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/signup?plan=starter" className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-6 text-sm font-semibold text-white ${marketingCtaPrimary}`} onClick={() => captureClientEvent("cta_clicked", { location: "homepage_hero", destination: "/signup?plan=starter" })}>
              {isRo ? "Începe trialul asistat" : "Start the assisted trial"} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#adevar-unic" className="inline-flex min-h-12 items-center justify-center text-sm font-semibold text-[#0B1020]">{isRo ? "Vedeți cum se leagă datele" : "See how the data connects"}</Link>
          </div>
        </div>
        <div>
          <div className="overflow-hidden rounded-2xl border border-[#DDE3EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <Image src="/showcase/reports-dashboard.png" alt={isRo ? "Panoul franchisetech — vânzări, numerar în casă și rapoarte" : "The franchisetech dashboard — sales, cash on hand, and reports"} width={2680} height={1470} sizes="(min-width: 1024px) 45vw, 100vw" className="h-auto w-full" priority />
          </div>
          <p className="mt-3 text-center text-xs text-[#8A94A6]">{isRo ? "Panoul zilnic — chiar din franchisetech." : "The daily dashboard — straight from franchisetech."}</p>
        </div>
      </div>
    </section>
  );
}

export function HomePageContentBottom() {
  const { locale } = useMarketingLocaleContext();
  const isRo = locale === "ro";
  const priorities = [
    { icon: BookCheck, number: "01", title: isRo ? "Conformitate înainte de orice" : "Compliance before everything", text: isRo ? "TVA pe produs, bon fiscal prin FiscalNet, numerar și raport Z urmărite până la închiderea zilei." : "Per-product VAT, FiscalNet fiscal receipts, cash, and Z report tracked through daily close." },
    { icon: ShoppingBasket, number: "02", title: isRo ? "Vânzări și achiziții exacte" : "Accurate sales and purchasing", text: isRo ? "Preț de vânzare, cost de achiziție, CMP și marjă netă din aceleași documente." : "Sale price, purchase cost, weighted cost, and net margin from the same documents." },
    { icon: BellRing, number: "03", title: isRo ? "Stoc care vă avertizează" : "Stock that warns you", text: isRo ? "Nivel curent, prag de reaprovizionare, diferențe și produse supra-cumpărate." : "Current level, reorder threshold, variances, and over-purchased products." },
  ];

  return (
    <>
      <Section id="prioritati">
        <div className="grid gap-8 lg:grid-cols-3">
          {priorities.map(({ icon: Icon, number, title, text }) => (
            <div key={number} className="border-t-2 border-[#0B1020] pt-5">
              <div className="flex items-center justify-between"><Icon className="h-5 w-5 text-[#165DFC]" aria-hidden /><span className="font-mono text-xs text-[#8A94A6]">{number}</span></div>
              <h2 className="mt-5 text-xl font-semibold text-[#0B1020]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#596579]">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="adevar-unic" tone="slate">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionLabel>{isRo ? "O singură sursă" : "One source"}</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Un registru, nu cinci fișiere Excel." : "One ledger, not five spreadsheets."}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{isRo ? "O vânzare înregistrează bonul, plata, mișcarea de stoc și consumul din rețetă. Panoul, raportul Z și rapoartele de stoc citesc din aceleași date." : "A sale records the receipt, payment, stock movement, and recipe consumption. The dashboard, Z report, and stock reports read from the same data."}</p>
            <div className="mt-6 space-y-3 text-sm text-[#3A4459]">
              {["Bon și linii", "Plată și sertar", "Stoc și CMP", "TVA și audit"].map((label) => <div key={label} className="flex items-center gap-3 border-b border-[#DDE3EB] pb-3"><Check className="h-4 w-4 text-[#00752C]" />{label}</div>)}
            </div>
          </div>
          <OwnerDashboardProof />
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <OwnerZReportProof />
          <div>
            <SectionLabel>{isRo ? "Conformitate zilnică" : "Daily compliance"}</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Nu afli la finalul lunii că ziua nu s-a închis corect." : "Do not discover at month-end that the day did not close correctly."}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{isRo ? "Raportul Z arată vânzările nete, TVA-ul pe cotă, metodele de plată și mișcările de numerar din zi, generat automat la fiecare închidere." : "The Z report shows net sales, VAT by rate, payment methods, and the day's cash movements, generated automatically at every close."}</p>
          </div>
        </div>
      </Section>

      <Section tone="slate">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>{isRo ? "Cost și marjă" : "Cost and margin"}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Prețul de vânzare fără cost nu este profit." : "A sale price without cost is not profit."}</h2>
          <p className={`mt-4 ${marketingSubtext}`}>{isRo ? "NIR-urile actualizează CMP. Rețetele consumă costul salvat la momentul vânzării. Marja pornește de la netul fără TVA." : "Goods receipts update weighted cost. Recipes consume the cost captured at sale time. Margin starts from net revenue before VAT."}</p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl"><OwnerRecipeProof /></div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionLabel>{isRo ? "Stoc și alerte" : "Stock and alerts"}</SectionLabel>
            <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Vedeți lipsa, surplusul și diferența de registru." : "See shortages, surplus, and ledger variance."}</h2>
            <p className={`mt-4 ${marketingSubtext}`}>{isRo ? "Pragurile de reaprovizionare și diferențele dintre registru și stocul înregistrat apar ca excepții de rezolvat, nu ca surprize." : "Reorder thresholds and differences between ledger and recorded stock appear as exceptions to resolve, not surprises."}</p>
          </div>
          <OwnerStockProof />
        </div>
      </Section>

      <Section id="preturi" tone="slate">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>{isRo ? "Prețuri" : "Pricing"}</SectionLabel>
          <h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Alegeți după operațiunile pe care trebuie să le controlați." : "Choose based on the operations you need to control."}</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {HOME_PLAN_IDS.map((id) => {
              const p = pricingPlans.find((plan) => plan.id === id)!;
              const price = Math.round(p.amountCents / 100);
              return (
                <div key={id} className="border-t border-[#0B1020] pt-5">
                  <h3 className="font-semibold text-[#0B1020]">{HOME_PLAN_SHORT_NAME[id]}</h3>
                  <p className="mt-2 font-mono text-3xl font-semibold text-[#0B1020]">{price} €<span className="font-sans text-sm font-normal text-[#8A94A6]">/{isRo ? "lună" : "month"}</span></p>
                  <p className="mt-3 text-sm leading-6 text-[#596579]">{isRo ? HOME_PLAN_TEXT_RO[id] : HOME_PLAN_TEXT_EN[id]}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-[#3A4459]">
            {isRo ? "Rulați pe două sau mai multe locații? " : "Running two or more locations? "}
            <Link href="/pricing" className="font-medium text-[#165DFC] hover:underline">{isRo ? "Vedeți Scale și Multi-locație →" : "See Scale and Multi-location →"}</Link>
          </p>
          <p className="mt-4 text-xs text-[#6B7688]">{isRo ? "Prețurile sunt fără TVA. FiscalNet, hardware-ul și serviciile terțe se plătesc separat." : "Prices exclude VAT. FiscalNet, hardware, and third-party services are separate."}</p>
        </div>
      </Section>

      <Section>
        <div className="max-w-xl"><SectionLabel>{isRo ? "Întrebări directe" : "Direct questions"}</SectionLabel><h2 className={`mt-3 ${marketingHeading}`}>{isRo ? "Ce trebuie clarificat înainte să începi" : "What to clarify before starting"}</h2></div>
        <div className="mt-8 max-w-5xl"><Faq items={isRo ? RO_FAQ : EN_FAQ} layout="grid-2" /></div>
      </Section>

      <Section id="incepe" tone="navy">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="font-mono text-xs uppercase text-white/60">{isRo ? "Următorul pas" : "Next step"}</p><h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{isRo ? "Pornești cu datele tale, nu cu un demo gol." : "Start with your data, not an empty demo."}</h2><p className="mt-3 max-w-xl text-base text-white/70">{isRo ? "Verificăm produsele, TVA-ul, casa și stocul înainte de prima zi live." : "We verify products, VAT, till, and stock before the first live day."}</p></div>
          <Link href="/signup?plan=starter" className="inline-flex min-h-12 flex-none items-center justify-center gap-2 rounded-[10px] bg-white px-6 text-sm font-semibold text-[#0B1020]">{isRo ? "Începe trialul asistat" : "Start the assisted trial"} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </Section>
    </>
  );
}
