export type CatalogLocale = "ro" | "en";

export type PaidAddonKey = "kitchen_display" | "table_service";

export type ExternalIntegrationKey =
  | "fiscalnet"
  | "anaf_efactura";

export type IncludedModuleKey = "inventory" | "recipe_costing" | "team_advanced" | "multi_site";
export type MarketplaceProductKey = PaidAddonKey | "saga_export" | "fiscalnet" | "anaf_efactura";
export type InstallableProductKey = MarketplaceProductKey;

export type CatalogItem = {
  key: string;
  name: Record<CatalogLocale, string>;
  description: Record<CatalogLocale, string>;
  category: "included_module" | "paid_addon" | "external_integration";
  installKey?: InstallableProductKey;
  featureColumn?: "kitchen_display_enabled" | "table_service_enabled" | "saga_export_enabled" | "fiscalnet_enabled" | "efactura_enabled";
  entitlement?: "kitchen.enabled" | "kitchen.table_service" | "fiscal.fiscalnet" | "fiscal.efactura" | "reports.accountant_pack";
  onboardingHref?: string;
  navHref?: string;
  priceEur?: number;
  priceNote?: Record<CatalogLocale, string>;
  logo?: string;
  settingsHref?: string;
  docsHref?: string;
  /** When true, owners can enable from Integrations without contacting sales. */
  selfInstall?: boolean;
};

export const INCLUDED_MODULES: Record<IncludedModuleKey, CatalogItem> = {
  inventory: {
    key: "inventory",
    category: "included_module",
    name: { ro: "Stoc și achiziții", en: "Stock & purchases" },
    description: {
      ro: "Stocuri, furnizori, achiziții și recepții.",
      en: "Stock levels, suppliers, purchases, and receiving.",
    },
    settingsHref: "/app/settings?tab=operations",
  },
  recipe_costing: {
    key: "recipe_costing",
    category: "included_module",
    name: { ro: "Costuri rețete", en: "Recipe costing" },
    description: {
      ro: "Rețete, cost ingrediente și rapoarte de marjă.",
      en: "Recipes, ingredient costs, and margin reports.",
    },
    settingsHref: "/app/recipes",
  },
  team_advanced: {
    key: "team_advanced",
    category: "included_module",
    name: { ro: "Echipă și audit", en: "Team & audit" },
    description: {
      ro: "Roluri avansate, echipă și audit numerar.",
      en: "Advanced roles, team controls, and cash audit.",
    },
    settingsHref: "/app/settings/team",
  },
  multi_site: {
    key: "multi_site",
    category: "included_module",
    name: { ro: "Operațiuni multi-site", en: "Multi-site operations" },
    description: {
      ro: "Locații multiple și comutare între sedii.",
      en: "Multiple sites and site switching.",
    },
    settingsHref: "/app/sites",
  },
};

export const PAID_ADDONS: Record<PaidAddonKey, CatalogItem> = {
  kitchen_display: {
    key: "kitchen_display",
    category: "paid_addon",
    installKey: "kitchen_display",
    featureColumn: "kitchen_display_enabled",
    entitlement: "kitchen.enabled",
    onboardingHref: "/app/kitchen",
    navHref: "/app/kitchen",
    name: { ro: "Kitchen Display", en: "Kitchen Display" },
    description: {
      ro: "Ecran de preparare pentru bar sau bucătărie, separat de POS. Inclus în planul Operations — fără taxă suplimentară.",
      en: "Prep screen for bar or kitchen, separate from the POS. Included in Operations — no extra fee.",
    },
    settingsHref: "/app/kitchen",
    selfInstall: true,
  },
  table_service: {
    key: "table_service",
    category: "paid_addon",
    installKey: "table_service",
    featureColumn: "table_service_enabled",
    entitlement: "kitchen.table_service",
    onboardingHref: "/app/settings/tables",
    navHref: "/app/pos",
    name: { ro: "Gestionare mese", en: "Table management" },
    description: {
      ro: "Plan sală, bonuri pe masă și încasare rapidă din POS.",
      en: "Floor plan, table tabs, and fast checkout from POS.",
    },
    settingsHref: "/app/settings/tables",
    selfInstall: true,
  },
};

export const INCLUDED_INTEGRATIONS: Record<"saga_export", CatalogItem> = {
  saga_export: {
    key: "saga_export",
    category: "included_module",
    installKey: "saga_export",
    featureColumn: "saga_export_enabled",
    entitlement: "reports.accountant_pack",
    onboardingHref: "/app/settings/accountant?install=saga",
    name: { ro: "Saga", en: "Saga" },
    description: {
      ro: "Export XML Saga și rapoarte contabile incluse în planurile eligibile.",
      en: "Saga XML export and accountant reports included in eligible plans.",
    },
    logo: "/integrations/saga.svg",
    settingsHref: "/app/settings/accountant?install=saga",
  },
};

export const EXTERNAL_INTEGRATIONS: Record<ExternalIntegrationKey, CatalogItem> = {
  fiscalnet: {
    key: "fiscalnet",
    category: "external_integration",
    installKey: "fiscalnet",
    featureColumn: "fiscalnet_enabled",
    entitlement: "fiscal.fiscalnet",
    onboardingHref: "/app/settings?tab=fiscal",
    name: { ro: "FiscalNet", en: "FiscalNet" },
    description: {
      ro: "Inclus în FranchiseTech pentru bonuri fiscale și raport Z. Plătești separat abonamentul FiscalNet la furnizorul tău.",
      en: "Included in FranchiseTech for fiscal receipts and Z-report. You pay your FiscalNet provider separately.",
    },
    logo: "/integrations/fiscalnet.png",
    settingsHref: "/app/settings?tab=fiscal",
    docsHref: "/help/romania-fiscalnet",
  },
  anaf_efactura: {
    key: "anaf_efactura",
    category: "external_integration",
    installKey: "anaf_efactura",
    featureColumn: "efactura_enabled",
    entitlement: "fiscal.efactura",
    onboardingHref: "/app/settings?tab=fiscal",
    name: { ro: "ANAF e-Factura", en: "ANAF e-Factura" },
    description: {
      ro: "Trimitere factură B2B în SPV prin OAuth ANAF.",
      en: "Send B2B invoices to SPV through ANAF OAuth.",
    },
    logo: "/integrations/anaf.svg",
    settingsHref: "/app/settings?tab=fiscal",
    docsHref: "/help",
  },
};

export const MARKETPLACE_PRODUCTS: Record<MarketplaceProductKey, CatalogItem> = {
  kitchen_display: PAID_ADDONS.kitchen_display,
  table_service: PAID_ADDONS.table_service,
  saga_export: INCLUDED_INTEGRATIONS.saga_export,
  fiscalnet: EXTERNAL_INTEGRATIONS.fiscalnet,
  anaf_efactura: EXTERNAL_INTEGRATIONS.anaf_efactura,
};

export const MARKETPLACE_PRODUCT_ORDER: readonly MarketplaceProductKey[] = [
  "kitchen_display",
  "table_service",
  "saga_export",
  "fiscalnet",
  "anaf_efactura",
];

export function marketplaceAllowsSelfInstall(item: CatalogItem): boolean {
  if (item.selfInstall === true) return true;
  if (item.category === "included_module" || item.category === "external_integration") return true;
  // Local dev: enable all marketplace modules without sales contact
  if (process.env.NODE_ENV === "development") return true;
  return false;
}

export function addonPriceLabel(addon: CatalogItem, locale: CatalogLocale): string {
  if (!addon.priceEur) {
    return locale === "ro" ? "Inclus" : "Included";
  }
  return locale === "ro" ? `€${addon.priceEur}/lună` : `€${addon.priceEur}/month`;
}
