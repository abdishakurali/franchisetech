"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addProduct } from "@/app/actions/kitchenops";
import { ImageUploadField } from "@/components/app/ImageUploadField";
import { ProductVatField } from "@/components/app/ProductVatField";
import { SearchableSelect } from "@/components/app/SearchableSelect";
import type { OrgVatRate } from "@/lib/vat-rates";
import type { ProductModuleVisibility } from "@/lib/product-module-fields";
import { useAppI18n } from "@/lib/app-i18n-context";
import { KITCHEN_STATIONS } from "@/lib/kitchen-stations";
import { unitLabel } from "@/lib/units-of-measure";

type Props = {
  defaultIngredient: boolean;
  categories: { id: string; name: string }[];
  posCategories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  units: string[];
  vatRates: OrgVatRate[];
  defaultVatRate: number;
  visibility: ProductModuleVisibility;
  kitchenStationsEnabled: boolean;
  currencySymbol: string;
  returnTo?: string;
};

export function ProductAddForm({
  defaultIngredient,
  categories,
  posCategories,
  suppliers,
  units,
  vatRates,
  defaultVatRate,
  visibility,
  kitchenStationsEnabled,
  currencySymbol,
  returnTo,
}: Props) {
  const router = useRouter();
  const { t: i18n, locale } = useAppI18n();
  const pf = i18n.productsForm;
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const posCategoryOptions = posCategories.map((c) => ({ value: c.id, label: c.name }));
  const unitOptions = units.map((u) => ({ value: u, label: unitLabel(u, locale) }));
  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }));
  const stationOptions = KITCHEN_STATIONS.map((s) => ({ value: s.value, label: s.label }));

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await addProduct(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(pf.saved);
      router.push(returnTo || "/app/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSave} className="space-y-5" encType="multipart/form-data">
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
            <ImageUploadField inputName="image_file" />
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{pf.basics}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{pf.productName} *</Label>
                  <Input
                    name="name"
                    required
                    placeholder={defaultIngredient ? pf.ingredientNamePlaceholder : pf.namePlaceholder}
                    autoFocus
                    className="mt-1.5 h-11 text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>{pf.category}</Label>
                    <Link href="/app/settings?tab=products" className="text-xs text-brass hover:underline">{pf.manageCategories}</Link>
                  </div>
                  <SearchableSelect name="category_id" options={categoryOptions} placeholder={pf.none} searchPlaceholder={pf.category} className="mt-1.5" />
                </div>
                {posCategoryOptions.length > 0 && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>{pf.posCategory}</Label>
                      <Link href="/app/settings?tab=products" className="text-xs text-brass hover:underline">{pf.manageCategories}</Link>
                    </div>
                    <SearchableSelect name="pos_category_id" options={posCategoryOptions} placeholder={pf.none} searchPlaceholder={pf.posCategory} className="mt-1.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{pf.pricing}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>{pf.salePrice(currencySymbol)}{defaultIngredient ? "" : " *"}</Label>
              <Input name="sale_price" type="number" step="0.01" min="0" placeholder="0.00" className="mt-1.5" />
            </div>
            <div>
              <Label>{pf.costPrice(currencySymbol)}{defaultIngredient ? " *" : ""}</Label>
              <Input name="cost_price" type="number" step="0.0001" min="0" placeholder="0.0000" className="mt-1.5" />
            </div>
            <div>
              <Label>{pf.vatRate}</Label>
              <div className="mt-1.5">
                <ProductVatField rates={vatRates} defaultRate={defaultVatRate} />
              </div>
            </div>
            <div>
              <Label>{pf.unit} *</Label>
              <SearchableSelect name="unit_of_measure" options={unitOptions} defaultValue={defaultIngredient ? "g" : "each"} required searchPlaceholder={pf.unit} className="mt-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{pf.options}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
              <input type="checkbox" name="available_in_pos" value="on" defaultChecked={!defaultIngredient} className="mt-0.5 h-4 w-4 accent-brass" />
              <span>
                <span className="block text-sm font-medium text-foreground">{pf.sellOnPos}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{pf.sellOnPosHint}</span>
              </span>
            </label>

            {visibility.recipeCosting && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
                <input type="checkbox" name="is_ingredient" value="on" defaultChecked={defaultIngredient} className="mt-0.5 h-4 w-4 accent-brass" />
                {visibility.inventory && <input type="hidden" name="is_stock_tracked" value="off" />}
                <span>
                  <span className="block text-sm font-medium text-foreground">{visibility.inventory ? pf.stockIngredient : pf.recipeIngredient}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{visibility.inventory ? pf.stockHint : pf.ingredientHint}</span>
                </span>
              </label>
            )}

            {visibility.inventory && !visibility.recipeCosting && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
                <input type="checkbox" name="is_stock_tracked" value="on" defaultChecked={defaultIngredient} className="mt-0.5 h-4 w-4 accent-brass" />
                <span>
                  <span className="block text-sm font-medium text-foreground">{pf.stock}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{pf.stockHint}</span>
                </span>
              </label>
            )}

            {visibility.inventory && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
                <input type="checkbox" name="is_purchaseable" value="on" defaultChecked={defaultIngredient} className="mt-0.5 h-4 w-4 accent-green-600" />
                <span>
                  <span className="block text-sm font-medium text-foreground">{pf.purchase}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{pf.purchaseHint}</span>
                </span>
              </label>
            )}
          </div>

          {visibility.inventory && defaultIngredient && (
            <div>
              <Label>{pf.openingStock}</Label>
              <Input name="opening_stock" type="number" step="0.01" min="0" placeholder="0" className="mt-1.5 w-36" />
            </div>
          )}
        </CardContent>
      </Card>

      <details className="group rounded-xl border border-border bg-card shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-xl [&::-webkit-details-marker]:hidden">
          <span>{pf.advanced}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-border px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{pf.skuOptional}</Label>
              <Input name="sku" placeholder="e.g. CHK-001" className="mt-1.5" />
            </div>
            {suppliers.length > 0 && visibility.inventory && (
              <div>
                <Label>{pf.supplierOptional}</Label>
                <SearchableSelect name="supplier_id" options={supplierOptions} placeholder={pf.none} searchPlaceholder={pf.supplierOptional} className="mt-1.5" />
              </div>
            )}
          </div>

          {kitchenStationsEnabled && (
            <div>
              <Label>{pf.kitchenStation}</Label>
              <SearchableSelect name="kitchen_station" options={stationOptions} placeholder={pf.allStations} searchPlaceholder={pf.kitchenStation} className="mt-1.5" />
            </div>
          )}
        </div>
      </details>

      <div className="h-20" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
          <Link href={returnTo || "/app/products"}>
            <Button variant="outline" type="button" disabled={saving}>
              {i18n.common.cancel}
            </Button>
          </Link>
          <Button
            type="button"
            disabled={saving}
            className="min-w-[8.5rem] bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => formRef.current?.requestSubmit()}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {pf.saving}
              </>
            ) : (
              defaultIngredient ? pf.addIngredient : pf.addProduct
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
