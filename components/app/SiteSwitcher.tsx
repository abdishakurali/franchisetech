"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setActiveSite } from "@/app/actions/site";
import type { AccessibleSite } from "@/lib/site-context";

interface SiteSwitcherProps {
  sites: AccessibleSite[];
  activeSiteId: string;
  collapsed?: boolean;
}

export function SiteSwitcher({ sites, activeSiteId, collapsed = false }: SiteSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0];

  function handleSelect(siteId: string) {
    if (siteId === activeSiteId) return;
    startTransition(async () => {
      await setActiveSite(siteId);
      router.refresh();
    });
  }

  if (sites.length < 2) return null;

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          title={activeSite?.name ?? "Switch location"}
          disabled={isPending}
          className="flex items-center justify-center rounded-lg h-9 w-9 mx-auto text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <MapPin className="h-[18px] w-[18px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="min-w-[160px]">
          {sites.map((site) => (
            <DropdownMenuItem
              key={site.id}
              onClick={() => handleSelect(site.id)}
              className={site.id === activeSiteId ? "font-semibold text-blue-700" : ""}
            >
              {site.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors w-full text-left"
      >
        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
        <span className="truncate flex-1">{activeSite?.name ?? "Select location"}</span>
        <ChevronDown className="h-3 w-3 flex-shrink-0 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="min-w-[180px]">
        {sites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => handleSelect(site.id)}
            className={site.id === activeSiteId ? "font-semibold text-blue-700" : ""}
          >
            {site.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
