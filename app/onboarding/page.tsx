"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, CheckCircle2, Plus, Thermometer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createOrganisationWithOwner } from "@/app/actions/onboarding";
import { saveReminderSchedules } from "@/app/actions/reminders";
import { targetRangeLabel, type AssetType } from "@/lib/temperature";

const steps = ["Business", "Units", "Reminders", "Start"];

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

const roles = ["Owner", "Manager", "Staff"];

const unitTypes = [
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "cold_room", label: "Cold Room" },
  { value: "chill_display", label: "Chill Display" },
  { value: "hot_hold", label: "Hot Hold" },
  { value: "other", label: "Other" },
];

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type UnitForm = { id: string; name: string; unitType: AssetType };

function newUnit(): UnitForm {
  return { id: crypto.randomUUID(), name: "", unitType: "fridge" };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [orgForm, setOrg] = useState({ name: "", businessType: "", userName: "", role: "Owner" });
  const [units, setUnits] = useState<UnitForm[]>([newUnit()]);

  // Reminder step state
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderRecipients, setReminderRecipients] = useState("");
  const [morningTime, setMorningTime] = useState("09:00");
  const [eveningTime, setEveningTime] = useState("17:00");
  const [reviewTime, setReviewTime] = useState("18:00");
  const [reminderDays, setReminderDays] = useState(ALL_DAYS);
  const [onboardingOrgId, setOnboardingOrgId] = useState<string | null>(null);

  const businessTypeLabel = orgForm.businessType || "Select type…";
  const roleLabel = orgForm.role;

  const updateUnit = (id: string, patch: Partial<UnitForm>) => {
    setUnits((current) => current.map((unit) => unit.id === id ? { ...unit, ...patch } : unit));
  };

  const removeUnit = (id: string) => {
    setUnits((current) => current.length === 1 ? current : current.filter((unit) => unit.id !== id));
  };

  const handleBusinessNext = () => {
    if (!orgForm.name.trim()) return toast.error("Business name is required");
    if (!orgForm.userName.trim()) return toast.error("Your name is required");
    setStep(1);
  };

  const handleUnitsNext = () => {
    if (units.some((unit) => !unit.name.trim())) return toast.error("Each unit needs a name");
    setStep(2);
  };

  const handleRemindersNext = async () => {
    // Save org first if not yet saved (we save here so reminders can reference the org)
    if (!onboardingOrgId) {
      setSaving(true);
      const result = await createOrganisationWithOwner({
        orgName: orgForm.name,
        businessType: orgForm.businessType || undefined,
        userName: orgForm.userName,
        assets: units.map((unit) => ({ name: unit.name, assetType: unit.unitType })),
      });
      setSaving(false);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      setOnboardingOrgId(result.organisationId ?? null);
    }

    if (remindersEnabled) {
      const recipients = reminderRecipients
        .split(/[,\n]/)
        .map((r) => r.trim())
        .filter(Boolean);

      if (!recipients.length) {
        toast.error("Add at least one recipient email, or skip reminders.");
        return;
      }

      const schedules = [
        { label: "Morning fridge/freezer check", time_of_day: morningTime },
        { label: "Evening fridge/freezer check", time_of_day: eveningTime },
        { label: "Manager daily review", time_of_day: reviewTime, reminder_type: "manager_review" as const },
      ].map((s) => ({
        reminder_type: (s.reminder_type ?? "temperature_check") as "temperature_check" | "manager_review",
        label: s.label,
        time_of_day: s.time_of_day,
        days_of_week: reminderDays,
        recipients,
        enabled: true,
      }));

      const saveResult = await saveReminderSchedules(schedules);
      if (saveResult.error) {
        toast.error(saveResult.error);
        return;
      }
    }

    setStep(3);
  };

  const handleFinish = async () => {
    // Org was already created in handleRemindersNext; just redirect
    router.push("/app/checks/new?tour=first-check");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Thermometer className="h-7 w-7 text-blue-600" />
          <span className="font-bold text-slate-900 text-xl">FridgeProof</span>
        </div>

        <div className="flex items-center justify-center mb-8 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block mr-2 ${i === step ? "text-blue-700" : i < step ? "text-green-700" : "text-slate-400"}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">About your business</h1>
                <p className="text-sm text-slate-500 mt-1">We create Main Kitchen automatically.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Business name *</Label>
                <Input data-tour="business-name" placeholder="Use the name on your food business records" value={orgForm.name} onChange={(e) => setOrg((f) => ({ ...f, name: e.target.value }))} />
                <p className="text-xs text-slate-500">Use the name shown on your food business records.</p>
              </div>
              <div className="space-y-1.5" data-tour="business-type">
                <Label>Business type</Label>
                <Select value={orgForm.businessType} onValueChange={(v) => setOrg((f) => ({ ...f, businessType: v }))}>
                  <SelectTrigger><span className="truncate">{businessTypeLabel}</span></SelectTrigger>
                  <SelectContent>{businessTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Your name *</Label>
                <Input data-tour="user-name" placeholder="e.g. Alex Murphy" value={orgForm.userName} onChange={(e) => setOrg((f) => ({ ...f, userName: e.target.value }))} />
              </div>
              <div className="space-y-1.5" data-tour="role-select">
                <Label>Your role</Label>
                <Select value={orgForm.role} onValueChange={(v) => setOrg((f) => ({ ...f, role: v }))}>
                  <SelectTrigger><span className="truncate">{roleLabel}</span></SelectTrigger>
                  <SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleBusinessNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">Continue <ArrowRight className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Add your first units</h1>
                <p className="text-sm text-slate-500 mt-1">Add 1 to 5 fridges, freezers, cold rooms, or hot-hold units.</p>
              </div>
              {units.map((unit, index) => {
                const typeLabel = unitTypes.find((type) => type.value === unit.unitType)?.label ?? "Fridge";
                return (
                  <div key={unit.id} className="rounded-lg border border-slate-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Unit {index + 1}</p>
                      {units.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeUnit(unit.id)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unit name *</Label>
                      <Input data-tour="unit-name" placeholder={index === 0 ? "Walk-in Cold Room" : "Fish Fridge"} value={unit.name} onChange={(e) => updateUnit(unit.id, { name: e.target.value })} />
                      <p className="text-xs text-slate-500">Example: Walk-in Cold Room, Fish Fridge, Main Freezer.</p>
                    </div>
                    <div className="space-y-1.5" data-tour="unit-type">
                      <Label>Unit type</Label>
                      <Select value={unit.unitType} onValueChange={(v) => updateUnit(unit.id, { unitType: v as AssetType })}>
                        <SelectTrigger><span className="truncate">{typeLabel}</span></SelectTrigger>
                        <SelectContent>{unitTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">Target range: {targetRangeLabel(unit.unitType)}</p>
                    </div>
                  </div>
                );
              })}
              <Button data-tour="add-unit" variant="outline" className="w-full gap-2" disabled={units.length >= 5} onClick={() => setUnits((current) => [...current, newUnit()])}>
                <Plus className="h-4 w-4" /> Add another unit
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUnitsNext}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h1 className="text-xl font-bold text-slate-900">Set reminder times</h1>
                </div>
                <p className="text-sm text-slate-500">
                  FridgeProof can email reminders so checks are not forgotten.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRemindersEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${remindersEnabled ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${remindersEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-medium text-slate-700">
                  {remindersEnabled ? "Email reminders on" : "Enable email reminders"}
                </span>
              </div>

              {remindersEnabled && (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label>Recipient emails</Label>
                    <Input
                      placeholder="chef@example.com, manager@example.com"
                      value={reminderRecipients}
                      onChange={(e) => setReminderRecipients(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Comma-separated. Defaults to your account email.</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Morning check</Label>
                      <Input type="time" value={morningTime} onChange={(e) => setMorningTime(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Evening check</Label>
                      <Input type="time" value={eveningTime} onChange={(e) => setEveningTime(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Manager review</Label>
                      <Input type="time" value={reviewTime} onChange={(e) => setReviewTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Days</Label>
                    <div className="flex gap-1 flex-wrap">
                      {ALL_DAYS.map((d, i) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() =>
                            setReminderDays((prev) =>
                              prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
                            )
                          }
                          className={`w-9 h-8 rounded text-xs font-medium border transition-colors ${
                            reminderDays.includes(d)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {DAY_LABELS[i]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  disabled={saving}
                  onClick={handleRemindersNext}
                >
                  {saving ? "Saving…" : remindersEnabled ? "Save & continue" : "Skip reminders"}
                  {!saving && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Start first check</h1>
                <p className="text-sm text-slate-500 mt-1">Start with one fridge. Add sensors later.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
                <p><span className="font-medium text-slate-900">Business:</span> {orgForm.name}</p>
                <p><span className="font-medium text-slate-900">Role:</span> {orgForm.role}</p>
                <p><span className="font-medium text-slate-900">Kitchen:</span> Main Kitchen</p>
                <p><span className="font-medium text-slate-900">Units:</span> {units.map((unit) => unit.name).join(", ")}</p>
                {remindersEnabled && <p><span className="font-medium text-slate-900">Reminders:</span> Set up ✓</p>}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button data-tour="start-first-check" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleFinish}>
                  Start first temperature check
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
