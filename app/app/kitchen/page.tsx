import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { KitchenDisplayClient } from "@/components/app/KitchenDisplayClient";
import { requireActiveSite } from "@/lib/site-context";
import { getAppLocaleAndText } from "@/lib/app-locale-server";

function canManage(role: string | null | undefined) {
  return ["owner", "manager"].includes(role ?? "");
}

function canUpdateKitchen(role: string | null | undefined) {
  return ["owner", "manager", "kitchen"].includes(role ?? "");
}

export default async function KitchenPage() {
  const { countryCode, profileLocale, supabase, orgId, membership, currency } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText(countryCode, profileLocale);
  const orgRow = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;
  const enabled = Boolean((orgRow as { kitchen_display_enabled?: boolean | null } | null)?.kitchen_display_enabled);
  const stationsEnabled = Boolean((orgRow as { kitchen_stations_enabled?: boolean | null } | null)?.kitchen_stations_enabled);

  if (!enabled) {
    return (
      <div className="max-w-3xl p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.kitchen.notEnabled}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">{t.kitchen.notEnabledDesc}</p>
            {canManage(membership.role) && (
              <Link href="/app/settings?tab=integrations">
                <Button>{t.kitchen.enableInSettings}</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { siteId: activeSiteId } = await requireActiveSite(supabase, orgId, membership.id, membership.role);

  const { data: orders } = await supabase
    .from("kitchen_orders")
    .select("id,order_number,status,created_at,order_type,table_label,note,kitchen_order_items(id,name,quantity,note,modifiers,unit_price,line_total,image_url,kitchen_station)")
    .eq("organisation_id", orgId)
    .eq("site_id", activeSiteId)
    .in("status", ["sent", "preparing", "ready"])
    .order("created_at", { ascending: true });

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
          <h1 className="text-2xl font-semibold text-slate-950">{t.kitchen.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.kitchen.ordersDesc}</p>
        </div>
        <Link href="/app/settings?tab=integrations">
          <Button variant="outline">{t.kitchen.featureSettings}</Button>
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
