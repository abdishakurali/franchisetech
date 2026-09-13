"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { Button } from "@/components/ui/button";
import {
  getPlanFeatureCategories,
  planDescriptionForMarket,
  pricingPlans,
  type BillingPlan,
} from "@/lib/billing/plans";
import { type BillingMarket } from "@/lib/billing/market";
import { PricingCheckoutButton } from "@/components/app/PricingCheckoutButton";

type PricingLabels = {
  mainPlan: string;
  seeFeatures: string;
  getStarted: string;
  freeSetupStrip: string;
  setupFreeTitle: string;
  setupFreeText: string;
  multiTitle: string;
  multiText: string;
  multiBody?: string;
  multiMinLocations?: string;
};

type PricingLocale = "en" | "ro";

const PLAN_SHORT_NAMES: Record<BillingPlan, string> = {
  starter: "Core",
  core: "Core",
  pro: "Operations",
  operations: "Operations",
  scale: "Scale",
  multi_location: "Multi-location",
};

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "Till & sales": "Casa de marcat & vânzări",
  Products: "Produse",
  Reports: "Rapoarte",
  "Romanian compliance": "Conformitate România",
  Included: "Inclus",
  "Stock & purchases": "Stoc & achiziții",
  "Recipe costing": "Cost rețete",
  Accounting: "Contabilitate",
  "Kitchen & orders": "Bucătărie & comenzi",
  "Add-ons": "Add-on-uri",
  "Team & controls": "Echipă & controale",
  Operations: "Operațiuni",
  Kitchen: "Bucătărie",
  Reporting: "Raportare",
  Romania: "România",
};

const CATEGORY_EN_TRANSLATIONS: Record<string, string> = {
  Contabilitate: "Accounting",
  România: "Romania",
};

const FEATURE_TRANSLATIONS: Record<string, string> = {
  "POS checkout": "Vânzare POS",
  "Cash & card payments": "Plăți cash & card",
  "Transaction history & receipts": "Istoric tranzacții & bonuri",
  "Open/close till": "Deschidere/închidere casă",
  "% or fixed lei discounts at checkout": "Discount procentual sau sumă fixă în lei",
  "Products & categories": "Produse & categorii",
  "CSV import & export": "Import & export CSV",
  "Sales report": "Raport vânzări",
  "FiscalNet fiscal receipts": "Bonuri fiscale prin FiscalNet",
  "Fiscal Z-report (daily close)": "Raport Z fiscal (închidere zilnică)",
  "Fiscal X-report (interim)": "Raport X fiscal (interimar)",
  "TVA groups": "Grupe TVA",
  "ANAF e-Factura support": "Suport ANAF e-Factura",
  "Owner and staff roles": "Roluri manager și personal",
  "Unlimited staff": "Personal nelimitat",
  "15-day assisted trial": "Trial asistat 15 zile",
  "Everything in Core": "Tot ce include Core",
  "Split payments & tips (optional)": "Plăți împărțite & bacșiș (opțional)",
  "Stock levels & movements": "Niveluri & mișcări stoc",
  Suppliers: "Furnizori",
  "Stock & purchase reports": "Rapoarte stoc & achiziții",
  "Recipes linked to products": "Rețete legate de produse",
  "Ingredient cost & margin": "Cost ingrediente & marjă",
  "Can-make from stock": "Poți produce din stoc",
  "Margins report": "Raport marje",
  "Ingredient consumption record": "Înregistrare consum ingrediente",
  "Audit CSV export": "Export CSV audit",
  "FiscalNet included in FranchiseTech; provider subscription paid separately": "FiscalNet este inclus în FranchiseTech; abonamentul furnizorului se plătește separat",
  "Staff roles & permissions": "Roluri & permisiuni personal",
  "Owner digest email: sales, cash status, voids, refunds, VAT and stock": "Email rezumat manager: vânzări, status casă, anulări, retururi, TVA și stoc",
  "Everything in Operations": "Tot ce include Operations",
  "Priority support (same-day response)": "Suport prioritar (răspuns în aceeași zi)",
  "Dedicated onboarding call": "Apel dedicat de onboarding",
  "Advanced operations support": "Suport operațional avansat",
  "Full accountant export pack (CSV + XML)": "Pachet complet export contabil (CSV + XML)",
  "Daily owner digest email": "Email zilnic sumar pentru manager",
  "Multiple sites": "Locații multiple",
  "Site switching": "Comutare între locații",
  "Per-site sales & reports": "Vânzări & rapoarte per locație",
  "FiscalNet receipt integration (when enabled in Settings)": "Integrare bonuri FiscalNet (când este activată în Setări)",
};

const FEATURE_EN_TRANSLATIONS: Record<string, string> = {
  "Bon de consum (materii prime consumate din rețete)": "Consumption note (raw materials consumed from recipes)",
  "Export audit CSV pentru contabil": "Audit CSV export for accountant",
  "Export XML Saga pentru contabil": "Saga XML export for accountant",
  "Pachete CSV audit complet": "Complete audit CSV packs",
  "Owner digest email zilnic": "Daily owner digest email",
};

const PLAN_DESCRIPTIONS_RO: Record<BillingPlan, string> = {
  starter: "Pentru o locație care are nevoie de POS conform, FiscalNet, bonuri fiscale și rapoarte zilnice.",
  core: "Pentru o locație care are nevoie de POS conform, FiscalNet, bonuri fiscale și rapoarte zilnice.",
  pro: "Pentru manageri care vor stoc, cost rețete, flux bucătărie și controale mai bune pentru personal.",
  operations: "Pentru manageri care vor stoc, cost rețete, flux bucătărie și controale mai bune pentru personal.",
  scale: "Pentru afaceri mature operațional care vor toate modulele, suport prioritar și spațiu de creștere.",
  multi_location: "Pentru afaceri cu două sau mai multe locații. Necesită planul de bază Scale.",
};

const DEFAULT_LABELS: Record<PricingLocale, PricingLabels> = {
  en: {
    mainPlan: "Most popular",
    seeFeatures: "See all features",
    getStarted: "Get started",
    freeSetupStrip: "Start free. In-app setup included - under an hour to your first sale.",
    setupFreeTitle: "Free in-app setup",
    setupFreeText: "New account -> demo products -> open till -> first sale. Step-by-step guide, no cost.",
    multiTitle: "Multi-location",
    multiText: "For businesses running 2+ locations.",
    multiBody: "Everything in Scale, billed per additional location. Central reporting and dedicated support.",
    multiMinLocations: "Minimum 2 locations",
  },
  ro: {
    mainPlan: "Cel mai popular",
    seeFeatures: "Vezi toate funcțiile",
    getStarted: "Începeți acum",
    freeSetupStrip: "Începi gratuit. Setup în aplicație inclus - sub o oră până la prima vânzare.",
    setupFreeTitle: "Setup gratuit în aplicație",
    setupFreeText: "Cont nou -> produse demo -> deschidere casă -> prima vânzare. Ghid pas cu pas, fără cost.",
    multiTitle: "Multi-locație",
    multiText: "Pentru afaceri cu 2+ locații.",
    multiBody: "Tot din Scale, facturat pe locație suplimentară. Raportare centrală și suport dedicat.",
    multiMinLocations: "Minimum 2 locații",
  },
};

function localizedText(locale: PricingLocale, english: string, romanian?: string) {
  return locale === "ro" ? romanian ?? english : english;
}

function localizedFeature(locale: PricingLocale, text: string) {
  if (locale === "en") return FEATURE_EN_TRANSLATIONS[text] ?? text;
  return localizedText(locale, text, FEATURE_TRANSLATIONS[text]);
}

function localizedCategory(locale: PricingLocale, text: string) {
  if (locale === "en") return CATEGORY_EN_TRANSLATIONS[text] ?? text;
  return localizedText(locale, text, CATEGORY_TRANSLATIONS[text]);
}

function localizedPlanDescription(locale: PricingLocale, plan: BillingPlan, market: BillingMarket) {
  return localizedText(locale, planDescriptionForMarket(plan, market), PLAN_DESCRIPTIONS_RO[plan]);
}

type Props = {
  variant: "marketing" | "billing";
  market?: BillingMarket;
  loggedIn?: boolean;
  configured?: boolean;
  labels?: PricingLabels;
  locale?: PricingLocale;
};

function PlanFeaturesAccordion({
  planId,
  market,
  seeFeatures,
  locale,
}: {
  planId: BillingPlan;
  market: BillingMarket;
  seeFeatures: string;
  locale: PricingLocale;
}) {
  const categories = getPlanFeatureCategories(planId, market);
  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4" aria-label={seeFeatures}>
      {categories.map((category) => (
        <div key={category.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{localizedCategory(locale, category.title)}</p>
          <ul className="space-y-2">
            {category.items.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                {localizedFeature(locale, feature)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PricingPlansSection({
  variant,
  market = "RO",
  loggedIn = false,
  configured = false,
  labels,
  locale = "en",
}: Props) {
  // Annual billing is hidden, not just defaulted away from: the live annual
  // Stripe prices are misconfigured (return the monthly-equivalent amount
  // instead of the annual total — see docs/adr/0002-annual-pricing-blocked.md),
  // so checkout on annual 503s every time. A visible toggle that fails on
  // click is worse than not offering the choice — re-enable once the Stripe
  // prices are corrected to actually charge the annual total on a yearly
  // interval.
  const interval: "month" | "year" = "month";
  const l = labels ?? DEFAULT_LABELS[locale];

  const mainPlans = pricingPlans.filter((plan) => plan.id === "starter" || plan.id === "pro");

  return (
    <div className="space-y-10">
      {variant === "marketing" && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-sm font-medium text-blue-800">
          {l.freeSetupStrip}
        </div>
      )}

      {/* Main plan cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {mainPlans.map((plan) => {
          const displayPrice = plan.price;
          const displayCadence = plan.cadence;
          const shortName = PLAN_SHORT_NAMES[plan.id];

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 text-left sm:p-8 ${
                plan.highlighted ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                  {l.mainPlan}
                </span>
              )}
              <p className={`text-sm font-semibold uppercase tracking-wide ${plan.highlighted ? "text-blue-700" : "text-slate-500"}`}>
                {shortName}
              </p>
              <p className="mt-2 text-4xl font-bold text-slate-900">{displayPrice}</p>
              <p className="text-sm text-slate-500">
                {localizedText(locale, displayCadence, "/lună")}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{localizedPlanDescription(locale, plan.id, market)}</p>
              <PlanFeaturesAccordion planId={plan.id} market={market} seeFeatures={l.seeFeatures} locale={locale} />
              {variant === "marketing" ? (
                <Link
                  href={`/signup?plan=${plan.id}`}
                  className="mt-6 block"
                  onClick={() =>
                    captureClientEvent("pricing_cta_clicked", {
                      plan: plan.id,
                      interval,
                      location: "plan_card",
                      cta_text: l.getStarted,
                    })
                  }
                >
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
                </Link>
              ) : (
                <div className="mt-6">
                  <PricingCheckoutButton plan={plan.id} loggedIn={loggedIn} configured={configured} interval={interval} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scale + Multi-location — for multi-site operators, the segment the brand is named for */}
      {(() => {
        const scale = pricingPlans.find((p) => p.id === "scale");
        const multi = pricingPlans.find((p) => p.id === "multi_location");
        if (!scale || !multi) return null;
        const scalePrice = scale.price;
        const multiPrice = multi.price;
        return (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{l.multiTitle}</p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <p>
                <span className="text-2xl font-bold text-slate-900">{scalePrice}</span>
                <span className="text-sm text-slate-500">{localizedText(locale, "/mo base", "/lună bază")}</span>
              </p>
              <p>
                <span className="text-2xl font-bold text-slate-900">+{multiPrice}</span>
                <span className="text-sm text-slate-500">{localizedText(locale, "/additional location/mo", "/locație suplimentară/lună")}</span>
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{l.multiBody ?? l.multiText}</p>
            <p className="mt-1 text-xs text-slate-500">{l.multiMinLocations}</p>
            <PlanFeaturesAccordion planId="scale" market={market} seeFeatures={l.seeFeatures} locale={locale} />
            {variant === "marketing" ? (
              <Link
                href="/contact?topic=multi-location"
                className="mt-6 block"
                onClick={() =>
                  captureClientEvent("pricing_cta_clicked", {
                    plan: "multi_location",
                    interval,
                    location: "multi_location_card",
                    cta_text: l.getStarted,
                  })
                }
              >
                <Button variant="outline" className="w-full">{localizedText(locale, "Talk to us about multi-location", "Discutați despre multi-locație")}</Button>
              </Link>
            ) : (
              <div className="mt-6">
                <PricingCheckoutButton plan="scale" loggedIn={loggedIn} configured={configured} interval={interval} />
              </div>
            )}
          </div>
        );
      })()}

      {/* Free self-serve setup */}
      <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-950">{l.setupFreeTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {l.setupFreeText}
        </p>
        {variant === "marketing" && (
          <Link
            href="/signup?plan=starter"
            className="mt-6 block"
            onClick={() =>
              captureClientEvent("pricing_cta_clicked", {
                plan: "starter",
                interval,
                location: "free_setup",
                cta_text: l.getStarted,
              })
            }
          >
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">{l.getStarted}</Button>
          </Link>
        )}
      </div>

    </div>
  );
}
