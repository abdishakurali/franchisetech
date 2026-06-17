import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addProduct, ensurePosDefaults } from "@/app/actions/kitchenops";
import { ImageUploadField } from "@/components/app/ImageUploadField";

const VAT_RATES = [0, 9, 13.5, 23];
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
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const isRO = currency === "RON";
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as { kitchen_stations_enabled?: boolean | null } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);
  await ensurePosDefaults();

  const params = await searchParams;
  const defaultIngredient = params?.type === "ingredient";

  const [{ data: categories }, { data: units }, { data: suppliers }] = await Promise.all([
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("units_of_measure").select("name").or(`organisation_id.eq.${orgId},organisation_id.is.null`).order("name").then(r => ({ data: r.data })),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
  ]);

  const allUnits = [...new Set([...DEFAULT_UNITS, ...((units ?? []).map((u: {name:string}) => u.name))])];

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/products" className="text-sm text-slate-500 hover:text-slate-700">← Products</Link>
        <h1 className="text-2xl font-semibold text-slate-950">
          {defaultIngredient ? "Add ingredient" : "Add product"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{defaultIngredient ? "New ingredient" : "New product"}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {defaultIngredient
              ? "Add items you buy and use in recipes, like milk, chicken, lettuce, or coffee beans."
              : "Add items you sell, like Americano, Smoothie, or Chicken Caesar."}
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
                <Label>Product name *</Label>
                <Input
                  name="name"
                  required
                  placeholder={defaultIngredient ? "e.g. Chicken, Cos Lettuce, Caesar Dressing" : "e.g. Americano, Chicken Caesar"}
                  autoFocus
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Example: Americano, Chicken Caesar, Banana Smoothie.</p>
              </div>
              <div>
                <Label>Category</Label>
                <select name="category_id" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">— none —</option>
                  {(categories ?? []).map((c: {id:string;name:string}) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Group similar items, like Drinks, Food, Snacks.</p>
              </div>
            </div>

            {/* Prices + VAT + Unit */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <Label>{defaultIngredient ? "Sale price (€)" : "Sale price (€) *"}</Label>
                <Input name="sale_price" type="number" step="0.01" min="0" placeholder="0.00" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">{defaultIngredient ? "Leave 0 if customers do not buy this directly." : "The price the customer pays."}</p>
              </div>
              <div>
                <Label>Cost price (€){defaultIngredient ? " *" : ""}</Label>
                <Input name="cost_price" type="number" step="0.0001" min="0" placeholder="0.0000" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">What one unit costs you. Used for margin.</p>
              </div>
              <div>
                <Label>VAT rate</Label>
                <select name="vat_rate" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
              <div>
                <Label>Unit *</Label>
                <select name="unit_of_measure" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {allUnits.map((u) => <option key={u} selected={defaultIngredient && u === "g"}>{u}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">How this item is measured, like each, g, kg, ml, litre, bottle.</p>
              </div>
            </div>

            {/* Product type — 2 clear checkboxes */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <p className="text-sm font-semibold text-slate-800">What is this product?</p>
              <p className="text-xs text-slate-500 -mt-2">You can select both — e.g. a soup base that is sold AND used as an ingredient.</p>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="available_in_pos"
                  value="on"
                  defaultChecked={!defaultIngredient}
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700">
                    {isRO ? "Se vinde la POS" : "Sell this item on POS"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRO ? "Activați dacă angajații trebuie să vândă acest articol la casă." : "Turn on if staff should be able to sell this."}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_ingredient"
                  value="on"
                  defaultChecked={defaultIngredient}
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                {/* When is_ingredient is checked we also want is_stock_tracked=on */}
                <input type="hidden" name="is_stock_tracked" value="off" />
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700">
                    {isRO ? "Urmărire stoc / ingredient" : "Track as ingredient / stock"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRO ? "Activați dacă cumpărați acest articol și doriți urmărirea stocului." : "Turn on if you buy this item and want stock tracked."}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_purchaseable"
                  value="on"
                  defaultChecked={defaultIngredient}
                  className="mt-0.5 h-4 w-4 accent-green-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900 group-hover:text-green-700">
                    {isRO ? "Poate fi cumpărat" : "Can be purchased"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRO
                      ? "Activați pentru mărfuri, ingrediente, consumabile și ambalaje — articole cumpărate de la furnizori. Apare la Înregistrează cumpărătură."
                      : "Turn on for goods, ingredients, supplies, and packaging — items you buy from suppliers. Appears in Record Purchase."}
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isRO ? "Tip articol" : "Item type"}
                </label>
                <select name="item_type" defaultValue={defaultIngredient ? "ingredient" : "finished_product"} className="h-9 w-full max-w-xs rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="finished_product">{isRO ? "Produs finit" : "Finished product"}</option>
                  <option value="ingredient">{isRO ? "Ingredient" : "Ingredient"}</option>
                  <option value="merchandise">{isRO ? "Marfă" : "Goods"}</option>
                  <option value="supply">{isRO ? "Consumabil" : "Supply"}</option>
                  <option value="packaging">{isRO ? "Ambalaj" : "Packaging"}</option>
                  <option value="raw_material">{isRO ? "Materie primă" : "Raw material"}</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {isRO ? "Separă produsele POS de articolele de inventar." : "Helps separate POS products from inventory items."}
                </p>
                {!defaultIngredient && (
                  <p className="text-xs text-amber-700 mt-1">
                    {isRO
                      ? "Produsele finite nu apar la Înregistrează cumpărătură decât dacă bifați «Poate fi cumpărat»."
                      : "Finished products won't appear in Record Purchase unless you check 'Can be purchased'."}
                  </p>
                )}
              </div>

              {/* Opening stock — shown for ingredient products */}
              {defaultIngredient && (
                <div className="ml-7 mt-1">
                  <Label>Opening stock (optional)</Label>
                  <Input
                    name="opening_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className="mt-1 w-36"
                  />
                  <p className="text-xs text-slate-500 mt-1">How much you currently have.</p>
                </div>
              )}
            </div>

            {/* SKU + Supplier */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>SKU (optional)</Label>
                <Input name="sku" placeholder="e.g. CHK-001" className="mt-1" />
              </div>
              {(suppliers ?? []).length > 0 && (
                <div>
                  <Label>Supplier (optional)</Label>
                  <select name="supplier_id" className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                    <option value="">— none —</option>
                    {(suppliers ?? []).map((s: {id:string;name:string}) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Who you usually buy this from.</p>
                </div>
              )}
            </div>


            {/* Kitchen Station */}
            {kitchenStationsEnabled && (
              <div>
                <label className="text-sm font-medium leading-none">Kitchen station</label>
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
              <Link href="/app/products"><Button variant="outline" type="button">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {defaultIngredient ? "Add ingredient" : "Add product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {defaultIngredient && (
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
