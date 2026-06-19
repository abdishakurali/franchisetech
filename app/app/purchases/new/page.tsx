import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { listAccessibleSites } from "@/lib/site-context";
import { PurchaseForm } from "@/components/app/PurchaseForm";

export default async function PurchasesNewPage() {
  const { supabase, orgId, currency, membership, user } = await getKitchenOpsContext();
  const [suppRes, prodRes, sites] = await Promise.all([
    supabase.from("suppliers").select("id,name").eq("organisation_id", orgId).order("name"),
    supabase
      .from("products")
      .select("id,name,unit_of_measure,item_type,is_ingredient")
      .eq("organisation_id", orgId)
      .eq("active", true)
      .or("is_purchaseable.eq.true,is_ingredient.eq.true")
      .order("name"),
    listAccessibleSites(supabase, orgId, membership.id, membership.role),
  ]);
  return (
    <PurchaseForm
      suppliers={suppRes.data ?? []}
      products={(prodRes.data ?? []) as never}
      sites={sites}
      currency={currency}
      currentUserId={user?.id}
    />
  );
}
