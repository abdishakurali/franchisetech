import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";

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
  product?: { id: string; name: string; current_stock_qty: number | null; unit_of_measure: string | null } | null;
};

type StockMovement = {
  id: string;
  movement_type: string;
  quantity_change: number;
  unit_of_measure: string | null;
  reason: string | null;
  performed_at: string;
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId, currency } = await getKitchenOpsContext();

  // Fetch product WITHOUT supplier join (fetched separately to avoid missing-FK errors)
  const { data: product } = await supabase
    .from("products")
    .select("*,product_categories(name,color)")
    .eq("organisation_id", orgId)
    .eq("id", id)
    .single();

  if (!product) return <div className="p-6 text-slate-500">Product not found.</div>;

  // Fetch supplier separately (safe even without FK)
  const supplierName: string | null = product.supplier_id
    ? await supabase.from("suppliers").select("name").eq("id", product.supplier_id).single().then(r => r.data?.name ?? null)
    : null;

  // Fetch recipe if this is a sellable product
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,name,yield_qty,recipe_items(id,ingredient_product_id,ingredient_name,quantity,unit_of_measure,unit_cost,total_cost)")
    .eq("product_id", id)
    .eq("organisation_id", orgId)
    .limit(1);
  const recipe = recipes?.[0] ?? null;

  // Fetch ingredient product details for recipe items
  let recipeItemsWithProducts: RecipeItem[] = [];
  if (recipe) {
    const rawItems = (recipe.recipe_items ?? []) as RecipeItem[];
    const stockIds = rawItems.map((ri) => ri.ingredient_product_id).filter(Boolean) as string[];
    const productMap = new Map<string, RecipeItem["product"]>();
    if (stockIds.length) {
      const { data: ingProds } = await supabase
        .from("products")
        .select("id,name,current_stock_qty,unit_of_measure")
        .in("id", stockIds);
      for (const p of ingProds ?? []) productMap.set(p.id, p);
    }
    recipeItemsWithProducts = rawItems.map((ri) => ({
      ...ri,
      product: ri.ingredient_product_id ? productMap.get(ri.ingredient_product_id) ?? null : null,
    }));
  }

  // Can-make calculation
  let canMake: number | null = null;
  let limitingIngredient: string | null = null;
  if (recipe && recipeItemsWithProducts.length > 0) {
    const yieldQty = Number(recipe.yield_qty ?? 1);
    let minMake = Infinity;
    for (const ri of recipeItemsWithProducts) {
      if (!ri.ingredient_product_id || !ri.quantity) continue;
      const onHand = Number(ri.product?.current_stock_qty ?? 0);
      const needed = Number(ri.quantity);
      const canMakeFromThis = needed > 0 ? Math.floor((onHand / needed) * yieldQty) : Infinity;
      if (canMakeFromThis < minMake) {
        minMake = canMakeFromThis;
        limitingIngredient = ri.ingredient_name ?? ri.product?.name ?? null;
      }
    }
    canMake = minMake === Infinity ? null : Math.max(0, minMake);
  }

  // Recipe cost
  const recipeCost = recipeItemsWithProducts.reduce((s, ri) => s + Number(ri.total_cost ?? 0), 0);
  const yieldQty = Number(recipe?.yield_qty ?? 1);
  const recipeCostPerUnit = yieldQty > 0 ? recipeCost / yieldQty : 0;
  const salePrice = Number(product.sale_price ?? 0);
  const grossMargin = salePrice - recipeCostPerUnit;
  const marginPct = salePrice > 0 ? (grossMargin / salePrice) * 100 : 0;

  // Stock movements (for ingredient products)
  let stockMovements: StockMovement[] = [];
  if (product.is_ingredient || product.is_stock_tracked) {
    const { data: movements } = await supabase
      .from("stock_movements")
      .select("id,movement_type,quantity_change,unit_of_measure,reason,performed_at")
      .eq("product_id", id)
      .eq("organisation_id", orgId)
      .order("performed_at", { ascending: false })
      .limit(20);
    stockMovements = (movements ?? []) as StockMovement[];
  }

  // Sales history (for sellable products)
  let salesHistory: Array<{ product_name: string; quantity: number; gross_amount: number | null; line_total: number; created_at: string }> = [];
  if (product.available_in_pos !== false || product.is_sellable) {
    const { data: salesItems } = await supabase
      .from("pos_transaction_items")
      .select("product_name,quantity,gross_amount,line_total,created_at")
      .eq("product_id", id)
      .eq("organisation_id", orgId)
      .order("created_at", { ascending: false })
      .limit(20);
    salesHistory = (salesItems ?? []) as typeof salesHistory;
  }

  // Used in recipes (for ingredient products)
  let usedInRecipes: Array<{ id: string; name: string; products?: { name: string; sale_price: number } | null }> = [];
  if (product.is_ingredient || product.is_stock_tracked) {
    const { data: riRows } = await supabase
      .from("recipe_items")
      .select("recipes(id,name,products(name,sale_price))")
      .eq("ingredient_product_id", id)
      .eq("organisation_id", orgId);
    usedInRecipes = (riRows ?? []).map((r) => {
      const rec = Array.isArray(r.recipes) ? r.recipes[0] : r.recipes;
      return { id: rec?.id ?? "", name: rec?.name ?? "", products: Array.isArray(rec?.products) ? rec.products[0] : rec?.products };
    }).filter((r) => r.id);
  }

  const isIngredient = product.is_ingredient || product.is_stock_tracked;
  const isSellable = product.available_in_pos !== false || product.is_sellable;
  const cat = product.product_categories as { name: string; color: string | null } | null;
  const supplier = supplierName ? { name: supplierName } : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/app/products" className="text-sm text-slate-500 hover:text-slate-700">← Products</Link>
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">{product.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {cat && <Badge variant="secondary" style={{ backgroundColor: (cat.color ?? "#94a3b8") + "20", color: cat.color ?? undefined }}>{cat.name}</Badge>}
            {product.available_in_pos !== false && <Badge className="bg-blue-100 text-blue-700 border-0">POS</Badge>}
            {product.is_ingredient && <Badge variant="outline">Ingredient</Badge>}
            {product.is_stock_tracked && <Badge variant="outline">Stock tracked</Badge>}
            {!product.active && <Badge variant="destructive">Inactive</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-xl object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-2xl">
              {isIngredient ? "Stock" : "POS"}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link href={`/app/products/${product.id}/edit`}><Button size="sm">Edit product</Button></Link>
            <Link href="/app/products/new" className="text-sm text-blue-600 hover:underline">+ Add product</Link>
          </div>
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isSellable && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Sale price</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{money(salePrice, currency)}</CardContent>
          </Card>
        )}
        {isIngredient && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">On hand</CardTitle></CardHeader>
            <CardContent className={`text-2xl font-bold ${Number(product.current_stock_qty ?? 0) <= Number(product.reorder_level ?? 0) && Number(product.reorder_level ?? 0) > 0 ? "text-red-600" : "text-green-700"}`}>
              {Number(product.current_stock_qty ?? 0)} {product.unit_of_measure ?? "units"}
            </CardContent>
          </Card>
        )}
        {recipe && (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Recipe cost</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold text-slate-700">{money(recipeCostPerUnit, currency)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Gross margin</CardTitle></CardHeader>
              <CardContent className={`text-2xl font-bold ${marginPct >= 60 ? "text-green-700" : marginPct >= 30 ? "text-amber-600" : "text-red-600"}`}>
                {money(grossMargin, currency)} ({marginPct.toFixed(1)}%)
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Can make</CardTitle></CardHeader>
              <CardContent className={`text-2xl font-bold ${canMake !== null && canMake < 5 ? "text-red-600" : "text-slate-950"}`}>
                {canMake !== null ? canMake : "—"}
                {limitingIngredient && canMake !== null && canMake < 20 && (
                  <p className="text-xs text-slate-400 font-normal mt-1">Limited by {limitingIngredient}</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
        {!recipe && isSellable && (
          <Card className="border-dashed">
            <CardContent className="pt-4 text-sm text-slate-400">
              No recipe linked.{" "}
              <Link href="/app/recipes/new" className="text-blue-600 hover:underline">Create recipe →</Link>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recipe breakdown */}
        {recipe && recipeItemsWithProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recipe: {recipe.name}</CardTitle>
              <p className="text-sm text-slate-500">Yield: {recipe.yield_qty} portion{Number(recipe.yield_qty) !== 1 ? "s" : ""}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Cost/unit</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipeItemsWithProducts.map((ri) => {
                    const onHand = Number(ri.product?.current_stock_qty ?? 0);
                    const needed = Number(ri.quantity);
                    const portions = needed > 0 ? Math.floor(onHand / needed) : null;
                    return (
                      <TableRow key={ri.id}>
                        <TableCell className="font-medium">
                          {ri.ingredient_name ?? ri.product?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">{needed}</TableCell>
                        <TableCell>{ri.unit_of_measure ?? "each"}</TableCell>
                        <TableCell className="text-right text-slate-500">{money(Number(ri.unit_cost ?? 0), currency)}</TableCell>
                        <TableCell className="text-right font-medium">{money(Number(ri.total_cost ?? 0), currency)}</TableCell>
                        <TableCell className={`text-right text-xs ${portions !== null && portions < 5 ? "text-red-600 font-medium" : "text-slate-500"}`}>
                          {ri.product ? `${onHand} ${ri.product.unit_of_measure ?? ""}` : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="mt-3 border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-slate-600"><span>Recipe cost ({recipe.yield_qty} portion{Number(recipe.yield_qty) !== 1 ? "s" : ""})</span><strong>{money(recipeCost, currency)}</strong></div>
                <div className="flex justify-between text-slate-600"><span>Cost per portion</span><strong>{money(recipeCostPerUnit, currency)}</strong></div>
                <div className="flex justify-between text-slate-600"><span>Sale price</span><strong>{money(salePrice, currency)}</strong></div>
                <div className={`flex justify-between font-bold text-base pt-1 ${marginPct >= 60 ? "text-green-700" : "text-amber-600"}`}>
                  <span>Margin</span><span>{money(grossMargin, currency)} ({marginPct.toFixed(1)}%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product info */}
        <Card>
          <CardHeader><CardTitle>Product info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Unit of measure", value: product.unit_of_measure ?? "each" },
              { label: "Cost price", value: product.cost_price ? money(Number(product.cost_price), currency) : "—" },
              { label: "VAT rate", value: `${product.vat_rate ?? 0}%` },
              { label: "SKU", value: product.sku ?? "—" },
              { label: "Category", value: cat?.name ?? "—" },
              { label: "Supplier", value: supplier?.name ?? "—" },
              { label: "Reorder level", value: product.reorder_level ? `${product.reorder_level} ${product.unit_of_measure ?? "units"}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-900 text-right">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stock movements */}
        {isIngredient && (
          <Card>
            <CardHeader><CardTitle>Stock movements</CardTitle></CardHeader>
            <CardContent>
              {!stockMovements.length ? (
                <p className="text-sm text-slate-400">No stock movements yet. Record a purchase to start.</p>
              ) : (
                <div className="space-y-2">
                  {stockMovements.map((m) => {
                    const isIn = Number(m.quantity_change) >= 0;
                    const typeLabel: Record<string, string> = {
                      purchase_received: "Purchase",
                      sale_used: "Sale used",
                      adjustment: "Adjustment",
                      waste: "Waste",
                    };
                    return (
                      <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                        <div>
                          <span className={`font-medium ${isIn ? "text-green-700" : "text-red-600"}`}>
                            {isIn ? "+" : ""}{Number(m.quantity_change)} {m.unit_of_measure ?? ""}
                          </span>
                          <span className="ml-2 text-slate-500">{typeLabel[m.movement_type] ?? m.movement_type}</span>
                          {m.reason && <span className="ml-1 text-slate-400">— {m.reason}</span>}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(m.performed_at).toLocaleDateString("en-IE", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Used in recipes */}
        {isIngredient && usedInRecipes.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Used in recipes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {usedInRecipes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-slate-500">{r.products?.name ?? "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales history */}
        {isSellable && salesHistory.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent sales</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesHistory.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(s.created_at).toLocaleDateString("en-IE", { day: "2-digit", month: "short" })}
                      </TableCell>
                      <TableCell className="text-right">{s.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{money(Number(s.gross_amount ?? s.line_total ?? 0), currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
