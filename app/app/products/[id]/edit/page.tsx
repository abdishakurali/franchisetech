import Link from "next/link";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { ensurePosDefaults } from "@/app/actions/kitchenops";
import { ProductEditForm } from "@/components/app/ProductEditForm";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { productModuleVisibility } from "@/lib/product-module-fields";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { listOperationalUnitNames } from "@/lib/units-of-measure";

function safeProductsReturnTo(value: string | undefined): string | undefined {
  return value?.startsWith("/app/products") ? value : undefined;
}

export default async function ProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const returnTo = safeProductsReturnTo((await searchParams)?.returnTo);
  const { supabase, orgId, membership, currency, countryCode, profileLocale } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const currencySymbol = currency === "RON" ? "lei" : "€";
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as {
    kitchen_stations_enabled?: boolean | null;
  } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);
  await ensurePosDefaults();

  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const visibility = productModuleVisibility(moduleFlags);

  const [{ data: product }, { data: inventoryCategories }, { data: posCategories }, units, { data: suppliers }, vatRates] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).eq("organisation_id", orgId).single(),
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).eq("category_type", "inventory").order("name"),
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).eq("category_type", "pos").order("name"),
    listOperationalUnitNames(supabase, orgId),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    listActiveVatRates(supabase, orgId),
  ]);

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-slate-500">{t.productsForm.productNotFound}</p>
        <Link href={returnTo || "/app/products"} className="mt-2 inline-block text-sm text-blue-600 hover:underline">
          ← {t.productsForm.backToProducts}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6 sm:py-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href={returnTo || "/app/products"} className="hover:text-slate-800">{t.productsForm.backToProducts}</Link>
        <span aria-hidden>/</span>
        <Link href={`/app/products/${id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="truncate max-w-[12rem] hover:text-slate-800">
          {product.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-900">{t.common.edit}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-slate-950">
        {t.productsForm.editProduct}
      </h1>

      <ProductEditForm
        product={product}
        categories={inventoryCategories ?? []}
        posCategories={posCategories ?? []}
        suppliers={suppliers ?? []}
        units={units}
        vatRates={vatRates}
        visibility={visibility}
        currencySymbol={currencySymbol}
        kitchenStationsEnabled={kitchenStationsEnabled}
        returnTo={returnTo}
      />
    </div>
  );
}
