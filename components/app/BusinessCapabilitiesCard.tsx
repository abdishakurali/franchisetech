"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CAPABILITY_CATEGORIES,
  getCapabilitySuggestions,
} from "@/lib/business-capabilities";
import {
  canUseModule,
  isModuleEnabled,
  moduleBlockReason,
  type OrgModuleRow,
} from "@/lib/business-modules";
import {
  BUSINESS_PROFILE_LABELS,
  normaliseBusinessProfile,
  type BusinessProfile,
} from "@/lib/business-profile";
import { profileLabel } from "@/lib/business-profile-i18n";
import type { RestaurantFeatureKey } from "@/lib/restaurant-features";
import type { BillingPlan } from "@/lib/billing/plans";
import { FormSelect } from "@/components/app/FormSelect";
import { FormCheckbox } from "@/components/app/FormCheckbox";

const PROFILE_OPTIONS: { value: BusinessProfile; label: string }[] = [
  { value: "simple", label: BUSINESS_PROFILE_LABELS.simple },
  { value: "standard", label: BUSINESS_PROFILE_LABELS.standard },
  { value: "multi_site", label: BUSINESS_PROFILE_LABELS.multi_site },
];

type FeatureValues = Partial<Record<RestaurantFeatureKey, boolean>>;

type Props = {
  industry: string | null | undefined;
  org: OrgModuleRow & { business_profile?: string | null };
  featureValues: FeatureValues;
  canEdit: boolean;
  subscriptionPlan: BillingPlan | null;
  hasTrial: boolean;
  locale?: string | null;
  lockedModule?: string | null;
  lockedMessage?: string | null;
  updateAction: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>;
};

export function BusinessCapabilitiesCard({
  industry,
  org,
  featureValues,
  canEdit,
  subscriptionPlan,
  hasTrial,
  locale,
  lockedModule,
  lockedMessage,
  updateAction,
}: Props) {
  const [pending, startTransition] = useTransition();
  const profile = normaliseBusinessProfile(org.business_profile);
  const suggestions = getCapabilitySuggestions({ industry, businessProfile: profile });
  const suggestionLabels = new Set(suggestions.map((s) => s.label));

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateAction(formData);
      if (result && "ok" in result && !result.ok) {
        toast.error(result.error ?? "Could not save options");
        return;
      }
      toast.success("Business options saved");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Features &amp; modules</CardTitle>
          <CardDescription>
            Choose what this business actually uses. Industry and business level only suggest helpful
            options — nothing turns on until an owner or manager enables it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lockedModule && lockedMessage ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">A module is locked</p>
              <p className="mt-1">{lockedMessage}</p>
              <Link href="/app/billing" className="mt-2 inline-block text-blue-700 hover:underline">
                View billing plans
              </Link>
            </div>
          ) : null}

          {suggestions.length > 0 ? (
            <div className="mb-5 flex gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p>
                <span className="font-medium">Suggested for your business:</span>{" "}
                {suggestions.map((s) => s.label).join(", ")}.
              </p>
            </div>
          ) : null}

          {canEdit ? (
            <form action={onSubmit} className="space-y-8" key={[
              org.inventory_enabled,
              org.recipe_costing_enabled,
              org.team_advanced_enabled,
              org.multi_site_ops_enabled,
              org.business_profile,
            ].join("-")}>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <label htmlFor="business_profile" className="text-sm font-medium text-slate-800">
                  Business level
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  Sets expectations and suggestions — you still choose each feature below.
                </p>
                <FormSelect
                  name="business_profile"
                  defaultValue={profile}
                  className="mt-2"
                  options={PROFILE_OPTIONS.map((opt) => ({
                    value: opt.value,
                    label: locale === "ro" ? profileLabel(opt.value, "ro") : opt.label,
                  }))}
                />
              </div>

              {CAPABILITY_CATEGORIES.map((category) => (
                <section key={category.id} className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{category.title}</h3>
                    <p className="text-xs text-slate-500">{category.description}</p>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((item) => {
                      const isSuggested = suggestionLabels.has(item.label);

                      if (item.kind === "module") {
                        const enabled = isModuleEnabled(org, item.moduleKey);
                        const allowed = canUseModule({
                          org: { ...org, [item.fieldName]: true },
                          module: item.moduleKey,
                          subscriptionPlan,
                          hasTrial,
                        });
                        const blockReason = moduleBlockReason({
                          org: { ...org, [item.fieldName]: true },
                          module: item.moduleKey,
                          subscriptionPlan,
                          hasTrial,
                        });
                        const toggleDisabled = !canEdit || (!enabled && !allowed);

                        return (
                          <div
                            key={item.id}
                            className={`flex items-start gap-3 rounded-lg border p-4 ${
                              allowed || !enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <FormCheckbox
                              name={item.fieldName}
                              defaultChecked={enabled}
                              disabled={toggleDisabled}
                              className="mt-1 h-5 w-5 rounded border-slate-300"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-slate-900">{item.label}</span>
                                {isSuggested ? <Badge variant="secondary">Suggested</Badge> : null}
                                {!allowed ? (
                                  <Badge variant="outline" className="gap-1 text-[10px]">
                                    <Lock className="h-3 w-3" /> Pro
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                              {!allowed && blockReason ? (
                                <p className="mt-1 text-xs text-amber-700">{blockReason}</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      }

                      const disabled = !canEdit || !item.ready;
                      return (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 ${
                            disabled ? "opacity-70" : ""
                          }`}
                        >
                          <FormCheckbox
                            name={item.fieldName}
                            defaultChecked={Boolean(featureValues[item.id])}
                            disabled={disabled}
                            className="mt-1 h-5 w-5 rounded border-slate-300"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-slate-900">{item.label}</span>
                              {isSuggested ? <Badge variant="secondary">Suggested</Badge> : null}
                              {!item.ready ? <Badge variant="outline">Coming later</Badge> : null}
                            </div>
                            <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <Button type="submit" disabled={!canEdit || pending}>
                  {pending ? "Saving…" : "Save options"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <p>
                <span className="text-slate-500">Business level:</span>{" "}
                <span className="font-medium">{profileLabel(profile, locale)}</span>
              </p>
              {CAPABILITY_CATEGORIES.map((category) => (
                <div key={category.id}>
                  <p className="font-medium text-slate-800">{category.title}</p>
                  <ul className="mt-1 space-y-0.5 text-slate-600">
                    {category.items.map((item) => {
                      const on =
                        item.kind === "module"
                          ? isModuleEnabled(org, item.moduleKey)
                          : Boolean(featureValues[item.id as RestaurantFeatureKey]);
                      return (
                        <li key={item.id}>
                          {item.label}: {on ? "On" : "Off"}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
