"use client";

import { useState, useEffect, useLayoutEffect, useMemo, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  LayoutDashboard, Package, BarChart3,
  LogOut, Menu, X, ChevronDown, Archive,
  CreditCard, ShoppingBag,
  Gift, BookOpen,
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
import { resetPosTillOpen, subscribePosTillOpen } from "@/lib/pos-till-state";
import { useAppI18n } from "@/lib/app-i18n-context";
import type { AppT } from "@/lib/app-i18n";

interface AppShellProps {
  user: User;
  profile: { full_name: string | null; email: string | null } | null;
  activeOrg: { id: string; name: string; country_code?: string | null; trial_ends_at?: string | null; referral_credit_months?: number | null; kitchen_display_enabled?: boolean | null; table_service_enabled?: boolean | null; efactura_enabled?: boolean | null; compact_workstation_nav_enabled?: boolean | null; business_profile?: string | null; loyalty_enabled?: boolean | null } | null;
  userRole: string | null;
  setupComplete?: boolean;
  moduleVisibility?: {
    inventory: boolean;
    purchases: boolean;
    recipeCosting: boolean;
    teamAdvanced: boolean;
    multiSite: boolean;
    kitchenOps: boolean;
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

function isLegalFallbackRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/app/billing") ||
    pathname.startsWith("/app/transactions") ||
    pathname.startsWith("/app/reports/z-report") ||
    pathname.startsWith("/app/reports/vat")
  );
}

function isSubscriptionBlockedForClient(subStatus?: SubscriptionStatus): boolean {
  return (
    subStatus?.state === "none" ||
    subStatus?.state === "canceled" ||
    subStatus?.state === "incomplete"
  );
}

/**
 * The full, unrestricted nav. Role-based restriction (cashier/kitchen,
 * accountant) is resolveNavItems' job alone — it either returns its own nav
 * for a role entirely (accountant) or filters this list down (limited
 * roles), so this function must not special-case roles itself: doing so
 * duplicated the same role check in two places with nothing keeping them
 * in sync.
 */
export function buildMainNav(t: AppT): NavItem[] {
  const nav: NavItem[] = [
    { href: "/app", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/app/pos", label: t.nav.pos, icon: CreditCard, exact: false },
    { href: "/app/products", label: t.nav.products, icon: Package, exact: false },
    // Recipes is a paid Operations module: gate it ONLY on the org's own
    // recipeCosting visibility (applied in resolveNavItems below), never on the
    // marketing-scope flag. LEAN_PRODUCT_SCOPE_ENABLED trims what the public
    // site advertises — it must not decide what a paying customer can reach.
    { href: "/app/recipes", label: t.nav.recipes, icon: BookOpen, exact: false },
    { href: "/app/stock", label: t.nav.stock, icon: Archive, exact: false },
    // Purchases (NIR/suppliers) is its own paid module since purchases_enabled
    // became independent of inventory_enabled — gated ONLY on moduleVisibility.
    // purchases below, never folded back under inventory.
    { href: "/app/purchases", label: t.nav.purchases, icon: ShoppingBag, exact: false },
    { href: "/app/reports", label: t.nav.reports ?? "Reports", icon: BarChart3, exact: false },
  ];

  return nav;
}

export function resolveNavItems(
  userRole: string | null,
  t: AppT,
  setupComplete: boolean,
  moduleVisibility: AppShellProps["moduleVisibility"],
  _activeOrg: AppShellProps["activeOrg"],
) {
  void _activeOrg;
  const limited = userRole === "cashier" || userRole === "kitchen";
  const accountant = userRole === "accountant";

  if (accountant) {
    const accountantNav: NavItem[] = [
      { href: "/accountant", label: "Clienții mei", icon: LayoutDashboard, exact: true },
    ];
    return { mainNav: accountantNav, stockNav: [], showStock: false, limited: false };
  }

  const mainNav = buildMainNav(t)
    .filter((item) => item.href !== "/app/recipes" || moduleVisibility?.recipeCosting === true)
    .filter((item) => item.href !== "/app/stock" || moduleVisibility?.inventory === true)
    .filter((item) => item.href !== "/app/purchases" || moduleVisibility?.purchases === true)
    .filter((item) => {
      if (!limited) return true;
      return item.href === "/app" || item.href === "/app/pos";
    });

  // Stock, recipes, and purchases are each independent paid Operations
  // modules — every one gated on its own moduleVisibility flag above, never
  // folded under another module's flag.
  const showStock = false;
  const stockNav: NavItem[] = [];

  return { mainNav, stockNav, showStock, limited };
}

function FranchiseTechLogo({ className }: { className?: string }) {
  return <Image src="/franchise-tech-logo.png" alt="FranchiseTech" width={180} height={40} className={className} />;
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
        "rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {label}
    </Link>
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
  onLogout: () => void;
  onReferralOpen: () => void;
  accessibleSites?: { id: string; name: string }[];
  activeSiteId?: string | null;
  userRole: string | null;
}) {
  const { mainNav, limited } = useMemo(
    () => resolveNavItems(userRole, t, setupComplete ?? false, moduleVisibility, activeOrg),
    [userRole, t, setupComplete, moduleVisibility, activeOrg],
  );

  const closeMobile = () => {
    if (mobileOpen) onMobileToggle();
  };

  return (
    <div className="print:hidden shrink-0 bg-card border-b border-border">
      <div className="flex h-12 items-center gap-2 sm:gap-3 px-3 sm:px-4">
        <Link href="/app" className="shrink-0" aria-label={t.nav.dashboard}>
          <FranchiseTechLogo className="h-8 w-auto max-w-[150px] sm:h-9 sm:max-w-[170px]" />
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
          {!limited && (
            <HeaderNavLink
              href="/app/settings"
              label={t.nav.settings}
              pathname={pathname}
            />
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {moduleVisibility?.multiSite === true && accessibleSites.length >= 2 && activeSiteId && (
            <div className="hidden md:block">
              <SiteSwitcher sites={accessibleSites} activeSiteId={activeSiteId} />
            </div>
          )}

          <HeaderBillingNotice subStatus={subStatus} daysLeft={daysLeft} t={t} />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent transition-colors outline-none"
              aria-label={profile?.full_name ?? t.shell.user}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-accent text-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block max-w-[8rem] truncate text-sm font-medium text-foreground">
                {profile?.full_name ?? t.shell.user}
              </span>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 md:hidden">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name ?? t.shell.user}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              {referral?.link && (
                <DropdownMenuItem onClick={onReferralOpen}>
                  <Gift className="h-4 w-4 mr-2" />
                  {t.shell.inviteTitle}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-attention">
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
          className="lg:hidden border-t border-border bg-card px-3 py-3 space-y-1 max-h-[min(70vh,28rem)] overflow-y-auto"
          aria-label={t.shell.mainNav}
        >
          {moduleVisibility?.multiSite === true && accessibleSites.length >= 2 && activeSiteId && (
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
  const { t, locale } = useAppI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [posTillOpen, setPosTillOpenState] = useState(false);

  const isPosRoute = pathname.startsWith("/app/pos");
  const posTillSelling = isPosRoute && posTillOpen;
  const showAppNav = !posTillSelling;

  useLayoutEffect(() => {
    return subscribePosTillOpen(setPosTillOpenState);
  }, []);

  useEffect(() => {
    if (!isPosRoute) resetPosTillOpen();
  }, [isPosRoute]);

  useEffect(() => {
    startTransition(() => setMobileOpen(false));
  }, [pathname]);

  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const daysLeft = trialDaysLeft;
  const subscriptionOverlayActive = isSubscriptionBlockedForClient(subStatus) && !isLegalFallbackRoute(pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const billingReason = subStatus?.state === "past_due_expired" ? "past_due_expired" : "trial_expired";
  const overlayCopy = locale === "ro"
    ? {
        eyebrow: subStatus?.state === "past_due_expired" ? "Plată necesară" : "Trial expirat",
        title: "Plătește ca să continui",
        body: "Accesul la POS este blocat până când plata este actualizată. Datele tale rămân salvate.",
        pay: "Plătește acum",
      }
    : {
        eyebrow: subStatus?.state === "past_due_expired" ? "Payment required" : "Trial expired",
        title: "Pay to continue",
        body: "POS access is blocked until payment is updated. Your data remains saved.",
        pay: "Pay now",
      };

  return (
    <div className={cn("app-shell app-shell-h relative flex flex-col overflow-hidden", isPosRoute ? "bg-card" : "bg-background")}>
      <div
        className={cn(
          "contents",
          subscriptionOverlayActive && "pointer-events-none select-none blur-sm opacity-20",
        )}
        aria-hidden={subscriptionOverlayActive}
      >
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
              <p className="break-all rounded-md bg-secondary px-3 py-2 text-sm text-foreground">{referral.link}</p>
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
          "flex-1 min-h-0 bg-card",
          posTillSelling ? "flex flex-col overflow-hidden" : "overflow-y-auto",
          isPosRoute && !posTillOpen && "lg:max-w-5xl lg:mx-auto lg:w-full",
        )}
      >
        {children}
      </main>
      </div>

      {subscriptionOverlayActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 text-center shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-attention">
              {overlayCopy.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {overlayCopy.title}
            </h2>
            <p className="mt-2 text-sm text-mid">
              {overlayCopy.body}
            </p>
            <Link
              href={`/app/billing?reason=${billingReason}`}
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
            >
              {overlayCopy.pay}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
