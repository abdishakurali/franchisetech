"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
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
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { onboardingStepLabels, onboardingStepOfLabel } from "@/lib/onboarding/steps";

const BUSINESS_TYPES = {
  ro: ["Cafenea", "Restaurant", "Takeaway", "Patiserie / brutărie", "Magazin mic", "Altele"],
  en: ["Café", "Restaurant", "Takeaway", "Bakery / patisserie", "Small shop", "Other"],
};

const UI_STRINGS = {
  ro: {
    brandName: "Numele firmei / brandului",
    brandPlaceholder: "ex: Café Central",
    cuiLabel: "CUI firmă",
    cuiPlaceholder: "ex: 12345678",
    cuiButton: "ANAF",
    vatRegisteredLabel: "Plătitor de TVA",
    addressLabel: "Adresă",
    registrationCodeLabel: "Nr. Reg. Com.",
    anafResolvedNote: (name: string) => `✓ ${name} — date preluate din ANAF`,
    industry: "Tip activitate",
    optional: "opțional",
    selectType: "Selectează tipul…",
    continueBtn: "Continuă",
    nameRequired: "Numele firmei este obligatoriu.",
    continuing: "Se creează firma…",
    title: "Spune-ne cine este firma",
    subtitle: "Câteva detalii rapide — puteți schimba totul mai târziu din Setări.",
    timeEstimate: "~2 minute",
    trialBadge: "Probă 15 zile · fără card necesar",
    hint: "Datele firmei apar pe bonuri și rapoarte.",
  },
  en: {
    brandName: "Brand/shop name",
    brandPlaceholder: "e.g. Café Central",
    cuiLabel: "Company tax ID (CUI)",
    cuiPlaceholder: "e.g. 12345678",
    cuiButton: "ANAF",
    vatRegisteredLabel: "VAT registered",
    addressLabel: "Address",
    registrationCodeLabel: "Trade registry no.",
    anafResolvedNote: (name: string) => `✓ ${name} — retrieved from ANAF`,
    industry: "Industry",
    optional: "optional",
    selectType: "Select type…",
    continueBtn: "Continue",
    nameRequired: "Brand/shop name is required.",
    continuing: "Creating your workspace…",
    title: "Tell us about your business",
    subtitle: "A couple of quick details — you can change everything later in Settings.",
    timeEstimate: "~2 minutes",
    trialBadge: "15-day trial · no card required",
    hint: "Business details appear on receipts and reports.",
  },
};

export default function OnboardingPage() {
  const [pending, startTransition] = useTransition();
  const [cifResolved, setCifResolved] = useState(false);
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
  // This is deliberately client-only: onboarding_step on the org row remains
  // the source of truth for WHICH STEP to resume at (see app/onboarding/layout.tsx).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("franchisetech:onboarding-draft");
      if (!saved) return;
      const parsed = JSON.parse(saved) as { form?: Partial<typeof form> };
      // eslint-disable-next-line react-hooks/set-state-in-effect -- runs once on mount (empty deps) to hydrate from the server-safe seed
      if (parsed.form) setForm((current) => ({ ...current, ...parsed.form }));
    } catch {
      // Ignore malformed or unavailable browser storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("franchisetech:onboarding-draft", JSON.stringify({ form }));
    } catch {
      // Private browsing may deny storage; onboarding remains fully usable.
    }
  }, [form]);

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
    captureClientEvent("onboarding_step_viewed", { step: "business_cui", country_code: form.countryCode });
  }, [form.countryCode]);

  const isRO = form.countryCode === "RO";
  const locale = isRO ? "ro" : "en";
  const t = UI_STRINGS[locale];
  const businessTypes = BUSINESS_TYPES[locale];

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const lookupCui = () => {
    if (!form.anafCif.trim()) return toast.error(isRO ? "Introduceți CUI-ul." : "Enter the CUI.");
    startTransition(async () => {
      const result = await lookupAnafCompany(form.anafCif);
      if (!result) {
        setCifResolved(false);
        toast.error(isRO ? "Firma nu a fost găsită în ANAF." : "Company not found in ANAF.");
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
      toast.success(isRO ? "Date preluate din ANAF." : "Retrieved from ANAF.");
    });
  };

  const handleContinue = () => {
    if (!form.name.trim()) return toast.error(t.nameRequired);
    captureClientEvent("onboarding_completed", { country_code: form.countryCode });
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
      } else {
        try {
          window.localStorage.removeItem("franchisetech:onboarding-draft");
        } catch {
          // Ignore storage failures.
        }
      }
    });
  };

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 text-center shadow-xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brass" />
            <p className="mt-4 font-semibold text-foreground">{t.continuing}</p>
          </div>
        </div>
      )}

      <OnboardingShell
        stepLabels={onboardingStepLabels(isRO, locale)}
        currentStepIndex={0}
        title={t.title}
        subtitle={t.subtitle}
        timeEstimate={t.timeEstimate}
        stepOfLabel={onboardingStepOfLabel(0, onboardingStepLabels(isRO, locale).length, locale)}
        trialBadge={t.trialBadge}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-md bg-accent px-4 py-3 text-sm text-foreground">
            <Building2 className="h-5 w-5 shrink-0 text-brass" />
            <span>{t.hint}</span>
          </div>
          <div>
            <Label htmlFor="businessType">{t.industry} <span className="font-normal text-muted-foreground">({t.optional})</span></Label>
            <Select value={form.businessType} onValueChange={(value) => update({ businessType: value })}>
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
              <Label htmlFor="anafCif">{t.cuiLabel} <span className="font-normal text-muted-foreground">({t.optional})</span></Label>
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
              <label className="mt-2 flex items-center gap-2 text-sm text-mid">
                <input
                  type="checkbox"
                  checked={form.anafVatRegistered}
                  onChange={(e) => update({ anafVatRegistered: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                {t.vatRegisteredLabel}
              </label>
              {cifResolved && (
                <div className="mt-2 space-y-0.5 rounded-md bg-reconciled/10 px-3 py-2 text-xs text-reconciled">
                  <p className="font-medium">{t.anafResolvedNote(form.name)}</p>
                  {form.anafAddress && <p>{t.addressLabel}: {form.anafAddress}</p>}
                  {anafRegistrationCode && <p>{t.registrationCodeLabel}: {anafRegistrationCode}</p>}
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
          <div className="border-t border-border pt-6">
            <Button
              className="h-11 w-full bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90 sm:w-auto"
              disabled={pending}
              onClick={handleContinue}
            >
              {t.continueBtn} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </OnboardingShell>
    </>
  );
}
