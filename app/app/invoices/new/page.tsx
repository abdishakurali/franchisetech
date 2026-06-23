import { InvoiceDraftForm } from "@/components/app/InvoiceDraftForm";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { listActiveVatRates } from "@/lib/vat-rates-server";

export default async function NewInvoicePage() {
  const { supabase, orgId } = await getKitchenOpsContext();
  const vatRates = await listActiveVatRates(supabase, orgId);
  return <InvoiceDraftForm vatRates={vatRates} />;
}
