"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/marketing/tokens";

type UserChip = {
  displayName: string;
  initials: string;
};

export function MarketingHeader({ user }: { user: UserChip | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto max-w-[180px] object-contain" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link href="/app" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">
                Dashboard
              </Link>
              <Link
                href="/app/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {user.initials || "U"}
                </span>
                <span className="hidden max-w-32 truncate sm:inline">{user.displayName}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-5"
              >
                Start trial
              </Link>
            </>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
