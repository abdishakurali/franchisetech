"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  labels: string[];
  current: number;
  timeEstimate?: string;
  /** Pre-formatted "Pasul 2 din 6" / "Step 2 of 6" — a string, not a
   *  formatter function: this component is rendered from Server Component
   *  pages, and a function prop can't cross that boundary (RSC). */
  stepOfLabel: string;
};

export function OnboardingStepper({ labels, current, timeEstimate, stepOfLabel }: Props) {
  const total = labels.length;
  const progressPct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-[family-name:var(--font-space-mono)]">{stepOfLabel}</span>
        {timeEstimate ? <span className="font-[family-name:var(--font-space-mono)] text-mid">{timeEstimate}</span> : null}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-brass transition-all duration-500 ease-out"
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
                "flex items-center gap-2.5 rounded-md border px-3 py-2.5 transition-colors",
                active && "border-brass/40 bg-accent shadow-sm",
                done && "border-reconciled/25 bg-reconciled/10",
                !active && !done && "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  active && "bg-brass text-ink",
                  done && "bg-reconciled text-paper",
                  !active && !done && "bg-secondary text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium leading-tight",
                  active && "text-foreground",
                  done && "text-reconciled",
                  !active && !done && "text-muted-foreground",
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
