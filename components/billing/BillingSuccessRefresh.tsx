"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BillingSuccessRefresh({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    router.refresh();
  }, [enabled, router]);

  return null;
}
