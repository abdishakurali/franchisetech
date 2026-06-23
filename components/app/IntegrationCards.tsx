import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type IntegrationStatus = "connected" | "available" | "coming_soon";

type IntegrationDef = {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: IntegrationStatus;
  settingsHref?: string;
  docsHref?: string;
  category: string;
};

interface IntegrationCardsProps {
  orgId: string;
  countryCode: string | null;
}

function StatusBadge({ status, isRO }: { status: IntegrationStatus; isRO: boolean }) {
  if (status === "connected")
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {isRO ? "Conectat" : "Connected"}
      </Badge>
    );
  if (status === "coming_soon")
    return (
      <Badge variant="outline" className="text-slate-400">
        <Clock className="h-3 w-3 mr-1" />
        {isRO ? "În curând" : "Coming soon"}
      </Badge>
    );
  return <Badge variant="outline">{isRO ? "Disponibil" : "Available"}</Badge>;
}

function IntegrationLogo({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-slate-100">
      <Image src={src} alt={name} width={40} height={40} className="object-contain" />
    </div>
  );
}

export async function IntegrationCards({ orgId, countryCode }: IntegrationCardsProps) {
  const supabase = await createClient();
  const isRO = countryCode === "RO";

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

  const integrations: IntegrationDef[] = [
    {
      id: "fiscalnet",
      name: "FiscalNet",
      logo: "/integrations/fiscalnet.svg",
      description: isRO
        ? "Casă fiscală omologată ANAF. Bonuri fiscale, raport Z, deschidere sertar."
        : "Fiscal printer for compliant receipts, Z-report, cash drawer.",
      status: "available",
      settingsHref: "/app/settings?tab=fiscal",
      docsHref: "/help/romania-fiscalnet",
      category: isRO ? "Fiscal" : "Hardware",
    },
    ...(isRO
      ? [
          {
            id: "anaf-efactura",
            name: "ANAF e-Factura",
            logo: "/integrations/anaf.svg",
            description: "Trimitere automată factură B2B în SPV prin OAuth ANAF.",
            status: anafConnected ? ("connected" as IntegrationStatus) : ("available" as IntegrationStatus),
            settingsHref: "/app/settings?tab=anaf",
            docsHref: "/help",
            category: "Fiscal",
          },
        ]
      : []),
    {
      id: "glovo",
      name: "Glovo",
      logo: "/integrations/glovo.svg",
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
      logo: "/integrations/tazz.svg",
      description: isRO
        ? "Sincronizare comenzi Tazz în POS. Disponibil curând."
        : "Tazz orders sync to POS. Coming soon.",
      status: "coming_soon",
      category: isRO ? "Livrare" : "Delivery",
    },
    {
      id: "bolt-food",
      name: "Bolt Food",
      logo: "/integrations/bolt-food.svg",
      description: isRO
        ? "Comenzi Bolt Food direct în POS. Disponibil curând."
        : "Bolt Food orders to POS. Coming soon.",
      status: "coming_soon",
      category: isRO ? "Livrare" : "Delivery",
    },
    {
      id: "smartbill",
      name: "SmartBill",
      logo: "/integrations/smartbill.svg",
      description: isRO
        ? "Export vânzări și facturi direct în SmartBill pentru contabil."
        : "Export sales and invoices to SmartBill for your accountant.",
      status: "coming_soon",
      category: isRO ? "Contabilitate" : "Accounting",
    },
    {
      id: "saga",
      name: "Saga",
      logo: "/integrations/saga.svg",
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
      logo: "/integrations/posthog.svg",
      description: "Product analytics, funnel tracking, and session recording.",
      status: "connected",
      category: "Analytics",
    },
  ];

  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === category)
              .map((integration) => (
                <Card
                  key={integration.id}
                  className={integration.status === "coming_soon" ? "opacity-60" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <IntegrationLogo src={integration.logo} name={integration.name} />
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                      </div>
                      <StatusBadge status={integration.status} isRO={isRO} />
                    </div>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  {integration.status !== "coming_soon" && (
                    <CardContent className="flex flex-wrap gap-2 pt-0">
                      {integration.settingsHref && (
                        <Link href={integration.settingsHref}>
                          <Button
                            size="sm"
                            variant={integration.status === "connected" ? "outline" : "default"}
                            className="h-7 text-xs"
                          >
                            {integration.status === "connected"
                              ? isRO
                                ? "Gestionează"
                                : "Manage"
                              : isRO
                                ? "Configurează"
                                : "Set up"}
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
        <Link
          href="/help"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          {isRO ? "Contactează-ne" : "Contact us"} <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
