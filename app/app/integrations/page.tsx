import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { IntegrationCards } from "@/components/app/IntegrationCards";
import { Store } from "lucide-react";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ install_error?: string }>;
}) {
  const params = await searchParams;
  const { orgId, countryCode } = await getKitchenOpsContext();
  const isRO = countryCode === "RO";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Marketplace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRO
              ? "Activează integrările și modulele incluse în planul tău. Dezactivarea ascunde meniurile fără să șteargă datele."
              : "Enable integrations and modules included in your plan. Turning one off hides menus without deleting data."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Store className="h-4 w-4" />
          {isRO ? "Disponibil și în Setări → Marketplace" : "Also available in Settings → Marketplace"}
        </div>
      </div>

      <IntegrationCards
        orgId={orgId}
        countryCode={countryCode}
        installError={params?.install_error ? decodeURIComponent(params.install_error) : null}
        returnTo="/app/integrations"
      />
    </div>
  );
}
