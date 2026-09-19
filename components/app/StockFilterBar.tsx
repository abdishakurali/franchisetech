"use client";

import Link from "next/link";

export type StockView = "all" | "low" | "order" | "supplier";

export function StockFilterBar({ filter, showArchived = false }: { filter: StockView; showArchived?: boolean }) {
  const base = "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
  const active = "border-brass/40 bg-accent text-foreground";
  const idle = "border-border bg-card text-mid hover:border-brass/30 hover:text-brass";

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
