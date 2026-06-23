"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Package, BarChart3,
  LogOut, Menu, X, ChevronDown, Archive,
  CreditCard, ListChecks, Truck, ShoppingBag,
  Gift, BookOpen, ChefHat, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CopyReferralButton } from "@/components/app/CopyReferralButton";
import { SiteSwitcher } from "@/components/app/SiteSwitcher";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/billing/subscription";
import { HeaderBillingNotice } from "@/components/billing/HeaderBillingNotice";
import { resetPosTillOpen, subscribePosTillOpen, readPosTillOpenCookie } from "@/lib/pos-till-state";
import { useAppI18n } from "@/lib/app-i18n-context";
import type { AppT } from "@/lib/app-i18n";

interface AppShellProps {
  user: User;
  profile: { full_name: string | null; email: string | null } | null;
  activeOrg: { id: string; name: string; country_code?: string | null; trial_ends_at?: string | null; referral_credit_months?: number | null; kitchen_display_enabled?: boolean | null; compact_workstation_nav_enabled?: boolean | null; business_profile?: string | null } | null;
  userRole: string | null;
  setupComplete?: boolean;
  moduleVisibility?: {
    inventory: boolean;
    recipeCosting: boolean;
    teamAdvanced: boolean;
    multiSite: boolean;
  };
  trialDaysLeft?: number;
  referral?: {
    link: string | null;
    code: string | null;
    creditMonths: number;
    daysLeft: number | null;
  } | null;
  subStatus?: SubscriptionStatus;
  accessibleSites?: { id: string; name: string }[];
  activeSiteId?: string | null;
  children: React.ReactNode;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
};

function buildMainNav(userRole: string | null, t: AppT): NavItem[] {
  const limited = userRole === "cashier" || userRole === "kitchen";
  const accountant = userRole === "accountant";

  if (limited) {
    return [
      { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
      { href: "/app/pos", label: t.nav.pos, icon: CreditCard, exact: false },
    ];
  }

  if (accountant) {
    return [
      { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
      { href: "/app/reports", label: t.nav.reports ?? "Reports", icon: BarChart3, exact: false },
    ];
  }

  const nav: NavItem[] = [
    { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/app/setup-checklist", label: t.nav.setupGuide, icon: ListChecks, exact: false },
    { href: "/app/pos", label: t.nav.pos, icon: CreditCard, exact: false },
    { href: "/app/products", label: t.nav.products, icon: Package, exact: false },
    { href: "/app/recipes", label: t.nav.recipes, icon: BookOpen, exact: false },
  ];

  return nav;
}

function buildStockNav(t: AppT) {
  return [
    { href: "/app/stock", label: t.nav.stockLevels, icon: Archive },
    { href: "/app/purchases", label: t.nav.purchases, icon: ShoppingBag },
    { href: "/app/suppliers", label: t.nav.suppliers, icon: Truck },
  ];
}

function resolveNavItems(
  userRole: string | null,
  t: AppT,
  setupComplete: boolean,
  moduleVisibility: AppShellProps["moduleVisibility"],
  activeOrg: AppShellProps["activeOrg"],
) {
  const limited = userRole === "cashier" || userRole === "kitchen";
  const accountant = userRole === "accountant";

  const isRO = activeOrg?.country_code === "RO";

  if (accountant) {
    const accountantNav: NavItem[] = [
      { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
      { href: "/app/reports", label: t.nav.reports ?? "Reports", icon: FileText, exact: false },
      { href: "/app/purchases", label: t.nav.purchases, icon: ShoppingBag, exact: false },
      { href: "/app/suppliers", label: t.nav.suppliers, icon: Truck, exact: false },
      ...(isRO ? [{ href: "/app/invoices", label: "Facturi", icon: FileText, exact: false }] : []),
    ];
    return { mainNav: accountantNav, stockNav: [], showStock: false, limited: false };
  }

  const mainNav = [
    ...buildMainNav(userRole, t).filter((item) => item.href !== "/app/setup-checklist" || !setupComplete),
    ...(activeOrg?.kitchen_display_enabled
      ? [{ href: "/app/kitchen", label: t.nav.kitchen, icon: ChefHat, exact: false }]
      : []),
    ...(isRO && !limited
      ? [{ href: "/app/invoices", label: "Facturi", icon: FileText, exact: false }]
      : []),
  ]
    .filter((item) => item.href !== "/app/recipes" || moduleVisibility?.recipeCosting === true)
    .filter((item) => {
      if (!limited) return true;
      return item.href === "/app" || item.href === "/app/pos" || item.href === "/app/kitchen";
    });

  const showStock = moduleVisibility?.inventory === true && !limited;
  const stockNav = showStock ? buildStockNav(t) : [];

  return { mainNav, stockNav, showStock, limited };
}

function FranchiseTechLogo({ className }: { className?: string }) {
  return <img src="/franchise-tech-logo.png" alt="FranchiseTech" className={className} />;
}

function navIsActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function HeaderNavLink({
  href,
  label,
  pathname,
  exact = false,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  pathname: string;
  exact?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const isActive = navIsActive(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        className,
      )}
    >
      {label}
    </Link>
  );
}

function StockHeaderMenu({
  pathname,
  stockNav,
  t,
  onNavigate,
  variant = "desktop",
}: {
  pathname: string;
  stockNav: ReturnType<typeof buildStockNav>;
  t: AppT;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const router = useRouter();
  const isStockActive = stockNav.some((item) => pathname.startsWith(item.href));

  if (variant === "mobile") {
    return (
      <div className="space-y-0.5">
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t.nav.stock}
        </p>
        {stockNav.map((item) => (
          <HeaderNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            pathname={pathname}
            onNavigate={onNavigate}
            className="block w-full"
          />
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none",
          isStockActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
        aria-label={t.nav.stock}
      >
        {t.nav.stock}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {stockNav.map((item) => (
          <DropdownMenuItem
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(pathname.startsWith(item.href) && "font-semibold text-blue-700")}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader({
  pathname,
  activeOrg,
  initials,
  profile,
  user,
  setupComplete,
  moduleVisibility,
  t,
  referral,
  subStatus,
  daysLeft,
  mobileOpen,
  onMobileToggle,
  onSettings,
  onLogout,
  onReferralOpen,
  accessibleSites = [],
  activeSiteId = null,
  userRole,
}: {
  pathname: string;
  activeOrg: AppShellProps["activeOrg"];
  initials: string;
  profile: AppShellProps["profile"];
  user: User;
  setupComplete?: boolean;
  moduleVisibility?: AppShellProps["moduleVisibility"];
  t: AppT;
  referral?: AppShellProps["referral"];
  subStatus?: SubscriptionStatus;
  daysLeft: number;
  mobileOpen: boolean;
  onMobileToggle: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onReferralOpen: () => void;
  accessibleSites?: { id: string; name: string }[];
  activeSiteId?: string | null;
  userRole: string | null;
}) {
  const { mainNav, stockNav, showStock, limited } = useMemo(
    () => resolveNavItems(userRole, t, setupComplete ?? false, moduleVisibility, activeOrg),
    [userRole, t, setupComplete, moduleVisibility, activeOrg],
  );

  const closeMobile = () => {
    if (mobileOpen) onMobileToggle();
  };

  return (
    <div className="print:hidden shrink-0 bg-white border-b border-slate-100">
      <div className="flex h-12 items-center gap-2 sm:gap-3 px-3 sm:px-4">
        <Link href="/app" className="shrink-0" aria-label={t.nav.dashboard}>
          <FranchiseTechLogo className="h-6 w-auto max-w-[120px] sm:h-7 sm:max-w-[140px]" />
        </Link>

        <nav
          className="hidden lg:flex flex-1 items-center gap-0.5 min-w-0 overflow-x-auto"
          aria-label={t.shell.mainNav}
        >
          {mainNav.map((item) => (
            <HeaderNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              pathname={pathname}
              exact={item.exact}
            />
          ))}
          {showStock && (
            <StockHeaderMenu pathname={pathname} stockNav={stockNav} t={t} />
          )}
          {!limited && (
            <HeaderNavLink
              href="/app/settings"
              label={t.nav.settings}
              pathname={pathname}
            />
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {accessibleSites.length >= 2 && activeSiteId && (
            <div className="hidden md:block">
              <SiteSwitcher sites={accessibleSites} activeSiteId={activeSiteId} />
            </div>
          )}

          <HeaderBillingNotice subStatus={subStatus} daysLeft={daysLeft} t={t} />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-50 transition-colors outline-none"
              aria-label={profile?.full_name ?? t.shell.user}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block max-w-[8rem] truncate text-sm font-medium text-slate-800">
                {profile?.full_name ?? t.shell.user}
              </span>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 md:hidden">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {profile?.full_name ?? t.shell.user}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              {referral?.link && (
                <DropdownMenuItem onClick={onReferralOpen}>
                  <Gift className="h-4 w-4 mr-2" />
                  {t.shell.inviteTitle}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onSettings}>{t.nav.settings}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                {t.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="app-mobile-nav"
            aria-label={mobileOpen ? t.shell.closeNav : t.shell.openNav}
            onClick={onMobileToggle}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="app-mobile-nav"
          className="lg:hidden border-t border-slate-100 bg-white px-3 py-3 space-y-1 max-h-[min(70vh,28rem)] overflow-y-auto"
          aria-label={t.shell.mainNav}
        >
          {accessibleSites.length >= 2 && activeSiteId && (
            <div className="mb-2 px-1 sm:hidden">
              <SiteSwitcher sites={accessibleSites} activeSiteId={activeSiteId} />
            </div>
          )}

          {mainNav.map((item) => (
            <HeaderNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              pathname={pathname}
              exact={item.exact}
              onNavigate={closeMobile}
              className="block w-full"
            />
          ))}

          {showStock && (
            <StockHeaderMenu
              pathname={pathname}
              stockNav={stockNav}
              t={t}
              onNavigate={closeMobile}
              variant="mobile"
            />
          )}

          {!limited && (
            <HeaderNavLink
              href="/app/settings"
              label={t.nav.settings}
              pathname={pathname}
              onNavigate={closeMobile}
              className="block w-full"
            />
          )}

        </nav>
      )}
    </div>
  );
}

export function AppShell({ user, profile, activeOrg, userRole, setupComplete = false, moduleVisibility, trialDaysLeft = 15, referral, subStatus, accessibleSites = [], activeSiteId = null, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useAppI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [posTillOpen, setPosTillOpenState] = useState(() => readPosTillOpenCookie());

  const isPosRoute = pathname.startsWith("/app/pos");
  const posTillSelling = isPosRoute && posTillOpen;
  const showAppNav = !posTillSelling;

  useEffect(() => {
    return subscribePosTillOpen(setPosTillOpenState);
  }, []);

  useEffect(() => {
    if (!isPosRoute) resetPosTillOpen();
  }, [isPosRoute]);

  useEffect(() => {
    startTransition(() => setMobileOpen(false));
  }, [pathname]);

  const hideChatOnPos = pathname.startsWith("/app/pos");
  useEffect(() => {
    if (hideChatOnPos) {
      document.body.classList.add("hide-chatwoot");
      try {
        window.$chatwoot?.toggle("close");
      } catch {
        /* widget may not be loaded yet */
      }
    } else {
      document.body.classList.remove("hide-chatwoot");
    }
    return () => {
      document.body.classList.remove("hide-chatwoot");
    };
  }, [hideChatOnPos]);

  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const daysLeft = trialDaysLeft;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={cn("app-shell-h flex flex-col overflow-hidden", isPosRoute ? "bg-white" : "bg-slate-50")}>
      {showAppNav && (
        <AppHeader
          pathname={pathname}
          activeOrg={activeOrg}
          userRole={userRole}
          initials={initials}
          profile={profile}
          user={user}
          setupComplete={setupComplete}
          moduleVisibility={moduleVisibility}
          t={t}
          referral={referral}
          subStatus={subStatus}
          daysLeft={daysLeft}
          mobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen((v) => !v)}
          onSettings={() => router.push("/app/settings")}
          onLogout={handleLogout}
          onReferralOpen={() => setReferralOpen(true)}
          accessibleSites={accessibleSites}
          activeSiteId={activeSiteId}
        />
      )}

      {referral?.link && (
        <Dialog open={referralOpen} onOpenChange={setReferralOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.shell.inviteTitle}</DialogTitle>
              <DialogDescription>{t.shell.inviteDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{referral.link}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyReferralButton link={referral.link} />
                {referral.code && <Badge variant="outline">{t.shell.referralCode} {referral.code}</Badge>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <main
        className={cn(
          "flex-1 min-h-0 bg-white",
          posTillSelling ? "flex flex-col overflow-hidden" : "overflow-y-auto",
          isPosRoute && !posTillOpen && "lg:max-w-5xl lg:mx-auto lg:w-full",
        )}
      >
        {children}
      </main>
    </div>
  );
}
