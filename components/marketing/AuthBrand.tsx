import Link from "next/link";
import { MarketingLocaleSwitcher } from "@/components/marketing/MarketingLocaleSwitcher";

export function AuthBrand() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-9 w-9 shrink-0 rounded-lg" />
        <span className="text-lg font-semibold tracking-tight text-slate-900">franchisetech</span>
      </Link>
      <MarketingLocaleSwitcher />
    </div>
  );
}
