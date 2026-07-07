"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // week starts Monday
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  return start;
}

/**
 * Quick-preset + custom date-range filter for report pages, replacing the
 * old pattern of bare native date inputs inside a full-page-reload <form>.
 * Presets navigate client-side (no reload flash), matching the dashboard's
 * DateFilter UX.
 */
export function ReportDateRangeFilter({
  basePath,
  from,
  to,
}: {
  basePath: string;
  from: string;
  to: string;
}) {
  const { t } = useAppI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  const today = new Date();
  const todayIso = toISO(today);

  function go(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", newFrom);
    params.set("to", newTo);
    router.push(`${basePath}?${params.toString()}`);
  }

  const presets: Array<{ key: string; label: string; range: () => [string, string] }> = [
    { key: "today", label: t.period.today, range: () => [todayIso, todayIso] },
    {
      key: "week",
      label: t.period.week,
      range: () => [toISO(startOfWeek(today)), todayIso],
    },
    {
      key: "month",
      label: t.period.month,
      range: () => [toISO(new Date(today.getFullYear(), today.getMonth(), 1)), todayIso],
    },
    {
      key: "lastMonth",
      label: t.period.lastMonth,
      range: () => [
        toISO(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        toISO(new Date(today.getFullYear(), today.getMonth(), 0)),
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((p) => (
          <Button
            key={p.key}
            type="button"
            size="sm"
            variant="outline"
            className="text-slate-600"
            onClick={() => {
              const [f, t2] = p.range();
              setFromValue(f);
              setToValue(t2);
              go(f, t2);
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1">
        <input
          type="date"
          value={fromValue}
          max={todayIso}
          onChange={(e) => setFromValue(e.target.value)}
          className="h-8 border-0 px-1 text-sm focus:outline-none"
          aria-label={t.common.from}
        />
        <span className="text-slate-300">→</span>
        <input
          type="date"
          value={toValue}
          max={todayIso}
          onChange={(e) => setToValue(e.target.value)}
          className="h-8 border-0 px-1 text-sm focus:outline-none"
          aria-label={t.common.to}
        />
        <Button type="button" size="sm" onClick={() => go(fromValue, toValue)}>
          {t.common.apply}
        </Button>
      </div>
    </div>
  );
}
