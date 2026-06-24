"use client";

import Link from "next/link";
import { useAppI18n } from "@/lib/app-i18n-context";

export function StockFilterBar({ filter }: { filter: "all" | "low" }) {
  const { t } = useAppI18n();
  const base = "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
  const active = "border-blue-300 bg-blue-50 text-blue-800";
  const idle = "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/app/stock" className={`${base} ${filter === "all" ? active : idle}`}>
        {t.stock.showAllStock}
      </Link>
      <Link href="/app/stock?filter=low" className={`${base} ${filter === "low" ? active : idle}`}>
        {t.stock.showLowStockOnly}
      </Link>
    </div>
  );
}
