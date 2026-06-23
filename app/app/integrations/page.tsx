import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { IntegrationCards } from "@/components/app/IntegrationCards";
import { Plug } from "lucide-react";

export default async function IntegrationsPage() {
  const { orgId, countryCode } = await getKitchenOpsContext();
  const isRO = countryCode === "RO";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {isRO ? "Integrări" : "Integrations"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRO
              ? "Conectează franchisetech cu instrumentele pe care le folosești deja."
              : "Connect franchisetech with the tools you already use."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Plug className="h-4 w-4" />
          {isRO ? "Disponibil și în Setări → Integrări" : "Also available in Settings → Integrations"}
        </div>
      </div>

      <IntegrationCards orgId={orgId} countryCode={countryCode} />
    </div>
  );
}
