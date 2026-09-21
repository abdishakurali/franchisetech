"use client";

import { useEffect } from "react";

/** Settings is now one scrollable page, not tabs. Existing `?tab=x` links
 * elsewhere in the app (module-guard redirects, "Manage categories" links,
 * the ANAF OAuth callback, etc.) still work — this just scrolls to the
 * matching section instead of switching a tab. */
export function ScrollToAnchor({ targetId }: { targetId: string | null }) {
  useEffect(() => {
    if (!targetId) return;
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [targetId]);
  return null;
}
