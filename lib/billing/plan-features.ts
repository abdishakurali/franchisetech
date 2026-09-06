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

  if (plan === "starter" || plan === "core") {
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
        items: [
          "Products & categories",
          market === "RO" ? "Cote TVA" : `${tax} rates`,
          "CSV import & export",
        ],
      },
      {
        title: "Reports",
        items: ["Sales report", tillClose, market === "RO" ? "Raport TVA" : `${tax} report`],
      },
      ...(market === "RO"
        ? [
            {
              title: "Romanian compliance",
              items: [
                "FiscalNet fiscal receipts",
                "Fiscal Z-report (daily close)",
                "Fiscal X-report (interim)",
                "TVA groups",
                "ANAF e-Factura support",
              ],
            },
          ]
        : []),
      {
        title: "Included",
        items: ["Owner and staff roles", "Unlimited staff", "15-day assisted trial"],
      },
    ];
  }

  if (plan === "pro" || plan === "operations") {
    const accountingItems =
      market === "RO"
        ? [
            "Bon de consum (materii prime consumate din rețete)",
            "Export audit CSV pentru contabil",
          ]
        : ["Ingredient consumption record", "Audit CSV export"];
    return [
      {
        title: "Till & sales",
        items: [
          "Everything in Core",
          "Split payments & tips (optional)",
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
        title: market === "RO" ? "Contabilitate" : "Accounting",
        items: accountingItems,
      },
      ...(market === "RO"
        ? [
            {
              title: "Fiscal",
              items: ["FiscalNet este inclus în franchisetech; abonamentul la furnizor se plătește separat"],
            },
          ]
        : []),
      {
        title: "Team & controls",
        items: [
          "Staff roles & permissions",
          "Owner digest email: sales, cash status, voids, refunds, VAT and stock",
        ],
      },
    ];
  }

  if (plan === "scale") {
    return [
      {
        title: "Operations",
        items: [
          "Everything in Operations",
          "Priority support (same-day response)",
          "Dedicated onboarding call",
          "Advanced operations support",
        ],
      },
      {
        title: market === "RO" ? "Contabilitate" : "Accounting",
        items:
          market === "RO"
            ? [
                "Export XML Saga pentru contabil",
                "Pachete CSV audit complet",
              ]
            : ["Full accountant export pack (CSV + XML)"],
      },
    ];
  }

  const countryCategory = multiLocationCountryCategory(market);
  return [
    {
      title: "Operations",
      items: ["Everything in Operations", "Multiple sites", "Site switching"],
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
