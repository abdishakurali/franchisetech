"use client";

import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";

export function useMarketingLocale() {
  return useMarketingLocaleContext().locale;
}

export function useMarketingMessages() {
  return useMarketingLocaleContext().t;
}
