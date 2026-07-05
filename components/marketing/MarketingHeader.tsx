"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMarketingMessages, useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import { MarketingBrand } from "@/components/marketing/MarketingBrand";
import { MarketingLocaleSwitcher } from "@/components/marketing/MarketingLocaleSwitcher";
import { marketingCtaPrimary } from "@/lib/marketing/tokens";
import { PRIMARY_INDUSTRY_NAV } from "@/lib/marketing/industry-verticals";

type UserChip = {
  displayName: string;
  initials: string;
};

export function MarketingHeader({ user }: { user: UserChip | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);
  const t = useMarketingMessages();
  const locale = useMarketingLocale();
  const industryLabel = (item: (typeof PRIMARY_INDUSTRY_NAV)[number]) =>
    locale === "ro" ? item.labelRo : item.labelEn;

  const navLinks = [
    { href: "/features", label: t.nav.features },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/resources/suppliers", label: t.nav.partners },
  ];

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!industryOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setIndustryOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [industryOpen]);

  function closeMenu() {
    setMobileOpen(false);
    setIndustryOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.25rem]">
        <MarketingBrand onClick={closeMenu} />

        <nav className="hidden items-center gap-6 text-sm text-slate-500 lg:flex" aria-label="Main">
          <Link href="/features" className="transition hover:text-slate-900">
            {t.nav.features}
          </Link>

          <div ref={industryRef} className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 transition hover:text-slate-900"
              aria-expanded={industryOpen}
              aria-haspopup="true"
              onClick={() => setIndustryOpen((v) => !v)}
            >
              {t.nav.businessTypes}
              <ChevronDown className={`h-4 w-4 transition ${industryOpen ? "rotate-180" : ""}`} />
            </button>
            {industryOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                {PRIMARY_INDUSTRY_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.slug}
                      href={item.path}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      onClick={() => setIndustryOpen(false)}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                      <span>{industryLabel(item)}</span>
                    </Link>
                  );
                })}
                <div className="my-1 border-t border-slate-100" />
                <Link
                  href="/industries"
                  className="block px-4 py-2 text-xs font-medium text-blue-600 hover:text-blue-700"
                  onClick={() => setIndustryOpen(false)}
                >
                  {t.nav.industries} →
                </Link>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 lg:flex">
            <MarketingLocaleSwitcher className="shrink-0" />
            {user ? (
              <>
                <Link href="/app" className="text-sm font-medium text-slate-600 hover:text-slate-950">
                  {t.header.dashboard}
                </Link>
                <Link
                  href="/app/profile"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {user.initials || "U"}
                  </span>
                  <span className="max-w-32 truncate">{user.displayName}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-950">
                  {t.header.login}
                </Link>
                <Link
                  href="/signup"
                  className={`rounded-full px-5 py-2 text-sm font-medium text-white transition ${marketingCtaPrimary}`}
                >
                  {t.header.getStarted}
                </Link>
              </>
            )}
          </div>

          {!user && (
            <Link
              href="/signup"
              className={`rounded-full px-3.5 py-2 text-xs font-semibold text-white transition lg:hidden ${marketingCtaPrimary}`}
            >
              {t.header.getStarted}
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.header.closeMenu : t.header.openMenu}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            aria-label={t.header.closeMenu}
            onClick={closeMenu}
          />
          <div className="fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-5 shadow-lg lg:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <Link
                href="/features"
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                onClick={closeMenu}
              >
                {t.nav.features}
              </Link>

              <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.nav.businessTypes}
              </p>
              {PRIMARY_INDUSTRY_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.slug}
                    href={item.path}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={closeMenu}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                    {industryLabel(item)}
                  </Link>
                );
              })}
              <Link
                href="/industries"
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
                onClick={closeMenu}
              >
                {t.nav.industries} →
              </Link>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href="/app"
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={closeMenu}
                  >
                    {t.header.dashboard}
                  </Link>
                  <Link
                    href="/app/profile"
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={closeMenu}
                  >
                    {user.displayName}
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                  onClick={closeMenu}
                >
                  {t.header.login}
                </Link>
              )}
            </nav>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.header.language}
              </p>
              <MarketingLocaleSwitcher />
            </div>

            {!user && (
              <Link
                href="/signup"
                className={`mt-5 flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white ${marketingCtaPrimary}`}
                onClick={closeMenu}
              >
                {t.header.getStarted}
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
}
