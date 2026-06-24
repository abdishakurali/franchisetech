import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addProduct, ensurePosDefaults } from "@/app/actions/kitchenops";
import { ImageUploadField } from "@/components/app/ImageUploadField";
import { ProductVatField } from "@/components/app/ProductVatField";
import { SearchableSelect } from "@/components/app/SearchableSelect";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { productModuleVisibility } from "@/lib/product-module-fields";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { listOperationalUnitNames } from "@/lib/units-of-measure";
import { KITCHEN_STATIONS } from "@/lib/kitchen-stations";

export default async function ProductsNewPage({ searchParams }: { searchParams?: Promise<{ type?: string }> }) {
  const { supabase, orgId, membership, currency, countryCode, profileLocale } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const pf = t.productsForm;
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as { kitchen_stations_enabled?: boolean | null } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);
  await ensurePosDefaults();

  const params = await searchParams;
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const visibility = productModuleVisibility(moduleFlags);
  const wantsIngredient = params?.type === "ingredient";
  const defaultIngredient = wantsIngredient && (visibility.inventory || visibility.recipeCosting);

  if (wantsIngredient && !defaultIngredient) redirect("/app/products/new");

  const [{ data: inventoryCategories }, { data: posCategories }, units, { data: suppliers }, vatRates] = await Promise.all([
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).eq("category_type", "inventory").order("name"),
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).eq("category_type", "pos").order("name"),
    listOperationalUnitNames(supabase, orgId),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    listActiveVatRates(supabase, orgId),
  ]);

  const defaultVatRate = getDefaultVatRateValue(vatRates);
  const categoryOptions = (inventoryCategories ?? []).map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }));
  const posCategoryOptions = (posCategories ?? []).map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }));
  const unitOptions = units.map((u) => ({ value: u, label: u }));
  const supplierOptions = (suppliers ?? []).map((s: { id: string; name: string }) => ({ value: s.id, label: s.name }));
  const stationOptions = KITCHEN_STATIONS.map((s) => ({ value: s.value, label: s.label }));
  const sym = currency === "RON" ? "lei" : currency === "GBP" ? "£" : "€";

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/products" className="text-sm text-slate-500 hover:text-slate-700">← {pf.backToProducts}</Link>
        <h1 className="text-2xl font-semibold text-slate-950">
          {defaultIngredient ? pf.addIngredient : pf.addProduct}
        </h1>
      </div>

      <form action={addProduct as unknown as (fd: FormData) => Promise<void>} className="space-y-5" encType="multipart/form-data">
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-start">
              <ImageUploadField inputName="image_file" />
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{pf.basics}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>{pf.productName} *</Label>
                    <Input
                      name="name"
                      required
                      placeholder={defaultIngredient ? "e.g. Chicken, Cos Lettuce, Caesar Dressing" : "e.g. Americano, Chicken Caesar"}
                      autoFocus
                      className="mt-1.5 h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>{pf.category}</Label>
                      <Link href="/app/settings?tab=products" className="text-xs text-blue-600 hover:underline">{pf.manageCategories}</Link>
                    </div>
                    <SearchableSelect name="category_id" options={categoryOptions} placeholder={pf.none} searchPlaceholder={pf.category} className="mt-1.5" />
                  </div>
                  {posCategoryOptions.length > 0 && (
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>{pf.posCategory}</Label>
                        <Link href="/app/settings?tab=products" className="text-xs text-blue-600 hover:underline">{pf.manageCategories}</Link>
                      </div>
                      <SearchableSelect name="pos_category_id" options={posCategoryOptions} placeholder={pf.none} searchPlaceholder={pf.posCategory} className="mt-1.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{pf.pricing}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>{pf.salePrice(sym)}{defaultIngredient ? "" : " *"}</Label>
                <Input name="sale_price" type="number" step="0.01" min="0" placeholder="0.00" className="mt-1.5" />
              </div>
              <div>
                <Label>{pf.costPrice(sym)}{defaultIngredient ? " *" : ""}</Label>
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

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{pf.options}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <input type="checkbox" name="available_in_pos" value="on" defaultChecked={!defaultIngredient} className="mt-0.5 h-4 w-4 accent-blue-600" />
                <span>
                  <span className="block text-sm font-medium text-slate-900">{pf.sellOnPos}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{pf.sellOnPosHint}</span>
                </span>
              </label>

              {visibility.recipeCosting && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" name="is_ingredient" value="on" defaultChecked={defaultIngredient} className="mt-0.5 h-4 w-4 accent-blue-600" />
                  {visibility.inventory && <input type="hidden" name="is_stock_tracked" value="off" />}
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{visibility.inventory ? pf.stockIngredient : pf.recipeIngredient}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{visibility.inventory ? pf.stockHint : pf.ingredientHint}</span>
                  </span>
                </label>
              )}

              {visibility.inventory && !visibility.recipeCosting && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" name="is_stock_tracked" value="on" defaultChecked={defaultIngredient} className="mt-0.5 h-4 w-4 accent-blue-600" />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{pf.stock}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{pf.stockHint}</span>
                  </span>
                </label>
              )}

              {visibility.inventory && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" name="is_purchaseable" value="on" defaultChecked={defaultIngredient} className="mt-0.5 h-4 w-4 accent-green-600" />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{pf.purchase}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{pf.purchaseHint}</span>
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

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{pf.advanced}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{pf.skuOptional}</Label>
                <Input name="sku" placeholder="e.g. CHK-001" className="mt-1.5" />
              </div>
              {(suppliers ?? []).length > 0 && visibility.inventory && (
                <div>
                  <Label>{pf.supplierOptional}</Label>
                  <SearchableSelect name="supplier_id" options={supplierOptions} placeholder={pf.none} searchPlaceholder={pf.supplierOptional} className="mt-1.5" />
                </div>
              )}
            </div>

            {kitchenStationsEnabled && (
              <div>
                <Label>{pf.kitchenStation}</Label>
                <SearchableSelect name="kitchen_station" options={stationOptions} placeholder="— all stations (default) —" searchPlaceholder={pf.kitchenStation} className="mt-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Link href="/app/products"><Button variant="outline" type="button">{t.common.cancel}</Button></Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            {defaultIngredient ? pf.addIngredient : pf.addProduct}
          </Button>
        </div>
      </form>
    </div>
  );
}
