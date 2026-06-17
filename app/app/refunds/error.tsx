"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RefundsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error so we can investigate later
    console.error("[refunds] client error:", error?.message, error?.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-4">
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-lg font-semibold text-slate-800">
          Could not load refunds
        </h2>
        <p className="text-sm text-slate-500">
          There was a problem loading this page. Your sales data is safe — this
          is a display error only.
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Try again
        </button>
        <Link
          href="/app"
          className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
