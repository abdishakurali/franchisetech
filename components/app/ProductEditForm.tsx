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
import type { OrgVatRate } from "@/lib/vat-rates";
import type { ProductModuleVisibility } from "@/lib/product-module-fields";
import { showProductTypeSection } from "@/lib/product-module-fields";
import { cn } from "@/lib/utils";
import { useAppI18n } from "@/lib/app-i18n-context";

const PLACEHOLDER_TYPES = ["coffee", "drink", "food", "snack", "ingredient", "other"];
const KITCHEN_STATIONS = [
  { value: "bar", label: "Bar" },
  { value: "starters", label: "Starters" },
  { value: "mains", label: "Mains" },
  { value: "vegetables", label: "Vegetables" },
  { value: "desserts", label: "Desserts" },
  { value: "cold_prep", label: "Cold Prep" },
  { value: "hot_kitchen", label: "Hot Kitchen" },
];

const selectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100";

type ProductRecord = {
  id: string;
  name: string;
  category_id: string | null;
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
  suppliers: { id: string; name: string }[];
  units: string[];
  vatRates: OrgVatRate[];
  visibility: ProductModuleVisibility;
  itemTypes: { value: string; label: string }[];
  kitchenStationsEnabled: boolean;
  currencySymbol: string;
};

function OptionToggle({
  name,
  title,
  description,
  defaultChecked,
  accent = "blue",
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
  accent?: "blue" | "green";
}) {
  const [on, setOn] = useState(defaultChecked);
  const activeRing = accent === "green" ? "border-green-300 bg-green-50/60" : "border-blue-300 bg-blue-50/60";
  const activeDot = accent === "green" ? "bg-green-600" : "bg-blue-600";

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        on ? activeRing : "border-slate-200 bg-white hover:border-slate-300",
      )}
    >
      <input
        type="checkbox"
        name={name}
        value="on"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          on ? activeDot : "bg-slate-200",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-white shadow transition-transform",
            on ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
    </label>
  );
}

export function ProductEditForm({
  product,
  categories,
  suppliers,
  units,
  vatRates,
  visibility,
  itemTypes,
  kitchenStationsEnabled,
  currencySymbol,
}: Props) {
  const router = useRouter();
  const { t: i18n } = useAppI18n();
  const pf = i18n.productsForm;
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

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
    itemType: pf.itemType,
    supplier: pf.supplier,
    saved: pf.saved,
    deleted: pf.deleted,
    deleteConfirm: pf.deleteConfirm,
    deleteBtn: pf.deleteBtn,
    finishedHint: pf.finishedHint,
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await updateProduct(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.saved);
      router.push(`/app/products/${product.id}`);
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
        toast.error(result.error);
        return;
      }
      toast.success(t.deleted);
      router.push("/app/products");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const showFinishedHint =
    visibility.inventory &&
    ((product.item_type === "finished_product") ||
      (!product.item_type && !product.is_ingredient));

  return (
    <div className="pb-24">
      <form ref={formRef} onSubmit={handleSave} className="space-y-5" encType="multipart/form-data">
        <input type="hidden" name="id" value={product.id} />

        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
              <ImageUploadField
                inputName="image_file"
                currentImageUrl={product.image_url}
                productName={product.name}
              />
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.basics}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="product-name">Product name *</Label>
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
                    <Label htmlFor="product-category">Category</Label>
                    <select
                      id="product-category"
                      name="category_id"
                      defaultValue={product.category_id ?? ""}
                      className={cn(selectClass, "mt-1.5")}
                    >
                      <option value="">— none —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.pricing}</p>
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
                <Label>VAT rate</Label>
                <div className="mt-1.5">
                  <ProductVatField rates={vatRates} defaultRate={Number(product.vat_rate ?? 0)} />
                </div>
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  name="unit_of_measure"
                  defaultValue={product.unit_of_measure ?? "each"}
                  className={cn(selectClass, "mt-1.5")}
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.options}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionToggle
                name="available_in_pos"
                title={t.pos}
                description={t.posHint}
                defaultChecked={product.available_in_pos !== false}
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

            {showProductTypeSection(visibility) && itemTypes.length > 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="item-type">{t.itemType}</Label>
                  <select
                    id="item-type"
                    name="item_type"
                    defaultValue={product.item_type ?? (product.is_ingredient ? "ingredient" : "finished_product")}
                    className={cn(selectClass, "mt-1.5 max-w-xs")}
                  >
                    {itemTypes.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {showFinishedHint && (
                    <p className="mt-1.5 text-xs text-amber-700">{t.finishedHint}</p>
                  )}
                </div>
                {visibility.inventory && suppliers.length > 0 && (
                  <div>
                    <Label htmlFor="supplier">{t.supplier}</Label>
                    <select
                      id="supplier"
                      name="supplier_id"
                      defaultValue={product.supplier_id ?? ""}
                      className={cn(selectClass, "mt-1.5")}
                    >
                      <option value="">— none —</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl [&::-webkit-details-marker]:hidden">
            <span>{t.advanced}</span>
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-slate-100 px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" defaultValue={product.sku ?? ""} placeholder="optional" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="placeholder-type">Placeholder type</Label>
                <select
                  id="placeholder-type"
                  name="placeholder_type"
                  defaultValue={product.placeholder_type ?? ""}
                  className={cn(selectClass, "mt-1.5")}
                >
                  <option value="">— auto —</option>
                  {PLACEHOLDER_TYPES.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
            </div>
            {kitchenStationsEnabled && (
              <div>
                <Label htmlFor="kitchen-station">Kitchen station</Label>
                <select
                  id="kitchen-station"
                  name="kitchen_station"
                  defaultValue={product.kitchen_station ?? ""}
                  className={cn(selectClass, "mt-1.5 max-w-md")}
                >
                  <option value="">— all stations —</option>
                  {KITCHEN_STATIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </details>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
          <Link href={`/app/products/${product.id}`}>
            <Button variant="outline" type="button" disabled={saving}>
              {t.cancel}
            </Button>
          </Link>
          <Button
            type="button"
            disabled={saving}
            className="min-w-[8.5rem] bg-blue-600 hover:bg-blue-700 text-white"
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
          className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors"
        >
          {showDanger ? pf.hideDelete : pf.showDelete}
        </button>
        {showDanger && (
          <Card className="mt-3 border-red-200">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-slate-600">
                {pf.hideProductHint}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                className="border-red-300 text-red-700 hover:bg-red-50"
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
