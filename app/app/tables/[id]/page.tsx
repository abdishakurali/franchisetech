import { redirect, notFound } from "next/navigation";
import { getTableWithStatus } from "@/app/actions/table-service";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { requireActiveSite } from "@/lib/site-context";

export default async function TableDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, orgId, membership } = await getKitchenOpsContext();
  const { siteId } = await requireActiveSite(supabase, orgId, membership.id, membership.role);
  const table = await getTableWithStatus(id, siteId);
  if (!table) notFound();

  if (table.active_tab) {
    redirect(`/app/pos?tabId=${table.active_tab.id}`);
  }
  redirect("/app/pos");
}
