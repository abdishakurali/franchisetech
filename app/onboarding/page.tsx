"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRight, MapPin } from "lucide-react";
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
import {
  deriveBusinessProfile,
  BUSINESS_PROFILE_LABELS,
  type IngredientTrackingIntent,
  type LocationBand,
} from "@/lib/business-profile";
import { createClient } from "@/lib/supabase/client";

const businessTypes = [
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
];

const countryOptions = [
  { code: "RO", label: "Romania" },
  { code: "IE", label: "Ireland" },
  { code: "UK", label: "United Kingdom" },
  { code: "OTHER", label: "Other" },
];

const locationOptions: { value: LocationBand; label: string; hint: string }[] = [
  { value: "one", label: "1 location", hint: "Single shop or café" },
  { value: "few", label: "2–5 locations", hint: "Small chain or franchise" },
  { value: "many", label: "6+ locations", hint: "Multi-site operator" },
];

const ingredientOptions: { value: IngredientTrackingIntent; label: string }[] = [
  { value: "no", label: "No — sell finished products only" },
  { value: "yes", label: "Yes — track ingredients and costs" },
  { value: "later", label: "Later — start with POS first" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
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

  const profile = deriveBusinessProfile({
    locationBand: form.locationBand,
    ingredientTracking: form.ingredientTracking,
  });

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const handleFinish = () => {
    startTransition(async () => {
      const result = await completePosOnboarding({
        orgName: form.name,
        businessType: form.businessType || undefined,
        userName: form.userName,
        countryCode: form.countryCode,
        locationBand: form.locationBand,
        ingredientTracking: form.ingredientTracking,
      });
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <img src="/marketing/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className={step === 0 ? "text-blue-600" : "text-green-600"}>1. Business</span>
            <span className="text-slate-300">→</span>
            <span className={step === 1 ? "text-blue-600" : ""}>2. Your setup</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {step === 0 ? "Set up your business" : "How do you want to run things?"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === 0
              ? "Quick details so we can open your till — you can change everything later in Settings."
              : "Choose what fits today. Stock and recipes stay off until you turn them on."}
          </p>
        </div>

        {step === 0 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Café Central"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="countryCode">Country</Label>
                <Select value={form.countryCode} onValueChange={(value) => update({ countryCode: value })}>
                  <SelectTrigger id="countryCode" className="mt-1 w-full">
                    <SelectValue placeholder="Select country…" />
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
              <details className="rounded-lg border border-slate-200 p-3 text-sm">
                <summary className="cursor-pointer font-medium text-slate-700">Optional details</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="userName">Your name</Label>
                    <Input
                      id="userName"
                      value={form.userName}
                      onChange={(e) => update({ userName: e.target.value })}
                      placeholder="Owner or manager name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Industry</Label>
                    <Select value={form.businessType || "__none__"} onValueChange={(value) => update({ businessType: value === "__none__" ? "" : value })}>
                      <SelectTrigger id="businessType" className="mt-1 w-full">
                        <SelectValue placeholder="Select type…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Select type…</SelectItem>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </details>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (!form.name.trim()) return toast.error("Business name is required");
                  setStep(1);
                }}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div>
                <p className="text-sm font-medium text-slate-700">How many locations?</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {locationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update({ locationBand: opt.value })}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        form.locationBand === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <MapPin className="mb-1 h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Track ingredients and stock?</p>
                <div className="mt-2 space-y-2">
                  {ingredientOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                        form.ingredientTracking === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ingredientTracking"
                        checked={form.ingredientTracking === opt.value}
                        onChange={() => update({ ingredientTracking: opt.value })}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-medium">Your profile:</span> {BUSINESS_PROFILE_LABELS[profile]}
                <p className="mt-1 text-xs text-slate-500">
                  Billing and plans are in Settings anytime — no plan choice required now.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={pending}
                  onClick={handleFinish}
                >
                  {pending ? "Opening your till…" : "Open my till"}
                  {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
