"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingMessages, useMarketingLocale } from "@/lib/marketing/use-marketing-locale";
import { MarketingBrand } from "@/components/marketing/MarketingBrand";
import { MarketingLocaleSwitcher } from "@/components/marketing/MarketingLocaleSwitcher";
import { marketingCtaPrimary } from "@/lib/marketing/tokens";
import { PRIMARY_INDUSTRY_NAV } from "@/lib/marketing/industry-verticals";
import { LEAN_PRODUCT_SCOPE_ENABLED } from "@/lib/product-scope";

type UserChip = {
  displayName: string;
  initials: string;
};

// Each entry must resolve to a real page or a real anchor on the homepage
// (POS/Gestiune/Integrări/Hardware are homepage sections, not standalone
// pages — franchisetech doesn't have a page per module yet). "/#slug" from
// any page navigates home and jumps to the anchor; a bare "#slug" only
// works while already on the homepage.
const PRODUCT_MENU = [
  { hrefRo: "/features/pos", hrefEn: "/features/pos", labelRo: "POS", labelEn: "POS" },
  { hrefRo: "/#offline", hrefEn: "/#offline", labelRo: "Mod offline", labelEn: "Offline mode" },
  { hrefRo: "/features/stock-management", hrefEn: "/features/stock-management", labelRo: "Gestiune", labelEn: "Stock" },
  { hrefRo: "/#conformitate", hrefEn: "/#conformitate", labelRo: "Integrări", labelEn: "Integrations" },
  { hrefRo: "/#hardware", hrefEn: "/#hardware", labelRo: "Hardware", labelEn: "Hardware" },
] as const;

export function MarketingHeader({ user }: { user: UserChip | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const t = useMarketingMessages();
  const locale = useMarketingLocale();
  const isRo = locale === "ro";
  const industryLabel = (item: (typeof PRIMARY_INDUSTRY_NAV)[number]) =>
    isRo ? item.labelRo : item.labelEn;
  const industryNav = LEAN_PRODUCT_SCOPE_ENABLED
    ? PRIMARY_INDUSTRY_NAV.filter((item) => item.slug === "cafes" || item.slug === "takeaways")
    : PRIMARY_INDUSTRY_NAV;

  // Every entry here must be a real, distinct page — a nav item that just
  // scrolls the visitor down the current page reads as broken once they've
  // clicked it once and landed nowhere new.
  const navLinks = [
    { href: "/compare", label: isRo ? "Comparații" : "Compare" },
    { href: "/blog", label: isRo ? "Ghiduri" : "Guides" },
    { href: "/pricing", label: isRo ? "Prețuri" : "Pricing" },
    { href: "/contact", label: "Contact" },
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
    if (!industryOpen && !productOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (industryOpen && industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setIndustryOpen(false);
      }
      if (productOpen && productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [industryOpen, productOpen]);

  function closeMenu() {
    setMobileOpen(false);
    setIndustryOpen(false);
    setProductOpen(false);
  }

  function trackNavClick(label: string, href: string, location: "desktop_nav" | "mobile_nav" | "industry_nav" | "product_nav") {
    captureClientEvent("nav_link_clicked", {
      label,
      href,
      location,
    });
  }

  function trackHeaderSignup(location: "desktop_header" | "mobile_header") {
    captureClientEvent("marketing_cta_clicked", {
      cta_type: "header_signup",
      cta_location: location,
      cta_text: locale === "ro" ? "Începe trialul" : "Start trial",
      href: "/signup?plan=free",
      plan: null,
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-9 px-4 sm:px-6 lg:h-[4.625rem]">
        <MarketingBrand onClick={closeMenu} />

        <nav className="hidden items-center gap-7 text-sm font-medium text-mid lg:flex" aria-label="Main">
          <div ref={productRef} className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 transition hover:text-foreground"
              aria-expanded={productOpen}
              aria-haspopup="true"
              onClick={() => setProductOpen((v) => !v)}
            >
              {isRo ? "Produs" : "Product"}
              <ChevronDown className={`h-4 w-4 transition ${productOpen ? "rotate-180" : ""}`} />
            </button>
            {productOpen && (
              <div className="absolute left-0 top-full z-50 mt-3 w-52 rounded-2xl border border-border bg-card py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {PRODUCT_MENU.map((item) => {
                  const href = isRo ? item.hrefRo : item.hrefEn;
                  const label = isRo ? item.labelRo : item.labelEn;
                  return (
                    <Link
                      key={label}
                      href={href}
                      className="block px-4 py-2.5 text-mid transition hover:bg-background hover:text-foreground"
                      onClick={() => {
                        trackNavClick(label, href, "product_nav");
                        setProductOpen(false);
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
                <div className="my-1 border-t border-border" />
                <Link
                  href="/features"
                  className="block px-4 py-2 text-xs font-medium text-brass hover:text-brass"
                  onClick={() => {
                    trackNavClick(isRo ? "Toate funcționalitățile" : "All features", "/features", "product_nav");
                    setProductOpen(false);
                  }}
                >
                  {isRo ? "Toate funcționalitățile →" : "All features →"}
                </Link>
              </div>
            )}
          </div>

          <div ref={industryRef} className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 transition hover:text-foreground"
              aria-expanded={industryOpen}
              aria-haspopup="true"
              onClick={() => setIndustryOpen((v) => !v)}
            >
              {t.nav.businessTypes}
              <ChevronDown className={`h-4 w-4 transition ${industryOpen ? "rotate-180" : ""}`} />
            </button>
            {industryOpen && (
              <div className="absolute left-0 top-full z-50 mt-3 w-64 rounded-2xl border border-border bg-card py-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {industryNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.slug}
                      href={item.path}
                      className="flex items-center gap-3 px-4 py-2.5 text-mid transition hover:bg-background hover:text-foreground"
                      onClick={() => {
                        trackNavClick(industryLabel(item), item.path, "industry_nav");
                        setIndustryOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span>{industryLabel(item)}</span>
                    </Link>
                  );
                })}
                <div className="my-1 border-t border-border" />
                <Link
                  href="/industries"
                  className="block px-4 py-2 text-xs font-medium text-brass hover:text-brass"
                  onClick={() => {
                    trackNavClick(t.nav.industries, "/industries", "industry_nav");
                    setIndustryOpen(false);
                  }}
                >
                  {t.nav.industries} →
                </Link>
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground"
              onClick={() => trackNavClick(link.label, link.href, "desktop_nav")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <MarketingLocaleSwitcher />
          <div className="hidden items-center gap-4 lg:flex">
            {user ? (
              <>
                <Link href="/app" className="text-sm font-medium text-mid hover:text-foreground">
                  {t.header.dashboard}
                </Link>
                <Link
                  href="/app/profile"
                  className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-2 py-1 text-sm font-medium text-mid hover:bg-background"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-brass">
                    {user.initials || "U"}
                  </span>
                  <span className="max-w-32 truncate">{user.displayName}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-mid hover:text-foreground">
                  {t.header.login}
                </Link>
                <Link
                  href="/signup?plan=free"
                  className={`rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white transition ${marketingCtaPrimary}`}
                  onClick={() => trackHeaderSignup("desktop_header")}
                >
                  {locale === "ro" ? "Începe trialul" : "Start trial"}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border text-mid lg:hidden"
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
            className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
            aria-label={t.header.closeMenu}
            onClick={closeMenu}
          />
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-card px-4 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <p className="px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {isRo ? "Produs" : "Product"}
              </p>
              {PRODUCT_MENU.map((item) => {
                const href = isRo ? item.hrefRo : item.hrefEn;
                const label = isRo ? item.labelRo : item.labelEn;
                return (
                  <Link
                    key={label}
                    href={href}
                    className="rounded-[10px] px-3 py-2.5 text-base font-medium text-foreground hover:bg-background"
                    onClick={() => {
                      trackNavClick(label, href, "mobile_nav");
                      closeMenu();
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/features"
                className="rounded-[10px] px-3 py-2 text-sm font-medium text-brass hover:bg-background"
                onClick={closeMenu}
              >
                {isRo ? "Toate funcționalitățile →" : "All features →"}
              </Link>

              <p className="mt-3 px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {t.nav.businessTypes}
              </p>
              {industryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.slug}
                    href={item.path}
                    className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-base font-medium text-foreground hover:bg-background"
                    onClick={() => {
                      trackNavClick(industryLabel(item), item.path, "industry_nav");
                      closeMenu();
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    {industryLabel(item)}
                  </Link>
                );
              })}
              <Link
                href="/industries"
                className="rounded-[10px] px-3 py-2 text-sm font-medium text-brass hover:bg-background"
                onClick={() => {
                  trackNavClick(t.nav.industries, "/industries", "mobile_nav");
                  closeMenu();
                }}
              >
                {t.nav.industries} →
              </Link>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[10px] px-3 py-3 text-base font-medium text-foreground hover:bg-background"
                  onClick={() => {
                    trackNavClick(link.label, link.href, "mobile_nav");
                    closeMenu();
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href="/app"
                    className="rounded-[10px] px-3 py-3 text-base font-medium text-foreground hover:bg-background"
                    onClick={closeMenu}
                  >
                    {t.header.dashboard}
                  </Link>
                  <Link
                    href="/app/profile"
                    className="rounded-[10px] px-3 py-3 text-base font-medium text-foreground hover:bg-background"
                    onClick={closeMenu}
                  >
                    {user.displayName}
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-[10px] px-3 py-3 text-base font-medium text-foreground hover:bg-background"
                  onClick={closeMenu}
                >
                  {t.header.login}
                </Link>
              )}
            </nav>

            {!user && (
              <Link
                href="/signup?plan=free"
                className={`mt-5 flex w-full items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold text-white ${marketingCtaPrimary}`}
                onClick={() => {
                  trackHeaderSignup("mobile_header");
                  closeMenu();
                }}
              >
                {locale === "ro" ? "Începe trialul" : "Start trial"}
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
}
