import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import {
  firstJoined,
  formatCostAsOf,
  formatQty,
  formatRecipeMoney,
  recipeCanMake,
  recipeCostMetrics,
  recipeLineCost,
  type RecipeRow,
} from "@/lib/recipe-costing";

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  await requireBusinessModule("recipe_costing");
  const { id } = await params;
  const justSaved = (await searchParams)?.saved === "1";
  const { supabase, orgId, currency } = await getKitchenOpsContext();

  const { data: rawRecipe } = await supabase
    .from("recipes")
    .select(
      "id,name,yield_qty,product_id,cost_computed_at,products(name,sale_price),recipe_items(id,ingredient_product_id,ingredient_name,quantity,unit_of_measure,unit_cost,total_cost)"
    )
    .eq("organisation_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (!rawRecipe) notFound();

  const recipe = rawRecipe as unknown as RecipeRow;
  const product = firstJoined(recipe.products);
  const salePrice = Number(product?.sale_price ?? 0);
  const metrics = recipeCostMetrics(recipe, salePrice);

  const stockIds = recipe.recipe_items
    .map((item) => item.ingredient_product_id)
    .filter(Boolean) as string[];

  const stockMap = new Map<string, number>();
  const nameMap = new Map<string, string>();

  if (stockIds.length) {
    const { data: stocks } = await supabase
      .from("products")
      .select("id,name,current_stock_qty")
      .in("id", stockIds);
    for (const stock of stocks ?? []) {
      stockMap.set(stock.id, Number(stock.current_stock_qty ?? 0));
      nameMap.set(stock.id, stock.name);
    }
  }

  const { canMake, limitingIngId, limitingIngName } = recipeCanMake(recipe, stockMap, nameMap);

  return (
    <div className="space-y-6 p-6">
      {justSaved && (
        <div className="rounded-xl border border-reconciled/25 bg-reconciled/10 px-4 py-3 text-sm font-medium text-reconciled">
          ✓ Modificările au fost salvate.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/app/recipes" className="text-sm text-muted-foreground hover:text-foreground">
            ← Toate rețetele
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">{recipe.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product?.name ?? "—"} · {metrics.yieldQty} {metrics.yieldQty === 1 ? "porție" : "porții"} per rețetă
          </p>
        </div>
        <Link href={`/app/recipes/${recipe.id}/edit`}>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Editează rețeta</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Sumar cost</CardTitle>
            <div className="flex flex-wrap items-center gap-4">
              {canMake !== null ? (
                <div className="min-w-[56px] text-center">
                  <p
                    className={`text-2xl font-bold leading-none ${
                      canMake === 0 ? "text-attention" : canMake < 5 ? "text-amber-600" : "text-reconciled"
                    }`}
                  >
                    {canMake}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">poți prepara</p>
                  {limitingIngName && canMake < 20 ? (
                    <p className="mt-0.5 text-[10px] leading-tight text-attention">⚠ {limitingIngName}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="text-center">
                <p className="text-xl font-bold leading-none">{formatRecipeMoney(salePrice, currency)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">preț vânzare</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold leading-none text-mid">
                  {formatRecipeMoney(metrics.costPerUnit, currency)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">cost ingrediente</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {formatCostAsOf(recipe.cost_computed_at, {
                    basis: "CMP",
                    asOf: (date) => `CMP la ${date}`,
                    unknown: "bază cost necunoscută",
                  })}
                </p>
              </div>
              <div className="text-center">
                <p
                  className={`text-xl font-bold leading-none ${
                    metrics.marginPct >= 60
                      ? "text-reconciled"
                      : metrics.marginPct >= 30
                        ? "text-amber-600"
                        : "text-attention"
                  }`}
                >
                  {metrics.marginPct.toFixed(1)}%
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">marjă</p>
              </div>
              <Badge
                variant="secondary"
                className={
                  metrics.marginPct >= 60
                    ? "bg-reconciled/10 text-reconciled"
                    : metrics.marginPct >= 30
                      ? "bg-amber-100 text-amber-700"
                      : "bg-attention/10 text-attention"
                }
              >
                marjă {formatRecipeMoney(metrics.margin, currency)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {recipe.recipe_items.length > 0 ? (
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead className="text-right">Necesar</TableHead>
                  <TableHead>Unitate</TableHead>
                  <TableHead className="text-right">Cost/unitate</TableHead>
                  <TableHead className="text-right">Cost linie</TableHead>
                  <TableHead className="text-right">Stoc disponibil</TableHead>
                  <TableHead className="text-right">Poți prepara</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.recipe_items.map((item) => {
                  const productId = item.ingredient_product_id;
                  const onHand = productId ? (stockMap.get(productId) ?? null) : null;
                  const displayName = (productId ? nameMap.get(productId) : null) ?? item.ingredient_name ?? "—";
                  const qtyPerPortion = Number(item.quantity) / metrics.yieldQty;
                  const portionsFromThis =
                    onHand !== null && qtyPerPortion > 0 ? Math.floor(onHand / qtyPerPortion) : null;
                  const isLimiting = productId === limitingIngId;
                  const lineCost = recipeLineCost(item);

                  return (
                    <TableRow
                      key={item.id}
                      className={isLimiting && canMake !== null && canMake < 20 ? "bg-amber-50/60" : ""}
                    >
                      <TableCell
                        className={`font-medium ${
                          isLimiting && canMake !== null && canMake < 20 ? "text-amber-800" : ""
                        }`}
                      >
                        {displayName}
                        {isLimiting && canMake !== null && canMake < 20 ? (
                          <span className="ml-2 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700">
                            limitativ
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{Number(item.quantity)}</TableCell>
                      <TableCell className="text-muted-foreground">{item.unit_of_measure ?? "buc"}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatRecipeMoney(Number(item.unit_cost ?? 0), currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatRecipeMoney(lineCost, currency)}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm tabular-nums ${
                          onHand !== null && onHand < Number(item.quantity) * 5
                            ? "text-attention font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {onHand !== null ? formatQty(onHand) : "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium tabular-nums ${
                          portionsFromThis !== null && portionsFromThis < 5 ? "text-attention" : "text-foreground"
                        }`}
                      >
                        {portionsFromThis !== null ? portionsFromThis : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-secondary font-semibold">
                  <TableCell colSpan={4} className="text-right text-mid">
                    Cost total ({metrics.yieldQty} {metrics.yieldQty === 1 ? "porție" : "porții"})
                  </TableCell>
                  <TableCell className="text-right">{formatRecipeMoney(metrics.totalCost, currency)}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        ) : (
          <CardContent className="text-sm text-muted-foreground">Niciun ingredient asociat acestei rețete încă.</CardContent>
        )}
      </Card>
    </div>
  );
}
