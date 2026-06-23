import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calculator,
  ClipboardList,
  FileDown,
  FileText,
  Package,
  Receipt,
  Scale,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import type { AppT } from "@/lib/app-i18n";

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

export function getAppReportLinks(t: AppT): AppReportLink[] {
  return [
    {
      href: "/app/reports/sales",
      title: t.reports.sales.title,
      desc: t.reports.sales.desc,
      icon: BarChart3,
      color: "bg-blue-50 text-blue-700",
      tag: t.reports.sales.tag,
    },
    {
      href: "/app/reports/z-report",
      title: t.reports.zReport.title,
      desc: t.reports.zReport.desc,
      icon: Receipt,
      color: "bg-green-50 text-green-700",
      tag: t.reports.zReport.tag,
    },
    {
      href: "/app/reports/vat",
      title: t.reports.vat.title,
      desc: t.reports.vat.desc,
      icon: Calculator,
      color: "bg-purple-50 text-purple-700",
      tag: t.reports.vat.tag,
    },
    {
      href: "/app/reports/stock",
      title: t.reports.stock.title,
      desc: t.reports.stock.desc,
      icon: Package,
      color: "bg-orange-50 text-orange-700",
      tag: t.reports.stock.tag,
      requiresInventory: true,
    },
    {
      href: "/app/reports/purchases",
      title: t.reports.purchases.title,
      desc: t.reports.purchases.desc,
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-700",
      tag: t.reports.purchases.tag,
      requiresInventory: true,
    },
    {
      href: "/app/reports/margins",
      title: t.reports.margins.title,
      desc: t.reports.margins.desc,
      icon: TrendingUp,
      color: "bg-teal-50 text-teal-700",
      tag: t.reports.margins.tag,
      requiresRecipe: true,
    },
    {
      href: "/app/transactions",
      title: t.reports.transactions.title,
      desc: t.reports.transactions.desc,
      icon: FileText,
      color: "bg-indigo-50 text-indigo-700",
      tag: t.reports.transactions.tag,
    },
    {
      href: "/app/reports/consum",
      title: t.reports.consum.title,
      desc: t.reports.consum.desc,
      icon: ClipboardList,
      color: "bg-rose-50 text-rose-700",
      tag: t.reports.consum.tag,
      requiresInventory: true,
    },
    {
      href: "/app/reports/balanta",
      title: t.reports.balanta.title,
      desc: t.reports.balanta.desc,
      icon: Scale,
      color: "bg-cyan-50 text-cyan-700",
      tag: t.reports.balanta.tag,
      requiresInventory: true,
    },
    {
      href: "/app/reports/gestiune",
      title: t.reports.gestiune.title,
      desc: t.reports.gestiune.desc,
      icon: Warehouse,
      color: "bg-slate-100 text-slate-700",
      tag: t.reports.gestiune.tag,
      requiresInventory: true,
    },
    {
      href: "/app/reports/audit-export",
      title: t.reports.auditExport.title,
      desc: t.reports.auditExport.desc,
      icon: FileDown,
      color: "bg-violet-50 text-violet-700",
      tag: t.reports.auditExport.tag,
    },
    {
      href: "/app/reports/staff",
      title: t.reports.staff?.title ?? "Staff performance",
      desc: t.reports.staff?.desc ?? "Transactions, discounts, and tips by cashier.",
      icon: Users,
      color: "bg-sky-50 text-sky-700",
      tag: t.reports.staff?.tag ?? null,
    },
  ];
}

export function filterReportLinks(
  t: AppT,
  input: { inventoryVisible: boolean; recipeVisible: boolean },
): AppReportLink[] {
  return getAppReportLinks(t).filter((link) => {
    if (link.requiresInventory && !input.inventoryVisible) return false;
    if (link.requiresRecipe && !input.recipeVisible) return false;
    return true;
  });
}
