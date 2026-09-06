"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/app/FormSelect";
import { useAppI18n } from "@/lib/app-i18n-context";

type Props = {
  defaultQuery?: string;
  defaultStatus?: string;
};

export function RecipesFilterForm({ defaultQuery = "", defaultStatus = "all" }: Props) {
  const { t } = useAppI18n();
  const r = t.recipes;
  const statusOptions = [
    { value: "all", label: r.filterAll },
    { value: "low-margin", label: r.filterLowMargin },
    { value: "good-margin", label: r.filterGoodMargin },
    { value: "missing-cost", label: r.filterMissingCost },
  ];

  return (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">{r.searchLabel}</label>
        <Input name="q" defaultValue={defaultQuery} placeholder={r.searchPlaceholder} />
      </div>
      <div className="min-w-[180px]">
        <label className="mb-1 block text-xs font-medium text-slate-500">{r.filterLabel}</label>
        <FormSelect name="status" options={statusOptions} defaultValue={defaultStatus} />
      </div>
      <Button type="submit" variant="outline">
        {r.apply}
      </Button>
    </form>
  );
}
