import { redirect } from "next/navigation";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { listAccessibleSites } from "@/lib/site-context";
import { PurchaseForm, type PurchaseDraftInitial } from "@/components/app/PurchaseForm";
import { ensurePosDefaults } from "@/app/actions/kitchenops";
import { listActiveVatRates } from "@/lib/vat-rates-server";

export default async function PurchaseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, orgId, currency, membership, user } = await getKitchenOpsContext();
  await ensurePosDefaults();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id,status,supplier_id,purchase_date,nir_date,invoice_number,supplier_invoice_date,site_id,notes,purchase_items(product_id,quantity,unit_cost,tax_rate,unit_of_measure)")
    .eq("id", id)
    .eq("organisation_id", orgId)
    .single();

  if (!purchase || purchase.status !== "draft") redirect(`/app/purchases/${id}`);

  const [suppRes, prodRes, sites, vatRates] = await Promise.all([
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    supabase
      .from("products")
      .select("id,name,unit_of_measure,item_type,is_ingredient,vat_rate")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .or("is_purchaseable.eq.true,is_ingredient.eq.true")
      .order("name"),
    listAccessibleSites(supabase, orgId, membership.id, membership.role),
    listActiveVatRates(supabase, orgId),
  ]);

  type ItemRow = {
    product_id: string;
    quantity: number;
    unit_cost: number;
    tax_rate: number;
    unit_of_measure: string | null;
  };

  const initialDraft: PurchaseDraftInitial = {
    id: purchase.id,
    supplier_id: purchase.supplier_id,
    purchase_date: purchase.purchase_date,
    nir_date: purchase.nir_date,
    invoice_number: purchase.invoice_number,
    supplier_invoice_date: purchase.supplier_invoice_date,
    site_id: purchase.site_id,
    notes: purchase.notes,
    items: ((purchase.purchase_items ?? []) as ItemRow[]).filter((i) => i.product_id),
  };

  return (
    <PurchaseForm
      suppliers={suppRes.data ?? []}
      products={(prodRes.data ?? []) as never}
      sites={sites}
      currency={currency}
      currentUserId={user?.id}
      initialDraft={initialDraft}
      vatRates={vatRates}
    />
  );
}
