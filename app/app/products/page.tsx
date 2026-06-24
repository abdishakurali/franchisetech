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
import { PRODUCT_LIST_SELECT } from "@/lib/supabase/product-selects";

function productsHref(opts: {
  category?: string;
  q?: string;
  type?: string;
  archived?: boolean;
}) {
  const sp = new URLSearchParams();
  if (opts.q) sp.set("q", opts.q);
  if (opts.type && opts.type !== "all") sp.set("type", opts.type);
  if (opts.archived) sp.set("archived", "1");
  if (opts.category && opts.category !== "all") sp.set("category", opts.category);
  const qs = sp.toString();
  return qs ? `/app/products?${qs}` : "/app/products";
}

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; type?: string; archived?: string }> }) {
  const { countryCode, profileLocale, supabase, orgId, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const recipeVisible = isModuleEnabled(moduleFlags, "recipe_costing");
  const inventoryVisible = isModuleEnabled(moduleFlags, "inventory");
  await ensurePosDefaults();
  const params = await searchParams;
  const q = params?.q ?? "";
  const selectedCategory = params?.category ?? "all";
  const typeFilter = params?.type ?? "all";
  const showArchived = params?.archived === "1";

  let productsQuery = supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("organisation_id", orgId)
    .order("name");
  if (!showArchived) {
    productsQuery = productsQuery.eq("active", true);
  }

  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("product_categories").select("*").eq("organisation_id", orgId).eq("category_type", "inventory").order("name"),
    productsQuery,
  ]);

  const categories = categoriesResult.data ?? [];
  const loadError = categoriesResult.error?.message ?? productsResult.error?.message ?? null;
  const products = (productsResult.data ?? [])
    .filter((p) => {
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
  })
    .map((p) => {
      const row = p as typeof p & { inventory_category?: { name: string; color: string | null } | null };
      return { ...row, product_categories: row.inventory_category ?? null };
    });

  const typeOptions = [
    { value: "all", label: t.products.typeAll },
    { value: "pos", label: t.products.typePos },
    ...(inventoryVisible || recipeVisible
      ? [{ value: "ingredient", label: t.products.typeIngredient }]
      : []),
    { value: "sellable", label: t.products.typeSellable },
  ];

  const categoryOptions = [
    { value: "all", label: t.products.allCategories },
    ...categories.map((c) => ({ value: c.id, label: c.name ?? t.common.untitled })),
  ];

  const listHrefOpts = { q, type: typeFilter, archived: showArchived };

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
          <Link href={showArchived ? "/app/products" : "/app/products?archived=1"}>
            <Button variant="outline" size="sm">
              {showArchived ? t.products.hideArchived : t.products.showArchived}
            </Button>
          </Link>
          {recipeVisible ? (
            <Link href="/app/recipes/new">
              <Button variant="outline" size="sm">{t.products.createRecipe}</Button>
            </Link>
          ) : null}
          <Link href="/app/products/modifiers">
            <Button variant="outline" size="sm">{t.products.modifiers?.title ?? "Modifiers"}</Button>
          </Link>
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

      {showArchived ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {t.products.archivedHint}
        </div>
      ) : null}

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
            {categories.map((c) => {
              const active = selectedCategory === c.id;
              return (
                <Link
                  key={c.id}
                  href={productsHref({ ...listHrefOpts, category: active ? "all" : c.id })}
                >
                  <Badge
                    variant="secondary"
                    className={`cursor-pointer transition-shadow hover:shadow-sm ${active ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                    style={{ backgroundColor: (c.color ?? "#94a3b8") + "20", color: c.color ?? undefined }}
                  >
                    {c.name}
                  </Badge>
                </Link>
              );
            })}
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
                name="category"
                defaultValue={selectedCategory}
                className="w-44"
                options={categoryOptions}
              />
              <FormSelect
                name="type"
                defaultValue={typeFilter}
                className="w-36"
                options={typeOptions}
              />
              {showArchived ? <input type="hidden" name="archived" value="1" /> : null}
              <Button type="submit" variant="outline" size="sm" className="h-8">{t.common.filter}</Button>
            </form>
          </div>
          {categories.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-500">{t.products.filterCategoryHint}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={productsHref({ ...listHrefOpts, category: "all" })}>
                  <Badge
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                  >
                    {t.products.allCategories}
                  </Badge>
                </Link>
                {categories.map((c) => {
                  const active = selectedCategory === c.id;
                  return (
                    <Link key={c.id} href={productsHref({ ...listHrefOpts, category: c.id })}>
                      <Badge
                        variant="secondary"
                        className={`cursor-pointer text-xs transition-shadow hover:shadow-sm ${active ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                        style={{ backgroundColor: (c.color ?? "#94a3b8") + "20", color: c.color ?? undefined }}
                      >
                        {c.name}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
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
