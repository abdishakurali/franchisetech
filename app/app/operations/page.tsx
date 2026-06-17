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

export default async function OperationsPage({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const params = await searchParams;
  const tab = params?.tab ?? "stock";

  // --- Stock ---
  const { data: stockProducts } = await supabase
    .from("products")
    .select("id,name,current_stock_qty,reorder_level,unit_of_measure,cost_price,product_categories(name)")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .or("is_stock_tracked.eq.true,is_ingredient.eq.true")
    .order("name");

  // --- Suppliers ---
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id,name,contact_name,email,phone")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("name");

  // --- Purchases ---
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id,purchase_date,purchased_at,reference,total_amount,suppliers!purchases_supplier_id_fkey(name),purchase_items(id)")
    .eq("organisation_id", orgId)
    .order("purchased_at", { ascending: false })
    .limit(50);

  // --- Recipes ---
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,name,yield_qty,products(name,sale_price),recipe_items(total_cost)")
    .eq("organisation_id", orgId)
    .order("created_at", { ascending: false });

  const tabs = [
    { key: "stock",     label: "Stock",     count: stockProducts?.length ?? 0 },
    { key: "suppliers", label: "Suppliers", count: suppliers?.length ?? 0 },
    { key: "purchases", label: "Purchases", count: purchases?.length ?? 0 },
    { key: "recipes",   label: "Recipes",   count: recipes?.length ?? 0 },
  ];

  function firstJoined<T>(v: T | T[] | null | undefined): T | null {
    return Array.isArray(v) ? v[0] ?? null : v ?? null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Operations</h1>
          <p className="text-sm text-slate-500">Stock · Suppliers · Purchases · Recipes</p>
        </div>
        <div className="flex gap-2">
          {tab === "suppliers" && <Link href="/app/suppliers/new"><Button size="sm">Add supplier</Button></Link>}
          {tab === "purchases" && <Link href="/app/purchases/new"><Button size="sm">Record purchase</Button></Link>}
          {tab === "recipes"   && <Link href="/app/recipes/new"><Button size="sm">Create recipe</Button></Link>}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link key={t.key} href={`?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
            {t.count > 0 && <span className="ml-1.5 text-xs text-slate-400">({t.count})</span>}
          </Link>
        ))}
      </div>

      {/* ---- STOCK ---- */}
      {tab === "stock" && (
        <Card>
          <CardContent className="pt-4">
            {!stockProducts?.length ? (
              <div className="text-center py-10">
                <p className="text-slate-400 mb-2">No stock-tracked products yet.</p>
                <Link href="/app/recipes/new"><Button variant="outline" size="sm">Create recipe</Button></Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">On hand</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Reorder at</TableHead>
                    <TableHead className="text-right">Cost/unit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stockProducts ?? []).map((p) => {
                    const qty = Number(p.current_stock_qty ?? 0);
                    const reorder = Number(p.reorder_level ?? 0);
                    const isLow = reorder > 0 && qty <= reorder;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link href={`/app/products/${p.id}`} className="font-medium hover:text-blue-600 hover:underline">{p.name}</Link>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isLow ? "text-red-600" : "text-green-700"}`}>{qty}</TableCell>
                        <TableCell>{p.unit_of_measure ?? "each"}</TableCell>
                        <TableCell className="text-right text-slate-400">{reorder || "—"}</TableCell>
                        <TableCell className="text-right">{p.cost_price ? money(Number(p.cost_price), currency) : "—"}</TableCell>
                        <TableCell>
                          {isLow ? <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Low</Badge>
                                 : <Badge variant="secondary">OK</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- SUPPLIERS ---- */}
      {tab === "suppliers" && (
        <Card>
          <CardContent className="pt-4">
            {!suppliers?.length ? (
              <div className="text-center py-10">
                <p className="text-slate-400 mb-2">No suppliers yet.</p>
                <Link href="/app/suppliers/new"><Button variant="outline" size="sm">Add first supplier</Button></Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(suppliers ?? []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.contact_name ?? "—"}</TableCell>
                      <TableCell>{s.email ?? "—"}</TableCell>
                      <TableCell>{s.phone ?? "—"}</TableCell>
                      <TableCell>
                        <Link href={`/app/suppliers/${s.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- PURCHASES ---- */}
      {tab === "purchases" && (
        <Card>
          <CardContent className="pt-4">
            {!purchases?.length ? (
              <div className="text-center py-10">
                <p className="text-slate-400 mb-2">No purchases recorded yet.</p>
                <Link href="/app/purchases/new"><Button variant="outline" size="sm">Record first purchase</Button></Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(purchases as unknown as Array<{id:string;purchase_date:string|null;purchased_at:string|null;reference:string|null;total_amount:number|null;suppliers:{name:string}|null;purchase_items:{id:string}[]}>).map((p) => {
                    const supplierName = (p.suppliers as {name:string}|null)?.name ?? "—";
                    const dateStr = String(p.purchase_date ?? p.purchased_at ?? "").slice(0, 10);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{dateStr}</TableCell>
                        <TableCell>{supplierName}</TableCell>
                        <TableCell>{p.reference ?? "—"}</TableCell>
                        <TableCell>{(p.purchase_items ?? []).length}</TableCell>
                        <TableCell className="text-right font-medium">{formatMoney(Number(p.total_amount ?? 0), currency)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- RECIPES ---- */}
      {tab === "recipes" && (
        <div className="space-y-4">
          {!recipes?.length ? (
            <Card>
              <CardContent className="pt-10 pb-10 text-center">
                <p className="text-slate-400 mb-4">No recipes yet.</p>
                <Link href="/app/recipes/new"><Button variant="outline">Create first recipe</Button></Link>
              </CardContent>
            </Card>
          ) : (
            (recipes ?? []).map((recipe) => {
              const product = firstJoined(recipe.products as {name:string;sale_price:number}|{name:string;sale_price:number}[]|null);
              const salePrice = Number(product?.sale_price ?? 0);
              const totalCost = (recipe.recipe_items ?? []).reduce((s: number, ri: {total_cost:number}) => s + Number(ri.total_cost ?? 0), 0);
              const yieldQty = Number(recipe.yield_qty ?? 1);
              const costPerUnit = yieldQty > 0 ? totalCost / yieldQty : 0;
              const margin = salePrice - costPerUnit;
              const marginPct = salePrice > 0 ? (margin / salePrice) * 100 : 0;
              return (
                <Card key={recipe.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle className="text-base">{recipe.name}</CardTitle>
                        <p className="text-sm text-slate-500">{product?.name ?? "—"} · yield {yieldQty}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-center">
                        <div><p className="text-lg font-bold">{money(salePrice, currency)}</p><p className="text-xs text-slate-400">sale</p></div>
                        <div><p className="text-lg font-bold text-slate-600">{money(costPerUnit, currency)}</p><p className="text-xs text-slate-400">cost</p></div>
                        <div>
                          <p className={`text-lg font-bold ${marginPct >= 60 ? "text-green-700" : marginPct >= 30 ? "text-amber-600" : "text-red-600"}`}>
                            {marginPct.toFixed(1)}%
                          </p>
                          <p className="text-xs text-slate-400">margin</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
