import Link from "next/link";
import { redirect } from "next/navigation";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { ProductAddForm } from "@/components/app/ProductAddForm";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { getDefaultVatRateValue } from "@/lib/vat-rates";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { productModuleVisibility } from "@/lib/product-module-fields";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { listOperationalUnitNames } from "@/lib/units-of-measure";

function safeProductsReturnTo(value: string | undefined): string | undefined {
  return value?.startsWith("/app/products") ? value : undefined;
}

export default async function ProductsNewPage({ searchParams }: { searchParams?: Promise<{ type?: string; returnTo?: string }> }) {
  const { supabase, orgId, membership, currency, countryCode, profileLocale } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const pf = t.productsForm;
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as { kitchen_stations_enabled?: boolean | null } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);

  const params = await searchParams;
  const returnTo = safeProductsReturnTo(params?.returnTo);
  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const visibility = productModuleVisibility(moduleFlags);
  const wantsIngredient = params?.type === "ingredient";
  const defaultIngredient = wantsIngredient && (visibility.inventory || visibility.recipeCosting);

  if (wantsIngredient && !defaultIngredient) redirect("/app/products/new");

  const [{ data: inventoryCategories }, { data: posCategories }, units, { data: suppliers }, vatRates] = await Promise.all([
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).eq("category_type", "inventory").order("name"),
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).eq("category_type", "pos").order("name"),
    listOperationalUnitNames(supabase, orgId),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    listActiveVatRates(supabase, orgId),
  ]);

  const defaultVatRate = getDefaultVatRateValue(vatRates);
  const sym = currency === "RON" ? "lei" : currency === "GBP" ? "£" : "€";

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href={returnTo || "/app/products"} className="text-sm text-muted-foreground hover:text-foreground">← {pf.backToProducts}</Link>
        <h1 className="text-2xl font-semibold text-foreground">
          {defaultIngredient ? pf.addIngredient : pf.addProduct}
        </h1>
      </div>

      <ProductAddForm
        defaultIngredient={Boolean(defaultIngredient)}
        categories={inventoryCategories ?? []}
        posCategories={posCategories ?? []}
        suppliers={suppliers ?? []}
        units={units}
        vatRates={vatRates}
        defaultVatRate={defaultVatRate}
        visibility={visibility}
        currencySymbol={sym}
        kitchenStationsEnabled={kitchenStationsEnabled}
        returnTo={returnTo}
      />
    </div>
  );
}
