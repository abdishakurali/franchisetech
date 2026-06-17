import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { RecipeCostCalculator } from "@/components/app/RecipeCostCalculator";

export default async function RecipesNewPage() {
  const { supabase, orgId } = await getKitchenOpsContext();

  const [{ data: sellableProducts }, { data: ingredientProducts }] = await Promise.all([
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

  const hasIngredients = (ingredientProducts?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/app/recipes" className="text-sm text-slate-500 hover:text-slate-700">← Product ingredients</Link>
        <h1 className="text-2xl font-semibold text-slate-950">Create recipe</h1>
      </div>

      {!hasIngredients && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">No stock items added yet.</p>
          <p>Add stock items with a cost per unit (e.g. €0.012/g for chicken) to calculate ingredient costs.</p>
          <Link href="/app/products/import-ingredients" className="mt-2 inline-flex font-medium underline">Import stock items →</Link>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Ingredient cost calculator</CardTitle></CardHeader>
        <CardContent>
          <RecipeCostCalculator
            sellableProducts={(sellableProducts ?? []) as { id: string; name: string; sale_price: number | null }[]}
            ingredientProducts={(ingredientProducts ?? []) as { id: string; name: string; unit_of_measure: string | null; cost_price: number | null; current_stock_qty: number | null }[]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
