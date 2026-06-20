import type { BusinessProfile } from "@/lib/business-profile";
import { normaliseBusinessProfile } from "@/lib/business-profile";

export type SetupSignals = {
  orgName?: string | null;
  country?: string | null;
  currencyCode?: string | null;
  businessProfile?: BusinessProfile | string | null;
  inventoryEnabled?: boolean;
  recipeCostingEnabled?: boolean;
  multiSiteOpsEnabled?: boolean;
  productCount?: number;
  paymentMethodCount?: number;
  txCount?: number;
  openSession?: boolean;
  reportViewed?: boolean;
  subscription?: boolean;
  siteCount?: number;
  ingredientCount?: number;
  supplierCount?: number;
  purchaseCount?: number;
  recipeCount?: number;
};

export type SetupStep = {
  id: string;
  title: string;
  text: string;
  href: string;
  label: string;
  done: boolean;
  status?: string;
  section: "core" | "advanced" | "multi_site" | "billing";
};

function hasBusinessDetails(signals: SetupSignals): boolean {
  return Boolean(signals.orgName?.trim() && signals.country?.trim() && signals.currencyCode?.trim());
}

export function buildSetupSteps(signals: SetupSignals): SetupStep[] {
  const profile = normaliseBusinessProfile(signals.businessProfile);
  const showInventory = Boolean(signals.inventoryEnabled);
  const showRecipes = Boolean(signals.recipeCostingEnabled);
  const showMultiSite = profile === "multi_site" || Boolean(signals.multiSiteOpsEnabled);

  const core: SetupStep[] = [
    {
      id: "business_details",
      title: "Add business details",
      text: "Confirm your business name, country, currency, and receipt details.",
      href: "/app/settings",
      label: "Open settings",
      done: hasBusinessDetails(signals),
      status: hasBusinessDetails(signals) ? "Details saved" : "Missing details",
      section: "core",
    },
    {
      id: "products",
      title: "Add products and categories",
      text: "Add the first items you sell. You only need a few products to start.",
      href: "/app/products/new",
      label: "Add product",
      done: (signals.productCount ?? 0) > 0,
      status: `${signals.productCount ?? 0} products`,
      section: "core",
    },
    {
      id: "payments",
      title: "Set payment methods",
      text: "Keep Cash and Card ready so every sale records the right payment type.",
      href: "/app/settings",
      label: "Open settings",
      done: (signals.paymentMethodCount ?? 0) > 0,
      status: `${signals.paymentMethodCount ?? 0} methods`,
      section: "core",
    },
    {
      id: "open_till",
      title: "Open till",
      text: "Enter the cash float before you start selling.",
      href: "/app/pos",
      label: "Open POS",
      done: Boolean(signals.openSession),
      status: signals.openSession ? "Till open" : "Till closed",
      section: "core",
    },
    {
      id: "first_sale",
      title: "Make first sale",
      text: "Run one real or test sale so the dashboard and reports have live data.",
      href: "/app/pos",
      label: "Go to POS",
      done: (signals.txCount ?? 0) > 0,
      status: `${signals.txCount ?? 0} sales`,
      section: "core",
    },
    {
      id: "daily_report",
      title: "Check daily report",
      text: "Review sales, cash/card totals, and top products after the first sale.",
      href: "/app",
      label: "View reports",
      done: Boolean(signals.reportViewed) || (signals.txCount ?? 0) > 0,
      section: "core",
    },
  ];

  const multiSite: SetupStep[] = showMultiSite
    ? [
        {
          id: "sites",
          title: "Add locations",
          text: "Create each site or branch you want to manage separately.",
          href: "/app/sites",
          label: "Manage sites",
          done: (signals.siteCount ?? 0) > 1,
          status: `${signals.siteCount ?? 0} sites`,
          section: "multi_site",
        },
      ]
    : [];

  const advanced: SetupStep[] = [
    ...(showInventory
      ? [
          {
            id: "ingredients",
            title: "Add ingredients",
            text: "Add stock items you buy and use in recipes.",
            href: "/app/products/import-ingredients",
            label: "Add ingredients",
            done: (signals.ingredientCount ?? 0) > 0,
            status: `${signals.ingredientCount ?? 0} ingredients`,
            section: "advanced" as const,
          },
          {
            id: "suppliers",
            title: "Add suppliers",
            text: "Record who you buy stock from.",
            href: "/app/suppliers/new",
            label: "Add supplier",
            done: (signals.supplierCount ?? 0) > 0,
            status: `${signals.supplierCount ?? 0} suppliers`,
            section: "advanced" as const,
          },
          {
            id: "purchase",
            title: "Record purchase",
            text: "Log a delivery to increase stock and track costs.",
            href: "/app/purchases/new",
            label: "Record purchase",
            done: (signals.purchaseCount ?? 0) > 0,
            status: `${signals.purchaseCount ?? 0} purchases`,
            section: "advanced" as const,
          },
        ]
      : []),
    ...(showRecipes
      ? [
          {
            id: "recipes",
            title: "Create recipes",
            text: "Connect products to ingredients to see cost, margin, and stock coverage.",
            href: "/app/recipes/new",
            label: "Create recipe",
            done: (signals.recipeCount ?? 0) > 0,
            status: `${signals.recipeCount ?? 0} recipes`,
            section: "advanced" as const,
          },
        ]
      : []),
  ];

  const billing: SetupStep = {
    id: "choose_plan",
    title: "Choose plan",
    text: "Pick Starter or Pro before the trial ends. Setup support is handled separately.",
    href: "/app/billing",
    label: "Choose plan",
    done: Boolean(signals.subscription),
    status: signals.subscription ? "Plan active" : "Trial only",
    section: "billing",
  };

  const activationCore = core.filter(
    (step) => !["business_details", "payments", "open_till"].includes(step.id),
  );

  return [...activationCore, ...multiSite, ...advanced, billing];
}

export function computeSetupProgress(signals: SetupSignals): {
  steps: SetupStep[];
  doneCount: number;
  totalCount: number;
  percent: number;
  complete: boolean;
} {
  const steps = buildSetupSteps(signals);
  const activationSteps = steps.filter((step) => step.section !== "billing");
  const doneCount = activationSteps.filter((step) => step.done).length;
  const totalCount = activationSteps.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const complete = (signals.txCount ?? 0) > 0;
  return { steps, doneCount, totalCount, percent, complete };
}
