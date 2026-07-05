"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  labels: string[];
  current: number;
  timeEstimate?: string;
  stepOf: (current: number, total: number) => string;
};

export function OnboardingStepper({ labels, current, timeEstimate, stepOf }: Props) {
  const total = labels.length;
  const progressPct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{stepOf(current + 1, total)}</span>
        {timeEstimate ? <span className="text-slate-400">{timeEstimate}</span> : null}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${Math.max(8, progressPct)}%` }}
        />
      </div>

      <ol className="grid gap-2 sm:grid-cols-3">
        {labels.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
                active && "border-blue-200 bg-blue-50/80 shadow-sm",
                done && "border-green-100 bg-green-50/50",
                !active && !done && "border-slate-100 bg-white",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active && "bg-blue-600 text-white",
                  done && "bg-green-600 text-white",
                  !active && !done && "bg-slate-100 text-slate-500",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium leading-tight",
                  active && "text-blue-900",
                  done && "text-green-800",
                  !active && !done && "text-slate-500",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
