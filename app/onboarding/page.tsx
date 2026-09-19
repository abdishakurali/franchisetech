"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Package,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { completePosOnboarding } from "@/app/actions/onboarding";
import { lookupAnafCompany } from "@/app/actions/partner-lookup";
import type { IngredientTrackingIntent, LocationBand } from "@/lib/business-profile";
import { createClient } from "@/lib/supabase/client";
import { readAcquisitionClient } from "@/lib/marketing/acquisition";
import { readPreferredPlanClient } from "@/lib/billing/preferred-plan";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { OnboardingStepper } from "@/components/app/OnboardingStepper";

const BUSINESS_TYPES = {
  ro: [
    "Cafenea",
    "Restaurant",
    "Takeaway",
    "Patiserie / brutărie",
    "Magazin mic",
    "Altele",
  ],
  en: [
    "Café",
    "Restaurant",
    "Takeaway",
    "Bakery / patisserie",
    "Small shop",
    "Other",
  ],
};

const UI_STRINGS = {
  ro: {
    brandName: "Numele firmei / brandului",
    brandPlaceholder: "ex: Café Central",
    country: "Țară",
    cuiLabel: "CUI firmă",
    cuiPlaceholder: "ex: 12345678",
    cuiButton: "ANAF",
    cuiRequired: "Introduceți CUI-ul.",
    vatRegisteredLabel: "Plătitor de TVA",
    addressLabel: "Adresă",
    registrationCodeLabel: "Nr. Reg. Com.",
    anafResolvedNote: (name: string) => `✓ ${name} — date preluate din ANAF`,
    yourName: "Numele dumneavoastră",
    namePlaceholder: "Proprietar sau manager",
    industry: "Tip activitate",
    selectType: "Selectează tipul…",
    continueBtn: "Continuă",
    nameRequired: "Numele firmei este obligatoriu.",
    locationsTitle: "Câte locații aveți?",
    ingredientsTitle: "Urmăriți ingrediente și stoc?",
    profileLabel: "Profilul dumneavoastră:",
    planHint: "Planurile și facturarea sunt în Setări oricând — nu trebuie să alegeți un plan acum.",
    backBtn: "Înapoi",
    openTill: "Creează produsele și deschide POS",
    openingTill: "Se deschide casa…",
    stepTitles: ["Configurați-vă afacerea", "Pregătit pentru prima vânzare"],
    stepSubtitles: [
      "Câteva detalii rapide pentru a vă deschide casa — puteți schimba totul mai târziu din Setări.",
      "Metodele de plată și casa sunt pregătite. Adăugați primul produs înainte de prima vânzare reală.",
    ],
    stepLabels: ["1. Afacere", "2. Prima vânzare"],
    stepShortLabels: ["Afacere", "Prima vânzare"],
    stepOf: (current: number, total: number) => `Pasul ${current} din ${total}`,
    stepEyebrow: (current: number, total: number) => `Pasul ${current} din ${total}`,
    timeEstimate: "~2 minute",
    trialBadge: "Probă 15 zile · fără card necesar",
    sidebarBanner: "Configurați-vă afacerea și casa de marcat ca să puteți vinde azi.",
    sidebarStepDescriptions: [
      "Numele firmei, tipul activității și numele dumneavoastră.",
      "Metodele de plată și casa pregătite; adăugați primul produs când sunteți gata.",
    ],
    fiscalLater: "Fac asta mai târziu",
    fiscalConnect: "Conectează ANAF e-Factura",
    fiscalConnecting: "Se conectează…",
    fiscalLegalTitle: "Facturare electronică ANAF",
    fiscalLegalBody:
      "Firmele românești trebuie să trimită facturile B2B prin ANAF e-Factura; nerespectarea poate atrage amenzi. Confirmați cu contabilul termenele și sumele exacte aplicabile firmei dumneavoastră.",
    fiscalHint:
      "Puteți conecta ANAF acum sau mai târziu din Setări → Fiscal. Durează ~2 minute cu certificatul digital al firmei.",
    fiscalGuidanceHeading: "Ghid & resurse",
    fiscalGuidanceEfacturaTitle: "Ghid ANAF e-Factura",
    fiscalGuidanceEfacturaDesc: "Cum conectezi certificatul digital al firmei.",
    fiscalGuidanceFiscalnetTitle: "FiscalNet & bonuri fiscale",
    fiscalGuidanceFiscalnetDesc: "Cum funcționează conexiunea casei de marcat fiscale.",
    learnHow: "Vezi ghidul",
    recommended: "Recomandat",
  },
  en: {
    brandName: "Brand/shop name",
    brandPlaceholder: "e.g. Café Central",
    country: "Country",
    cuiLabel: "Company tax ID (CUI)",
    cuiPlaceholder: "e.g. 12345678",
    cuiButton: "ANAF",
    cuiRequired: "Enter the CUI.",
    vatRegisteredLabel: "VAT registered",
    addressLabel: "Address",
    registrationCodeLabel: "Trade registry no.",
    anafResolvedNote: (name: string) => `✓ ${name} — retrieved from ANAF`,
    yourName: "Your name",
    namePlaceholder: "Owner or manager name",
    industry: "Industry",
    selectType: "Select type…",
    continueBtn: "Continue",
    nameRequired: "Brand/shop name is required.",
    locationsTitle: "How many locations?",
    ingredientsTitle: "Track ingredients and stock?",
    profileLabel: "Your profile:",
    planHint: "Billing and plans are in Settings anytime — no plan choice required now.",
    backBtn: "Back",
    openTill: "Create products and open POS",
    openingTill: "Opening your till…",
    stepTitles: ["Set up your business", "Ready for the first sale"],
    stepSubtitles: [
      "Quick details so we can open your till — you can change everything later in Settings.",
      "Payment methods and the till are ready. Add your first product before the first real sale.",
    ],
    stepLabels: ["1. Business", "2. First sale"],
    stepShortLabels: ["Business", "First sale"],
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    stepEyebrow: (current: number, total: number) => `Step ${current} of ${total}`,
    timeEstimate: "~2 minutes",
    trialBadge: "15-day trial · no card required",
    sidebarBanner: "Set up your business and till so you can start selling today.",
    sidebarStepDescriptions: [
      "Brand name, industry, and your name.",
      "Payment methods and an open till; add your first product when ready.",
    ],
    fiscalLater: "I'll do this later",
    fiscalConnect: "Connect ANAF e-Factura",
    fiscalConnecting: "Connecting…",
    fiscalLegalTitle: "Romanian e-invoicing",
    fiscalLegalBody:
      "Romanian businesses must send B2B invoices through ANAF e-Factura. You can connect now or from Settings → Fiscal.",
    fiscalHint: "Takes about 2 minutes with your company's digital certificate.",
    fiscalGuidanceHeading: "Guidance & resources",
    fiscalGuidanceEfacturaTitle: "ANAF e-Invoicing guide",
    fiscalGuidanceEfacturaDesc: "How to connect your company's digital certificate.",
    fiscalGuidanceFiscalnetTitle: "FiscalNet & fiscal receipts",
    fiscalGuidanceFiscalnetDesc: "How the fiscal till connection works.",
    learnHow: "Learn how",
    recommended: "Recommended",
  },
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [cifResolved, setCifResolved] = useState(false);
  const [fiscalAction, setFiscalAction] = useState<"skip" | "anaf" | null>(null);
  const [form, setForm] = useState({
    name: "",
    anafCif: "",
    anafVatRegistered: false,
    anafAddress: "",
    businessType: "",
    userName: "",
    countryCode: "RO",
    locationBand: "one" as LocationBand,
    ingredientTracking: "later" as IngredientTrackingIntent,
  });
  const [anafRegistrationCode, setAnafRegistrationCode] = useState("");

  // Keep unfinished onboarding resilient to refreshes and accidental tab closes.
  // This is deliberately client-only: the server action remains the source of truth.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("franchisetech:onboarding-draft");
      if (!saved) return;
      const parsed = JSON.parse(saved) as { step?: number; form?: Partial<typeof form> };
      if (parsed.form) setForm((current) => ({ ...current, ...parsed.form }));
      if (parsed.step === 0 || parsed.step === 1) setStep(parsed.step);
    } catch {
      // Ignore malformed or unavailable browser storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("franchisetech:onboarding-draft", JSON.stringify({ step, form }));
    } catch {
      // Private browsing may deny storage; onboarding remains fully usable.
    }
  }, [step, form]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      const fullName = user?.user_metadata?.full_name as string | undefined;
      const businessName = user?.user_metadata?.business_name as string | undefined;
      startTransition(() => {
        setForm((current) => ({
          ...current,
          userName: current.userName || fullName?.trim() || "",
          name: current.name || businessName?.trim() || "",
        }));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [startTransition]);

  useEffect(() => {
    captureClientEvent("onboarding_step_viewed", {
      step,
      country_code: form.countryCode,
    });
  }, [step, form.countryCode]);

  const isRO = form.countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = UI_STRINGS[locale];
  const businessTypes = BUSINESS_TYPES[locale];

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const lookupCui = () => {
    if (!form.anafCif.trim()) return toast.error("Introduceți CUI-ul.");
    startTransition(async () => {
      const result = await lookupAnafCompany(form.anafCif);
      if (!result) {
        setCifResolved(false);
        toast.error("Firma nu a fost găsită în ANAF.");
        return;
      }
      update({
        name: result.name,
        anafCif: result.cui,
        anafVatRegistered: result.vatRegistered,
        anafAddress: result.address,
      });
      setAnafRegistrationCode(result.registrationCode);
      setCifResolved(true);
      toast.success("Date preluate din ANAF.");
    });
  };

  const handleFinish = (connectEfactura = false) => {
    setFiscalAction(connectEfactura ? "anaf" : "skip");
    captureClientEvent("onboarding_completed", {
      country_code: form.countryCode,
      connect_efactura: connectEfactura,
    });
    startTransition(async () => {
      const acquisition = readAcquisitionClient();
      const preferredPlan = readPreferredPlanClient();
      const urlRef =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null;
      const ref = urlRef ?? acquisition?.ref ?? null;

      const result = await completePosOnboarding({
        orgName: form.name,
        anafCif: form.anafCif,
        anafVatRegistered: form.anafVatRegistered,
        anafAddress: form.anafAddress,
        businessType: form.businessType || undefined,
        userName: form.userName,
        countryCode: form.countryCode,
        locationBand: form.locationBand,
        ingredientTracking: form.ingredientTracking,
        preferredPlan: preferredPlan ?? undefined,
        referralCode: ref,
        connectEfactura,
        acquisition: acquisition
          ? {
              utm_source: acquisition.utm_source,
              utm_campaign: acquisition.utm_campaign,
              utm_content: acquisition.utm_content,
              utm_medium: acquisition.utm_medium,
              gclid: acquisition.gclid,
              gbraid: acquisition.gbraid,
              wbraid: acquisition.wbraid,
              fbclid: acquisition.fbclid,
              ga_client_id: acquisition.ga_client_id,
            }
          : null,
      });
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        setFiscalAction(null);
      } else {
        try {
          window.localStorage.removeItem("franchisetech:onboarding-draft");
        } catch {
          // Ignore storage failures.
        }
      }
    });
  };

  const stepShortLabels = t.stepShortLabels;

  return (
    <div className="relative min-h-screen bg-[#F3F0E8] text-[#0D0F0E] [&_input]:border-[#DFDCD2] [&_input]:bg-white [&_button[data-slot=select-trigger]]:border-[#DFDCD2]">
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 font-semibold text-slate-950">
              {fiscalAction === "anaf" ? t.fiscalConnecting : t.openingTill}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isRO ? "Se deschide casa…" : "Opening your till…"}
            </p>
          </div>
        </div>
      )}

      <header className="border-b border-[#DFDCD2] bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
            {t.trialBadge}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[768px] px-4 py-8 pb-16 sm:py-10">
        <div>
          <OnboardingStepper
            labels={stepShortLabels}
            current={step}
            timeEstimate={t.timeEstimate}
            stepOf={t.stepOf}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#DFDCD2] bg-white">
          <div className="p-5 sm:p-10">
            <div className="mb-8">
              <h1 className="font-[family-name:var(--font-display)] text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-[#0D0F0E] sm:text-[34px]">
                {t.stepTitles[step]}
              </h1>
              <p className="mt-3 max-w-xl text-[17px] leading-[1.55] text-[#5B5D57]">
                {t.stepSubtitles[step]}
              </p>
            </div>

            {/* ── STEP 0: Business ── */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-xl bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
                  <Building2 className="h-5 w-5 shrink-0 text-blue-600" />
                  <span>{isRO ? "Datele firmei apar pe bonuri și rapoarte." : "Business details appear on receipts and reports."}</span>
                </div>
                <div>
                  <Label htmlFor="businessType">{t.industry}</Label>
                  <Select
                    value={form.businessType || undefined}
                    onValueChange={(value) => update({ businessType: value })}
                  >
                    <SelectTrigger id="businessType" className="mt-1 w-full">
                      <SelectValue placeholder={t.selectType} />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isRO && (
                  <div>
                    <Label htmlFor="anafCif">{t.cuiLabel}</Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="anafCif"
                        value={form.anafCif}
                        onChange={(e) => {
                          setCifResolved(false);
                          update({ anafCif: e.target.value });
                        }}
                        onBlur={() => {
                          if (form.anafCif.trim().length >= 4 && !form.name) void lookupCui();
                        }}
                        placeholder={t.cuiPlaceholder}
                      />
                      <Button type="button" variant="outline" onClick={lookupCui} disabled={pending}>
                        {t.cuiButton}
                      </Button>
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={form.anafVatRegistered}
                        onChange={(e) => update({ anafVatRegistered: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {t.vatRegisteredLabel}
                    </label>
                    {cifResolved && (
                      <div className="mt-2 space-y-0.5 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                        <p className="font-medium">{t.anafResolvedNote(form.name)}</p>
                        {form.anafAddress && (
                          <p>{t.addressLabel}: {form.anafAddress}</p>
                        )}
                        {anafRegistrationCode && (
                          <p>{t.registrationCodeLabel}: {anafRegistrationCode}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <Label htmlFor="name">{t.brandName}</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder={t.brandPlaceholder}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="userName">{t.yourName}</Label>
                  <Input
                    id="userName"
                    value={form.userName}
                    onChange={(e) => update({ userName: e.target.value })}
                    placeholder={t.namePlaceholder}
                    className="mt-1"
                  />
                </div>
                <div className="border-t border-slate-100 pt-6">
                  <Button
                    className="h-11 w-full bg-blue-600 px-8 text-base hover:bg-blue-700 text-white sm:w-auto"
                    onClick={() => {
                      if (!form.name.trim()) return toast.error(t.nameRequired);
                      setStep(1);
                    }}
                  >
                    {t.continueBtn} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                {[
                  {
                    icon: Package,
                    title: isRO ? "Catalogul dumneavoastră" : "Your catalog",
                    text: isRO ? "Catalogul începe gol. Adăugați primul produs direct din POS sau Produse." : "Your catalog starts empty. Add your first product from POS or Products.",
                  },
                  {
                    icon: Receipt,
                    title: isRO ? "Numerar, card și TVA" : "Cash, card, and VAT",
                    text: isRO ? "Metodele de plată și cotele TVA sunt pregătite pentru o vânzare de test." : "Payment methods and tax rates are ready for a test sale.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "FiscalNet",
                    text: isRO ? "După creare, conectați casa fiscală înainte de prima vânzare reală." : "After setup, connect the fiscal register before the first real sale.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3 rounded-xl border border-slate-200 p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                      </div>
                      <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />
                    </div>
                  );
                })}

                <Link href="/help/romania-fiscalnet" target="_blank" className="inline-flex text-sm font-medium text-blue-700 hover:underline">
                  {isRO ? "Vezi ghidul FiscalNet" : "Read the FiscalNet guide"}
                </Link>

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-6 sm:flex-row-reverse">
                  <Button
                    className="h-11 flex-1 bg-blue-600 text-base hover:bg-blue-700 text-white"
                    disabled={pending}
                    onClick={() => handleFinish(false)}
                  >
                    {pending ? t.openingTill : t.openTill}
                    {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-11 sm:w-auto"
                    onClick={() => setStep(0)}
                    disabled={pending}
                  >
                    {t.backBtn}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
