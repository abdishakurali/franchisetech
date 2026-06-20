import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calculator,
  FileText,
  Package,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

export type AppReportLink = {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  tag: string | null;
  requiresInventory?: boolean;
  requiresRecipe?: boolean;
};

export const APP_REPORT_LINKS: AppReportLink[] = [
  {
    href: "/app/reports/sales",
    title: "Sales report",
    desc: "Totals, transactions, and top products.",
    icon: BarChart3,
    color: "bg-blue-50 text-blue-700",
    tag: "Most used",
  },
  {
    href: "/app/reports/z-report",
    title: "Till close report",
    desc: "Cash and card totals, opening cash, counted cash.",
    icon: Receipt,
    color: "bg-green-50 text-green-700",
    tag: "End of day",
  },
  {
    href: "/app/reports/vat",
    title: "VAT report",
    desc: "Net, VAT, and gross sales by VAT rate.",
    icon: Calculator,
    color: "bg-purple-50 text-purple-700",
    tag: "Tax",
  },
  {
    href: "/app/reports/stock",
    title: "Stock report",
    desc: "Current stock levels and reorder alerts.",
    icon: Package,
    color: "bg-orange-50 text-orange-700",
    tag: null,
    requiresInventory: true,
  },
  {
    href: "/app/reports/purchases",
    title: "Purchases report",
    desc: "Supplier spend and purchase history.",
    icon: ShoppingBag,
    color: "bg-amber-50 text-amber-700",
    tag: null,
    requiresInventory: true,
  },
  {
    href: "/app/reports/margins",
    title: "Margins report",
    desc: "Product cost and margin.",
    icon: TrendingUp,
    color: "bg-teal-50 text-teal-700",
    tag: null,
    requiresRecipe: true,
  },
  {
    href: "/app/transactions",
    title: "Transactions",
    desc: "Search sales, view receipts, refund or void.",
    icon: FileText,
    color: "bg-indigo-50 text-indigo-700",
    tag: null,
  },
];

export function filterReportLinks(input: {
  inventoryVisible: boolean;
  recipeVisible: boolean;
}): AppReportLink[] {
  return APP_REPORT_LINKS.filter((link) => {
    if (link.requiresInventory && !input.inventoryVisible) return false;
    if (link.requiresRecipe && !input.recipeVisible) return false;
    return true;
  });
}
