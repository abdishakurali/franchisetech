"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CreditCard, HeartPulse, LayoutDashboard, Users } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Panou", icon: LayoutDashboard },
  { href: "/admin/trading", label: "Vânzări live", icon: Activity },
  { href: "/admin/signups", label: "Înscrieri", icon: Users },
  { href: "/admin/billing", label: "Facturare", icon: CreditCard },
  { href: "/admin/health", label: "Sănătate", icon: HeartPulse },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Admin">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${
              active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
