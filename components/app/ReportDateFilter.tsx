"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Single-date quick-preset filter (Azi/Ieri + custom), for daily reports like the Z-report. */
export function ReportDateFilter({ basePath, date }: { basePath: string; date: string }) {
  const { t } = useAppI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(date);

  const today = new Date();
  const todayIso = toISO(today);
  const yesterdayIso = toISO(new Date(today.getTime() - 86_400_000));

  function go(newDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={value === todayIso ? "default" : "outline"}
          className={value === todayIso ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-600"}
          onClick={() => {
            setValue(todayIso);
            go(todayIso);
          }}
        >
          {t.period.today}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === yesterdayIso ? "default" : "outline"}
          className={value === yesterdayIso ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-600"}
          onClick={() => {
            setValue(yesterdayIso);
            go(yesterdayIso);
          }}
        >
          {t.reportPages.zReport.yesterday}
        </Button>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1">
        <input
          type="date"
          value={value}
          max={todayIso}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 border-0 px-1 text-sm focus:outline-none"
        />
        <Button type="button" size="sm" onClick={() => go(value)}>
          {t.common.apply}
        </Button>
      </div>
    </div>
  );
}
