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
      items: ["Fiscal driver receipt integration (when enabled in Settings)"],
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
                "Fiscal driver fiscal receipts",
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

  // New pricing generation (2026-09) — Free mirrors Core's feature set exactly,
  // with different framing ("no card, no expiry" instead of a trial) and an
  // explicit callout of its product/location caps, since those caps (not
  // missing features) are what distinguishes it.
  if (plan === "free") {
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
      { title: "Till & sales", items: tillItems },
      {
        title: "Products",
        items: [
          "Products & categories (up to 50)",
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
                "Fiscal driver fiscal receipts",
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
        items: ["Owner and staff roles", "Unlimited staff", "1 location", "No card required, free forever"],
      },
    ];
  }

  if (plan === "pro" || plan === "operations" || plan === "growth") {
    const accountingItems =
      market === "RO"
        ? [
            "Bon de consum (materii prime consumate din rețete)",
            "Export audit CSV pentru contabil",
            ...(plan === "growth" ? ["Pachet export contabil (CSV + XML)"] : []),
          ]
        : [
            "Ingredient consumption record",
            "Audit CSV export",
            ...(plan === "growth" ? ["Accountant export pack (CSV + XML)"] : []),
          ];
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
              items: ["Driverul fiscal este inclus în franchisetech; abonamentul la furnizor se plătește separat"],
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

  if (plan === "team") {
    const teamCountryCategory = multiLocationCountryCategory(market);
    return [
      {
        title: "Operations",
        items: ["Everything in Pro", "Multiple sites", "Site switching", "€29/extra location/month"],
      },
      ...(teamCountryCategory ? [teamCountryCategory] : []),
      {
        title: "Reporting",
        items: ["Per-site sales & reports", tillClose],
      },
      {
        title: "Support",
        items: ["Priority support (same-day response)"],
      },
    ];
  }

  // multi_location — legacy per-location add-on to a Scale base plan, unrelated
  // to the new "team" plan above (which bundles its own per-location price).
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
