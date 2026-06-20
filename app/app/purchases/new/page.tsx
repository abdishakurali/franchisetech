import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { listAccessibleSites } from "@/lib/site-context";
import { PurchaseForm } from "@/components/app/PurchaseForm";
import { ensurePosDefaults } from "@/app/actions/kitchenops";
import { listActiveVatRates } from "@/lib/vat-rates-server";
import { requireBusinessModule } from "@/lib/module-guard";

export default async function PurchasesNewPage() {
  await requireBusinessModule("inventory");
  const { supabase, orgId, currency, membership, user } = await getKitchenOpsContext();
  await ensurePosDefaults();
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
  return (
    <PurchaseForm
      suppliers={suppRes.data ?? []}
      products={(prodRes.data ?? []) as never}
      sites={sites}
      currency={currency}
      currentUserId={user?.id}
      vatRates={vatRates}
    />
  );
}
