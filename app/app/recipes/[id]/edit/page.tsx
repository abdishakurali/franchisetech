import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { RecipeCostCalculator } from "@/components/app/RecipeCostCalculator";
import { requireBusinessModule } from "@/lib/module-guard";
import { updateRecipeFromProducts } from "@/app/actions/kitchenops";

export default async function RecipeEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBusinessModule("recipe_costing");
  const { id } = await params;
  const { supabase, orgId } = await getKitchenOpsContext();

  const [{ data: recipe }, { data: sellableProducts }, { data: ingredientProducts }] = await Promise.all([
    supabase
      .from("recipes")
      .select("id,name,yield_qty,product_id,recipe_items(ingredient_product_id,quantity)")
      .eq("organisation_id", orgId)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("products")
      .select("id,name,sale_price")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .or("is_sellable.eq.true,available_in_pos.eq.true")
      .order("name"),
    supabase.from("products")
      .select("id,name,unit_of_measure,cost_price,current_stock_qty")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .or("is_ingredient.eq.true,is_stock_tracked.eq.true")
      .order("name"),
  ]);

  if (!recipe) notFound();

  const items = (recipe.recipe_items ?? []) as { ingredient_product_id: string | null; quantity: number | null }[];
  // Lines whose ingredient was deleted have no product id and cannot be
  // represented in the picker — drop them here so the form still opens, rather
  // than rendering a blank row the user cannot interpret.
  const initialRows = items
    .filter((it) => it.ingredient_product_id)
    .map((it) => ({ product_id: String(it.ingredient_product_id), quantity: String(it.quantity ?? "") }));
  const droppedLines = items.length - initialRows.length;

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href={`/app/recipes/${id}`} className="text-sm text-slate-500 hover:text-slate-700">← Înapoi la rețetă</Link>
        <h1 className="text-2xl font-semibold text-slate-950">Editează rețeta</h1>
      </div>

      {droppedLines > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {droppedLines === 1
            ? "Un ingredient din această rețetă nu mai există în stoc și a fost omis. Adaugă-l din nou dacă e nevoie."
            : `${droppedLines} ingrediente din această rețetă nu mai există în stoc și au fost omise. Adaugă-le din nou dacă e nevoie.`}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingrediente și cost</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipeCostCalculator
            sellableProducts={sellableProducts ?? []}
            ingredientProducts={ingredientProducts ?? []}
            recipeId={id}
            initialProductId={recipe.product_id ?? undefined}
            initialYieldQty={String(recipe.yield_qty ?? 1)}
            initialRows={initialRows}
            submitAction={updateRecipeFromProducts as unknown as (fd: FormData) => Promise<void>}
            submitLabel="Salvează modificările"
          />
        </CardContent>
      </Card>
    </div>
  );
}
