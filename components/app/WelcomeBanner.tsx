"use client";

import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import type { AppLocale } from "@/lib/app-i18n";
import { getAppText } from "@/lib/app-i18n";

type Props = {
  locale?: AppLocale;
};

export function WelcomeBanner({ locale = "ro" }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const t = getAppText(locale).activation;

  if (dismissed) return null;

  return (
    <div className="border-b border-border bg-accent px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <ShoppingCart className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="min-w-0 flex-1 text-sm text-foreground">{t.welcomeBody}</p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-card"
          aria-label={t.welcomeDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
