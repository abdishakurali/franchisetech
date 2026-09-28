"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProduct, updateProduct } from "@/app/actions/kitchenops";
import { ImageUploadField } from "@/components/app/ImageUploadField";
import { ProductVatField } from "@/components/app/ProductVatField";
import { SearchableSelect } from "@/components/app/SearchableSelect";
import type { OrgVatRate } from "@/lib/vat-rates";
import type { ProductModuleVisibility } from "@/lib/product-module-fields";
import { cn } from "@/lib/utils";
import { useAppI18n } from "@/lib/app-i18n-context";
import { KITCHEN_STATIONS } from "@/lib/kitchen-stations";
import { unitLabel } from "@/lib/units-of-measure";

type ProductRecord = {
  id: string;
  name: string;
  category_id: string | null;
  pos_category_id?: string | null;
  sale_price: number | null;
  cost_price: number | null;
  vat_rate: number | null;
  unit_of_measure: string | null;
  placeholder_type: string | null;
  sku: string | null;
  image_url: string | null;
  available_in_pos: boolean | null;
  is_stock_tracked: boolean | null;
  is_ingredient: boolean | null;
  is_purchaseable?: boolean | null;
  item_type?: string | null;
  supplier_id: string | null;
  kitchen_station: string | null;
};

type Props = {
  product: ProductRecord;
  categories: { id: string; name: string }[];
  posCategories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  units: string[];
  vatRates: OrgVatRate[];
  visibility: ProductModuleVisibility;
  kitchenStationsEnabled: boolean;
  currencySymbol: string;
  returnTo?: string;
};

function OptionToggle({
  name,
  title,
  description,
  defaultChecked,
  accent = "blue",
  onChange,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
  accent?: "blue" | "green";
  onChange?: (on: boolean) => void;
}) {
  const [on, setOn] = useState(defaultChecked);
  const activeRing = accent === "green" ? "border-reconciled/30 bg-reconciled/15" : "border-brass/40 bg-accent/60";
  const activeDot = accent === "green" ? "bg-green-600" : "bg-brass";

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        on ? activeRing : "border-border bg-card hover:border-border",
      )}
    >
      <input
        type="checkbox"
        name={name}
        value="on"
        checked={on}
        onChange={(e) => { setOn(e.target.checked); onChange?.(e.target.checked); }}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          on ? activeDot : "bg-secondary",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-card shadow transition-transform",
            on ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

export function ProductEditForm({
  product,
  categories,
  posCategories,
  suppliers,
  units,
  vatRates,
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
  const [deleting, setDeleting] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [availableInPos, setAvailableInPos] = useState(product.available_in_pos !== false);
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const posCategoryOptions = posCategories.map((c) => ({ value: c.id, label: c.name }));
  const unitOptions = units.map((u) => ({ value: u, label: unitLabel(u, locale) }));
  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }));
  const stationOptions = KITCHEN_STATIONS.map((s) => ({ value: s.value, label: s.label }));

  const t = {
    basics: pf.basics,
    pricing: pf.pricing,
    options: pf.options,
    advanced: pf.advanced,
    salePrice: pf.salePrice(currencySymbol),
    costPrice: pf.costPrice(currencySymbol),
    save: pf.save,
    saving: pf.saving,
    cancel: i18n.common.cancel,
    pos: pf.pos,
    posHint: pf.posHint,
    stock: pf.stock,
    stockHint: pf.stockHint,
    ingredient: pf.ingredient,
    ingredientHint: pf.ingredientHint,
    purchase: pf.purchase,
    purchaseHint: pf.purchaseHint,
    supplier: pf.supplier,
    saved: pf.saved,
    deleted: pf.deleted,
    deleteConfirm: pf.deleteConfirm,
    deleteBtn: pf.deleteBtn,
    finishedHint: pf.finishedHint,
    posCategory: pf.posCategory,
    manageCategories: pf.manageCategories,
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await updateProduct(fd);
      if (!result.ok) {
        // updateProduct forwards the bare EntitlementDeniedError code, not a
        // message — showing it verbatim left the owner staring at
        // "entitlement_denied" with no idea their plan was the cause.
        toast.error(
          result.error === "entitlement_denied"
            ? locale === "ro"
              ? "Acțiune indisponibilă pentru planul curent. Faceți upgrade pentru a continua."
              : "This action isn't available on your current plan. Upgrade to continue."
            : result.error,
        );
        return;
      }
      toast.success(t.saved);
      router.push(returnTo || `/app/products/${product.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    if (!window.confirm(t.deleteConfirm)) return;
    setDeleting(true);
    try {
      const fd = new FormData();
      fd.set("id", product.id);
      const result = await deleteProduct(fd);
      if (!result.ok) {
        toast.error(
          result.error === "entitlement_denied"
            ? locale === "ro"
              ? "Acțiune indisponibilă pentru planul curent. Faceți upgrade pentru a continua."
              : "This action isn't available on your current plan. Upgrade to continue."
            : result.error,
        );
        return;
      }
      toast.success(t.deleted);
      router.push("/app/products");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="pb-24">
      <form ref={formRef} onSubmit={handleSave} className="space-y-5" encType="multipart/form-data">
        <input type="hidden" name="id" value={product.id} />

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
              <ImageUploadField
                inputName="image_file"
                currentImageUrl={product.image_url}
                productName={product.name}
              />
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.basics}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="product-name">{pf.productName} *</Label>
                    <Input
                      id="product-name"
                      name="name"
                      required
                      defaultValue={product.name}
                      className="mt-1.5 h-11 text-base"
                      autoFocus
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="product-category">{pf.category}</Label>
                      <Link href="/app/settings?tab=products" className="text-xs text-brass hover:underline">{t.manageCategories}</Link>
                    </div>
                    <SearchableSelect name="category_id" options={categoryOptions} defaultValue={product.category_id} placeholder={pf.none} searchPlaceholder={pf.category} className="mt-1.5" />
                  </div>
                  {availableInPos && (
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>{t.posCategory}</Label>
                        <Link href="/app/settings?tab=products" className="text-xs text-brass hover:underline">{t.manageCategories}</Link>
                      </div>
                      <SearchableSelect name="pos_category_id" options={posCategoryOptions} defaultValue={product.pos_category_id ?? null} placeholder={pf.none} searchPlaceholder={t.posCategory} className="mt-1.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.pricing}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="sale-price">{t.salePrice}</Label>
                <Input
                  id="sale-price"
                  name="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={Number(product.sale_price ?? 0)}
                  className="mt-1.5 tabular-nums"
                />
              </div>
              <div>
                <Label htmlFor="cost-price">{t.costPrice}</Label>
                <Input
                  id="cost-price"
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.cost_price ? Number(product.cost_price) : ""}
                  placeholder="0.00"
                  className="mt-1.5 tabular-nums"
                />
              </div>
              <div>
                <Label>{pf.vatRate}</Label>
                <div className="mt-1.5">
                  <ProductVatField rates={vatRates} defaultRate={Number(product.vat_rate ?? 0)} />
                </div>
              </div>
              <div>
                <Label htmlFor="unit">{pf.unit}</Label>
                <SearchableSelect name="unit_of_measure" options={unitOptions} defaultValue={product.unit_of_measure ?? "each"} required searchPlaceholder={pf.unit} className="mt-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.options}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionToggle
                name="available_in_pos"
                title={t.pos}
                description={t.posHint}
                defaultChecked={product.available_in_pos !== false}
                onChange={setAvailableInPos}
              />
              {visibility.inventory && (
                <OptionToggle
                  name="is_stock_tracked"
                  title={t.stock}
                  description={t.stockHint}
                  defaultChecked={!!product.is_stock_tracked}
                />
              )}
              {visibility.recipeCosting && (
                <OptionToggle
                  name="is_ingredient"
                  title={t.ingredient}
                  description={t.ingredientHint}
                  defaultChecked={!!product.is_ingredient}
                />
              )}
              {visibility.inventory && (
                <OptionToggle
                  name="is_purchaseable"
                  title={t.purchase}
                  description={t.purchaseHint}
                  defaultChecked={!!product.is_purchaseable || !!product.is_ingredient}
                  accent="green"
                />
              )}
            </div>

            {visibility.inventory && suppliers.length > 0 && (
              <div>
                <Label htmlFor="supplier">{t.supplier}</Label>
                <SearchableSelect name="supplier_id" options={supplierOptions} defaultValue={product.supplier_id} placeholder={pf.none} searchPlaceholder={t.supplier} className="mt-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        <details className="group rounded-xl border border-border bg-card shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-xl [&::-webkit-details-marker]:hidden">
            <span>{t.advanced}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-border px-4 py-4">
            <div>
              <Label htmlFor="sku">{pf.skuOptional}</Label>
              <Input id="sku" name="sku" defaultValue={product.sku ?? ""} className="mt-1.5 max-w-md" />
            </div>
            {kitchenStationsEnabled && (
              <div>
                <Label htmlFor="kitchen-station">{pf.kitchenStation}</Label>
                <SearchableSelect name="kitchen_station" options={stationOptions} defaultValue={product.kitchen_station} placeholder={pf.allStations} searchPlaceholder={pf.kitchenStation} className="mt-1.5 max-w-md" />
              </div>
            )}
          </div>
        </details>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
          <Link href={returnTo || `/app/products/${product.id}`}>
            <Button variant="outline" type="button" disabled={saving}>
              {t.cancel}
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
                {t.saving}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowDanger((v) => !v)}
          className="text-xs font-medium text-muted-foreground hover:text-attention transition-colors"
        >
          {showDanger ? pf.hideDelete : pf.showDelete}
        </button>
        {showDanger && (
          <Card className="mt-3 border-attention/25">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-mid">
                {pf.hideProductHint}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                className="border-attention/40 text-attention hover:bg-attention/10"
                onClick={handleDelete}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {t.deleteBtn}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
