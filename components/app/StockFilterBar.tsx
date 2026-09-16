"use client";

import Link from "next/link";

export type StockView = "all" | "low" | "order" | "supplier";

export function StockFilterBar({ filter, showArchived = false }: { filter: StockView; showArchived?: boolean }) {
  const base = "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
  const active = "border-blue-300 bg-blue-50 text-blue-800";
  const idle = "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700";

  const views: Array<{ key: StockView; label: string }> = [
    { key: "all", label: "Toate" },
    { key: "low", label: "Sub minim" },
    { key: "order", label: "De comandat" },
    { key: "supplier", label: "Furnizor" },
  ];

  return <nav aria-label="Vizualizări stoc" className="flex gap-2 overflow-x-auto pb-1">
    {views.map(({ key, label }) => (
      <Link key={key} href={`/app/stock?filter=${key}${showArchived ? "&archived=1" : ""}`}
        aria-current={filter === key ? "page" : undefined}
        className={`${base} shrink-0 ${filter === key ? active : idle}`}>
        {label}
      </Link>
    ))}
  </nav>;
}
