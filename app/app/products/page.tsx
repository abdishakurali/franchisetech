import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { isModuleEnabled } from "@/lib/business-modules";
import { FormSelect } from "@/components/app/FormSelect";
import { addCategory, ensurePosDefaults, deleteProducts, updateProductStock } from "@/app/actions/kitchenops";
import { ProductsBulkTable } from "@/components/app/BulkDeleteTable";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; type?: string }> }) {
  const { countryCode, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode);
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const recipeVisible = isModuleEnabled(moduleFlags, "recipe_costing");
  const inventoryVisible = isModuleEnabled(moduleFlags, "inventory");
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

  const typeOptions = [
    { value: "all", label: t.products.typeAll },
    { value: "pos", label: t.products.typePos },
    ...(inventoryVisible || recipeVisible
      ? [{ value: "ingredient", label: t.products.typeIngredient }]
      : []),
    { value: "sellable", label: t.products.typeSellable },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{t.products.title}</h1>
          <p className="text-sm text-slate-500">{t.products.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/products/export"><Button variant="outline" size="sm">{t.common.export}</Button></a>
          <Link href="/app/products/import"><Button variant="outline" size="sm">{t.common.import}</Button></Link>
          {recipeVisible ? (
            <Link href="/app/recipes/new">
              <Button variant="outline" size="sm">{t.products.createRecipe}</Button>
            </Link>
          ) : null}
          <Link href="/app/products/new">
            <Button size="sm">{t.products.addProduct}</Button>
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t.products.loadError} {loadError}
        </div>
      )}

      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">
          {t.products.manageCategories(categories.length)}
        </summary>
        <div className="p-4 border-t">
          <form action={addCategory as unknown as (fd: FormData) => Promise<void>} className="flex flex-wrap gap-3 items-end mb-3">
            <div><Input name="name" required placeholder={t.products.categoryName} className="w-40" /></div>
            <div><Input name="color" placeholder="#2563eb" className="w-28" /></div>
            <div><Input name="sort_order" type="number" placeholder={t.products.sort} className="w-20" /></div>
            <Button type="submit" variant="outline" size="sm">{t.common.add}</Button>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>{t.products.productList(products.length)}</CardTitle>
            <form className="flex flex-wrap gap-2">
              <Input name="q" placeholder={t.common.search} defaultValue={q} className="w-36 h-8 text-sm" />
              <FormSelect
                name="type"
                defaultValue={typeFilter}
                className="w-36"
                options={typeOptions}
              />
              <Button type="submit" variant="outline" size="sm" className="h-8">{t.common.filter}</Button>
            </form>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.products.bulkHint}</p>
        </CardHeader>
        <CardContent>
          {!products.length ? (
            <div className="text-center py-10">
              <p className="text-slate-400 mb-4">{t.products.empty}</p>
              <Link href="/app/products/new"><Button variant="outline">{t.products.addFirst}</Button></Link>
            </div>
          ) : (
            <ProductsBulkTable
              products={products as never}
              deleteAction={deleteProducts}
              updateStockAction={inventoryVisible ? updateProductStock : undefined}
              inventoryVisible={inventoryVisible}
              recipeVisible={recipeVisible}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
