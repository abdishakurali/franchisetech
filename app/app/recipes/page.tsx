import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";

function money(v: number, cur = "EUR") {
  if (cur === "RON") return `${Number(v).toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: cur || "EUR" }).format(v);
}

type RecipeItem = {
  id: string;
  ingredient_product_id: string | null;
  ingredient_name: string | null;
  quantity: number;
  unit_of_measure: string | null;
  unit_cost: number;
  total_cost: number;
};

type Recipe = {
  id: string;
  name: string;
  yield_qty: number | string;
  product_id: string | null;
  products: { name: string; sale_price: number } | { name: string; sale_price: number }[] | null;
  recipe_items: RecipeItem[];
};

function firstJoined<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

export default async function RecipesPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  await requireBusinessModule("recipe_costing");
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const params = await searchParams;
  const q = (params?.q ?? "").trim().toLowerCase();
  const status = params?.status ?? "all";

  const { data: rawRecipes } = await supabase
    .from("recipes")
    .select("id,name,yield_qty,product_id,products(name,sale_price),recipe_items(id,ingredient_product_id,ingredient_name,quantity,unit_of_measure,unit_cost,total_cost)")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false });

  const recipes = (rawRecipes ?? []) as unknown as Recipe[];

  // Fetch stock AND names for all ingredient products
  const allStockIds = [...new Set(
    recipes.flatMap((r) => r.recipe_items.map((ri) => ri.ingredient_product_id).filter(Boolean) as string[])
  )];

  const stockMap = new Map<string, number>();   // product_id → current_stock_qty
  const nameMap  = new Map<string, string>();   // product_id → name

  if (allStockIds.length) {
    const { data: stocks } = await supabase
      .from("products")
      .select("id,name,current_stock_qty")
      .in("id", allStockIds);
    for (const s of stocks ?? []) {
      stockMap.set(s.id, Number(s.current_stock_qty ?? 0));
      nameMap.set(s.id, s.name);
    }
  }

  const recipeCards = recipes.map((recipe) => {
    const product = firstJoined(recipe.products);
    const salePrice = Number(product?.sale_price ?? 0);
    const yieldQty = Number(recipe.yield_qty ?? 1);
    const totalCost = recipe.recipe_items.reduce((s, ri) => {
      const stored = Number(ri.total_cost ?? 0);
      if (stored > 0) return s + stored;
      return s + Number(ri.unit_cost ?? 0) * Number(ri.quantity ?? 0);
    }, 0);
    const costPerUnit = yieldQty > 0 ? totalCost / yieldQty : 0;
    const margin = salePrice - costPerUnit;
    const marginPct = salePrice > 0 ? (margin / salePrice) * 100 : 0;
    const matchesSearch = !q || [recipe.name, product?.name, ...recipe.recipe_items.map((ri) => ri.ingredient_name)].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchesStatus =
      status === "all" ||
      (status === "low-margin" && marginPct < 30) ||
      (status === "good-margin" && marginPct >= 60) ||
      (status === "missing-cost" && recipe.recipe_items.some((ri) => Number(ri.total_cost ?? 0) <= 0 && Number(ri.unit_cost ?? 0) <= 0));
    return { recipe, product, salePrice, yieldQty, totalCost, costPerUnit, margin, marginPct, matchesSearch, matchesStatus };
  }).filter((row) => row.matchesSearch && row.matchesStatus);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Product ingredients</h1>
          <p className="text-sm text-slate-500">Ingredient cost, margin, and how many portions each product can make right now.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/products/import-ingredients">
            <Button variant="outline" size="sm">Import stock items</Button>
          </Link>
          <Link href="/app/recipes/new"><Button>Create recipe</Button></Link>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
          <Input name="q" defaultValue={params?.q ?? ""} placeholder="Search product, recipe, or ingredient" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Filter</label>
          <select name="status" defaultValue={status} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="all">All recipes</option>
            <option value="low-margin">Low margin</option>
            <option value="good-margin">Good margin</option>
            <option value="missing-cost">Missing cost</option>
          </select>
        </div>
        <Button type="submit" variant="outline">Apply</Button>
      </form>

      {!recipes.length ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <div className="text-4xl">👨‍🍳</div>
            <p className="text-slate-700 font-medium">No product ingredients yet.</p>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              First add your ingredients as products (with cost per unit), then link them to a product to see cost, margin, and how many portions you can make.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/app/products/import-ingredients"><Button variant="outline">Import stock items</Button></Link>
              <Link href="/app/recipes/new"><Button>Create recipe</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recipeCards.map(({ recipe, product, salePrice, yieldQty, totalCost, costPerUnit, margin, marginPct }) => {
            // Can-make — find minimum portions possible from stock
            let canMake: number | null = null;
            let limitingIngId: string | null = null;
            let limitingIngName: string | null = null;

            const trackedItems = recipe.recipe_items.filter((ri) => ri.ingredient_product_id && Number(ri.quantity) > 0);
            if (trackedItems.length > 0) {
              let minPortions = Infinity;
              for (const ri of trackedItems) {
                const onHand = stockMap.get(ri.ingredient_product_id!) ?? 0;
                // qty per portion = ri.quantity / yieldQty
                const qtyPerPortion = Number(ri.quantity) / yieldQty;
                const portions = qtyPerPortion > 0 ? Math.floor(onHand / qtyPerPortion) : Infinity;
                if (portions < minPortions) {
                  minPortions = portions;
                  limitingIngId = ri.ingredient_product_id;
                  // Use product name from lookup, fall back to stored ingredient_name
                  limitingIngName = nameMap.get(ri.ingredient_product_id!) ?? ri.ingredient_name ?? null;
                }
              }
              canMake = Math.max(0, minPortions === Infinity ? 0 : minPortions);
            }

            return (
              <Card key={recipe.id}>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-base">{recipe.name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {product?.name ?? "—"} · {yieldQty} portion{yieldQty !== 1 ? "s" : ""} per batch
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                      {/* Can make */}
                      {canMake !== null && (
                        <div className="text-center min-w-[56px]">
                          <p className={`text-2xl font-bold leading-none ${canMake === 0 ? "text-red-600" : canMake < 5 ? "text-amber-600" : "text-green-700"}`}>
                            {canMake}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">can make</p>
                          {limitingIngName && canMake < 20 && (
                            <p className="text-[10px] text-red-500 mt-0.5 leading-tight">⚠ {limitingIngName}</p>
                          )}
                        </div>
                      )}
                      {/* Sale price */}
                      <div className="text-center">
                        <p className="text-xl font-bold leading-none">{money(salePrice, currency)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">sale price</p>
                      </div>
                      {/* Recipe cost */}
                      <div className="text-center">
                        <p className="text-xl font-bold leading-none text-slate-600">{money(costPerUnit, currency)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">ingredient cost</p>
                      </div>
                      {/* Margin */}
                      <div className="text-center">
                        <p className={`text-xl font-bold leading-none ${marginPct >= 60 ? "text-green-700" : marginPct >= 30 ? "text-amber-600" : "text-red-600"}`}>
                          {marginPct.toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">margin</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={marginPct >= 60 ? "bg-green-100 text-green-700" : marginPct >= 30 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}
                      >
                        {money(margin, currency)} margin
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                {recipe.recipe_items.length > 0 && (
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead className="text-right">Needed</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Cost/unit</TableHead>
                          <TableHead className="text-right">Line cost</TableHead>
                          <TableHead className="text-right">Stock on hand</TableHead>
                          <TableHead className="text-right">Can make</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipe.recipe_items.map((ri) => {
                          const pid = ri.ingredient_product_id;
                          const onHand = pid ? (stockMap.get(pid) ?? null) : null;
                          const displayName = (pid ? nameMap.get(pid) : null) ?? ri.ingredient_name ?? "—";
                          const qtyPerPortion = Number(ri.quantity) / yieldQty;
                          const portionsFromThis = onHand !== null && qtyPerPortion > 0
                            ? Math.floor(onHand / qtyPerPortion)
                            : null;
                          const isLimiting = pid === limitingIngId;
                          const lineCost = Number(ri.total_cost ?? 0) || Number(ri.unit_cost ?? 0) * Number(ri.quantity ?? 0);

                          return (
                            <TableRow key={ri.id} className={isLimiting && canMake !== null && canMake < 20 ? "bg-amber-50/60" : ""}>
                              <TableCell className={`font-medium ${isLimiting && canMake !== null && canMake < 20 ? "text-amber-800" : ""}`}>
                                {displayName}
                                {isLimiting && canMake !== null && canMake < 20 && (
                                  <span className="ml-2 text-[10px] rounded bg-amber-100 text-amber-700 px-1 py-0.5">limiting</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">{Number(ri.quantity)}</TableCell>
                              <TableCell className="text-slate-500">{ri.unit_of_measure ?? "each"}</TableCell>
                              <TableCell className="text-right text-slate-500 tabular-nums">
                                {money(Number(ri.unit_cost ?? 0), currency)}
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                {money(lineCost, currency)}
                              </TableCell>
                              <TableCell className={`text-right text-sm tabular-nums ${
                                onHand !== null && onHand < Number(ri.quantity) * 5 ? "text-red-600 font-medium" : "text-slate-500"
                              }`}>
                                {onHand !== null ? onHand : "—"}
                              </TableCell>
                              <TableCell className={`text-right font-medium tabular-nums ${
                                portionsFromThis !== null && portionsFromThis < 5 ? "text-red-600" : "text-slate-700"
                              }`}>
                                {portionsFromThis !== null ? portionsFromThis : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-slate-50 font-semibold">
                          <TableCell colSpan={4} className="text-right text-slate-600">
                            Total cost ({yieldQty} {yieldQty === 1 ? "portion" : "portions"})
                          </TableCell>
                          <TableCell className="text-right">{money(totalCost, currency)}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {!recipeCards.length && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-slate-500">No recipes match this search or filter.</CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
