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
    <div className="border-b border-brass/25 bg-accent px-4 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brass text-ink shadow-sm">
            <ShoppingCart className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t.welcomeTitle}</p>
            <p className="mt-0.5 text-sm text-foreground/90">{t.welcomeBody}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={startTour}
            >
              {t.welcomeTourCta}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1.5 text-brass hover:bg-accent/80"
              aria-label={t.welcomeDismiss}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
          {t.welcomeSteps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              {i > 0 ? <span className="hidden text-brass/50 sm:inline" aria-hidden>→</span> : null}
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  i === 0
                    ? "border-brass/40 bg-card text-foreground shadow-sm"
                    : "border-brass/25 bg-accent/50 text-brass",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    i === 0 ? "bg-brass text-ink" : "bg-accent text-brass",
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
