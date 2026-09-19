"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { AppReportLink } from "@/lib/app-report-links";

// icon is a pre-rendered element (not the LucideIcon component itself) --
// Server Components cannot pass raw component/function references as props
// into a Client Component like this one, only serializable React elements.
type SearchableReport = Omit<AppReportLink, "icon"> & { icon: ReactNode };

export function ReportsSearch({ reports, searchPlaceholder }: { reports: SearchableReport[]; searchPlaceholder: string }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? reports.filter((r) => r.title.toLowerCase().includes(query) || r.desc.toLowerCase().includes(query))
    : reports;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brass/30 sm:max-w-xs"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Niciun raport găsit pentru &ldquo;{q}&rdquo;.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-brass/30 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.color}`}>
                  {r.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground transition-colors group-hover:text-brass">
                      {r.title}
                    </p>
                    {r.tag ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {r.tag}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
