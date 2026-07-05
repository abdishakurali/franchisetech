"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, Sparkles } from "lucide-react";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";
import { cn } from "@/lib/utils";

type Props = {
  locale: AppLocale;
};

export function ActivationBanner({ locale }: Props) {
  const t = getAppText(locale);
  const steps = t.activation.dashboardSteps;

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-950">{t.dashboard.activationTitle}</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                {t.dashboard.activationDesc}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/app/setup-checklist"
              className="inline-flex h-8 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-medium text-blue-900 hover:bg-blue-50"
            >
              {t.dashboard.activationChecklist}
            </Link>
            <Link
              href="/app/pos?welcome=1"
              className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t.dashboard.activationCta}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>

        <ol className="grid gap-2 sm:grid-cols-3">
          {steps.map((step, i) => {
            const done = i === 0;
            const current = i === 1;
            return (
              <li
                key={step.label}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-3",
                  current && "border-blue-300 bg-white shadow-sm ring-1 ring-blue-100",
                  done && "border-green-100 bg-green-50/60",
                  !done && !current && "border-slate-100 bg-white/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    done && "bg-green-600 text-white",
                    current && "bg-blue-600 text-white",
                    !done && !current && "bg-slate-100 text-slate-400",
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
