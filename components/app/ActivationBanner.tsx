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
    <div className="overflow-hidden rounded-xl border border-brass/30 bg-accent shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brass text-ink">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{t.dashboard.activationTitle}</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-mid">
                {t.dashboard.activationDesc}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/app/products/new"
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t.dashboard.addProducts}
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
                  "flex items-start gap-3 rounded-md border px-3 py-3",
                  current && "border-brass/40 bg-card shadow-sm",
                  done && "border-reconciled/25 bg-reconciled/10",
                  !done && !current && "border-border bg-card/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    done && "bg-reconciled text-paper",
                    current && "bg-brass text-ink",
                    !done && !current && "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
