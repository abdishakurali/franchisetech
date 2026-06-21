import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addProduct, ensurePosDefaults } from "@/app/actions/kitchenops";
import { ImageUploadField } from "@/components/app/ImageUploadField";
import { ProductVatField } from "@/components/app/ProductVatField";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import {
  itemTypeSelectOptions,
  productModuleVisibility,
  showProductTypeSection,
} from "@/lib/product-module-fields";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
const DEFAULT_UNITS = ["each","portion","kg","g","litre","ml","cup","bottle","box","case","pack"];
const KITCHEN_STATIONS = [
  { value: "bar",         label: "Bar" },
  { value: "starters",   label: "Starters" },
  { value: "mains",      label: "Mains" },
  { value: "vegetables", label: "Vegetables" },
  { value: "desserts",   label: "Desserts" },
  { value: "cold_prep",  label: "Cold Prep" },
  { value: "hot_kitchen",label: "Hot Kitchen" },
];


export default async function ProductsNewPage({ searchParams }: { searchParams?: Promise<{ type?: string }> }) {
  const { supabase, orgId, membership, currency, countryCode } = await getKitchenOpsContext();
  const { locale, t } = await getAppLocaleAndText(countryCode);
  const pf = t.productsForm;
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as { kitchen_stations_enabled?: boolean | null } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);
  await ensurePosDefaults();

  const params = await searchParams;
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const visibility = productModuleVisibility(moduleFlags);
  const itemTypes = itemTypeSelectOptions(visibility, locale);
  const wantsIngredient = params?.type === "ingredient";
  const defaultIngredient = wantsIngredient && (visibility.inventory || visibility.recipeCosting);

  if (wantsIngredient && !defaultIngredient) {
    redirect("/app/products/new");
  }

  const [{ data: categories }, { data: units }, { data: suppliers }, vatRates] = await Promise.all([
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("units_of_measure").select("name").or(`organisation_id.eq.${orgId},organisation_id.is.null`).order("name").then(r => ({ data: r.data })),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    listActiveVatRates(supabase, orgId),
  ]);
  const defaultVatRate = getDefaultVatRateValue(vatRates);

  const allUnits = [...new Set([...DEFAULT_UNITS, ...((units ?? []).map((u: {name:string}) => u.name))])];
  const sym = currency === "RON" ? "lei" : currency === "GBP" ? "£" : "€";

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/products" className="text-sm text-slate-500 hover:text-slate-700">← {pf.backToProducts}</Link>
        <h1 className="text-2xl font-semibold text-slate-950">
          {defaultIngredient ? pf.addIngredient : pf.addProduct}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{defaultIngredient ? pf.newIngredient : pf.newProduct}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {defaultIngredient ? pf.newIngredientDesc : pf.newProductDesc}
          </p>
        </CardHeader>
        <CardContent>
          <form action={addProduct as unknown as (fd: FormData) => Promise<void>} className="space-y-5" encType="multipart/form-data">

            {/* Product image — at the top so staff can see what they are adding */}
            <div className="flex flex-col items-center pb-2">
              <ImageUploadField inputName="image_file" />
            </div>

            {/* Name + Category */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{pf.productName} *</Label>
                <Input
                  name="name"
                  required
                  placeholder={defaultIngredient ? "e.g. Chicken, Cos Lettuce, Caesar Dressing" : "e.g. Americano, Chicken Caesar"}
                  autoFocus
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{pf.category}</Label>
                <select name="category_id" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">{pf.none}</option>
                  {(categories ?? []).map((c: {id:string;name:string}) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Prices + VAT + Unit */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <Label>{pf.salePrice(sym)}{defaultIngredient ? "" : " *"}</Label>
                <Input name="sale_price" type="number" step="0.01" min="0" placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>{pf.costPrice(sym)}{defaultIngredient ? " *" : ""}</Label>
                <Input name="cost_price" type="number" step="0.0001" min="0" placeholder="0.0000" className="mt-1" />
              </div>
              <div>
                <Label>{pf.vatRate}</Label>
                <ProductVatField rates={vatRates} defaultRate={defaultVatRate} />
              </div>
              <div>
                <Label>{pf.unit} *</Label>
                <select name="unit_of_measure" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {allUnits.map((u) => <option key={u} selected={defaultIngredient && u === "g"}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Product type */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-800">{pf.whatIsProduct}</p>
              {showProductTypeSection(visibility) && (
                <p className="text-xs text-slate-500 -mt-2">{pf.typeBothHint}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="available_in_pos"
                  value="on"
                  defaultChecked={!defaultIngredient}
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700">{pf.sellOnPos}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{pf.sellOnPosHint}</p>
                </div>
              </label>

              {visibility.recipeCosting && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_ingredient"
                    value="on"
                    defaultChecked={defaultIngredient}
                    className="mt-0.5 h-4 w-4 accent-blue-600"
                  />
                  {visibility.inventory && <input type="hidden" name="is_stock_tracked" value="off" />}
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700">
                      {visibility.inventory ? pf.stockIngredient : pf.recipeIngredient}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {visibility.inventory ? pf.stockHint : pf.ingredientHint}
                    </p>
                  </div>
                </label>
              )}

              {visibility.inventory && !visibility.recipeCosting && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_stock_tracked"
                    value="on"
                    defaultChecked={defaultIngredient}
                    className="mt-0.5 h-4 w-4 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700">{pf.stock}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pf.stockHint}</p>
                  </div>
                </label>
              )}

              {visibility.inventory && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_purchaseable"
                    value="on"
                    defaultChecked={defaultIngredient}
                    className="mt-0.5 h-4 w-4 accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-green-700">{pf.purchase}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{pf.purchaseHint}</p>
                  </div>
                </label>
              )}

              {showProductTypeSection(visibility) && itemTypes.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{pf.itemType}</label>
                  <select name="item_type" defaultValue={defaultIngredient ? "ingredient" : "finished_product"} className="h-9 w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 text-sm">
                    {itemTypes.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">{pf.itemTypeHint}</p>
                  {!defaultIngredient && visibility.inventory && (
                    <p className="text-xs text-amber-700 mt-1">{pf.finishedHint}</p>
                  )}
                </div>
              )}

              {visibility.inventory && defaultIngredient && (
                <div className="ml-7 mt-1">
                  <Label>{pf.openingStock}</Label>
                  <Input
                    name="opening_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="mt-1 w-36"
                  />
                </div>
              )}
            </div>

            {/* SKU + Supplier */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>{pf.skuOptional}</Label>
                <Input name="sku" placeholder="e.g. CHK-001" className="mt-1" />
              </div>
              {(suppliers ?? []).length > 0 && visibility.inventory && (
                <div>
                  <Label>{pf.supplierOptional}</Label>
                  <select name="supplier_id" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    <option value="">{pf.none}</option>
                    {(suppliers ?? []).map((s: {id:string;name:string}) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>


            {/* Kitchen Station */}
            {kitchenStationsEnabled && (
              <div>
                <label className="text-sm font-medium leading-none">{pf.kitchenStation}</label>
                <select name="kitchen_station" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">— all stations (default) —</option>
                  {KITCHEN_STATIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Which kitchen monitor should show this item. Leave blank to show on all displays.
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Link href="/app/products"><Button variant="outline" type="button">{t.common.cancel}</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {defaultIngredient ? pf.addIngredient : pf.addProduct}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {defaultIngredient && visibility.recipeCosting && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">Ingredient cost examples</p>
          <div className="space-y-1 text-xs text-blue-700">
            <p>• Chicken at €12/kg → unit = <strong>g</strong>, cost = <strong>€0.012</strong></p>
            <p>• Cos Lettuce at €1.20/head → unit = <strong>head</strong>, cost = <strong>€1.20</strong></p>
            <p>• Caesar dressing at €10/litre → unit = <strong>ml</strong>, cost = <strong>€0.010</strong></p>
          </div>
          <p className="mt-2 text-blue-600">Recipe cost is calculated automatically from these values.</p>
        </div>
      )}
    </div>
  );
}
