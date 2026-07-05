import type { PublicVendor } from "@/lib/vendors/queries";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { VendorCard } from "@/components/marketing/suppliers/VendorCard";

export function VendorGrid({
  vendors,
  locale,
  emptyMessage,
}: {
  vendors: PublicVendor[];
  locale: MarketingLocale;
  emptyMessage: string;
}) {
  if (!vendors.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} locale={locale} />
      ))}
    </div>
  );
}
