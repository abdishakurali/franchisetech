import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { KitchenDisplayClient } from "@/components/app/KitchenDisplayClient";
import { requireActiveSite } from "@/lib/site-context";

function canManage(role: string | null | undefined) {
  return ["owner", "manager"].includes(role ?? "");
}

function canUpdateKitchen(role: string | null | undefined) {
  return ["owner", "manager", "kitchen"].includes(role ?? "");
}

export default async function KitchenPage() {
  const { supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const orgRow = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;
  const enabled = Boolean((orgRow as { kitchen_display_enabled?: boolean | null } | null)?.kitchen_display_enabled);
  const stationsEnabled = Boolean((orgRow as { kitchen_stations_enabled?: boolean | null } | null)?.kitchen_stations_enabled);

  if (!enabled) {
    return (
      <div className="max-w-3xl p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Display is not enabled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Kitchen Display is optional. POS works normally until an owner or manager enables it.
            </p>
            {canManage(membership.role) && (
              <Link href="/app/settings?tab=features">
                <Button>Enable in Settings</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resolve active site and check access
  const { siteId: activeSiteId } = await requireActiveSite(supabase, orgId, membership.id, membership.role);

  // Fetch active orders with kitchen_station on items — scoped to active site
  const { data: orders } = await supabase
    .from("kitchen_orders")
    .select("id,order_number,status,created_at,order_type,table_label,note,kitchen_order_items(id,name,quantity,note,modifiers,unit_price,line_total,image_url,kitchen_station)")
    .eq("organisation_id", orgId)
    .eq("site_id", activeSiteId)
    .in("status", ["sent", "preparing", "ready"])
    .order("created_at", { ascending: true });

  // Find which stations are actually used by products in this org (for the tab strip)
  let activeStations: string[] = [];
  if (stationsEnabled) {
    const { data: stationRows } = await supabase
      .from("products")
      .select("kitchen_station")
      .eq("organisation_id", orgId)
      .eq("available_in_pos", true)
      .not("kitchen_station", "is", null);

    const stationSet = new Set(
      (stationRows ?? [])
        .map((r: { kitchen_station: string | null }) => r.kitchen_station)
        .filter((s): s is string => Boolean(s))
    );

    // Keep display order: bar → starters → mains → vegetables → desserts → cold_prep → hot_kitchen → custom
    const ORDER = ["bar","starters","mains","vegetables","desserts","cold_prep","hot_kitchen"];
    activeStations = [
      ...ORDER.filter((s) => stationSet.has(s)),
      ...[...stationSet].filter((s) => !ORDER.includes(s)).sort(),
    ];
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Kitchen Display</h1>
          <p className="mt-1 text-sm text-slate-500">Orders created after Kitchen Display was enabled appear here.</p>
        </div>
        <Link href="/app/settings?tab=features">
          <Button variant="outline">Feature settings</Button>
        </Link>
      </div>
      <KitchenDisplayClient
        orders={(orders ?? []) as never}
        canUpdate={canUpdateKitchen(membership.role)}
        currency={currency}
        stationsEnabled={stationsEnabled}
        activeStations={activeStations}
      />
    </div>
  );
}
