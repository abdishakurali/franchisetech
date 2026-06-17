import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { PurchaseForm } from "@/components/app/PurchaseForm";

export default async function PurchasesNewPage() {
  const { supabase, orgId, currency } = await getKitchenOpsContext();
  const [suppRes, prodRes] = await Promise.all([
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    // Only show purchaseable/ingredient items — not finished products
    supabase
      .from("products")
      .select("id,name,unit_of_measure,item_type,is_ingredient")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .or("is_purchaseable.eq.true,is_ingredient.eq.true")
      .order("name"),
  ]);
  return (
    <PurchaseForm
      suppliers={suppRes.data ?? []}
      products={(prodRes.data ?? []) as never}
      currency={currency}
    />
  );
}
