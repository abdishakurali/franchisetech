import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, ExternalLink, Plug } from "lucide-react";

type IntegrationStatus = "connected" | "available" | "coming_soon";

type Integration = {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: IntegrationStatus;
  settingsHref?: string;
  docsHref?: string;
  category: string;
};

export default async function IntegrationsPage() {
  const { supabase, orgId, countryCode } = await getKitchenOpsContext();
  const { t } = await getAppLocaleAndText();
  const isRO = countryCode === "RO";

  // Check connected integrations
  const [glovoResult, anafResult] = await Promise.all([
    supabase
      .from("delivery_integrations")
      .select("provider,active")
      .eq("organisation_id", orgId)
      .eq("provider", "glovo")
      .eq("active", true)
      .maybeSingle(),
    isRO
      ? supabase
          .from("organisations")
          .select("anaf_cif")
          .eq("id", orgId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const glovoConnected = !!glovoResult.data;
  const anafConnected = !!(anafResult.data as { anaf_cif?: string | null } | null)?.anaf_cif;

  const integrations: Integration[] = [
    {
      id: "fiscalnet",
      name: "FiscalNet",
      logo: "🖨️",
      description: isRO
        ? "Casă fiscală omologată ANAF. Bonuri fiscale, raport Z, deschidere sertar."
        : "Fiscal printer integration for compliant receipts.",
      status: "available",
      settingsHref: "/app/settings?tab=hardware",
      docsHref: "/help/romania-fiscalnet",
      category: isRO ? "Fiscal" : "Hardware",
    },
    ...(isRO ? [{
      id: "anaf-efactura",
      name: "ANAF e-Factura",
      logo: "🧾",
      description: "Trimitere automată factură B2B în SPV prin OAuth ANAF.",
      status: anafConnected ? "connected" as IntegrationStatus : "available" as IntegrationStatus,
      settingsHref: "/app/settings?tab=anaf",
      docsHref: "/help",
      category: "Fiscal",
    }] : []),
    {
      id: "glovo",
      name: "Glovo",
      logo: "🟡",
      description: isRO
        ? "Comenzile Glovo apar direct în POS fără reintroducere manuală."
        : "Glovo delivery orders sync directly into POS.",
      status: glovoConnected ? "connected" : "available",
      settingsHref: "/app/settings?tab=features",
      category: isRO ? "Livrare" : "Delivery",
    },
    {
      id: "tazz",
      name: "Tazz by eMAG",
      logo: "🔴",
      description: isRO
        ? "Sincronizare comenzi Tazz în POS. Disponibil curând."
        : "Tazz orders sync to POS. Coming soon.",
      status: "coming_soon",
      category: isRO ? "Livrare" : "Delivery",
    },
    {
      id: "bolt-food",
      name: "Bolt Food",
      logo: "⚡",
      description: isRO
        ? "Comenzi Bolt Food direct în POS. Disponibil curând."
        : "Bolt Food orders to POS. Coming soon.",
      status: "coming_soon",
      category: isRO ? "Livrare" : "Delivery",
    },
    {
      id: "smartbill",
      name: "SmartBill",
      logo: "📄",
      description: isRO
        ? "Export vânzări și facturi direct în SmartBill pentru contabil."
        : "Export sales and invoices to SmartBill for your accountant.",
      status: "coming_soon",
      category: isRO ? "Contabilitate" : "Accounting",
    },
    {
      id: "saga",
      name: "Saga",
      logo: "📊",
      description: isRO
        ? "Export XML Saga și CSV contabilitate disponibil în Rapoarte → Audit."
        : "Saga XML export available under Reports → Audit.",
      status: "available",
      settingsHref: "/app/reports/audit-export",
      category: isRO ? "Contabilitate" : "Accounting",
    },
    {
      id: "posthog",
      name: "PostHog Analytics",
      logo: "🦔",
      description: "Product analytics, funnel tracking, and session recording.",
      status: "connected",
      category: "Analytics",
    },
  ];

  const categories = [...new Set(integrations.map((i) => i.category))];

  const statusBadge = (status: IntegrationStatus) => {
    if (status === "connected") return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />Connected</Badge>;
    if (status === "coming_soon") return <Badge variant="outline" className="text-slate-400"><Clock className="h-3 w-3 mr-1" />Coming soon</Badge>;
    return <Badge variant="outline">Available</Badge>;
  };

  return (
    <div className="space-y-8 p-4 sm:p-6">
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
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">
            {integrations.filter((i) => i.status === "connected").length} {isRO ? "conectate" : "connected"}
          </span>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.filter((i) => i.category === category).map((integration) => (
              <Card key={integration.id} className={integration.status === "coming_soon" ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>{integration.logo}</span>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                      </div>
                    </div>
                    {statusBadge(integration.status)}
                  </div>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                {integration.status !== "coming_soon" && (
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    {integration.settingsHref && (
                      <Link href={integration.settingsHref}>
                        <Button size="sm" variant={integration.status === "connected" ? "outline" : "default"} className="h-7 text-xs">
                          {integration.status === "connected"
                            ? (isRO ? "Gestionează" : "Manage")
                            : (isRO ? "Configurează" : "Set up")}
                        </Button>
                      </Link>
                    )}
                    {integration.docsHref && (
                      <Link href={integration.docsHref} target="_blank">
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {isRO ? "Ghid" : "Guide"}
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          {isRO
            ? "Ai nevoie de o integrare care nu apare aici? Scrie-ne și o adăugăm pe roadmap."
            : "Need an integration not listed here? Let us know and we'll add it to the roadmap."}
        </p>
        <Link href="/help" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
          {isRO ? "Contactează-ne" : "Contact us"} <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
