"use client";

import Link from "next/link";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BUSINESS_MODULE_DEFINITIONS,
  canUseModule,
  isModuleEnabled,
  moduleBlockReason,
  type OrgModuleRow,
} from "@/lib/business-modules";
import { BUSINESS_PROFILE_LABELS, normaliseBusinessProfile, type BusinessProfile } from "@/lib/business-profile";
import { profileLabel } from "@/lib/business-profile-i18n";
import type { BillingPlan } from "@/lib/billing/plans";
import type { BusinessModuleKey } from "@/lib/billing/entitlements";

type Props = {
  org: OrgModuleRow & { business_profile?: string | null };
  canEdit: boolean;
  subscriptionPlan: BillingPlan | null;
  hasTrial: boolean;
  locale?: string | null;
  lockedModule?: string | null;
  lockedMessage?: string | null;
  updateAction: (formData: FormData) => Promise<void>;
};

const PROFILE_OPTIONS: { value: BusinessProfile; label: string }[] = [
  { value: "simple", label: BUSINESS_PROFILE_LABELS.simple },
  { value: "standard", label: BUSINESS_PROFILE_LABELS.standard },
  { value: "multi_site", label: BUSINESS_PROFILE_LABELS.multi_site },
];

const TOGGLE_MODULES: BusinessModuleKey[] = [
  "inventory",
  "recipe_costing",
  "team_advanced",
  "multi_site",
];

export function BusinessModulesCard({
  org,
  canEdit,
  subscriptionPlan,
  hasTrial,
  locale,
  lockedModule,
  lockedMessage,
  updateAction,
}: Props) {
  const profile = normaliseBusinessProfile(org.business_profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business level &amp; modules</CardTitle>
        <CardDescription>
          Choose how complex your setup is. Modules you turn off stay hidden in the menu — your data is kept.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {lockedModule && lockedMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Module locked</p>
            <p className="mt-1">{lockedMessage}</p>
            <Link href="/app/billing" className="mt-2 inline-block text-blue-700 hover:underline">
              View billing plans
            </Link>
          </div>
        ) : null}

        {canEdit ? (
          <form action={updateAction} className="space-y-6">
            <div>
              <label htmlFor="business_profile" className="text-sm font-medium text-slate-700">
                Business level
              </label>
              <select
                id="business_profile"
                name="business_profile"
                defaultValue={profile}
                className="mt-1 h-10 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {PROFILE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {locale === "ro" ? profileLabel(opt.value, "ro") : opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Changing level does not delete stock or recipe data. Turn modules off to simplify the menu.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Product modules</p>
              {TOGGLE_MODULES.map((moduleKey) => {
                const def = BUSINESS_MODULE_DEFINITIONS.find((d) => d.key === moduleKey);
                const fieldName = def?.settingsKey ?? "inventory_enabled";
                const enabled = isModuleEnabled(org, moduleKey);
                const allowed = canUseModule({
                  org: { ...org, [fieldName]: true },
                  module: moduleKey,
                  subscriptionPlan,
                  hasTrial,
                });
                const blockReason = moduleBlockReason({
                  org: { ...org, [fieldName]: true },
                  module: moduleKey,
                  subscriptionPlan,
                  hasTrial,
                });

                return (
                  <div
                    key={moduleKey}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      allowed ? "border-slate-200" : "border-slate-100 bg-slate-50 opacity-90"
                    }`}
                  >
                    <input type="hidden" name={fieldName} value="false" />
                    <input
                      type="checkbox"
                      name={fieldName}
                      value="true"
                      defaultChecked={enabled}
                      disabled={!allowed}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{def?.label}</span>
                        {!allowed ? (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Lock className="h-3 w-3" /> Pro
                          </Badge>
                        ) : enabled ? (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Unlock className="h-3 w-3" /> On
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500">{def?.description}</p>
                      {!allowed && blockReason ? (
                        <p className="mt-1 text-xs text-amber-700">{blockReason}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button type="submit" variant="outline">Save modules</Button>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Business level:</span>{" "}
              <span className="font-medium">{profileLabel(profile, locale)}</span>
            </p>
            {TOGGLE_MODULES.map((moduleKey) => {
              const def = BUSINESS_MODULE_DEFINITIONS.find((d) => d.key === moduleKey);
              return (
                <p key={moduleKey}>
                  <span className="text-slate-500">{def?.label}:</span>{" "}
                  <span className="font-medium">{isModuleEnabled(org, moduleKey) ? "On" : "Off"}</span>
                </p>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
