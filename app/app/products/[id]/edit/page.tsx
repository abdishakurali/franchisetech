import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { updateProduct, deleteProduct, ensurePosDefaults } from "@/app/actions/kitchenops";
import { ImageUploadField } from "@/components/app/ImageUploadField";

const VAT_RATES = [0, 9, 13.5, 23];
const DEFAULT_UNITS = ["each","portion","kg","g","litre","ml","cup","bottle","box","case","pack"];
const PLACEHOLDER_TYPES = ["coffee","drink","food","snack","ingredient","other"];
const KITCHEN_STATIONS = [
  { value: "bar",         label: "Bar" },
  { value: "starters",   label: "Starters" },
  { value: "mains",      label: "Mains" },
  { value: "vegetables", label: "Vegetables" },
  { value: "desserts",   label: "Desserts" },
  { value: "cold_prep",  label: "Cold Prep" },
  { value: "hot_kitchen",label: "Hot Kitchen" },
];


export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const isRO = currency === "RON";
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as { kitchen_stations_enabled?: boolean | null } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);
  await ensurePosDefaults();

  const [{ data: product }, { data: categories }, { data: units }, { data: suppliers }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).eq("organisation_id", orgId).single(),
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("units_of_measure").select("name").or(`organisation_id.eq.${orgId},organisation_id.is.null`).order("name"),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
  ]);

  if (!product) return <div className="p-6 text-slate-500">Product not found.</div>;

  const allUnits = [...new Set([...DEFAULT_UNITS, ...((units ?? []).map((u: {name:string}) => u.name))])];

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href={`/app/products/${id}`} className="text-sm text-slate-500 hover:text-slate-700">← {product.name}</Link>
        <h1 className="text-2xl font-semibold text-slate-950">Edit product</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Edit: {product.name}</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProduct as unknown as (fd: FormData) => Promise<void>} className="space-y-4" encType="multipart/form-data">
            <input type="hidden" name="id" value={id} />

            {/* Product image — at the top */}
            <div className="flex flex-col items-center pb-2">
              <ImageUploadField
                inputName="image_file"
                currentImageUrl={product.image_url ?? null}
                productName={product.name ?? "Product"}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Product name *</Label>
                <Input name="name" required defaultValue={product.name} />
                <p className="text-xs text-slate-500 mt-1">Example: Americano, Chicken Caesar, Banana Smoothie.</p>
              </div>
              <div>
                <Label>Category</Label>
                <select name="category_id" defaultValue={product.category_id ?? ""} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">— none —</option>
                  {(categories ?? []).map((c: {id:string;name:string}) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Group similar items, like Drinks, Food, Snacks.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <Label>Sale price (€)</Label>
                <Input name="sale_price" type="number" step="0.01" min="0" defaultValue={Number(product.sale_price ?? 0)} />
                <p className="text-xs text-slate-500 mt-1">The price the customer pays.</p>
              </div>
              <div>
                <Label>Cost price (€)</Label>
                <Input name="cost_price" type="number" step="0.01" min="0" defaultValue={product.cost_price ? Number(product.cost_price) : ""} placeholder="0.00" />
                <p className="text-xs text-slate-500 mt-1">What one unit costs you. Used for margin.</p>
              </div>
              <div>
                <Label>VAT rate</Label>
                <select name="vat_rate" defaultValue={product.vat_rate ?? 0} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
              <div>
                <Label>Unit</Label>
                <select name="unit_of_measure" defaultValue={product.unit_of_measure ?? "each"} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  {allUnits.map((u) => <option key={u}>{u}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">How this item is measured, like each, g, kg, ml, litre, bottle.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Placeholder type</Label>
                <select name="placeholder_type" defaultValue={product.placeholder_type ?? ""} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">— auto —</option>
                  {PLACEHOLDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>SKU</Label>
                <Input name="sku" defaultValue={product.sku ?? ""} placeholder="optional" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">Product type</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="available_in_pos" value="on"
                    defaultChecked={product.available_in_pos !== false} className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span>
                    <strong>{isRO ? "Se vinde la POS" : "Sell this item on POS"}</strong>
                    <br />
                    <span className="text-xs text-slate-500">
                      {isRO ? "Activați dacă angajații trebuie să vândă acest articol la casă." : "Turn on if staff should be able to sell this."}
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="is_stock_tracked" value="on"
                    defaultChecked={!!product.is_stock_tracked} className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span>
                    <strong>{isRO ? "Urmărire stoc" : "Track stock"}</strong>
                    <br />
                    <span className="text-xs text-slate-500">
                      {isRO ? "Activați dacă cumpărați articolul și doriți urmărirea stocului." : "Turn on if you buy this item and want stock tracked."}
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="is_ingredient" value="on"
                    defaultChecked={!!product.is_ingredient} className="mt-0.5 accent-blue-600 w-4 h-4" />
                  <span>
                    <strong>Ingredient</strong>
                    <br />
                    <span className="text-xs text-slate-500">
                      {isRO ? "Activați dacă acest articol este folosit în rețete." : "Turn on if this item is used in recipes."}
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="is_purchaseable" value="on"
                    defaultChecked={!!(product as {is_purchaseable?: boolean}).is_purchaseable || !!product.is_ingredient} className="mt-0.5 accent-green-600 w-4 h-4" />
                  <span>
                    <strong>{isRO ? "Poate fi cumpărat" : "Can be purchased"}</strong>
                    <br />
                    <span className="text-xs text-slate-500">
                      {isRO
                        ? "Apare la Înregistrează cumpărătură pentru mărfuri, ingrediente, consumabile."
                        : "Appears in Record Purchase for goods, ingredients, supplies."}
                    </span>
                  </span>
                </label>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {isRO ? "Tip articol" : "Item type"}
                </label>
                <select name="item_type" defaultValue={(product as {item_type?: string}).item_type ?? (product.is_ingredient ? "ingredient" : "finished_product")} className="h-9 max-w-xs rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="finished_product">{isRO ? "Produs finit" : "Finished product"}</option>
                  <option value="ingredient">{isRO ? "Ingredient" : "Ingredient"}</option>
                  <option value="merchandise">{isRO ? "Marfă" : "Goods"}</option>
                  <option value="supply">{isRO ? "Consumabil" : "Supply"}</option>
                  <option value="packaging">{isRO ? "Ambalaj" : "Packaging"}</option>
                  <option value="raw_material">{isRO ? "Materie primă" : "Raw material"}</option>
                </select>
                {((product as {item_type?: string}).item_type === "finished_product" || (!(product as {item_type?: string}).item_type && !product.is_ingredient)) && (
                  <p className="text-xs text-amber-700 mt-1">
                    {isRO
                      ? "Produsele finite nu apar la Înregistrează cumpărătură decât dacă bifați «Poate fi cumpărat»."
                      : "Finished products won't appear in Record Purchase unless you check 'Can be purchased'."}
                  </p>
                )}
              </div>
            </div>

            {(suppliers ?? []).length > 0 && (
              <div>
                <Label>Supplier</Label>
                <select name="supplier_id" defaultValue={product.supplier_id ?? ""} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="">— none —</option>
                  {(suppliers ?? []).map((s: {id:string;name:string}) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-1">Who you usually buy this from.</p>
              </div>
            )}


            {/* Kitchen Station */}
            {kitchenStationsEnabled && (
              <div>
                <label className="text-sm font-medium leading-none">Kitchen station</label>
                <select name="kitchen_station" defaultValue={product.kitchen_station ?? ""} className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
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
            <div className="flex gap-3 pt-2">
              <Link href={`/app/products/${id}`}><Button variant="outline" type="button">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete section */}
      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-red-700">Delete product</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">This hides the product from all views. It can be restored if needed.</p>
          <form action={deleteProduct as unknown as (fd: FormData) => Promise<void>}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              Delete product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
