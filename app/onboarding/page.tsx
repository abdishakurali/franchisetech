"use client";

import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, Store, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { completePosOnboarding } from "@/app/actions/onboarding";
import {
  deriveBusinessProfile,
  recommendedPlanForProfile,
  BUSINESS_PROFILE_LABELS,
  type IngredientTrackingIntent,
  type LocationBand,
} from "@/lib/business-profile";
import { pricingPlans } from "@/lib/billing/plans";

const steps = ["Business", "Size", "Plan", "Quick setup", "Start"];

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
    seedSampleCategory: true,
  });

  const profile = deriveBusinessProfile({
    locationBand: form.locationBand,
    ingredientTracking: form.ingredientTracking,
  });
  const recommendedPlan = recommendedPlanForProfile(profile);
  const planDef = pricingPlans.find((p) => p.id === recommendedPlan);

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
        seedSampleCategory: form.seedSampleCategory,
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
          <img src="/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-950">Set up your business</h1>
          <p className="mt-1 text-sm text-slate-500">
            A short quiz so we show the right tools — POS first, stock and recipes when you need them.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map((label, index) => (
              <span
                key={label}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  index === step
                    ? "bg-blue-600 text-white"
                    : index < step
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
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
                <select
                  id="businessType"
                  value={form.businessType}
                  onChange={(e) => update({ businessType: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">Select type…</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="countryCode">Country</Label>
                <select
                  id="countryCode"
                  value={form.countryCode}
                  onChange={(e) => update({ countryCode: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  {countryOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (!form.name.trim()) return toast.error("Business name is required");
                  if (!form.userName.trim()) return toast.error("Your name is required");
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
                <span className="font-medium">Your profile:</span>{" "}
                {BUSINESS_PROFILE_LABELS[profile]}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep(2)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">Recommended plan for your setup</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{planDef?.name ?? recommendedPlan}</p>
                <p className="mt-1 text-sm text-slate-600">{planDef?.description}</p>
                <p className="mt-2 text-lg font-bold text-blue-700">
                  {planDef?.price}{planDef?.cadence}
                </p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {(planDef?.features ?? []).slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                You start on a free trial. Choose a plan later from Billing — no checkout now.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm text-slate-600">
                We will add Cash and Card payment methods automatically. Optionally seed a starter category.
              </p>
              <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={form.seedSampleCategory}
                  onChange={(e) => update({ seedSampleCategory: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium">Add a &quot;General&quot; product category</p>
                  <p className="text-xs text-slate-500">Saves one step when you add your first products.</p>
                </div>
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep(4)}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3 text-center">
                  <Store className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                  <p className="text-xs font-medium">{BUSINESS_PROFILE_LABELS[profile]}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Building2 className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                  <p className="text-xs font-medium">{planDef?.name ?? "Trial"}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                  <p className="text-xs font-medium">POS-first setup guide</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Next: add products, open the till, and make your first sale. Stock and recipes stay hidden until you enable them.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} disabled={pending}>Back</Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={pending}
                  onClick={handleFinish}
                >
                  {pending ? "Creating workspace…" : "Go to setup guide"}
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
