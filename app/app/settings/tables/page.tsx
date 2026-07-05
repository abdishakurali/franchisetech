export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAllTables, getFloorSections } from "@/app/actions/table-service";
import { TablesSettingsClient } from "@/components/app/TablesSettingsClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAccessibleSites, requireActiveSite } from "@/lib/site-context";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";

function canManage(role: string | null | undefined) {
  return role === "owner" || role === "manager";
}

export default async function TablesSettingsPage() {
  const { supabase, orgId, membership } = await getKitchenOpsContext();

  if (!canManage(membership.role)) {
    redirect("/app/settings");
  }

  const orgRow = Array.isArray(membership.organisations) ? membership.organisations[0] : membership.organisations;
  const tableServiceEnabled = Boolean((orgRow as { table_service_enabled?: boolean })?.table_service_enabled);

  const moduleFlags = await fetchOrgModuleFlags(supabase, orgId);
  const multiSite = moduleFlags.multi_site_ops_enabled === true;

  let activeSiteId: string | null = null;
  let sites: { id: string; name: string }[] = [];
  if (multiSite) {
    sites = await listAccessibleSites(supabase, orgId, membership.id, membership.role);
    const resolved = await requireActiveSite(supabase, orgId, membership.id, membership.role);
    activeSiteId = resolved.siteId;
  }

  const siteFilter = multiSite ? activeSiteId : undefined;
  const [tables, sections] = await Promise.all([
    getAllTables(siteFilter),
    getFloorSections(siteFilter),
  ]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Setări mese</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurează planul sălii — secțiuni, layout și mese.
          </p>
        </div>
        <Link href="/app/pos">
          <Button variant="outline" size="sm">Vezi sala în POS</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Modul gestionare mese</CardTitle>
            <Badge variant={tableServiceEnabled ? "default" : "outline"}>
              {tableServiceEnabled ? "Activ" : "Neactiv"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!tableServiceEnabled ? (
            <p className="text-sm text-muted-foreground">
              Activează modulul din{" "}
              <Link href="/app/settings?tab=integrations" className="text-primary underline">
                Integrări
              </Link>
              {" "}pentru a folosi mesele în POS.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Modul activ. Ospătarii aleg masa direct din{" "}
              <Link href="/app/pos" className="text-primary underline">POS</Link>.
            </p>
          )}
        </CardContent>
      </Card>

      {tableServiceEnabled && (
        <TablesSettingsClient
          tables={tables}
          sections={sections}
          sites={sites}
          multiSite={multiSite}
          activeSiteId={activeSiteId}
        />
      )}
    </div>
  );
}
