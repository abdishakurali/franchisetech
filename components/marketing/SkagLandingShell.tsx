import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingBrand } from "@/components/marketing/MarketingBrand";

/**
 * Minimal shell for paid-ads landing pages (app/lp/[slug]).
 * No nav links, no announcement bar, no footer link maze — a visitor who
 * clicked a Google ad should see the offer and the CTA, nothing else that
 * gives them a reason to leave before converting.
 */
export function SkagLandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <MarketingBrand />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-100 px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>© {new Date().getFullYear()} franchisetech</span>
          <Link href="/privacy" className="hover:text-slate-600">
            Confidențialitate
          </Link>
          <Link href="/terms" className="hover:text-slate-600">
            Termeni
          </Link>
        </div>
      </footer>
    </div>
  );
}
