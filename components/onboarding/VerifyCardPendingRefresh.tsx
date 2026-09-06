"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 10;

/**
 * Stripe webhook confirmation can lag a few seconds behind the redirect back
 * to this page. Without this, "trialul pornește automat" was a false promise
 * — the page never re-checked on its own, leaving the user stuck until they
 * manually reloaded.
 */
export function VerifyCardPendingRefresh() {
  const router = useRouter();
  const attempts = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      attempts.current += 1;
      if (attempts.current > MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
