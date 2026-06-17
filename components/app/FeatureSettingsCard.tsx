"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSuggestedFeaturesForCountry,
  getSuggestedFeaturesForIndustry,
  RESTAURANT_FEATURE_KEYS,
  RESTAURANT_FEATURES,
  type RestaurantFeatureKey,
} from "@/lib/restaurant-features";

type FeatureValues = Partial<Record<RestaurantFeatureKey, boolean>>;

export function FeatureSettingsCard({
  industry,
  countryCode,
  values,
  canEdit,
  action,
}: {
  industry: string | null | undefined;
  countryCode?: string | null;
  values: FeatureValues;
  canEdit: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const industrySuggestions = getSuggestedFeaturesForIndustry(industry);
  const countrySuggestions = getSuggestedFeaturesForCountry(countryCode);
  const suggestions = [...new Set([...industrySuggestions, ...countrySuggestions])];

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
      toast.success("Business options saved");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Optional features</CardTitle>
          <CardDescription>
            Choose what this business actually uses. Industry only suggests helpful options; nothing turns on until an owner or manager enables it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 && (
            <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              Useful for this business type: {suggestions.map((key) => RESTAURANT_FEATURES[key].label).join(", ")}.
            </div>
          )}
          <form action={onSubmit} className="space-y-3">
            {RESTAURANT_FEATURE_KEYS.map((key) => {
              const feature = RESTAURANT_FEATURES[key];
              const disabled = !canEdit || !feature.ready;
              const isSuggested = suggestions.includes(key);
              return (
                <label key={key} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{feature.label}</span>
                      {isSuggested && <Badge variant="secondary">Suggested</Badge>}
                      {!feature.ready && <Badge variant="outline">Coming later</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    name={key}
                    defaultChecked={Boolean(values[key])}
                    disabled={disabled}
                    className="mt-1 h-5 w-5 rounded border-slate-300"
                  />
                </label>
              );
            })}
            <div className="flex justify-end">
              <Button type="submit" disabled={!canEdit || pending}>
                {pending ? "Saving..." : "Save options"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
