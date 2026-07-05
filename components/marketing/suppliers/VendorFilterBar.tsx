"use client";

import { useRouter } from "next/navigation";
import { VENDOR_CATEGORIES, type VendorCategorySlug } from "@/lib/marketing/vendor-categories";
import type { County } from "@/lib/vendors/queries";
import type { MarketingLocale } from "@/lib/marketing/locale";

/**
 * Category/county selects navigate to the real destination route
 * (/resources/suppliers/[category]/[county]) rather than filtering via
 * query string — category and category×county are genuine, separately
 * indexable SEO landing pages, so this is client-side navigation, not
 * client-side re-fetching. All data fetching stays server-side at the
 * destination route.
 */
export function VendorFilterBar({
  counties,
  currentCategory,
  currentCounty,
  locale,
}: {
  counties: County[];
  currentCategory?: VendorCategorySlug;
  currentCounty?: string;
  locale: MarketingLocale;
}) {
  const router = useRouter();

  function navigate(category: string, county: string) {
    if (!category) {
      router.push("/resources/suppliers");
      return;
    }
    if (!county) {
      router.push(`/resources/suppliers/${category}`);
      return;
    }
    router.push(`/resources/suppliers/${category}/${county}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={currentCategory ?? ""}
        onChange={(e) => navigate(e.target.value, currentCounty ?? "")}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
      >
        <option value="">{locale === "ro" ? "Toate categoriile" : "All categories"}</option>
        {VENDOR_CATEGORIES.map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {locale === "ro" ? cat.labelRo : cat.labelEn}
          </option>
        ))}
      </select>

      <select
        value={currentCounty ?? ""}
        onChange={(e) => navigate(currentCategory ?? "", e.target.value)}
        disabled={!currentCategory}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{locale === "ro" ? "Toate județele" : "All counties"}</option>
        {counties.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
