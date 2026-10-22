import { InvoiceDraftForm } from "@/components/app/InvoiceDraftForm";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { mapUnitOfMeasureToAnafCode } from "@/lib/anaf/unit-codes";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { redirect } from "next/navigation";
import { suggestNextInvoiceNumber } from "@/app/actions/efactura";

type PurchaseItemRow = {
  product_id: string | number | null;
  product_name: string | null;
  item_name: string | null;
  quantity: number | null;
  unit_cost: number | null;
  tax_rate: number | null;
  unit_of_measure: string | null;
};

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams?: Promise<{ purchaseId?: string }>;
}) {
  const params = await searchParams;
  const { supabase, orgId, user } = await getKitchenOpsContext();
  const { data: org } = await supabase
    .from("organisations")
    .select("efactura_enabled")
    .eq("id", orgId)
    .maybeSingle();
  if (!org?.efactura_enabled) redirect("/app/settings?tab=integrations");

  const [vatRates, productsResult, recipesResult, customersResult, profileResult, nextNumber] = await Promise.all([
    listActiveVatRates(supabase, orgId),
    supabase
      .from("products")
      .select("id,name,sale_price,cost_price,vat_rate,unit_of_measure,active,is_stock_tracked")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .order("name", { ascending: true })
      .limit(500),
    supabase.from("recipes").select("product_id").eq("organisation_id", orgId).eq("is_active", true),
    supabase
      .from("customers")
      .select("id,name,tax_id,registration_code,address")
      .eq("organisation_id", orgId)
      .order("name")
      .limit(300),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    suggestNextInvoiceNumber(),
  ]);

  const productsWithRecipe = new Set((recipesResult.data ?? []).map((r) => String(r.product_id)));
  const products = (productsResult.data ?? []).map((product) => ({
    id: String(product.id),
    name: String(product.name ?? ""),
    unitCode: mapUnitOfMeasureToAnafCode(product.unit_of_measure),
    unitPrice: Number(product.sale_price ?? product.cost_price ?? 0),
    vatRate: product.vat_rate === null ? null : Number(product.vat_rate),
    stockUnit: (product.unit_of_measure as string | null) ?? "each",
    deductsStock: Boolean(product.is_stock_tracked) || productsWithRecipe.has(String(product.id)),
  }));
  const customers = (customersResult.data ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name ?? ""),
    taxId: (c.tax_id as string | null) ?? null,
    registrationCode: (c.registration_code as string | null) ?? null,
    address: (c.address as string | null) ?? null,
  }));

  let initialDraft: Parameters<typeof InvoiceDraftForm>[0]["initialDraft"] = {
    issuerName: (profileResult.data?.full_name as string | null) ?? undefined,
  };
  if (params?.purchaseId) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select(`
        id,invoice_number,purchase_date,supplier_invoice_date,
        suppliers!purchases_supplier_id_fkey(name,tax_id,address),
        purchase_items(product_id,product_name,item_name,quantity,unit_cost,tax_rate,unit_of_measure)
      `)
      .eq("id", params.purchaseId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (purchase) {
      const supplier = purchase.suppliers as { name?: string | null; tax_id?: string | null; address?: string | null } | null;
      const items = (purchase.purchase_items ?? []) as PurchaseItemRow[];
      initialDraft = {
        ...initialDraft,
        invoiceNumber: purchase.invoice_number ? `FACT-${purchase.invoice_number}` : undefined,
        issueDate: String(purchase.supplier_invoice_date ?? purchase.purchase_date ?? "").slice(0, 10) || undefined,
        buyerCif: supplier?.tax_id ?? "",
        buyerName: supplier?.name ?? "",
        buyerAddress: supplier?.address ?? "",
        sourcePurchaseId: String(purchase.id),
        sourcePurchaseLabel: purchase.invoice_number ?? String(purchase.id),
        lines: items.map((item) => ({
          productId: item.product_id === null || item.product_id === undefined ? "" : String(item.product_id),
          name: item.product_name ?? item.item_name ?? "",
          unitCode: mapUnitOfMeasureToAnafCode(item.unit_of_measure),
          quantity: String(item.quantity ?? 1),
          unitPrice: String(item.unit_cost ?? ""),
          vatRate: item.tax_rate === null || item.tax_rate === undefined ? undefined : String(item.tax_rate),
        })),
      };
    }
  }

  return <InvoiceDraftForm vatRates={vatRates} products={products} customers={customers} initialDraft={initialDraft} nextNumberHint={nextNumber} />;
}
