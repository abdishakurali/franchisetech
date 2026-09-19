"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { pricingPlans } from "@/lib/billing/plans";
import { getHomepageContent } from "@/lib/marketing/homepage-content";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";

function TrialLink({ location, className = "" }: { location: string; className?: string }) {
  const { locale } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);
  return (
    <Link href="/signup?plan=starter" className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brass px-6 text-sm font-semibold text-ink transition hover:bg-brass/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass ${className}`} onClick={() => captureClientEvent("cta_clicked", { location, destination: "/signup?plan=starter" })}>
      {c.trial}<ArrowRight size={17} aria-hidden />
    </Link>
  );
}

export function HomePageContentTop() {
  const { locale } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);
  useEffect(() => { captureClientEvent("landing_page_view", { locale, page: "homepage_claude_design" }); }, [locale]);
  return (
    <>
      <section className="overflow-hidden bg-ink px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brass">{c.eyebrow}</p>
            <h1 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-[4rem]">{c.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">{c.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><TrialLink location="homepage_hero" /><a href="#ce-face" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-card/10">{c.watch}</a></div>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/60"><Check size={15} aria-hidden />{c.trialNote}</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-12 rounded-full bg-brass/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border border-white/15 bg-card shadow-2xl"><Image src="/showcase/pos-cart.png" alt="Ecranul de vânzare FranchiseTech" width={1600} height={1000} priority className="h-auto w-full" /></div>
            <p className="mt-3 text-center text-xs text-white/45">{locale === "ro" ? "Ecranul de vânzare, din platformă" : "The sales screen, inside the platform"}</p>
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-background px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 text-center sm:grid-cols-3 sm:text-left">
          {[[locale === "ro" ? "Folosit zilnic în România" : "Used daily in Romania", locale === "ro" ? "de cafenele independente" : "by independent cafés"], ["3.800+", locale === "ro" ? "bonuri procesate" : "receipts processed"], ["9.500+", locale === "ro" ? "mișcări de stoc urmărite" : "stock movements tracked"]].map(([value, text]) => <div key={value} className="border-border sm:border-l sm:pl-6 first:sm:border-l-0 first:sm:pl-0"><p className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{value}</p><p className="mt-1 text-sm text-mid">{text}</p></div>)}
        </div>
      </section>
    </>
  );
}

const featureImages = ["/showcase/pos-cart.png", "/showcase/recipe-costing.png", "/showcase/stock-levels.png", "/showcase/reports-dashboard.png"] as const;

export function HomePageContentBottom() {
  const { locale } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);
  const starter = pricingPlans.find((plan) => plan.id === "starter")!;
  return (
    <>
      <section id="ce-face" className="scroll-mt-20 bg-card px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brass">{locale === "ro" ? "Ce face, pe scurt" : "What it does"}</p>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-5xl">{c.benefitsLabel}.</h2>
          <div className="mt-14 space-y-20 lg:space-y-28">
            {c.benefits.map((benefit, index) => <article key={benefit.title} className="grid items-center gap-9 lg:grid-cols-2 lg:gap-20"><div className={index % 2 ? "lg:order-2" : ""}><p className="font-mono text-sm text-brass">0{index + 1}</p><h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-foreground">{benefit.title}</h3><p className="mt-4 max-w-lg text-base leading-7 text-mid">{benefit.text}</p></div><div className={`overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_60px_rgba(13,15,14,0.08)] ${index % 2 ? "lg:order-1" : ""}`}><Image src={featureImages[index]} alt={benefit.title} width={1600} height={1000} className="h-auto w-full" /></div></article>)}
          </div>
        </div>
      </section>
      <section id="offline" className="bg-ink px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20"><div><p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brass"><WifiOff size={16} aria-hidden />{c.offlineLabel}</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.025em] sm:text-5xl">{locale === "ro" ? "Cade internetul. Casa vinde mai departe." : "Internet goes down. The till keeps selling."}</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/65">{c.offlineIntro}</p></div><div className="rounded-xl border border-white/12 bg-card/[0.06] p-6 sm:p-8">{c.offlineSteps.map((step, index) => <div key={step.title} className="flex gap-4 border-b border-white/10 py-5 first:pt-0 last:border-0 last:pb-0"><span className="font-mono text-sm text-brass">0{index + 1}</span><div><h3 className="font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{step.text}</p></div></div>)}</div></div>
      </section>
      <section id="customer-proof" className="bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20"><div><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brass">{c.customerProof.label}</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.025em] text-foreground">{c.customerProof.title}</h2><p className="mt-5 text-base leading-7 text-mid">{c.customerProof.caption}</p></div><dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">{[["3.814", locale === "ro" ? "bonuri" : "receipts"], ["9.513", locale === "ro" ? "mișcări stoc" : "stock movements"], ["238", locale === "ro" ? "produse" : "products"], ["115", locale === "ro" ? "rețete" : "recipes"]].map(([value, text]) => <div key={text} className="bg-card p-6 sm:p-8"><dd className="font-mono text-3xl font-semibold text-foreground">{value}</dd><dt className="mt-2 text-sm text-mid">{text}</dt></div>)}</dl></div>
      </section>
      <section id="final-cta" className="bg-brass px-4 py-16 text-ink sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto flex max-w-5xl flex-col items-center text-center"><h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.025em] sm:text-5xl">{locale === "ro" ? "Începe cu rețetele tale. Vezi cifrele în aceeași zi." : "Start with your recipes. See the numbers the same day."}</h2><p className="mt-5 max-w-2xl text-base leading-7 text-white/75">{locale === "ro" ? `Începe proba de 15 zile fără card. Adaugă produsele cu ghidul din aplicație. Starter de la ${Math.round(starter.amountCents / 100)} €/lună.` : `Start your 15-day trial without a card. Add products with in-app guidance. Starter from €${Math.round(starter.amountCents / 100)}/month.`}</p><TrialLink location="homepage_final" className="mt-8 !bg-card !text-foreground hover:!bg-background" /></div></section>
    </>
  );
}
