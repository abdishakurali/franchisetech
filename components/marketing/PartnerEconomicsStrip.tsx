import type { MarketingMessages } from "@/lib/marketing/i18n/en";

type EconomicsItem = MarketingMessages["partners"]["economics"][number];

export function PartnerEconomicsStrip({ items }: { items: readonly EconomicsItem[] }) {
  return (
    <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center sm:py-6">
          <p className="text-xl font-bold leading-tight text-blue-600 sm:text-3xl">{item.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
