"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import { VENDOR_CATEGORIES } from "@/lib/marketing/vendor-categories";

/**
 * Persistent category nav for /resources/suppliers and its sub-routes —
 * derives the active entry from the current path rather than a prop, so
 * it renders identically (and stays highlighted correctly) whether it's
 * placed on the hub, a category page, or a category×county page.
 */
export function VendorCategorySidebar() {
  const pathname = usePathname();
  const locale = useMarketingLocale();
  const isRo = locale === "ro";

  const isAll = pathname === "/resources/suppliers";
  const activeCategorySlug = pathname?.startsWith("/resources/suppliers/")
    ? pathname.replace("/resources/suppliers/", "").split("/")[0]
    : undefined;

  const linkClass = (active: boolean) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <nav aria-label={isRo ? "Categorii furnizori" : "Supplier categories"} className="space-y-1">
      <Link href="/resources/suppliers" className={linkClass(isAll)}>
        {isRo ? "Toate categoriile" : "All categories"}
      </Link>
      {VENDOR_CATEGORIES.map((cat) => (
        <Link key={cat.slug} href={cat.path} className={linkClass(activeCategorySlug === cat.slug)}>
          {isRo ? cat.labelRo : cat.labelEn}
        </Link>
      ))}
    </nav>
  );
}
