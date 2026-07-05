import { createClient } from "@/lib/supabase/server";
import { setBusinessModuleInstalled } from "@/app/actions/org-settings";
import { ChatRequestButton } from "@/components/app/ChatRequestButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MARKETPLACE_PRODUCT_ORDER,
  MARKETPLACE_PRODUCTS,
  addonPriceLabel,
  marketplaceAllowsSelfInstall,
  type CatalogItem,
  type CatalogLocale,
  type MarketplaceProductKey,
} from "@/lib/billing/catalog";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type MarketplaceStatus = "active" | "available";

type CardDef = {
  id: MarketplaceProductKey;
  item: CatalogItem;
  status: MarketplaceStatus;
  installKey?: MarketplaceProductKey;
};

interface IntegrationCardsProps {
  orgId: string;
  countryCode: string | null;
  installError?: string | null;
  returnTo?: string;
}

function StatusBadge({ status, isRO }: { status: MarketplaceStatus; isRO: boolean }) {
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {isRO ? "Activ" : "Active"}
      </Badge>
    );
  }
  return <Badge variant="outline">{isRO ? "Disponibil" : "Available"}</Badge>;
}

function ProductLogo({ src, name }: { src?: string; name: string }) {
  if (!src) {
    return (
      <div className="flex h-8 w-32 items-center text-sm font-semibold text-blue-700">
        FranchiseTech
      </div>
    );
  }
  return (
    <div className="relative h-8 w-32 flex-shrink-0">
      <Image src={src} alt={name} fill className="object-contain object-left" />
    </div>
  );
}

export async function IntegrationCards({
  orgId,
  countryCode,
  installError,
  returnTo = "/app/settings?tab=integrations",
}: IntegrationCardsProps) {
  const supabase = await createClient();
  const locale: CatalogLocale = countryCode === "RO" ? "ro" : "en";
  const isRO = locale === "ro";

  const orgSettingsResult = await supabase
    .from("organisations")
    .select("kitchen_display_enabled,table_service_enabled,saga_export_enabled,fiscalnet_enabled,efactura_enabled")
    .eq("id", orgId)
    .maybeSingle();
  let orgSettings = orgSettingsResult.data as Record<string, unknown> | null;
  const orgSettingsError = orgSettingsResult.error;

  if (
    orgSettingsError?.code === "42703" ||
    orgSettingsError?.code === "PGRST204" ||
    (orgSettingsError?.message ?? "").toLowerCase().includes("efactura_enabled")
  ) {
    const fallback = await supabase
      .from("organisations")
      .select("kitchen_display_enabled,saga_export_enabled,fiscalnet_enabled")
      .eq("id", orgId)
      .maybeSingle();
    orgSettings = fallback.data as Record<string, unknown> | null;
  }

  const cards: CardDef[] = MARKETPLACE_PRODUCT_ORDER.map((id) => {
    const item = MARKETPLACE_PRODUCTS[id];
    let status: MarketplaceStatus = "available";
    if (id === "kitchen_display" && orgSettings?.kitchen_display_enabled) status = "active";
    if (id === "table_service" && orgSettings?.table_service_enabled) status = "active";
    if (id === "saga_export" && orgSettings?.saga_export_enabled) status = "active";
    if (id === "fiscalnet" && orgSettings?.fiscalnet_enabled) status = "active";
    if (id === "anaf_efactura" && orgSettings?.efactura_enabled) status = "active";
    return { id, item, status, installKey: item.installKey ?? id };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          {isRO ? "Marketplace" : "Marketplace"}
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          {isRO
            ? "Activează integrările și modulele incluse în planul tău. Dezactivarea ascunde meniurile și câmpurile, fără să șteargă datele."
            : "Enable integrations and modules included in your plan. Turning one off hides menus and fields without deleting data."}
        </p>
        {installError ? (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{installError}</p>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const name = card.item.name[locale];
            const active = card.status === "active";
            return (
              <Card key={card.id}>
                <CardHeader className="pb-2">
                  <div className="mb-2.5">
                    <ProductLogo src={card.item.logo} name={name} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold text-slate-800">{name}</CardTitle>
                    <StatusBadge status={card.status} isRO={isRO} />
                  </div>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {card.item.description[locale]}
                  </CardDescription>
                  <p className="pt-1 text-xs font-semibold text-slate-700">
                    {addonPriceLabel(card.item, locale)}
                    {(card.id === "fiscalnet" || card.id === "anaf_efactura") && (
                      <span className="font-normal text-slate-500">
                        {" "}
                        {isRO ? "în FranchiseTech" : "in FranchiseTech"}
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {card.installKey && !active && !marketplaceAllowsSelfInstall(card.item) ? (
                    <ChatRequestButton label={isRO ? "Contactați-ne" : "Contact us"} />
                  ) : card.installKey ? (
                    <form action={setBusinessModuleInstalled}>
                      <input type="hidden" name="module" value={card.installKey} />
                      <input type="hidden" name="installed" value={active ? "false" : "true"} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <Button
                        type="submit"
                        size="sm"
                        variant={active ? "outline" : "default"}
                        className="h-7 text-xs"
                      >
                        {active
                          ? isRO ? "Dezinstalează" : "Uninstall"
                          : isRO ? "Activează" : "Enable"}
                      </Button>
                    </form>
                  ) : null}
                  {card.item.settingsHref && active && (
                    <Link href={card.item.settingsHref}>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        {isRO ? "Configurează" : "Configure"}
                      </Button>
                    </Link>
                  )}
                  {card.item.docsHref && (
                    <Link href={card.item.docsHref} target="_blank">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {isRO ? "Ghid" : "Guide"}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
