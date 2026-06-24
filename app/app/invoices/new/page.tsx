import { InvoiceDraftForm } from "@/components/app/InvoiceDraftForm";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { mapUnitOfMeasureToAnafCode } from "@/lib/anaf/unit-codes";
import { listActiveVatRates } from "@/lib/vat-rates-server";

type PurchaseItemRow = {
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
  const { supabase, orgId } = await getKitchenOpsContext();
  const [vatRates, productsResult] = await Promise.all([
    listActiveVatRates(supabase, orgId),
    supabase
      .from("products")
      .select("id,name,sale_price,cost_price,vat_rate,unit_of_measure,active")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .order("name", { ascending: true })
      .limit(500),
  ]);

  const products = (productsResult.data ?? []).map((product) => ({
    id: String(product.id),
    name: String(product.name ?? ""),
    unitCode: mapUnitOfMeasureToAnafCode(product.unit_of_measure),
    unitPrice: Number(product.sale_price ?? product.cost_price ?? 0),
    vatRate: product.vat_rate === null ? null : Number(product.vat_rate),
  }));

  let initialDraft = undefined;
  if (params?.purchaseId) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select(`
        id,invoice_number,purchase_date,supplier_invoice_date,
        suppliers!purchases_supplier_id_fkey(name,tax_id,address),
        purchase_items(product_name,item_name,quantity,unit_cost,tax_rate,unit_of_measure)
      `)
      .eq("id", params.purchaseId)
      .eq("organisation_id", orgId)
      .maybeSingle();

    if (purchase) {
      const supplier = purchase.suppliers as { name?: string | null; tax_id?: string | null; address?: string | null } | null;
      const items = (purchase.purchase_items ?? []) as PurchaseItemRow[];
      initialDraft = {
        invoiceNumber: purchase.invoice_number ? `FACT-${purchase.invoice_number}` : undefined,
        issueDate: String(purchase.supplier_invoice_date ?? purchase.purchase_date ?? "").slice(0, 10) || undefined,
        buyerCif: supplier?.tax_id ?? "",
        buyerName: supplier?.name ?? "",
        buyerAddress: supplier?.address ?? "",
        lines: items.map((item) => ({
          name: item.product_name ?? item.item_name ?? "",
          unitCode: mapUnitOfMeasureToAnafCode(item.unit_of_measure),
          quantity: String(item.quantity ?? 1),
          unitPrice: String(item.unit_cost ?? ""),
          vatRate: item.tax_rate === null || item.tax_rate === undefined ? undefined : String(item.tax_rate),
        })),
      };
    }
  }

  return <InvoiceDraftForm vatRates={vatRates} products={products} initialDraft={initialDraft} />;
}
