"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppI18n } from "@/lib/app-i18n-context";

export default function RefundsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useAppI18n();
  useEffect(() => {
    // Log the error so we can investigate later
    console.error("[refunds] client error:", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-4">
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-lg font-semibold text-foreground">
          {t.errors.refundsLoadFailed}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t.errors.refundsSafeData}
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            {t.errors.errorId}: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t.errors.tryAgain}
        </button>
        <Link
          href="/app"
          className="text-sm px-4 py-2 rounded-lg border border-border text-mid hover:bg-secondary"
        >
          {t.errors.backToDashboard}
        </Link>
      </div>
    </div>
  );
}
