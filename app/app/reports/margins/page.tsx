import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMoney, getKitchenOpsContext, marginPercent } from "@/lib/kitchenops/metrics";

type JoinedProduct = { name?: string | null; sale_price?: number | string | null } | null;

function firstJoined<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function MarginReportPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const params = await searchParams;
  const q = (params?.q ?? "").trim().toLowerCase();
  const status = params?.status ?? "all";
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,name,yield_qty,products(name,sale_price),recipe_items(quantity,unit_cost,total_cost,ingredient_name)")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false });
  const rows = (recipes ?? []).map((recipe) => {
    const product = firstJoined(recipe.products as JoinedProduct | JoinedProduct[]);
    const salePrice = Number(product?.sale_price ?? 0);
    const batchCost = (recipe.recipe_items ?? []).reduce((total, item) => {
      const stored = Number(item.total_cost ?? 0);
      return total + (stored > 0 ? stored : Number(item.unit_cost ?? 0) * Number(item.quantity ?? 0));
    }, 0);
    const cost = batchCost / Math.max(Number(recipe.yield_qty ?? 1), 1);
    return { id: recipe.id, recipe: recipe.name, product: product?.name ?? "-", salePrice, cost, margin: salePrice - cost, marginPct: marginPercent(salePrice, cost) };
  }).filter((row) => {
    const matchesSearch = !q || [row.product, row.recipe].join(" ").toLowerCase().includes(q);
    const matchesStatus =
      status === "all" ||
      (status === "low-margin" && row.marginPct < 30) ||
      (status === "good-margin" && row.marginPct >= 60) ||
      (status === "loss" && row.margin < 0);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.margin - a.margin);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-semibold text-slate-950">Margin Report</h1><p className="text-sm text-slate-500">Product sale price, recipe cost, margin, and gross margin percentage.</p></div>
      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
          <Input name="q" defaultValue={params?.q ?? ""} placeholder="Search product or recipe" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Filter</label>
          <select name="status" defaultValue={status} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="all">All margins</option>
            <option value="low-margin">Low margin</option>
            <option value="good-margin">Good margin</option>
            <option value="loss">Loss</option>
          </select>
        </div>
        <Button type="submit" variant="outline">Apply</Button>
      </form>
      <Card><CardHeader><CardTitle>Recipe margins</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Recipe</TableHead><TableHead>Sale price</TableHead><TableHead>Recipe cost</TableHead><TableHead>Margin</TableHead><TableHead>Gross margin</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell>{row.product}</TableCell><TableCell>{row.recipe}</TableCell><TableCell>{formatMoney(row.salePrice, currency)}</TableCell><TableCell>{formatMoney(row.cost, currency)}</TableCell><TableCell>{formatMoney(row.margin, currency)}</TableCell><TableCell>{row.marginPct.toFixed(1)}%</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  );
}
