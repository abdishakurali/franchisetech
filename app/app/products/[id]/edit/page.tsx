import Link from "next/link";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { ensurePosDefaults } from "@/app/actions/kitchenops";
import { ProductEditForm } from "@/components/app/ProductEditForm";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { itemTypeSelectOptions, productModuleVisibility } from "@/lib/product-module-fields";

const DEFAULT_UNITS = ["each", "portion", "kg", "g", "litre", "ml", "cup", "bottle", "box", "case", "pack"];

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const isRO = currency === "RON";
  const currencySymbol = isRO ? "lei" : "€";
  const orgInfo = (Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations) as {
    kitchen_stations_enabled?: boolean | null;
  } | null;
  const kitchenStationsEnabled = Boolean(orgInfo?.kitchen_stations_enabled);
  await ensurePosDefaults();

  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const visibility = productModuleVisibility(moduleFlags);
  const itemTypes = itemTypeSelectOptions(visibility, isRO);

  const [{ data: product }, { data: categories }, { data: units }, { data: suppliers }, vatRates] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).eq("organisation_id", orgId).single(),
    supabase.from("product_categories").select("id,name").eq("organisation_id", orgId).order("sort_order"),
    supabase.from("units_of_measure").select("name").or(`organisation_id.eq.${orgId},organisation_id.is.null`).order("name"),
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    listActiveVatRates(supabase, orgId),
  ]);

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Product not found.</p>
        <Link href="/app/products" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  const allUnits = [...new Set([...DEFAULT_UNITS, ...((units ?? []).map((u: { name: string }) => u.name))])];

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6 sm:py-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href="/app/products" className="hover:text-slate-800">Products</Link>
        <span aria-hidden>/</span>
        <Link href={`/app/products/${id}`} className="truncate max-w-[12rem] hover:text-slate-800">
          {product.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-slate-900">Edit</span>
      </nav>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-slate-950">
        {isRO ? "Editează produs" : "Edit product"}
      </h1>

      <ProductEditForm
        product={product}
        categories={categories ?? []}
        suppliers={suppliers ?? []}
        units={allUnits}
        vatRates={vatRates}
        visibility={visibility}
        itemTypes={itemTypes}
        kitchenStationsEnabled={kitchenStationsEnabled}
        isRO={isRO}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
