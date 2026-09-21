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
import type { AppLocale } from "@/lib/app-i18n";
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
  "purchases",
  "recipe_costing",
  "team_advanced",
  "multi_site",
];

// BUSINESS_MODULE_DEFINITIONS (lib/business-modules.ts) is shared with
// non-UI code (module-guard, entitlements) and stays English-only — this is
// a local RO overlay, same pattern PricingPlansSection.tsx uses for its
// English-first shared data. All user-facing text must be Romanian per
// project convention; code/shared definitions stay in English.
const MODULE_LABELS_RO: Partial<Record<BusinessModuleKey, { label: string; description: string }>> = {
  inventory: { label: "Stoc", description: "Niveluri de stoc și numărători de inventar." },
  purchases: { label: "Achiziții", description: "Furnizori și recepție marfă (NIR)." },
  recipe_costing: { label: "Cost rețete", description: "Rețete, cost ingrediente și rapoarte de marjă." },
  team_advanced: { label: "Echipă & audit", description: "Roluri și permisiuni pentru echipă." },
  multi_site: { label: "Operațiuni multi-locație", description: "Mai multe locații și raportare centralizată." },
};

const UI_STRINGS = {
  en: {
    title: "Business level & modules",
    description: "Choose how complex your setup is. Modules you turn off stay hidden in the menu — your data is kept.",
    moduleLocked: "Module locked",
    viewBilling: "View billing plans",
    businessLevel: "Business level",
    businessLevelHint: "Changing level does not delete stock or recipe data. Turn modules off to simplify the menu.",
    productModules: "Product modules",
    save: "Save modules",
    on: "On",
    pro: "Pro",
  },
  ro: {
    title: "Nivel business & module",
    description: "Alege cât de complexă e configurația ta. Modulele dezactivate rămân ascunse din meniu — datele tale sunt păstrate.",
    moduleLocked: "Modul blocat",
    viewBilling: "Vezi planurile de facturare",
    businessLevel: "Nivel business",
    businessLevelHint: "Schimbarea nivelului nu șterge datele de stoc sau rețete. Dezactivează module pentru a simplifica meniul.",
    productModules: "Module produs",
    save: "Salvează modulele",
    on: "Activ",
    pro: "Pro",
  },
} as const;

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
  const uiLocale: AppLocale = locale === "ro" ? "ro" : "en";
  const s = UI_STRINGS[uiLocale];
  const profile = normaliseBusinessProfile(org.business_profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{s.title}</CardTitle>
        <CardDescription>{s.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {lockedModule && lockedMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">{s.moduleLocked}</p>
            <p className="mt-1">{lockedMessage}</p>
            <Link href="/app/billing" className="mt-2 inline-block text-brass hover:underline">
              {s.viewBilling}
            </Link>
          </div>
        ) : null}

        {canEdit ? (
          <form action={updateAction} className="space-y-6">
            <div>
              <label htmlFor="business_profile" className="text-sm font-medium text-foreground">
                {s.businessLevel}
              </label>
              <select
                id="business_profile"
                name="business_profile"
                defaultValue={profile}
                className="mt-1 h-10 w-full max-w-md rounded-md border border-border bg-card px-3 text-sm"
              >
                {PROFILE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {locale === "ro" ? profileLabel(opt.value, "ro") : opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">{s.businessLevelHint}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{s.productModules}</p>
              {TOGGLE_MODULES.map((moduleKey) => {
                const def = BUSINESS_MODULE_DEFINITIONS.find((d) => d.key === moduleKey);
                const localised = uiLocale === "ro" ? MODULE_LABELS_RO[moduleKey] : null;
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
                }, uiLocale);

                return (
                  <div
                    key={moduleKey}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      allowed ? "border-border" : "border-border bg-secondary opacity-90"
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
                        <span className="text-sm font-medium">{localised?.label ?? def?.label}</span>
                        {!allowed ? (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Lock className="h-3 w-3" /> {s.pro}
                          </Badge>
                        ) : enabled ? (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Unlock className="h-3 w-3" /> {s.on}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">{localised?.description ?? def?.description}</p>
                      {!allowed && blockReason ? (
                        <p className="mt-1 text-xs text-amber-700">{blockReason}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button type="submit" variant="outline">{s.save}</Button>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">{s.businessLevel}:</span>{" "}
              <span className="font-medium">{profileLabel(profile, locale)}</span>
            </p>
            {TOGGLE_MODULES.map((moduleKey) => {
              const def = BUSINESS_MODULE_DEFINITIONS.find((d) => d.key === moduleKey);
              const localised = uiLocale === "ro" ? MODULE_LABELS_RO[moduleKey] : null;
              return (
                <p key={moduleKey}>
                  <span className="text-muted-foreground">{localised?.label ?? def?.label}:</span>{" "}
                  <span className="font-medium">{isModuleEnabled(org, moduleKey) ? s.on : (uiLocale === "ro" ? "Inactiv" : "Off")}</span>
                </p>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
