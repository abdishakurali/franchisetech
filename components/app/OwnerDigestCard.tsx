"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/app/FormSelect";
import { saveOwnerDigestSettings } from "@/app/actions/owner-digest";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";

export type OwnerDigestInitial = {
  enabled: boolean;
  frequency: "off" | "daily" | "weekly";
  dayOfWeek: number;
  timeOfDay: string;
  timezone: string;
  recipients: string[];
};

export type OwnerDigestTeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  locale: AppLocale;
  canEdit: boolean;
  ownerEmail: string;
  initial: OwnerDigestInitial;
  teamMembers: OwnerDigestTeamMember[];
};

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export function OwnerDigestCard({
  locale,
  canEdit,
  ownerEmail,
  initial,
  teamMembers,
}: Props) {
  const t = getAppText(locale).settings.notifications;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [testLoading, setTestLoading] = useState(false);
  const [digestEnabled, setDigestEnabled] = useState(initial.enabled);
  const [frequency, setFrequency] = useState(initial.frequency);

  const formKey = `${initial.enabled}-${initial.frequency}-${initial.dayOfWeek}-${initial.timeOfDay}`;

  const selectedRecipients = new Set(
    (initial.recipients.length ? initial.recipients : [ownerEmail])
      .map((email) => email.toLowerCase())
  );

  const dayOptions = DAY_KEYS.map((key, i) => ({
    value: String(i + 1),
    label: t[key],
  }));

  const handleSave = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveOwnerDigestSettings(formData);
      if (!result.ok) {
        toast.error(t.couldNotSave);
        return;
      }
      toast.success(t.saved);
      router.refresh();
    });
  };

  const handleTest = async () => {
    setTestLoading(true);
    try {
      const checkedRecipient = document.querySelector<HTMLInputElement>(
        "input[name='owner_digest_recipients']:checked"
      );
      const testTo = checkedRecipient?.value ?? ownerEmail;

      const res = await fetch("/api/owner-digest/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testTo }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? t.testFailed);
        return;
      }
      toast.success(t.testSent);
    } catch {
      toast.error(t.testFailed);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {canEdit ? (
          <form key={formKey} action={handleSave} className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="owner_digest_enabled"
                checked={digestEnabled}
                onChange={(e) => {
                  const on = e.target.checked;
                  setDigestEnabled(on);
                  if (on && frequency === "off") {
                    setFrequency("daily");
                  }
                }}
                className="h-4 w-4 rounded border-slate-300"
              />
              {t.enabled}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="owner_digest_frequency">{t.frequency}</Label>
                <FormSelect
                  name="owner_digest_frequency"
                  defaultValue={frequency}
                  className="mt-1"
                  onValueChange={(value) => {
                    const next =
                      value === "daily" || value === "weekly" ? value : "off";
                    setFrequency(next);
                    if (next !== "off") {
                      setDigestEnabled(true);
                    } else {
                      setDigestEnabled(false);
                    }
                  }}
                  options={[
                    { value: "off", label: t.frequencyOff },
                    { value: "daily", label: t.frequencyDaily },
                    { value: "weekly", label: t.frequencyWeekly },
                  ]}
                />
              </div>
              {frequency === "weekly" ? (
                <div>
                  <Label htmlFor="owner_digest_day_of_week">{t.dayOfWeek}</Label>
                  <FormSelect
                    name="owner_digest_day_of_week"
                    defaultValue={String(initial.dayOfWeek)}
                    className="mt-1"
                    options={dayOptions}
                  />
                  <p className="mt-1 text-xs text-slate-500">{t.dayOfWeekHint}</p>
                </div>
              ) : (
                <>
                  <input type="hidden" name="owner_digest_day_of_week" value={String(initial.dayOfWeek)} />
                  {frequency === "daily" && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                      {t.dailyPeriodHint}
                    </div>
                  )}
                </>
              )}
              <div>
                <Label htmlFor="owner_digest_time_of_day">{t.timeOfDay}</Label>
                <Input
                  id="owner_digest_time_of_day"
                  name="owner_digest_time_of_day"
                  type="time"
                  defaultValue={initial.timeOfDay}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="owner_digest_timezone">{t.timezone}</Label>
                <Input
                  id="owner_digest_timezone"
                  name="owner_digest_timezone"
                  defaultValue={initial.timezone}
                  className="mt-1"
                  placeholder="Europe/Bucharest"
                />
              </div>
            </div>

            <div>
              <Label>{t.recipients}</Label>
              <p className="text-xs text-slate-500 mt-0.5 mb-1">
                {t.recipientsHint}
              </p>
              <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {teamMembers.map((member) => (
                  <label key={member.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      name="owner_digest_recipients"
                      value={member.email}
                      defaultChecked={selectedRecipients.has(member.email.toLowerCase())}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-slate-900">{member.name || member.email}</span>
                      <span className="block truncate text-xs text-slate-500">{member.email} · {member.role}</span>
                    </span>
                  </label>
                ))}
                {teamMembers.length === 0 && (
                  <p className="px-3 py-3 text-sm text-slate-500">{ownerEmail}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? t.saving : t.save}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={testLoading}
              >
                {testLoading ? t.sendingTest : t.sendTest}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            {initial.enabled
              ? `${t.frequency}: ${
                  initial.frequency === "daily"
                    ? t.frequencyDaily
                    : initial.frequency === "weekly"
                      ? t.frequencyWeekly
                      : t.frequencyOff
                }`
              : t.frequencyOff}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
