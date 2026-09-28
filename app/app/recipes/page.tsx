import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RecipesFilterForm } from "@/components/app/RecipesFilterForm";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import {
  firstJoined,
  formatCostAsOf,
  formatRecipeMoney,
  recipeCanMake,
  recipeCostMetrics,
  type RecipeRow,
} from "@/lib/recipe-costing";

export default async function RecipesPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  await requireBusinessModule("recipe_costing");
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const params = await searchParams;
  const q = (params?.q ?? "").trim().toLowerCase();
  const status = params?.status ?? "all";

  const { data: rawRecipes } = await supabase
    .from("recipes")
    .select("id,name,yield_qty,product_id,cost_computed_at,products(name,sale_price),recipe_items(id,ingredient_product_id,ingredient_name,quantity,unit_cost,total_cost)")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false });

  const recipes = (rawRecipes ?? []) as unknown as RecipeRow[];

  const allStockIds = [
    ...new Set(
      recipes.flatMap((recipe) =>
        recipe.recipe_items.map((item) => item.ingredient_product_id).filter(Boolean) as string[]
      )
    ),
  ];

  const stockMap = new Map<string, number>();
  const nameMap = new Map<string, string>();

  if (allStockIds.length) {
    const { data: stocks } = await supabase
      .from("products")
      .select("id,name,current_stock_qty")
      .in("id", allStockIds);
    for (const stock of stocks ?? []) {
      stockMap.set(stock.id, Number(stock.current_stock_qty ?? 0));
      nameMap.set(stock.id, stock.name);
    }
  }

  const rows = recipes
    .map((recipe) => {
      const product = firstJoined(recipe.products);
      const salePrice = Number(product?.sale_price ?? 0);
      const metrics = recipeCostMetrics(recipe, salePrice);
      const { canMake, limitingIngName } = recipeCanMake(recipe, stockMap, nameMap);
      const ingredientCount = recipe.recipe_items.length;
      const searchBlob = [recipe.name, product?.name, ...recipe.recipe_items.map((item) => item.ingredient_name)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !q || searchBlob.includes(q);
      const matchesStatus =
        status === "all" ||
        (status === "low-margin" && metrics.marginPct < 30) ||
        (status === "good-margin" && metrics.marginPct >= 60) ||
        (status === "missing-cost" &&
          recipe.recipe_items.some(
            (item) => Number(item.total_cost ?? 0) <= 0 && Number(item.unit_cost ?? 0) <= 0
          ));

      return {
        recipe,
        product,
        salePrice,
        ingredientCount,
        canMake,
        limitingIngName,
        ...metrics,
        matchesSearch,
        matchesStatus,
      };
    })
    .filter((row) => row.matchesSearch && row.matchesStatus)
    // Sort on the same value the table renders (product name, falling back to
    // the recipe name) — ordering by a DB column would sort recipe.name, which
    // is not what the list shows. Romanian collation so diacritics (ă, â, î,
    // ș, ț) file correctly, and numeric so "360ml" precedes "480ml".
    .sort((a, b) =>
      (a.product?.name ?? a.recipe.name ?? "").localeCompare(
        b.product?.name ?? b.recipe.name ?? "",
        "ro",
        { sensitivity: "base", numeric: true }
      )
    );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.recipes.listTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.recipes.listSubtitle}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/products/import-ingredients">
            <Button variant="outline" size="sm">{t.recipes.importStock}</Button>
          </Link>
          <Link href="/app/recipes/new">
            <Button>{t.recipes.createRecipe}</Button>
          </Link>
        </div>
      </div>

      <RecipesFilterForm defaultQuery={params?.q ?? ""} defaultStatus={status} />

      {!recipes.length ? (
        <Card>
          <CardContent className="space-y-4 pb-10 pt-10 text-center">
            <div className="text-4xl">👨‍🍳</div>
            <p className="font-medium text-foreground">{t.recipes.emptyList}</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">{t.recipes.emptyListHint}</p>
            <div className="flex justify-center gap-3">
              <Link href="/app/products/import-ingredients">
                <Button variant="outline">{t.recipes.importStock}</Button>
              </Link>
              <Link href="/app/recipes/new">
                <Button>{t.recipes.createRecipe}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.tables.product}</TableHead>
                  <TableHead className="text-right">{t.recipes.ingredients}</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">{t.recipes.salePrice}</TableHead>
                  <TableHead className="text-right hidden md:table-cell">{t.recipes.costPerPortion}</TableHead>
                  <TableHead className="text-right">{t.tables.margin}</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">{t.recipes.canMake}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(
                  ({
                    recipe,
                    product,
                    salePrice,
                    ingredientCount,
                    costPerUnit,
                    margin,
                    marginPct,
                    canMake,
                    limitingIngName,
                  }) => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium max-w-[220px]">
                        <Link href={`/app/recipes/${recipe.id}`} className="block truncate hover:text-brass">
                          {product?.name ?? recipe.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-mid">{ingredientCount}</TableCell>
                      <TableCell className="text-right tabular-nums hidden sm:table-cell">{formatRecipeMoney(salePrice, currency)}</TableCell>
                      <TableCell
                        className="text-right tabular-nums text-mid hidden md:table-cell"
                        title={formatCostAsOf(recipe.cost_computed_at, {
                          basis: t.common.costBasisCmp,
                          asOf: t.common.costAsOf,
                          unknown: t.common.costBasisUnknown,
                        })}
                      >
                        {formatRecipeMoney(costPerUnit, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`tabular-nums font-medium ${
                            marginPct >= 60 ? "text-reconciled" : marginPct >= 30 ? "text-amber-600" : "text-attention"
                          }`}
                        >
                          {marginPct.toFixed(1)}%
                        </span>
                        <span className="ml-2 hidden tabular-nums text-xs text-muted-foreground sm:inline">
                          ({formatRecipeMoney(margin, currency)})
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        {canMake !== null ? (
                          <div>
                            <span
                              className={`tabular-nums font-semibold ${
                                canMake === 0 ? "text-attention" : canMake < 5 ? "text-amber-600" : "text-reconciled"
                              }`}
                            >
                              {canMake}
                            </span>
                            {limitingIngName && canMake < 20 ? (
                              <p className="text-[10px] text-attention">⚠ {limitingIngName}</p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/app/recipes/${recipe.id}`}
                            className="text-sm font-medium text-brass hover:text-brass"
                          >
                            {t.recipes.view}
                          </Link>
                          <Link
                            href={`/app/recipes/${recipe.id}/edit`}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground"
                          >
                            {t.common.edit}
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
            {!rows.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t.recipes.noMatch}</p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
