import type { BillingPlan } from "@/lib/billing/plans";
import {
  purchaseReceivingLabelForMarket,
  taxLabelForMarket,
  tillCloseLabelForMarket,
  type BillingMarket,
} from "@/lib/billing/market";

export type PlanFeatureCategory = {
  title: string;
  items: readonly string[];
};

function stockPurchaseItems(market: BillingMarket): readonly string[] {
  const tax = taxLabelForMarket(market);
  const receiving = purchaseReceivingLabelForMarket(market);
  if (market === "RO") {
    return ["Stock levels & movements", "Suppliers", receiving, "Stock & purchase reports"];
  }
  return [
    "Stock levels & movements",
    "Suppliers",
    receiving,
    `${tax} on purchase lines`,
    "Stock & purchase reports",
  ];
}

function multiLocationCountryCategory(market: BillingMarket): PlanFeatureCategory | null {
    if (market === "RO") {
    return {
      title: "Romania",
      items: ["FiscalNet receipt integration (when enabled in Settings)"],
    };
  }
  return null;
}

export function getPlanFeatureCategories(
  plan: BillingPlan,
  market: BillingMarket = "IE"
): readonly PlanFeatureCategory[] {
  const tax = taxLabelForMarket(market);
  const tillClose = tillCloseLabelForMarket(market);

  if (plan === "starter") {
    const tillItems =
      market === "RO"
        ? [
            "POS checkout",
            "Cash & card payments",
            "Transaction history & receipts",
            "Open/close till",
            "% or fixed lei discounts at checkout",
          ]
        : [
            "POS checkout",
            "Cash & card payments",
            "Transaction history & receipts",
            "Open/close till",
          ];
    return [
      {
        title: "Till & sales",
        items: tillItems,
      },
      {
        title: "Products",
        items: ["Products & categories", `${tax} rates`, "CSV import & export"],
      },
      {
        title: "Reports",
        items: ["Sales report", tillClose, `${tax} report`],
      },
      {
        title: "Included",
        items: ["Manual cash drawer mode", "Unlimited staff", "15-day assisted trial"],
      },
    ];
  }

  if (plan === "pro") {
    return [
      {
        title: "Till & sales",
        items: [
          "Everything in Starter",
          "Split payments & tips (optional)",
          "Cash drawer connector support",
        ],
      },
      {
        title: "Stock & purchases",
        items: stockPurchaseItems(market),
      },
      {
        title: "Recipe costing",
        items: [
          "Recipes linked to products",
          "Ingredient cost & margin",
          "Can-make from stock",
          "Margins report",
        ],
      },
      {
        title: "Kitchen & orders",
        items: [
          "Kitchen display (optional)",
          "Order workflow (optional)",
          "Prep stations (optional)",
          "Dine-in / takeaway labels (optional)",
        ],
      },
      {
        title: "Team & controls",
        items: ["Staff roles & permissions", "Cash drawer audit trail"],
      },
    ];
  }

  const countryCategory = multiLocationCountryCategory(market);
  return [
    {
      title: "Operations",
      items: ["Everything in Pro", "Multiple sites", "Site switching"],
    },
    ...(countryCategory ? [countryCategory] : []),
    {
      title: "Reporting",
      items: ["Per-site sales & reports", tillClose],
    },
  ];
}

export function flatPlanFeatures(plan: BillingPlan, market: BillingMarket = "IE"): string[] {
  return getPlanFeatureCategories(plan, market).flatMap((cat) => cat.items);
}
