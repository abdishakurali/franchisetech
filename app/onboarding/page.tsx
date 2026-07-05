"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  Building2,
  FileCheck2,
  Loader2,
  MapPin,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  deriveBusinessProfile,
  BUSINESS_PROFILE_LABELS,
  type IngredientTrackingIntent,
  type LocationBand,
} from "@/lib/business-profile";
import { createClient } from "@/lib/supabase/client";
import { readAcquisitionClient } from "@/lib/marketing/acquisition";
import { readPreferredPlanClient } from "@/lib/billing/preferred-plan";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { OnboardingStepper } from "@/components/app/OnboardingStepper";
import { cn } from "@/lib/utils";

const countryOptions = [
  { code: "RO", label: "România" },
  { code: "IE", label: "Ireland" },
  { code: "UK", label: "United Kingdom" },
  { code: "OTHER", label: "Other" },
];

const BUSINESS_TYPES = {
  ro: [
    "Restaurant",
    "Cafenea",
    "Servicii alimentare",
    "Măcelărie",
    "Pescărie",
    "Catering",
    "Bucătărie hotel",
    "Dark Kitchen",
    "Cămin de bătrâni",
    "Bucătărie școlară",
    "Altele",
  ],
  en: [
    "Restaurant",
    "Café",
    "Food service",
    "Butcher",
    "Fishmonger",
    "Caterer",
    "Hotel Kitchen",
    "Dark Kitchen",
    "Care Home",
    "School Kitchen",
    "Other",
  ],
};

const LOCATION_OPTIONS = {
  ro: [
    { value: "one" as LocationBand, label: "1 locație", hint: "Un singur punct de lucru" },
    { value: "few" as LocationBand, label: "2–5 locații", hint: "Lanț mic sau franciză" },
    { value: "many" as LocationBand, label: "6+ locații", hint: "Operator multi-locație" },
  ],
  en: [
    { value: "one" as LocationBand, label: "1 location", hint: "Single shop or café" },
    { value: "few" as LocationBand, label: "2–5 locations", hint: "Small chain or franchise" },
    { value: "many" as LocationBand, label: "6+ locations", hint: "Multi-site operator" },
  ],
};

const INGREDIENT_OPTIONS = {
  ro: [
    { value: "no" as IngredientTrackingIntent, label: "Nu — vând produse finite" },
    { value: "yes" as IngredientTrackingIntent, label: "Da — urmăresc ingrediente și costuri" },
    { value: "later" as IngredientTrackingIntent, label: "Mai târziu — încep cu POS" },
  ],
  en: [
    { value: "no" as IngredientTrackingIntent, label: "No — sell finished products only" },
    { value: "yes" as IngredientTrackingIntent, label: "Yes — track ingredients and costs" },
    { value: "later" as IngredientTrackingIntent, label: "Later — start with POS first" },
  ],
};

const UI_STRINGS = {
  ro: {
    brandName: "Numele firmei / brandului",
    brandPlaceholder: "ex: Café Central",
    country: "Țară",
    yourName: "Numele tău",
    namePlaceholder: "Proprietar sau manager",
    industry: "Tip activitate",
    selectType: "Selectează tipul…",
    continueBtn: "Continuă",
    nameRequired: "Numele firmei este obligatoriu.",
    locationsTitle: "Câte locații ai?",
    ingredientsTitle: "Urmărești ingrediente și stoc?",
    profileLabel: "Profilul tău:",
    planHint: "Planurile și facturarea sunt în Setări oricând — nu trebuie să alegi un plan acum.",
    backBtn: "Înapoi",
    openTill: "Deschide casa",
    openingTill: "Se deschide casa…",
    stepTitles: ["Configurează-ți afacerea", "Cum vrei să funcționeze?", "Conformitate fiscală română"],
    stepSubtitles: [
      "Câteva detalii rapide pentru a-ți deschide casa — poți schimba totul mai târziu din Setări.",
      "Alege ce ți se potrivește acum. Stocul și rețetele rămân dezactivate până le pornești.",
      "Conectează ANAF e-Factura acum sau mai târziu din Setări → Fiscal.",
    ],
    stepLabels: ["1. Afacere", "2. Configurare", "3. Fiscal"],
    stepShortLabels: ["Afacere", "Configurare", "Fiscal"],
    stepOf: (current: number, total: number) => `Pasul ${current} din ${total}`,
    timeEstimate: "~2 minute",
    trialBadge: "Trial 15 zile · fără card",
    fiscalLater: "Fac asta mai târziu",
    fiscalConnect: "Conectează ANAF e-Factura",
    fiscalConnecting: "Se conectează…",
    fiscalLegalTitle: "Obligație legală din ianuarie 2025",
    fiscalLegalBody:
      "Toate firmele românești trebuie să trimită facturile B2B prin ANAF e-Factura. Amenda pentru netransmitere: 1.000–2.500 lei per factură.",
    fiscalHint:
      "Poți conecta ANAF acum sau mai târziu din Setări → Fiscal. Durează ~2 minute cu certificatul digital al firmei.",
    recommended: "Recomandat",
  },
  en: {
    brandName: "Brand/shop name",
    brandPlaceholder: "e.g. Café Central",
    country: "Country",
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
    openTill: "Open my till",
    openingTill: "Opening your till…",
    stepTitles: ["Set up your business", "How do you want to run things?", "Romanian fiscal compliance"],
    stepSubtitles: [
      "Quick details so we can open your till — you can change everything later in Settings.",
      "Choose what fits today. Stock and recipes stay off until you turn them on.",
      "Connect ANAF e-Factura now or skip and do it later from Settings → Fiscal.",
    ],
    stepLabels: ["1. Business", "2. Your setup", "3. Fiscal"],
    stepShortLabels: ["Business", "Your setup", "Fiscal"],
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    timeEstimate: "~2 minutes",
    trialBadge: "15-day trial · no card",
    fiscalLater: "I'll do this later",
    fiscalConnect: "Connect ANAF e-Factura",
    fiscalConnecting: "Connecting…",
    fiscalLegalTitle: "Romanian e-invoicing",
    fiscalLegalBody:
      "Romanian businesses must send B2B invoices through ANAF e-Factura. You can connect now or from Settings → Fiscal.",
    fiscalHint: "Takes about 2 minutes with your company's digital certificate.",
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
    businessType: "",
    userName: "",
    countryCode: "RO",
    locationBand: "one" as LocationBand,
    ingredientTracking: "later" as IngredientTrackingIntent,
  });

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

  const profile = deriveBusinessProfile({
    locationBand: form.locationBand,
    ingredientTracking: form.ingredientTracking,
  });

  const isRO = form.countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = UI_STRINGS[locale];
  const businessTypes = BUSINESS_TYPES[locale];
  const locationOptions = LOCATION_OPTIONS[locale];
  const ingredientOptions = INGREDIENT_OPTIONS[locale];

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const lookupCui = () => {
    if (!form.anafCif.trim()) return toast.error("Introdu CUI-ul.");
    startTransition(async () => {
      const result = await lookupAnafCompany(form.anafCif);
      if (!result) {
        setCifResolved(false);
        toast.error("Firma nu a fost găsită în ANAF.");
        return;
      }
      update({ name: result.name, anafCif: result.cui, anafVatRegistered: result.vatRegistered });
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
              ga_client_id: acquisition.ga_client_id,
            }
          : null,
      });
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        setFiscalAction(null);
      }
    });
  };

  const stepShortLabels = isRO ? t.stepShortLabels : t.stepShortLabels.slice(0, 2);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80">
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 font-semibold text-slate-950">
              {fiscalAction === "anaf" ? t.fiscalConnecting : t.openingTill}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {isRO ? "Se creează produsele demo și se deschide casa…" : "Creating demo products and opening your till…"}
            </p>
          </div>
        </div>
      )}

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
            {t.trialBadge}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 pb-16">
        <OnboardingStepper
          labels={stepShortLabels}
          current={step}
          timeEstimate={t.timeEstimate}
          stepOf={t.stepOf}
        />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {t.stepTitles[step]}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            {t.stepSubtitles[step]}
          </p>
        </div>

        {/* ── STEP 0: Business ── */}
        {step === 0 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center gap-3 rounded-xl bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
                <Building2 className="h-5 w-5 shrink-0 text-blue-600" />
                <span>{isRO ? "Datele firmei apar pe bonuri și rapoarte." : "Business details appear on receipts and reports."}</span>
              </div>
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
                <Label htmlFor="countryCode">{t.country}</Label>
                <Select value={form.countryCode} onValueChange={(value) => update({ countryCode: value })}>
                  <SelectTrigger id="countryCode" className="mt-1 w-full">
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isRO && (
                <div>
                  <Label htmlFor="anafCif">CUI firmă</Label>
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
                      placeholder="ex: 12345678"
                    />
                    <Button type="button" variant="outline" onClick={lookupCui} disabled={pending}>
                      ANAF
                    </Button>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.anafVatRegistered}
                      onChange={(e) => update({ anafVatRegistered: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Plătitor de TVA
                  </label>
                  {cifResolved && (
                    <p className="mt-1 text-xs text-green-600">✓ {form.name} — date preluate din ANAF</p>
                  )}
                </div>
              )}
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
              <div>
                <Label htmlFor="businessType">{t.industry}</Label>
                <Select
                  value={form.businessType || "__none__"}
                  onValueChange={(value) => update({ businessType: value === "__none__" ? "" : value })}
                >
                  <SelectTrigger id="businessType" className="mt-1 w-full">
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t.selectType}</SelectItem>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="h-11 w-full bg-blue-600 text-base hover:bg-blue-700 text-white"
                onClick={() => {
                  if (!form.name.trim()) return toast.error(t.nameRequired);
                  setStep(1);
                }}
              >
                {t.continueBtn} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <Settings2 className="h-5 w-5 shrink-0 text-slate-500" />
                <span>{isRO ? "Poți schimba oricând din Setări." : "You can change these anytime in Settings."}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{t.locationsTitle}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {locationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update({ locationBand: opt.value })}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all active:scale-[0.98]",
                        form.locationBand === opt.value
                          ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                      )}
                    >
                      <MapPin className="mb-1 h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{t.ingredientsTitle}</p>
                <div className="mt-2 space-y-2">
                  {ingredientOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                        form.ingredientTracking === opt.value
                          ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300",
                        opt.value === "later" && form.ingredientTracking !== opt.value && "border-dashed",
                      )}
                    >
                      <input
                        type="radio"
                        name="ingredientTracking"
                        checked={form.ingredientTracking === opt.value}
                        onChange={() => update({ ingredientTracking: opt.value })}
                        className="h-4 w-4 border-slate-300 text-blue-600"
                      />
                      <span className="flex-1 text-sm">
                        {opt.label}
                        {opt.value === "later" ? (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                            {t.recommended}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-medium">{t.profileLabel}</span> {BUSINESS_PROFILE_LABELS[profile]}
                <p className="mt-1 text-xs text-slate-500">{t.planHint}</p>
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="h-11 px-5" onClick={() => setStep(0)} disabled={pending}>
                  {t.backBtn}
                </Button>
                <Button
                  className="h-11 flex-1 bg-blue-600 text-base hover:bg-blue-700 text-white"
                  disabled={pending}
                  onClick={() => {
                    if (isRO) {
                      setStep(2);
                    } else {
                      handleFinish(false);
                    }
                  }}
                >
                  {pending ? t.openingTill : isRO ? t.continueBtn : t.openTill}
                  {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">{t.fiscalLegalTitle}</p>
                  <p className="mt-1 leading-relaxed">{t.fiscalLegalBody}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p>{t.fiscalHint}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row-reverse">
                <Button
                  className="h-11 flex-1 bg-blue-600 text-base hover:bg-blue-700 text-white"
                  disabled={pending}
                  onClick={() => handleFinish(true)}
                >
                  {pending && fiscalAction === "anaf" ? t.fiscalConnecting : t.fiscalConnect}
                  {!(pending && fiscalAction === "anaf") && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 flex-1"
                  disabled={pending}
                  onClick={() => handleFinish(false)}
                >
                  {pending && fiscalAction === "skip" ? t.openingTill : t.fiscalLater}
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 sm:w-auto"
                  onClick={() => setStep(1)}
                  disabled={pending}
                >
                  {t.backBtn}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
