"use client";

import { useState } from "react";
import { ArrowRight, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";
import { cn } from "@/lib/utils";

type Props = {
  locale?: AppLocale;
};

export function WelcomeBanner({ locale = "ro" }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const t = getAppText(locale).activation;

  if (dismissed) return null;

  const startTour = () => {
    window.dispatchEvent(new CustomEvent("fp-start-first-sale-tour"));
  };

  return (
    <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/60 px-4 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <ShoppingCart className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-blue-950">{t.welcomeTitle}</p>
            <p className="mt-0.5 text-sm text-blue-800/90">{t.welcomeBody}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 bg-blue-600 text-white hover:bg-blue-700"
              onClick={startTour}
            >
              {t.welcomeTourCta}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-100/80"
              aria-label={t.welcomeDismiss}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
          {t.welcomeSteps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              {i > 0 ? <span className="hidden text-blue-300 sm:inline" aria-hidden>→</span> : null}
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  i === 0
                    ? "border-blue-300 bg-white text-blue-900 shadow-sm"
                    : "border-blue-100/80 bg-blue-50/50 text-blue-700",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    i === 0 ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600",
                  )}
                >
                  {i + 1}
                </span>
                {label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
