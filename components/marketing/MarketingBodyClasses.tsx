"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Coordinates body classes used by comparison-page sticky actions. */
export function MarketingBodyClasses() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const isCompare = pathname?.startsWith("/compare");
    const hideMobileCta =
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/signup") ||
      pathname?.startsWith("/app");
    const hasMobileCta = !hideMobileCta && !isCompare;
    const hasBottomSticky = isCompare;

    body.classList.toggle("marketing-partners-sticky", hasBottomSticky);
    body.classList.toggle("marketing-mobile-cta", hasMobileCta);

    return () => {
      body.classList.remove("marketing-partners-sticky", "marketing-mobile-cta");
    };
  }, [pathname]);

  return null;
}
