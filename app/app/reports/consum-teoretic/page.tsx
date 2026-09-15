import { ReportDateRangeFilter } from "@/components/app/ReportDateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireBusinessModule } from "@/lib/module-guard";

type TxItem = { transaction_id: string; recipe_id: string; quantity: number };
type RecipeRow = { id: string; yield_qty: number | null; created_at: string };
type RecipeItemRow = { recipe_id: string; ingredient_product_id: string | null; quantity: number };
type ProductRow = { id: string; name: string; unit_of_measure: string | null };
type MovementRow = { product_id: string | null; quantity_change: number; reference_id: string | null };

export default async function ConsumTeoreticPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireBusinessModule("inventory");
  const { supabase, orgId } = await getKitchenOpsContext();
  const params = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const fromDate = params?.from ?? firstOfMonth.toISOString().slice(0, 10);
  const toDate = params?.to ?? today;
  const periodStart = `${fromDate}T00:00:00.000Z`;
  const periodEnd = `${toDate}T23:59:59.999Z`;

  // Only sales the sell path actually linked to a recipe at the time
  // (pos_transaction_items.recipe_id) count on EITHER side of this
  // comparison. A sale with no recipe link contributes no theoretical
  // figure -- and its real stock movement (if any: a directly-tracked
  // product sold on its own, or older data from before this org's recipes
  // existed) must be left out of "actual" too, or the two sides aren't
  // measuring the same sales. Checked against real data before writing
  // this: without this scoping, "actual" ran 60-100% above "theoretical"
  // for nearly every ingredient, org-wide -- not real over-consumption,
  // just older/untracked sales the theoretical side could never see.
  // Scoped correctly, the same data lines up within single-digit percent.
  const { data: txItemsRaw } = await supabase
    .from("pos_transaction_items")
    .select("transaction_id,recipe_id,quantity,pos_transactions!inner(status,sold_at,organisation_id)")
    .eq("pos_transactions.organisation_id", orgId)
    .neq("pos_transactions.status", "voided")
    .gte("pos_transactions.sold_at", periodStart)
    .lte("pos_transactions.sold_at", periodEnd)
    .not("recipe_id", "is", null);

  const txItems = (txItemsRaw ?? []) as unknown as TxItem[];
  const linkedTransactionIds = new Set(txItems.map((t) => t.transaction_id));
  const recipeIds = [...new Set(txItems.map((t) => t.recipe_id))];

  const labels = {
    title: "Consum teoretic vs. real",
    subtitle: "Ce ar fi trebuit consumat conform rețetelor curente, comparat cu ce a fost efectiv scăzut din stoc.",
  };

  if (recipeIds.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.title}</h1>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <ReportDateRangeFilter basePath="/app/reports/consum-teoretic" from={fromDate} to={toDate} />
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-400">
            Nicio vânzare legată de o rețetă în această perioadă.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [{ data: recipesRaw }, { data: recipeItemsRaw }] = await Promise.all([
    supabase.from("recipes").select("id,yield_qty,created_at").in("id", recipeIds),
    supabase.from("recipe_items").select("recipe_id,ingredient_product_id,quantity").in("recipe_id", recipeIds),
  ]);
  const recipes = (recipesRaw ?? []) as RecipeRow[];
  const recipeItems = (recipeItemsRaw ?? []) as RecipeItemRow[];
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const itemsByRecipe = new Map<string, RecipeItemRow[]>();
  for (const ri of recipeItems) {
    if (!ri.ingredient_product_id) continue;
    const arr = itemsByRecipe.get(ri.recipe_id) ?? [];
    arr.push(ri);
    itemsByRecipe.set(ri.recipe_id, arr);
  }

  // Theoretical: current recipe proportions x quantity actually sold.
  const theoretical = new Map<string, number>();
  for (const tx of txItems) {
    const recipe = recipeById.get(tx.recipe_id);
    if (!recipe) continue;
    const yieldQty = Number(recipe.yield_qty ?? 1) || 1;
    for (const ri of itemsByRecipe.get(tx.recipe_id) ?? []) {
      const ingId = ri.ingredient_product_id!;
      const qty = (Number(ri.quantity) / yieldQty) * Number(tx.quantity);
      theoretical.set(ingId, (theoretical.get(ingId) ?? 0) + qty);
    }
  }

  const ingredientIds = [...theoretical.keys()];

  const { data: movementsRaw } = ingredientIds.length
    ? await supabase
        .from("stock_movements")
        .select("product_id,quantity_change,reference_id")
        .eq("organisation_id", orgId)
        .eq("movement_type", "sale_used")
        .eq("reference_type", "sale")
        .in("product_id", ingredientIds)
        .gte("performed_at", periodStart)
        .lte("performed_at", periodEnd)
    : { data: [] };
  const movements = (movementsRaw ?? []) as MovementRow[];

  const actual = new Map<string, number>();
  for (const m of movements) {
    if (!m.product_id || !m.reference_id) continue;
    if (!linkedTransactionIds.has(m.reference_id)) continue; // scoping -- see comment above
    actual.set(m.product_id, (actual.get(m.product_id) ?? 0) + -Number(m.quantity_change));
  }

  const { data: productsRaw } = ingredientIds.length
    ? await supabase.from("products").select("id,name,unit_of_measure").in("id", ingredientIds)
    : { data: [] };
  const products = new Map(((productsRaw ?? []) as ProductRow[]).map((p) => [p.id, p]));

  const rows = ingredientIds
    .map((id) => {
      const theo = theoretical.get(id) ?? 0;
      const act = actual.get(id) ?? 0;
      const variance = act - theo;
      const variancePct = theo > 0 ? (variance / theo) * 100 : null;
      return {
        id,
        name: products.get(id)?.name ?? id,
        unit: products.get(id)?.unit_of_measure ?? "",
        theo,
        act,
        variance,
        variancePct,
      };
    })
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

  const totalTheo = rows.reduce((s, r) => s + r.theo, 0);
  const totalAct = rows.reduce((s, r) => s + r.act, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{labels.title}</h1>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <ReportDateRangeFilter basePath="/app/reports/consum-teoretic" from={fromDate} to={toDate} />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Teoreticul folosește rețetele de ASTĂZI, nu rețeta validă la momentul fiecărei vânzări.</p>
        <p className="mt-1 text-xs text-amber-800">
          Acest sistem nu păstrează istoricul rețetelor — dacă o rețetă a fost modificată de la vânzare până acum,
          teoreticul poate să nu corespundă exact cu ce s-a folosit efectiv atunci, chiar dacă totul a funcționat corect.
          O diferență NU înseamnă automat pierdere sau risipă — verificați întâi dacă rețeta a fost modificată recent
          (vezi data de pe pagina rețetei) înainte de a trage o concluzie.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Teoretic (rețete curente)</CardTitle></CardHeader><CardContent className="text-xl font-bold">{totalTheo.toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Real (scăzut din stoc)</CardTitle></CardHeader><CardContent className="text-xl font-bold">{totalAct.toFixed(2)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Diferență</CardTitle></CardHeader><CardContent className={`text-xl font-bold ${Math.abs(totalAct - totalTheo) < 0.01 ? "text-slate-700" : totalAct > totalTheo ? "text-red-600" : "text-green-700"}`}>{(totalAct - totalTheo).toFixed(2)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Pe ingredient</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead className="text-right">Teoretic</TableHead>
                <TableHead className="text-right">Real</TableHead>
                <TableHead className="text-right">Diferență</TableHead>
                <TableHead className="text-right">Diferență %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-right tabular-nums text-slate-500">{r.theo.toFixed(3)} {r.unit}</TableCell>
                  <TableCell className="text-right tabular-nums text-slate-500">{r.act.toFixed(3)} {r.unit}</TableCell>
                  <TableCell
                    className={`text-right tabular-nums font-medium ${
                      Math.abs(r.variance) < 0.005 ? "text-slate-400" : r.variance > 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {r.variance > 0 ? "+" : ""}{r.variance.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-slate-500">
                    {r.variancePct != null ? `${r.variancePct > 0 ? "+" : ""}${r.variancePct.toFixed(1)}%` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500">
          <strong>Sursa datelor:</strong> Teoreticul provine din liniile de vânzare cu rețetă asociată (pos_transaction_items.recipe_id)
          × cantitățile din rețeta curentă. Realul provine din mișcările de stoc de tip &apos;sale_used&apos;, limitate strict la
          aceleași vânzări — o vânzare fără rețetă asociată nu apare pe nicio parte a comparației.
        </p>
      </div>
    </div>
  );
}
