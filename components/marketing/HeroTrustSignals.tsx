import { Cloud, Headphones, PiggyBank, Users } from "lucide-react";
import type { MarketingMessages } from "@/lib/marketing/i18n/en";

const icons = [Headphones, Cloud, PiggyBank, Users] as const;

export function HeroTrustSignals({ items }: { items: MarketingMessages["home"]["hero"]["trustSignals"] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => {
        const Icon = icons[i] ?? Cloud;
        return (
          <div
            key={item.title}
            className="flex gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3.5 shadow-sm backdrop-blur-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
