"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/app/FormSelect";

const STATUS_OPTIONS = [
  { value: "all", label: "All recipes" },
  { value: "low-margin", label: "Low margin" },
  { value: "good-margin", label: "Good margin" },
  { value: "missing-cost", label: "Missing cost" },
];

type Props = {
  defaultQuery?: string;
  defaultStatus?: string;
};

export function RecipesFilterForm({ defaultQuery = "", defaultStatus = "all" }: Props) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
        <Input name="q" defaultValue={defaultQuery} placeholder="Search product, recipe, or ingredient" />
      </div>
      <div className="min-w-[180px]">
        <label className="mb-1 block text-xs font-medium text-slate-500">Filter</label>
        <FormSelect name="status" options={STATUS_OPTIONS} defaultValue={defaultStatus} />
      </div>
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}
