"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Package, Settings,
  LogOut, Menu, X, ChevronDown, Archive,
  CreditCard, ListChecks, Truck, ShoppingBag,
  ChevronRight, Gift, BookOpen,
  ChefHat, AlertTriangle,
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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/billing/subscription";
import { TrialBanner } from "@/components/billing/TrialBanner";
import { resetPosTillOpen, subscribePosTillOpen, readPosTillOpenCookie } from "@/lib/pos-till-state";
import { useAppI18n } from "@/lib/app-i18n-context";
import { PlatformLocaleSwitcher } from "@/components/shared/PlatformLocaleSwitcher";
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
  if (limited) {
    return [
      { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
      { href: "/app/pos", label: t.nav.pos, icon: CreditCard, exact: false },
    ];
  }

  const nav: NavItem[] = [
    { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/app/setup-checklist", label: t.nav.setupGuide, icon: ListChecks, exact: false },
    { href: "/app/pos", label: t.nav.pos, icon: CreditCard, exact: false },
  ];

  nav.push(
    { href: "/app/products", label: t.nav.products, icon: Package, exact: false },
    { href: "/app/recipes", label: t.nav.recipes, icon: BookOpen, exact: false },
  );

  return nav;
}

function buildStockNav(t: AppT) {
  return [
    { href: "/app/stock", label: t.nav.stockLevels, icon: Archive },
    { href: "/app/purchases", label: t.nav.purchases, icon: ShoppingBag },
    { href: "/app/suppliers", label: t.nav.suppliers, icon: Truck },
  ];
}

function buildBottomNav(t: AppT) {
  return [
    { href: "/app/settings", label: t.nav.settings, icon: Settings, exact: false },
  ];
}

function FranchiseTechLogo({ className }: { className?: string }) {
  return <img src="/franchise-tech-logo.png" alt="FranchiseTech" className={className} />;
}

function NavLink({
  href, label, icon: Icon, exact = false, pathname, indent = false, onNavigate, collapsed = false,
}: {
  href: string; label: string; icon: React.ComponentType<{ className?: string }>;
  exact?: boolean; pathname: string; indent?: boolean; onNavigate?: () => void; collapsed?: boolean;
}) {
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        onClick={onNavigate}
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors h-9 w-9 mx-auto",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Icon className="h-[18px] w-[18px] flex-shrink-0" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg text-sm font-medium transition-colors",
        indent ? "px-3 py-1.5 ml-3" : "px-3 py-2",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

function StockSection({
  pathname, onNavigate, collapsed = false, t,
}: {
  pathname: string; onNavigate?: () => void; collapsed?: boolean; t: AppT;
}) {
  const stockNav = buildStockNav(t);
  const isStockActive = ["/app/stock", "/app/purchases", "/app/suppliers"].some(
    (p) => pathname.startsWith(p)
  );
  const [open, setOpen] = useState(isStockActive);

  if (collapsed) {
    return (
      <Link
        href="/app/stock"
        title={t.nav.stock}
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors h-9 w-9 mx-auto",
          isStockActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Archive className="h-[18px] w-[18px]" />
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isStockActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Archive className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">{t.nav.stock}</span>
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", (open || isStockActive) ? "rotate-90" : "")} />
      </button>
      {(open || isStockActive) && (
        <div className="mt-0.5 space-y-0.5">
          {stockNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              pathname={pathname}
              indent
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppSidebar({
  pathname, activeOrg, userRole, initials, profile, user, setupComplete,
  moduleVisibility, t,
  onNavigate, onSettings, onLogout, collapsed = false,
  accessibleSites = [], activeSiteId = null,
}: {
  pathname: string;
  activeOrg: { id: string; name: string; kitchen_display_enabled?: boolean | null; compact_workstation_nav_enabled?: boolean | null } | null;
  userRole: string | null;
  initials: string;
  profile: { full_name: string | null; email: string | null } | null;
  user: User;
  setupComplete?: boolean;
  moduleVisibility?: {
    inventory: boolean;
    recipeCosting: boolean;
    teamAdvanced: boolean;
    multiSite: boolean;
  };
  t: AppT;
  mobile?: boolean;
  onNavigate?: () => void;
  onSettings: () => void;
  onLogout: () => void;
  collapsed?: boolean;
  accessibleSites?: { id: string; name: string }[];
  activeSiteId?: string | null;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center h-14 border-b border-slate-100 shrink-0",
        collapsed ? "justify-center px-2" : "px-3"
      )}>
        <FranchiseTechLogo className={collapsed ? "h-6 w-auto max-w-[36px] object-contain" : "h-8 w-auto max-w-[160px]"} />
      </div>

      {/* Org — hidden when collapsed */}
      {!collapsed && activeOrg && (
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-700 truncate">{activeOrg.name}</p>
            {userRole && (
              <Badge variant="secondary" className="text-[10px] capitalize ml-2 shrink-0">
                {userRole}
              </Badge>
            )}
          </div>
          {accessibleSites.length >= 2 && activeSiteId && (
            <div className="mt-2">
              <SiteSwitcher sites={accessibleSites} activeSiteId={activeSiteId} />
            </div>
          )}
        </div>
      )}
      {collapsed && accessibleSites.length >= 2 && activeSiteId && (
        <div className="py-1 border-b border-slate-100">
          <SiteSwitcher sites={accessibleSites} activeSiteId={activeSiteId} collapsed />
        </div>
      )}

      {/* Nav */}
      <nav className={cn(
        "flex-1 overflow-y-auto pt-3 pb-2",
        collapsed ? "px-1 space-y-1" : "px-2 space-y-0.5"
      )}>
        {[
          ...buildMainNav(userRole, t).filter((item) => item.href !== "/app/setup-checklist" || !setupComplete),
          ...(activeOrg?.kitchen_display_enabled ? [{ href: "/app/kitchen", label: t.nav.kitchen, icon: ChefHat, exact: false }] : []),
        ]
          .filter((item) => item.href !== "/app/recipes" || moduleVisibility?.recipeCosting === true)
          .filter((item) => {
            const limited = userRole === "cashier" || userRole === "kitchen";
            if (!limited) return true;
            return item.href === "/app" || item.href === "/app/pos" || item.href === "/app/kitchen";
          })
          .map((item) => (
          <NavLink
            key={item.href}
            {...item}
            pathname={pathname}
            onNavigate={onNavigate}
            collapsed={collapsed}
          />
        ))}

        {moduleVisibility?.inventory === true && userRole !== "cashier" && userRole !== "kitchen" ? (
          <StockSection pathname={pathname} onNavigate={onNavigate} collapsed={collapsed} t={t} />
        ) : null}

        {/* Bottom nav */}
        <div className={cn("mt-1 border-t border-slate-100", collapsed ? "pt-1 space-y-1" : "pt-1")}>
          {buildBottomNav(t)
            .filter((item) => userRole !== "cashier" && userRole !== "kitchen")
            .map((item) => (
            <NavLink
              key={item.href}
              {...item}
              pathname={pathname}
              onNavigate={onNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* User — shrink-0 keeps it anchored at bottom regardless of nav scroll height */}
      <div className={cn("py-3 border-t border-slate-100 shrink-0", collapsed ? "px-1" : "px-2")}>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center w-full hover:bg-slate-50 rounded-lg transition-colors outline-none",
              collapsed ? "justify-center p-1.5" : "gap-2.5 text-left px-2 py-2"
            )}
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{profile?.full_name ?? "User"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? "center" : "end"} className="w-48">
            <DropdownMenuItem onClick={onSettings}>{t.nav.settings}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />{t.nav.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function AppShell({ user, profile, activeOrg, userRole, setupComplete = false, moduleVisibility, trialDaysLeft = 15, referral, subStatus, accessibleSites = [], activeSiteId = null, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useAppI18n();
  const orgIsRO = activeOrg?.country_code === "RO";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [mobileReferralOpen, setMobileReferralOpen] = useState(false);
  const [posTillOpen, setPosTillOpenState] = useState(() => readPosTillOpenCookie());
  // Till compact mode: explicit opt-in only, stored in localStorage per device.
  // Lazy initializer runs on mount — no effect needed, no setState-in-effect.
  const [tillCompact] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem("franchisetech:tillCompact") === "true";
    } catch { return false; }
  });

  // POS: collapsed sidebar when till closed; hidden when selling.
  const isPosRoute = pathname.startsWith("/app/pos");
  const isWorkstationRoute = pathname.startsWith("/app/pos") || pathname.startsWith("/app/kitchen");
  const isPosMode = isPosRoute || (isWorkstationRoute && Boolean(activeOrg?.compact_workstation_nav_enabled));
  const posTillSelling = isPosRoute && posTillOpen;
  const showSidebar = !posTillSelling;
  const sidebarCollapsed = posTillSelling
    ? false
    : isPosRoute
      ? true
      : (isWorkstationRoute && !isPosRoute) || tillCompact;

  useEffect(() => {
    return subscribePosTillOpen(setPosTillOpenState);
  }, []);

  useEffect(() => {
    if (!isPosRoute) resetPosTillOpen();
  }, [isPosRoute]);

  const hideChat = pathname.startsWith("/app/pos") || pathname.startsWith("/app/kitchen") || pathname.startsWith("/app/settings");
  useEffect(() => {
    if (hideChat) { document.body.classList.add("hide-chatwoot"); }
    else { document.body.classList.remove("hide-chatwoot"); }
    return () => { document.body.classList.remove("hide-chatwoot"); };
  }, [hideChat]);

  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const daysLeft = trialDaysLeft;
  const creditMonths = Number(referral?.creditMonths ?? activeOrg?.referral_credit_months ?? 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const sidebarProps = {
    pathname, activeOrg, userRole, initials, profile, user, setupComplete, moduleVisibility, t,
    onSettings: () => router.push("/app/settings"),
    onLogout: handleLogout,
    collapsed: sidebarCollapsed,
    accessibleSites,
    activeSiteId,
  };

  return (
    <div className={cn("app-shell-h flex overflow-hidden", isPosRoute ? "bg-white" : "bg-slate-50", tillCompact && "till-compact-mode")}>
      {/* Desktop sidebar — collapsed on POS (till closed); hidden while selling */}
      {showSidebar && (
      <aside className={cn(
        "hidden lg:flex print:hidden flex-col bg-white border-r border-slate-100 shrink-0 transition-all duration-200 ease-in-out",
        sidebarCollapsed ? "w-12" : "w-44"
      )}>
        <AppSidebar {...sidebarProps} />
      </aside>
      )}

      {/* Mobile overlay — POS till closed: icon nav; other routes: full nav */}
      {mobileOpen && showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white flex flex-col shadow-xl">
            <AppSidebar
              {...sidebarProps}
              mobile
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
              aria-label={t.shell.closeNav}
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className={cn("flex-1 flex flex-col overflow-hidden min-h-0", isPosRoute && "bg-white")}>
        {!isPosRoute && (
          <TrialBanner
            subStatus={subStatus}
            daysLeft={daysLeft}
            creditMonths={creditMonths}
            referral={referral}
            onReferralOpen={() => setReferralOpen(true)}
          />
        )}

        {/* POS slim header — only when till is closed (nav + logo) */}
        {isPosRoute && !posTillSelling && (
          <header className="print:hidden flex items-center justify-between h-11 px-4 bg-white border-b border-slate-100 shrink-0">
            <FranchiseTechLogo className="h-5 w-auto" />
            <div className="flex items-center gap-2 min-w-0">
              <PlatformLocaleSwitcher scope="app" orgIsRO={orgIsRO} className="hidden sm:block" />
              {activeOrg?.name ? (
                <span className="truncate text-xs font-medium text-slate-500 max-w-[40vw] sm:max-w-none">{activeOrg.name}</span>
              ) : null}
              {!posTillSelling && (
                <Button variant="ghost" size="icon-sm" className="lg:hidden shrink-0" aria-label={t.shell.openNav} onClick={() => setMobileOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
              )}
            </div>
          </header>
        )}

        {/* Referral dialog (desktop) */}
        {referral?.link && (
          <Dialog open={referralOpen} onOpenChange={setReferralOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t.shell.inviteTitle}</DialogTitle>
                <DialogDescription>
                  {t.shell.inviteDesc}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{referral.link}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyReferralButton link={referral.link} />
                  {referral.code && <Badge variant="outline">{t.shell.referralCode} {referral.code}</Badge>}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {t.shell.trialDaysLeft(daysLeft)} · {t.shell.referralCredit(creditMonths)}
              </p>
            </DialogContent>
          </Dialog>
        )}

        {/* Mobile header — non-POS routes */}
        {!posTillSelling && !isPosRoute && (
          <header className="lg:hidden print:hidden flex items-center justify-between h-11 px-4 bg-white border-b border-slate-100">
            <FranchiseTechLogo className="h-6 w-auto" />
            <div className="flex items-center gap-1">
              <PlatformLocaleSwitcher scope="app" orgIsRO={orgIsRO} />
              {referral?.link && (
                <>
                  <Button variant="ghost" size="icon-sm" aria-label="Open referral dialog" onClick={() => setMobileReferralOpen(true)}>
                    <Gift className="h-4 w-4" />
                  </Button>
                  <Dialog open={mobileReferralOpen} onOpenChange={setMobileReferralOpen}>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{t.shell.inviteTitle}</DialogTitle>
                        <DialogDescription>
                          {t.shell.inviteDesc}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <p className="break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{referral.link}</p>
                        <CopyReferralButton link={referral.link} />
                      </div>
                      <p className="text-xs text-slate-500">{t.shell.referralCredit(creditMonths)}</p>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Button variant="ghost" size="icon-sm" aria-label={t.shell.openNav} onClick={() => setMobileOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </header>
        )}

        <main className={cn(
          "bg-white",
          posTillSelling ? "flex-1 flex flex-col overflow-hidden min-h-0" : "flex-1 min-h-0 overflow-y-auto",
          isPosRoute && !posTillOpen && "lg:max-w-5xl lg:mx-auto lg:w-full"
        )}>{children}</main>
      </div>
    </div>
  );
}
