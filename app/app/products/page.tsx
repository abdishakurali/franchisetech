import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMoney, getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { addCategory, ensurePosDefaults, deleteProducts, updateProductStock } from "@/app/actions/kitchenops";
import { ProductsBulkTable } from "@/components/app/BulkDeleteTable";
import { PageHint } from "@/components/app/PageHint";

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; type?: string }> }) {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  await ensurePosDefaults();
  const params = await searchParams;
  const q = params?.q ?? "";
  const selectedCategory = params?.category ?? "all";
  const typeFilter = params?.type ?? "all";

  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("product_categories").select("*").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("products").select("*,product_categories(name,color)").eq("organisation_id", orgId).eq("active", true).order("name"),
  ]);

  const categories = categoriesResult.data ?? [];
  const loadError = categoriesResult.error?.message ?? productsResult.error?.message ?? null;
  const products = (productsResult.data ?? []).filter((p) => {
    const name = String(p.name ?? "");
    const sku = String(p.sku ?? "");
    const needle = q.toLowerCase();
    const matchText = !q || name.toLowerCase().includes(needle) || sku.toLowerCase().includes(needle);
    const matchCat = selectedCategory === "all" || p.category_id === selectedCategory;
    const matchType = typeFilter === "all"
      || (typeFilter === "sellable" && p.is_sellable !== false)
      || (typeFilter === "ingredient" && (p.is_ingredient === true || p.is_stock_tracked === true))
      || (typeFilter === "pos" && p.available_in_pos !== false);
    return matchText && matchCat && matchType;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Products</h1>
          <p className="text-sm text-slate-500">Menu items, ingredients, VAT, pricing, and stock.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/products/export"><Button variant="outline" size="sm">Export CSV</Button></a>
          <Link href="/app/products/import"><Button variant="outline" size="sm">Import CSV</Button></Link>
          <Link href="/app/recipes/new">
            <Button variant="outline" size="sm">Create recipe</Button>
          </Link>
          <Link href="/app/products/new">
            <Button size="sm">Add product</Button>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Products could not load: {loadError}
        </div>
      )}

      {/* Categories */}
      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">
          Manage categories ({categories.length})
        </summary>
        <div className="p-4 border-t">
          <form action={addCategory as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap gap-3 items-end mb-3">
            <div><Input name="name" required placeholder="Category name" className="w-40" /></div>
            <div><Input name="color" placeholder="#2563eb" className="w-28" /></div>
            <div><Input name="sort_order" type="number" placeholder="Sort" className="w-20" /></div>
            <Button type="submit" variant="outline" size="sm">Add</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary" style={{ backgroundColor: (c.color ?? "#94a3b8") + "20", color: c.color ?? undefined }}>
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      </details>

      {/* Product list with bulk select */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Product list ({products.length})</CardTitle>
            <form className="flex flex-wrap gap-2">
              <Input name="q" placeholder="Search" defaultValue={q} className="w-36 h-8 text-sm" />
              <select name="type" defaultValue={typeFilter} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm">
                <option value="all">All</option>
                <option value="pos">POS items</option>
                <option value="ingredient">Ingredients</option>
                <option value="sellable">Sellable</option>
              </select>
              <Button type="submit" variant="outline" size="sm" className="h-8">Filter</Button>
            </form>
          </div>
          <p className="text-xs text-slate-400 mt-1">Check boxes to select items, then delete selected.</p>
        </CardHeader>
        <CardContent>
          {!products.length ? (
            <div className="text-center py-10">
              <p className="text-slate-400 mb-4">No products yet.</p>
              <Link href="/app/products/new"><Button variant="outline">Add first product</Button></Link>
            </div>
          ) : (
            <ProductsBulkTable
              products={products as never}
              deleteAction={deleteProducts}
              updateStockAction={updateProductStock}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
