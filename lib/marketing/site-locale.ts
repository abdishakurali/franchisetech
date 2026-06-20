import type { Metadata } from "next";
import { SITE_URL } from "@/lib/marketing/seo";

export const MARKETING_LANG = "en" as const;

export function localeAlternates(path: string): Metadata["alternates"] {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    canonical: path,
    languages: {
      en: url,
      ro: url,
      it: url,
      "x-default": url,
    },
  };
}

export const MARKETING_KEYWORDS = [
  "cafe POS",
  "restaurant POS",
  "food business software",
  "cloud POS",
  "kitchen display system",
  "recipe costing",
  "stock management cafe",
  "till close report",
  "Z-report POS",
  "multi-location restaurant software",
  "POS restaurant România",
  "software cafenea",
] as const;
