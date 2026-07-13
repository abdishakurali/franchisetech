"use client";

import { Check, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingSidebarStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type Props = {
  banner: string;
  steps: OnboardingSidebarStep[];
  current: number;
};

export function OnboardingSidebar({ banner, steps, current }: Props) {
  return (
    <div className="relative hidden h-full flex-col overflow-hidden bg-gradient-to-b from-blue-50 via-blue-50/70 to-white p-8 lg:flex">
      <div
        className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mb-9 flex items-start gap-2.5 rounded-xl bg-white/80 px-3.5 py-3 text-xs text-blue-900 shadow-sm ring-1 ring-blue-100 backdrop-blur">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
        <span className="leading-relaxed">{banner}</span>
      </div>

      <ol className="relative z-10 flex flex-col">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const isLast = i === steps.length - 1;
          const Icon = step.icon;
          return (
            <li key={step.title} className="relative flex gap-4 pb-9 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[17px] top-9 bottom-0 w-px border-l-2",
                    done ? "border-blue-300" : "border-dashed border-slate-200",
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done && "bg-blue-600 text-white",
                  active && "bg-blue-600 text-white ring-4 ring-blue-100",
                  !active && !done && "bg-white text-slate-400 ring-1 ring-slate-200",
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" />}
              </span>
              <div className="pt-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-blue-900" : done ? "text-slate-700" : "text-slate-400",
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs leading-relaxed",
                    active ? "text-blue-700/80" : "text-slate-400",
                  )}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
